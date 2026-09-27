# Modelo integrado

export_model.py reconstrói a regressão logística selecionada no notebook fornecido, usando apenas os 3000 clientes do treino (semente 42). Não seleciona hiperparâmetros no teste.
O artefato JSON fica em src/main/resources/ml/model.json e inclui transformação numérica, categorias, classes, coeficientes e hash do CSV.
A API executa a regressão em Java, sem carregar pickle e sem enviar dados pessoais a serviço externo.
ModelParityTest compara as probabilidades Java com 12 vetores de referência Python; tolerância 1e-10.
Resultados reproduzidos: F1 macro 0,4058861083869879 e acurácia 0,432.
O teste não valida efetividade comercial, calibração nem equidade em clientes reais.

Para reproduzir: instale as versões de requirements.txt em ambiente isolado e execute python ia/export_model.py. Revise o diff e rode mvn verify antes de publicar.
