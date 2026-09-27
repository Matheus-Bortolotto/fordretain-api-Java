package com.ford.fordretain.config;
import com.ford.fordretain.exception.DatabaseException;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy;
import javax.sql.DataSource;
import java.sql.Connection;
@Component
public class OracleConnectionFactory {
    private final TransactionAwareDataSourceProxy dataSource;
    public OracleConnectionFactory(DataSource dataSource) { this.dataSource=new TransactionAwareDataSourceProxy(dataSource); }
    public Connection getConnection() {
        try { return dataSource.getConnection(); }
        catch (Exception e) { throw new DatabaseException("Erro ao conectar no banco",e); }
    }
}
