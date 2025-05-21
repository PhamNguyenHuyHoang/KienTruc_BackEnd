package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.DangKyHocPhan;
import com.dangkyhocphan.model.LopHocPhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
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

    @Query("SELECT dk.lopHocPhan FROM DangKyHocPhan dk WHERE dk.sinhVien.maSinhVien = :maSinhVien")
    List<LopHocPhan> findLopHocPhanBySinhVien_MaSinhVien(@Param("maSinhVien") String maSinhVien);

    // Lấy danh sách lớp học phần đã đăng ký của sinh viên
    @Query("""
                SELECT new map(m.tenMonHoc as tenMonHoc, m.soTinChi as soTinChi)
                FROM DangKyHocPhan d
                JOIN d.lopHocPhan l
                JOIN l.monHoc m
                WHERE d.sinhVien.maSinhVien = :maSinhVien
            """)
    List<Map<String, Object>> findTinChiTheoMonHocBySinhVien(@Param("maSinhVien") String maSinhVien);

    // Đếm số lượng sinh viên đã đăng ký lớp học phần
    int countByLopHocPhan_MaLopHocPhan(String maLopHocPhan);

    //    @Modifying
//    @Transactional
//    @Query("DELETE FROM DangKyHocPhan d WHERE d.lopHocPhan.maLopHocPhan = :maLopHocPhan")
//    void deleteByMaLopHocPhan(@Param("maLopHocPhan") String maLopHocPhan);
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM DangKyHocPhan d WHERE d.lopHocPhan.maLopHocPhan = :maLopHocPhan")
    int deleteByMaLopHocPhan(@Param("maLopHocPhan") String maLopHocPhan);

    List<DangKyHocPhan> findByLopHocPhan_MaLopHocPhan(String maLopHocPhan);

    void flush();


}