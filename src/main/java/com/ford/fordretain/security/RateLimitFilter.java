package com.ford.fordretain.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {
    @Value("${security.rate-limit.requests-per-minute:60}") private int generalLimit = 60;
    @Value("${security.rate-limit.login-per-minute:10}") private int loginLimit = 10;
    private final Map<String, Window> windows = new HashMap<>();
    private long lastCleanup;
    private static class Window { long start; int used; Window(long now) { start = now; } }
    private synchronized boolean allow(String key, int limit) {
        long now = System.nanoTime();
        long minute = 60_000_000_000L;
        if (now-lastCleanup >= minute) {
            windows.entrySet().removeIf(e -> now-e.getValue().start >= minute);
            lastCleanup = now;
        }
        Window w = windows.get(key);
        if (w == null || now-w.start >= minute) {
            if (w == null && windows.size() >= 10000) return false;
            w = new Window(now); windows.put(key, w);
        }
        return ++w.used <= limit;
    }
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws IOException, ServletException {
        if (!req.getRequestURI().startsWith("/api/")) { chain.doFilter(req,res); return; }
        String ip = req.getRemoteAddr(); // Never trust arbitrary X-Forwarded-For.
        boolean auth = req.getRequestURI().startsWith("/api/v1/auth/");
        if (!allow("api:"+ip,generalLimit) || (auth && !allow("auth:"+ip,loginLimit))) {
            res.setStatus(429); res.setHeader("Retry-After","60"); res.setContentType("application/json"); res.setCharacterEncoding("UTF-8");
            res.getWriter().write("{\"erro\":\"Limite de requisições excedido\"}"); return;
        }
        chain.doFilter(req,res);
    }
}
