package com.dangkyhocphan.dto;

import lombok.Data;

@Data
public class OllamaResponse {
    private String model;
    private String response;
    private boolean done;
    private String created_at;
}
