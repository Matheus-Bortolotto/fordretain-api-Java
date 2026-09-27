package com.ford.fordretain.config;
import com.ford.fordretain.dao.UsuarioDAO;
import com.ford.fordretain.model.Usuario;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
@Profile("local")
public class LocalAdminConfig {
    @Bean ApplicationRunner localAdmin(UsuarioDAO dao, PasswordEncoder encoder,
            @Value("${LOCAL_ADMIN_PASSWORD}") String password) {
        return args -> {
            if (password.length()<16) throw new IllegalArgumentException("Senha local deve ter 16 caracteres ou mais");
            if (dao.countActiveAdmins()==0) dao.save(Usuario.builder().nome("Admin local")
                .email("admin@example.invalid").senhaHash(encoder.encode(password)).role("ADMIN").ativo(true).build());
        };
    }
}
