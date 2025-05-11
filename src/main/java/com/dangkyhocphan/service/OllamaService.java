package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.OllamaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OllamaService {

    private static final Logger logger = LoggerFactory.getLogger(OllamaService.class);
    private final RestTemplate restTemplate;
    private final String ollamaUrl;
    private final String model;
    private final double temperature;

    public OllamaService(
            @Value("${ollama.base-url}") String ollamaUrl,
            @Value("${ollama.model}") String model,
            @Value("${ollama.temperature}") double temperature) {
        this.restTemplate = new RestTemplate();
        this.ollamaUrl = ollamaUrl + "/api/generate";
        this.model = model;
        this.temperature = temperature;
    }

    public String getChatResponse(String prompt) {
        logger.info("Calling Ollama with prompt: {}", prompt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = String.format(
                "{\"model\": \"%s\", \"prompt\": \"%s\", \"temperature\": %.1f, \"stream\": false}",
                model, prompt, temperature
        );

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            OllamaResponse response = restTemplate.postForObject(ollamaUrl, entity, OllamaResponse.class);
            logger.info("Ollama response: {}", response);
            return response != null && response.getResponse() != null
                    ? response.getResponse()
                    : "No response from Ollama";
        } catch (Exception e) {
            logger.error("Error calling Ollama API: {}", e.getMessage());
            return "Error calling Ollama API: " + e.getMessage();
        }
    }
}