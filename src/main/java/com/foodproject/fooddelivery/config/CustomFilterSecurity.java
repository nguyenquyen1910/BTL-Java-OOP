package com.foodproject.fooddelivery.config;

import com.foodproject.fooddelivery.security.CustomJwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class CustomFilterSecurity {

    private final CustomJwtFilter customJwtFilter;
    private final AuthenticationEntryPoint authenticationEntryPoint;

    public CustomFilterSecurity(CustomJwtFilter customJwtFilter, AuthenticationEntryPoint authenticationEntryPoint) {
        this.customJwtFilter = customJwtFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf(AbstractHttpConfigurer::disable);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.addFilterBefore(customJwtFilter, UsernamePasswordAuthenticationFilter.class);
        http.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/index",
                                "/static/**",
                                "/assets/**",
                                "/js/**",
                                "/css/**",
                                "/font/**",
                                "/img/**",
                                "/login/**",
                                "/user",
                                "/user/me",
                                "/user/change",
                                "/user/change-password",
                                "/cart/**",
                                "/order/get/",
                                "/order/details/",
                                "/order/insert",
                                "/products/all",
                                "/products/homepage",
                                "products/product",
                                "/products/find",
                                "/category/**",
                                "/admin").permitAll()
                        .requestMatchers(
                                "/products/admin/**",
                                "/user/admin/**",
                                "/order/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                ).exceptionHandling(exceptionHandling -> {
            exceptionHandling.authenticationEntryPoint(authenticationEntryPoint);
        });
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://127.0.0.1:5500", "http://127.0.0.1:3000", "http://127.0.0.1:5501"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}