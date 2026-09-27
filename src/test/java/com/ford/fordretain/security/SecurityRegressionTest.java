package com.ford.fordretain.security;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.springframework.test.util.ReflectionTestUtils;
import com.ford.fordretain.dao.UsuarioDAO;
import com.ford.fordretain.model.Usuario;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityRegressionTest {
    private JwtService jwt() {
        JwtService j = new JwtService();
        ReflectionTestUtils.setField(j,"secret","test-key-123456789012345678901234567890123456789012345678901234567890");
        ReflectionTestUtils.setField(j,"expiration",3600000L); return j;
    }
    @Test void desativarContaRejeitaTokenAnterior() throws Exception {
        JwtService jwt=jwt(); UsuarioDAO dao=mock(UsuarioDAO.class);
        when(dao.findByEmail("test@example.invalid")).thenReturn(Optional.of(Usuario.builder().ativo(false).role("ADMIN").build()));
        JwtAuthFilter filter=new JwtAuthFilter(jwt,dao);
        MockHttpServletRequest req=new MockHttpServletRequest("GET","/api/v1/dashboard");
        req.addHeader("Authorization","Bearer "+jwt.generateToken("test@example.invalid","ADMIN"));
        MockHttpServletResponse res=new MockHttpServletResponse(); AtomicBoolean called=new AtomicBoolean();
        filter.doFilter(req,res,(a,b)->called.set(true));
        assertEquals(401,res.getStatus());assertFalse(called.get());
    }
    @Test void rebaixarRoleRejeitaTokenAnterior() throws Exception {
        JwtService jwt=jwt(); UsuarioDAO dao=mock(UsuarioDAO.class);
        when(dao.findByEmail("test@example.invalid")).thenReturn(Optional.of(Usuario.builder().ativo(true).role("ANALISTA").build()));
        JwtAuthFilter filter=new JwtAuthFilter(jwt,dao);
        MockHttpServletRequest req=new MockHttpServletRequest("GET","/api/v1/dashboard");
        req.addHeader("Authorization","Bearer "+jwt.generateToken("test@example.invalid","ADMIN"));
        MockHttpServletResponse res=new MockHttpServletResponse();
        filter.doFilter(req,res,(a,b)->fail("Token antigo autorizado"));assertEquals(401,res.getStatus());
    }
    @Test void limiteDeLoginRetorna429SemBloquearHealth() throws Exception {
        RateLimitFilter f=new RateLimitFilter();
        for(int i=0;i<11;i++) {
            MockHttpServletResponse res=new MockHttpServletResponse();
            f.doFilter(new MockHttpServletRequest("POST","/api/v1/auth/login"),res,(a,b)->{});
            assertEquals(i<10?200:429,res.getStatus());
            if(i==10) assertEquals("60",res.getHeader("Retry-After"));
        }
        MockHttpServletResponse res=new MockHttpServletResponse();
        f.doFilter(new MockHttpServletRequest("GET","/actuator/health"),res,(a,b)->{});
        assertEquals(200,res.getStatus());
    }
    @Test void criptografiaNaoAceitaDadoCorrompidoOuTextoPuro() {
        CryptoUtils c=new CryptoUtils();ReflectionTestUtils.setField(c,"secret","unit-test-key");ReflectionTestUtils.setField(c,"salt","unit-test-salt");
        String encrypted=c.encrypt("11999999999");assertEquals("11999999999",c.decrypt(encrypted));
        assertNotEquals(encrypted,c.encrypt("11999999999"));
        byte[] bytes=java.util.Base64.getDecoder().decode(encrypted);bytes[bytes.length-1]^=1;
        assertThrows(IllegalStateException.class,()->c.decrypt(java.util.Base64.getEncoder().encodeToString(bytes)));
        assertThrows(IllegalStateException.class,()->c.decrypt("11999999999"));
    }
    @Test void credencialDeMetricasNaoAutorizaApi() throws Exception {
        JwtService jwt=jwt();UsuarioDAO dao=mock(UsuarioDAO.class);JwtAuthFilter f=new JwtAuthFilter(jwt,dao);
        String secret="metrics-token-123456789012345678901234567890";ReflectionTestUtils.setField(f,"monitoringToken",secret);
        MockHttpServletRequest req=new MockHttpServletRequest("GET","/api/v1/clientes");req.addHeader("Authorization","Bearer "+secret);
        MockHttpServletResponse res=new MockHttpServletResponse();f.doFilter(req,res,(a,b)->fail());assertEquals(401,res.getStatus());verifyNoInteractions(dao);
    }
}
