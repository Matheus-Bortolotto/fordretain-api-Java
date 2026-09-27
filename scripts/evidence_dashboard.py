"""Gera relatório visual a partir dos resultados reais; não simula Grafana."""
from pathlib import Path
import json,re
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1];out=root/'evidencias'
d=json.loads((out/'http-tests.json').read_text());tests=d['tests']
fig=plt.figure(figsize=(13,9),facecolor='white')
fig.text(.06,.94,'FordRetain  |  Validação local de segurança',fontsize=22,weight='bold',color='#14314b')
fig.text(.06,.9,d['timestamp']+'   •   Base Matheus-Bortolotto 1a63684 + correções locais',fontsize=11)
fig.text(.06,.865,'Ambiente H2 em memória. Relatório de execução HTTP; não é captura do GitHub Actions.',fontsize=11)
ax=fig.add_axes([.06,.12,.88,.69]);ax.axis('off')
table=ax.table(cellText=[[r['test'],str(r['expected']),str(r['status']),'PASSOU' if r['pass'] else 'FALHOU'] for r in tests],colLabels=['Verificação','Esperado','Obtido','Resultado'],colWidths=[.60,.12,.12,.16],cellLoc='left',loc='center')
table.auto_set_font_size(False);table.set_fontsize(12);table.scale(1,2)
for (i,j),cell in table.get_celld().items():
 cell.set_edgecolor('#d9e0e7');cell.set_facecolor('#e9eff5' if i==0 else '#fff');
 if i==0:cell.set_text_props(weight='bold')
fig.text(.06,.045,'Fonte: http-tests.json. Tokens e senhas não integram o relatório.',fontsize=10)
fig.savefig(out/'http-tests.png',dpi=140,bbox_inches='tight');plt.close(fig)
text=(out/'metrics.prom').read_text();counts=[]
for event,v in re.findall(r'fordretain_security_events_total\{event="([^"]+)"\}\s+([0-9.]+)',text):counts.append((event,float(v)))
fig,ax=plt.subplots(figsize=(11,5));fig.set_facecolor('white');ax.barh([r[0] for r in counts],[r[1] for r in counts],color='#235b80');ax.set_xlabel('Eventos acumulados durante a execução local');ax.set_title('Snapshot das métricas reais da API',loc='left',weight='bold',pad=18)
for i,(_,v) in enumerate(counts):ax.text(v+.2,i,str(int(v)),va='center')
ax.spines[['top','right']].set_visible(False);fig.text(.02,.01,'Fonte: metrics.prom | H2 local | Visualização estática; Grafana ainda depende de homologação',fontsize=9);fig.tight_layout(rect=[0,.04,1,1]);fig.savefig(out/'metrics.png',dpi=160);plt.close(fig)
