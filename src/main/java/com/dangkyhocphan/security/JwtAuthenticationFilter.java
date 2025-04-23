package com.dangkyhocphan.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtUtil jwtUtil;

    private UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, @Qualifier("taiKhoanDetailsService") UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    //    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        try {
//            String jwt = getJwtFromRequest(request);
//
//            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt, userDetailsService.loadUserByUsername(jwtUtil.extractUsername(jwt)))) {
//                String username = jwtUtil.extractUsername(jwt);
//                System.out.println("Extracted username from token: " + username);
//                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
//                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//
//                SecurityContextHolder.getContext().setAuthentication(authentication);
//
//                // Log lại quyền của user để kiểm tra
//                System.out.println("User: " + username);
//                System.out.println("Authorities: " + userDetails.getAuthorities());
//
//            }
//        } catch (Exception ex) {
//            logger.error("Could not set user authentication in security context", ex);
//        }
//
//        filterChain.doFilter(request, response);
//    }
//@Override
//protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//    try {
//        String jwt = getJwtFromRequest(request);
//        System.out.println("Received Authorization Header: " + jwt); // ✅ Log token nhận được
//
//        if (StringUtils.hasText(jwt)) {
//            String username = jwtUtil.extractUsername(jwt);
//            System.out.println("Extracted username from token: " + username); // ✅ Kiểm tra username
//
//            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
//                System.out.println("User details loaded: " + userDetails.getUsername()); // ✅ Xác nhận UserDetails
//
//                if (jwtUtil.validateToken(jwt, userDetails)) {
//                    UsernamePasswordAuthenticationToken authentication =
//                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                    SecurityContextHolder.getContext().setAuthentication(authentication);
//
//                    // ✅ Kiểm tra xem authentication có được thiết lập không
//                    System.out.println("User authenticated: " + authentication.getName());
//                    System.out.println("User authorities: " + authentication.getAuthorities());
//                } else {
//                    System.out.println("JWT Validation failed!");
//                }
//            } else {
//                System.out.println("JWT is invalid or already authenticated.");
//            }
//        }
//    } catch (Exception ex) {
//        logger.error("Could not set user authentication in security context", ex);
//    }
//
//    filterChain.doFilter(request, response);
//}
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt, userDetailsService.loadUserByUsername(jwtUtil.extractUsername(jwt)))) {
                String username = jwtUtil.extractUsername(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // 📌 Thêm log để kiểm tra authentication
                System.out.println("🔍 SecurityContext Authentication: " + SecurityContextHolder.getContext().getAuthentication());
                System.out.println("🔍 Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);

        // 📌 Kiểm tra SecurityContext sau khi request đi qua tất cả các filter
        System.out.println("🔍 SecurityContext after filter: " + SecurityContextHolder.getContext().getAuthentication());
    }


    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        System.out.println("Received Authorization Header: " + bearerToken); // Log token

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);

        }

        return null;
    }
}