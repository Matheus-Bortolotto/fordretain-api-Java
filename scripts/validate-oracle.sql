-- Executar no SQL Developer autenticado; não colocar senhas no arquivo.
SELECT 1 AS conexao_ok FROM DUAL;
SELECT table_name FROM user_tables WHERE table_name IN ('CLIENTES','PREDICOES','USUARIOS');
SELECT COUNT(*) AS usuarios_ativos FROM usuarios WHERE ativo = 1;
