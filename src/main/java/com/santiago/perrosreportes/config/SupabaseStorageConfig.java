package com.santiago.perrosreportes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

@Configuration
public class SupabaseStorageConfig {

    @Bean
    public RestClient supabaseStorageRestClient(@Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.secret-key}") String secretKey) {

        return RestClient.builder()
                .baseUrl(supabaseUrl + "/storage/v1")
                .defaultHeader("apikey", secretKey)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                .build();
    }
}
