package com.dangkyhocphan.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SequenceInitService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initSequenceGenerator() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS sequence_generator (
                id VARCHAR(20) PRIMARY KEY,
                value INT NOT NULL
            );
        """);

        jdbcTemplate.update("""
            INSERT INTO sequence_generator (id, value)
            SELECT ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM sequence_generator WHERE id = ?
            );
        """, "DK", 1000, "DK");
    }
}

