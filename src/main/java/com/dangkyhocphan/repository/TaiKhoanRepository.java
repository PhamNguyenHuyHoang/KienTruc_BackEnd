package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    boolean existsByTenDangNhap(String tenDangNhap); // Thêm phương thức này
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    @Query("SELECT MAX(t.maTaiKhoan) FROM TaiKhoan t")
    String findLastMaTaiKhoan();


}

