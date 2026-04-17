package com.complementasenac.backend.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class FirebaseAuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String header = httpRequest.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.replace("Bearer ", "");

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

                request.setAttribute("uid", decodedToken.getUid());
                request.setAttribute("email", decodedToken.getEmail());

            } catch (Exception e) {
                if (httpRequest.getRequestURI().startsWith("/api/auth/")) {
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    httpResponse.setContentType("application/json");
                    httpResponse.getWriter().write("{\"error\":\"Token invalido\"}");
                    return;
                }
            }
        }

        if (httpRequest.getRequestURI().startsWith("/api/auth/")
                && request.getAttribute("uid") == null) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\":\"Token ausente\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}