package com.ford.fordretain.security;

import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuditLogFilter extends OncePerRequestFilter {
    private final ObjectProvider<MeterRegistry> registries;
    public AuditLogFilter(ObjectProvider<MeterRegistry> registries) { this.registries = registries; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String requestId = UUID.randomUUID().toString();
        response.setHeader("X-Request-ID", requestId);
        long start = System.nanoTime();
        try { chain.doFilter(request, response); }
        finally {
            int status = response.getStatus();
            String event = status == 429 ? "rate_limit" : status == 403 ? "access_denied" :
                status == 401 ? "authentication_failed" : "request_completed";
            String path = request.getRequestURI();
            if (status >= 200 && status < 300) {
                if (path.equals("/api/v1/auth/login")) event = "login_success";
                else if (path.equals("/api/v1/auth/register")) event = "user_registered";
                else if (path.startsWith("/api/v1/admin/") && !request.getMethod().equals("GET"))
                    event = "admin_change";
            }
            log.atInfo().addKeyValue("event", event).addKeyValue("request_id", requestId)
                .addKeyValue("method", request.getMethod()).addKeyValue("status", status)
                .addKeyValue("duration_ms", (System.nanoTime()-start)/1_000_000).log("http_audit");
            MeterRegistry registry = registries.getIfAvailable();
            if (registry != null) registry.counter("fordretain.security.events", "event", event).increment();
        }
    }
}
