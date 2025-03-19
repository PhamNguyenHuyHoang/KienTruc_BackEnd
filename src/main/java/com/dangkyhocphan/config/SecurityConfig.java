package com.dangkyhocphan.config;

import com.dangkyhocphan.security.JwtAuthenticationFilter;
import com.dangkyhocphan.security.JwtUtil;
import com.dangkyhocphan.security.TaiKhoanDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize
public class SecurityConfig {

    private final TaiKhoanDetailsService taiKhoanDetailsService;
    private final JwtUtil jwtUtil; // Thêm JwtUtil

    @Autowired // Thêm @Autowired
    public SecurityConfig(TaiKhoanDetailsService taiKhoanDetailsService, JwtUtil jwtUtil) {
        this.taiKhoanDetailsService = taiKhoanDetailsService;
        this.jwtUtil = jwtUtil; // Khởi tạo JwtUtil
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return taiKhoanDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(taiKhoanDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .securityContext(context -> context.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 🚀 Thêm dòng này
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/doimatkhau").permitAll()
                                .requestMatchers("/dangkyhocphan/api/hocphan/**").hasAuthority("SINHVIEN")
                                .requestMatchers("/dangkyhocphan/api/sinhvien/me").hasAuthority("SINHVIEN")
                                .requestMatchers("/dangkyhocphan/api/sinhvien/**").hasAuthority("QUANTRIVIEN")
                                .requestMatchers(HttpMethod.PUT, "/dangkyhocphan/api/sinhvien/**")
                                .hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                                .requestMatchers("/dangkyhocphan/api/quantrivien/**").hasAuthority("QUANTRIVIEN")
//                        .requestMatchers(HttpMethod.POST, "/dangkyhocphan/api/sinhvien").hasAuthority("QUANTRIVIEN")
                                .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults()) // Sử dụng Basic Authentication
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class); // Thêm JwtAuthenticationFilter

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, taiKhoanDetailsService); // Tạo bean JwtAuthenticationFilter
    }
}