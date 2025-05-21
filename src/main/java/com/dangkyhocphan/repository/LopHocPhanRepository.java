package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.LopHocPhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LopHocPhanRepository extends JpaRepository<LopHocPhan, String> {
    List<LopHocPhan> findByHocKy_Id_MaHocKy(String maHocKy);
    List<LopHocPhan> findByHocKy_Id_NamHoc(String namHoc);


    @Query("SELECT l FROM LopHocPhan l WHERE l.hocKy.id.maHocKy = :maHocKy AND l.hocKy.id.namHoc = :namHoc")
    List<LopHocPhan> findByHocKy_MaHocKyAndHocKy_NamHoc(@Param("maHocKy") String maHocKy, @Param("namHoc") String namHoc);


    Optional<LopHocPhan> findTopByOrderByMaLopHocPhanDesc();
}
