"""TruffleHog offline: registra metadados sem publicar o segredo encontrado."""
import subprocess, json, sys, datetime, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root/'evidencias'; out.mkdir(exist_ok=True)
p=subprocess.run(['trufflehog','git','file://'+str(root),'--no-verification','--no-update','--json','--fail'],capture_output=True,text=True,cwd=root)
triage=json.loads((root/'security/trufflehog-triage.json').read_text())
known={(x['detector'],x['sha256']):x['reason'] for x in triage}
findings=[]
for line in p.stdout.splitlines():
    try: item=json.loads(line)
    except json.JSONDecodeError: continue
    meta=item.get('SourceMetadata',{}).get('Data',{})
    git=meta.get('Git',meta.get('git',{}))
    fingerprint=hashlib.sha256(item.get('Raw','').encode()).hexdigest()
    reason=known.get((item.get('DetectorName'),fingerprint))
    findings.append({'triage':reason or 'Revisao necessaria', 'false_positive':bool(reason), 'fingerprint':fingerprint,'detector':item.get('DetectorName'), 'verified':item.get('Verified',False),
                     'file':git.get('file'), 'commit':git.get('commit'), 'line':git.get('line')})
report={'tool':'TruffleHog','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'scope':'Historico Git completo da branch analisada', 'verification':'Desativada; nenhum segredo enviado ao provedor',
        'exit_code':p.returncode,'findings':findings,'count':len(findings), 'actionable':sum(not x['false_positive'] for x in findings)}
(out/'trufflehog.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps(report,ensure_ascii=False))
if p.returncode not in (0,183):
    print('Erro operacional no TruffleHog; scan nao aprovado.',file=sys.stderr)
    sys.exit(p.returncode or 1)
sys.exit(1 if report['actionable'] else 0)
