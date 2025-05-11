package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.SinhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, String> {
    Optional<SinhVien> findByEmail(String email);
    Optional<SinhVien> findByTaiKhoan_TenDangNhap(String tenDangNhap); // Tìm sinh viên theo tên đăng nhập
    boolean existsByEmail(String email); // Kiểm tra email đã tồn tại
}
