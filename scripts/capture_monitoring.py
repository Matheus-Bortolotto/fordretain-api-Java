"""Capturas do Grafana e Prometheus em execucao; chamada pelo teste HTTP."""
import json, os, subprocess, time, urllib.request, urllib.parse, secrets, html
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture(root,env,results):
    out=root/'evidencias'; mon=root/'monitoring'
    (mon/'metrics-token.txt').write_text(env['MONITORING_TOKEN'])
    env=env.copy(); env['GRAFANA_ADMIN_PASSWORD']=secrets.token_urlsafe(24)
    subprocess.run(['docker','compose','-f',str(mon/'docker-compose.yml'),'up','-d'],env=env,check=True)
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
    def get(url):
        with opener.open(url,timeout=5) as r:return json.load(r)
    for _ in range(90):
        try:
            health=get('http://127.0.0.1:3000/api/health')
            up=get('http://127.0.0.1:9090/api/v1/query?query='+urllib.parse.quote('up{job="fordretain"}'))
            if health.get('database')=='ok' and up['data']['result'] and up['data']['result'][0]['value'][1]=='1':break
        except Exception:pass
        time.sleep(2)
    else:raise RuntimeError('Prometheus nao confirmou target UP e Grafana saudavel')
    # Enough samples for rate panels; generate low-volume traffic throughout.
    for _ in range(8):
        for _ in range(2):
            try:opener.open('http://127.0.0.1:8080/api/v1/dashboard').close()
            except Exception:pass
        time.sleep(15)
    (out/'monitoring-checks.json').write_text(json.dumps({'grafana':health,'prometheus':up,'commit':os.getenv('GITHUB_SHA'),'run':os.getenv('GITHUB_RUN_ID')},indent=2))
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        page=browser.new_page(viewport={'width':1440,'height':1100})
        page.goto('http://127.0.0.1:3000/login')
        page.locator('input[name="user"]').fill('admin');page.locator('input[name="password"]').fill(env['GRAFANA_ADMIN_PASSWORD'])
        page.get_by_role('button',name='Log in',exact=True).click();page.wait_for_url('**/',timeout=30000)
        page.goto('http://127.0.0.1:3000/d/fordretain-security?from=now-15m&to=now&refresh=5s')
        page.get_by_text('Disponibilidade',exact=True).wait_for(timeout=30000)
        page.wait_for_timeout(15000);page.screenshot(path=str(out/'grafana.png'),full_page=True)
        page.goto('http://127.0.0.1:9090/targets');page.wait_for_timeout(3000);page.screenshot(path=str(out/'prometheus.png'),full_page=True)
        rows=''.join('<tr><td>'+html.escape(r['test'])+'</td><td>'+str(r['status'])+'</td><td>'+('APROVADO' if r['pass'] else 'FALHOU')+'</td></tr>' for r in results)
        page.set_content('<html><style>body{font:22px Arial;padding:48px;color:#14233b}table{border-collapse:collapse;width:100%}td{padding:14px;border-bottom:1px solid #ddd}h1{color:#15345e}</style><h1>FordRetain — verificações HTTP</h1><p>Execução real em H2 • commit '+html.escape(os.getenv('GITHUB_SHA','local'))+'</p><table>'+rows+'</table></html>')
        page.screenshot(path=str(out/'runtime-report.png'),full_page=True)
        browser.close()
    (mon/'metrics-token.txt').unlink(missing_ok=True)
