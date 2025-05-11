package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.ChatRequest;
import com.dangkyhocphan.service.OllamaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ollama")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final OllamaService ollamaService;

    public ChatController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
        logger.info("ChatController initialized");
    }

    @PostMapping
    public String chat(@RequestBody ChatRequest request) {
        logger.info("Received request with message: {}", request.getMessage());
        String response = ollamaService.getChatResponse(request.getMessage());
        logger.info("Response from Ollama: {}", response);
        return response;
    }
}