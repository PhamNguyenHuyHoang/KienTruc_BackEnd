package com.dangkyhocphan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaRepositories("com.dangkyhocphan.repository")
@EntityScan("com.dangkyhocphan.model")
@SpringBootApplication
public class DangkyhocphanApplication {
	public static void main(String[] args) {
		SpringApplication.run(DangkyhocphanApplication.class, args);
	}
}
