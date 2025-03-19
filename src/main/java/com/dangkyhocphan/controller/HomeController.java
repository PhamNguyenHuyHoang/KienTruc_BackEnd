package com.dangkyhocphan.controller;

import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.SinhVienRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HomeController {
    private final SinhVienRepository sinhVienRepository;

    public HomeController(SinhVienRepository sinhVienRepository) {
        this.sinhVienRepository = sinhVienRepository;
    }

    @GetMapping("/home")
    public String home(Model model) {
        List<SinhVien> sinhViens = sinhVienRepository.findAll();
        model.addAttribute("sinhViens", sinhViens); // Đảm bảo truyền đúng danh sách
        return "home";
    }
}

