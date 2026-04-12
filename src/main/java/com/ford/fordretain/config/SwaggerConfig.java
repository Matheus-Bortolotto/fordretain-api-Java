package com.ford.fordretain.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI fordRetainOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FordRetain API")
                        .description("""
                                API de Retenção Preditiva de Clientes Ford.
                                
                                Permite prever o perfil comportamental de clientes no momento da compra,
                                identificar leads em risco de evasão e visualizar métricas de VIN Share
                                por região e modelo de veículo.
                                
                                Desenvolvido como parte do Challenge Ford FIAP 2026.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe FordRetain - FIAP")
                                .email("grupo@fiap.com.br"))
                        .license(new License()
                                .name("Uso Acadêmico")
                                .url("https://www.fiap.com.br")));
    }
}
