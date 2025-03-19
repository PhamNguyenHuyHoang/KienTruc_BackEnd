package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.QuanTriVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuanTriVienRepository extends JpaRepository<QuanTriVien, String> {
    Optional<QuanTriVien> findByTaiKhoan_MaTaiKhoan(String maTaiKhoan);
    Optional<QuanTriVien> findByMaAdmin(String maAdmin);
    boolean existsByEmailAndMaAdminNot(String email, String maAdmin);
}



