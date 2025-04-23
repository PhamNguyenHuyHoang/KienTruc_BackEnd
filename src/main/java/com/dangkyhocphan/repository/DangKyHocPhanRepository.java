package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.DangKyHocPhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DangKyHocPhanRepository extends JpaRepository<DangKyHocPhan, String> {
    // Kiểm tra xem đã tồn tại đăng ký cho sinh viên và lớp học phần này chưa
    boolean existsBySinhVien_MaSinhVienAndLopHocPhan_MaLopHocPhan(String maSinhVien, String maLopHocPhan);

    // Lấy danh sách đăng ký của một sinh viên
    List<DangKyHocPhan> findBySinhVien_MaSinhVien(String maSinhVien);

    // Tìm một đăng ký cụ thể theo mã sinh viên và mã lớp học phần
    Optional<DangKyHocPhan> findBySinhVien_MaSinhVienAndLopHocPhan_MaLopHocPhan(String maSinhVien, String maLopHocPhan);

    @Query(value = "SELECT madk FROM dang_ky_hoc_phan WHERE madk LIKE :prefix% ORDER BY madk DESC LIMIT 1 FOR UPDATE", nativeQuery = true)
    Optional<String> findLastMaDKForUpdate(@Param("prefix") String prefix);
}