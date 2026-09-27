"""Reproduz apenas a regressão logística selecionada no notebook; não refaz seleção."""
from pathlib import Path
import json,hashlib,unicodedata
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler,OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score,accuracy_score
ROOT=Path(__file__).resolve().parents[1]
features=['idade','regiao','canalCompra','formaPagamento','modeloVeiculo','historicoMarca']
def normalize(v):
 if pd.isna(v) or not str(v).strip():return np.nan
 return ''.join(c for c in unicodedata.normalize('NFKD',str(v).strip().upper()) if not unicodedata.combining(c)).replace(' ','_')
data=pd.read_csv(ROOT/'ia/clientes_sinteticos.csv').drop_duplicates().copy()
data.loc[~data.idade.between(18,100),'idade']=np.nan
for f in features[1:]:data[f]=data[f].map(normalize)
train,other=train_test_split(data,test_size=.4,stratify=data.perfil,random_state=42)
valid,test=train_test_split(other,test_size=.5,stratify=other.perfil,random_state=42)
pre=ColumnTransformer([('num',Pipeline([('imputer',SimpleImputer(strategy='median',add_indicator=True)),('scale',StandardScaler())]),['idade']),('cat',Pipeline([('imputer',SimpleImputer(strategy='constant',fill_value='AUSENTE')),('onehot',OneHotEncoder(handle_unknown='ignore',sparse_output=False))]),features[1:])],sparse_threshold=0)
model=Pipeline([('pre',pre),('lr',LogisticRegression(C=.01,class_weight='balanced',solver='lbfgs',max_iter=3000))]).fit(train[features],train.perfil)
num=pre.named_transformers_['num'];cat=pre.named_transformers_['cat'];lr=model.named_steps['lr']
meta=dict(version='fordretain-lr-synthetic-v1',features=features,classes=lr.classes_.tolist(),median=float(num.named_steps['imputer'].statistics_[0]),mean=num.named_steps['scale'].mean_.tolist(),scale=num.named_steps['scale'].scale_.tolist(),categories=[c.tolist() for c in cat.named_steps['onehot'].categories_],coefficients=lr.coef_.tolist(),intercepts=lr.intercept_.tolist(),dataset_sha256=hashlib.sha256((ROOT/'ia/clientes_sinteticos.csv').read_bytes()).hexdigest(),test_f1=float(f1_score(test.perfil,model.predict(test[features]),average='macro')),test_accuracy=float(accuracy_score(test.perfil,model.predict(test[features]))))
(ROOT/'src/main/resources/ml/model.json').write_text(json.dumps(meta,indent=2))
examples=test[features].head(12).copy();examples=examples.replace({np.nan:None})
records=[]
for row,prob in zip(examples.to_dict('records'),model.predict_proba(test[features].head(12))):records.append(dict(input=row,probabilities=dict(zip(lr.classes_,map(float,prob)))))
out=ROOT/'src/test/resources/ml';out.mkdir(parents=True,exist_ok=True);(out/'golden.json').write_text(json.dumps(records,indent=2))
print(json.dumps({k:meta[k] for k in ['version','test_f1','test_accuracy']}))
