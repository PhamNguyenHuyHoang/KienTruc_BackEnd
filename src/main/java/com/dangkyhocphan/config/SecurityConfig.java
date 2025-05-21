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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;


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
                .cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .securityContext(context -> context.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 🔓 Các endpoint công khai
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/doimatkhau").permitAll()
                        // ✏️ Các endpoint cho cả SINHVIEN và QUANTRIVIEN
                        .requestMatchers(HttpMethod.PUT, "/api/sinhvien/**").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/lichhoc/lophocphan/{maLopHocPhan}").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/lichhoc/sinhvien/{maSinhVien}/tuan").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.POST, "/api/ollama").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.POST, "/api/ollama/non-stream").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/lichhoc/{maSinhVien}").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/hocky/current").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/sinhvien/{maSinhVien}").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/time-valid").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        //.requestMatchers(HttpMethod.GET, "/api/chuongtrinhkhung").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/chuongtrinhkhung/{maNganh}/{maMonHoc}").hasAnyAuthority("SINHVIEN", "QUANTRIVIEN")


                        // 🎓 Các endpoint dành cho SINHVIEN
                        .requestMatchers(HttpMethod.POST, "/api/dangkyhocphan/dangky/me").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/sinhvien/{maSinhVien}").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/lichhoc/me").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/dangkyhocphan/huy").hasAuthority("SINHVIEN")
                        .requestMatchers("/api/hocphan/**").hasAuthority("SINHVIEN")
                        .requestMatchers("/api/sinhvien/me").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/monhoc/**").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/lophocphan/**").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/lophocphan/sinhvien/{maSinhVien}").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/sinhvien/me/tinchi-theo-monhoc").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan/sinhvien/me").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/sinhvien/tien-do-hoc-tap").hasAuthority("SINHVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/chuongtrinhkhung/me").hasAuthority("SINHVIEN")

                        // 👑 Các endpoint dành cho QUANTRIVIEN
                        .requestMatchers("/api/sinhvien/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/quantrivien/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/monhoc/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/lophocphan/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/dangkyhocphan/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers(HttpMethod.GET, "/api/dangkyhocphan").hasAuthority("QUANTRIVIEN")
                        .requestMatchers(HttpMethod.POST, "/api/dangkyhocphan/dangky").hasAuthority("QUANTRIVIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/monhoc/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/lophocphan/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/lichhoc/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/nganhhoc/**").hasAuthority("QUANTRIVIEN")
                        .requestMatchers("/api/chuongtrinhkhung/**").hasAuthority("QUANTRIVIEN")
                        // 🔒 Các endpoint còn lại yêu cầu xác thực
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
        //                .httpBasic(Customizer.withDefaults())// Sử dụng Basic Authentication
        ;
        // 👇 Cấu hình CORS riêng biệt
//        http.cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource()));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));// Cho phép React
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // Nếu frontend có gửi cookie

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, taiKhoanDetailsService); // Tạo bean JwtAuthenticationFilter
    }
}