"""Executa a API local em H2, testa HTTP e grava evidências sem credenciais."""
import os,subprocess,secrets,json,time,urllib.request,urllib.error
from pathlib import Path
root=Path(__file__).resolve().parents[1]; out=root/'evidencias';out.mkdir(exist_ok=True)
env=os.environ.copy();env.update({k:secrets.token_urlsafe(48) for k in ['JWT_SECRET','CRYPTO_SECRET','CRYPTO_SALT','MONITORING_TOKEN']});env['LOCAL_ADMIN_PASSWORD']=secrets.token_urlsafe(24);env['SPRING_PROFILES_ACTIVE']='local'
log=open(out/'runtime.jsonl','w');proc=subprocess.Popen(['java','-jar',str(root/'target/fordretain-api-1.0.0.jar')],env=env,stdout=log,stderr=subprocess.STDOUT)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}));results=[]
def request(path,body=None,token=None,method=None):
 h={'Content-Type':'application/json'}
 if token:h['Authorization']='Bearer '+token
 r=urllib.request.Request('http://127.0.0.1:8080'+path,data=json.dumps(body).encode() if body is not None else None,headers=h,method=method)
 try:
  response=opener.open(r,timeout=8)
 except urllib.error.HTTPError as e:response=e
 raw=response.read().decode();return response.status,raw

def check(name,path,expected,body=None,token=None,method=None):
 status,raw=request(path,body,token,method);results.append({'test':name,'status':status,'expected':expected,'pass':status==expected});assert status==expected,(name,status,raw[:250]);return json.loads(raw) if raw else None
try:
 for _ in range(40):
  try:
   status,raw=request('/actuator/health')
   if status==200:break
  except OSError:pass
  if proc.poll() is not None:raise RuntimeError('API não iniciou; consulte runtime.jsonl')
  time.sleep(.5)
 # ApplicationRunner may still initialize account after health becomes available.
 for _ in range(20):
  status,raw=request('/api/v1/auth/login',{'email':'admin@example.invalid','senha':env['LOCAL_ADMIN_PASSWORD']})
  if status==200:break
  time.sleep(.3)
 assert status==200,raw
 admin=json.loads(raw)['token'];results.append({'test':'Login ADMIN local','status':200,'expected':200,'pass':True})
 check('Health','/actuator/health',200)
 check('Sem token','/api/v1/dashboard',401)
 check('Cadastro ANALISTA','/api/v1/auth/register',201,{'nome':'Usuário de teste','email':'analista@example.invalid','senha':'local-validation-only-123'})
 user=check('Login ANALISTA','/api/v1/auth/login',200,{'email':'analista@example.invalid','senha':'local-validation-only-123'})['token']
 check('RBAC ANALISTA','/api/v1/dashboard',403,token=user)
 body={'nome':'Cliente sintético','email':'cliente@example.invalid','telefone':'11999990000','regiao':'SP','idade':30,'canalCompra':'ONLINE','formaPagamento':'FINANCIAMENTO','modeloVeiculo':'RANGER','dataCompra':'2026-09-01','historicoMarca':'PRIMEIRA_COMPRA'}
 prediction=check('Predição IA persistida','/api/v1/predict',201,body,admin)
 (out/'prediction.json').write_text(json.dumps({k:v for k,v in prediction.items() if k!='nomeCliente'},indent=2))
 check('Dashboard ADMIN','/api/v1/dashboard',200,token=admin)
 check('Métricas sem token','/actuator/prometheus',401)
 status,metrics=request('/actuator/prometheus',token=env['MONITORING_TOKEN']);assert status==200
 (out/'metrics.prom').write_text(metrics)
 results.append({'test':'Métricas com identidade própria','status':status,'expected':200,'pass':True})
 check('Token de métricas não autoriza API','/api/v1/dashboard',401,token=env['MONITORING_TOKEN'])
 for _ in range(12):status,_=request('/api/v1/auth/login',{'email':'wrong@example.invalid','senha':'incorrect-only'})
 assert status==429;results.append({'test':'Rate limit login','status':status,'expected':429,'pass':True})
 status,metrics=request('/actuator/prometheus',token=env['MONITORING_TOKEN']);assert status==200;(out/'metrics.prom').write_text(metrics)
 if os.getenv('CAPTURE_DASHBOARD')=='true':
  from capture_monitoring import capture
  capture(root,env,results)
finally:
 proc.terminate();proc.wait(timeout=15);log.close()
 # Keep only structured audit events; remove startup messages with framework credentials.
 records=[]
 for line in (out/'runtime.jsonl').read_text().splitlines():
  try:
   obj=json.loads(line)
   if obj.get('message') in ['http_audit','inference_completed']:records.append(obj)
  except ValueError:pass
 (out/'audit.jsonl').write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in records)+'\n')
 (out/'runtime.jsonl').unlink()
 (out/'http-tests.json').write_text(json.dumps({'environment':'local H2; não Oracle','base':'1a63684','timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'tests':results},indent=2,ensure_ascii=False))
print(json.dumps(results,ensure_ascii=False))
