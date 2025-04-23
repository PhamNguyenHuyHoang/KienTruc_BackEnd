package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.LopHocPhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LopHocPhanRepository extends JpaRepository<LopHocPhan, String> {
    List<LopHocPhan> findByHocKyAndNamHoc(String hocKy, String namHoc);

    List<LopHocPhan> findByHocKy(String hocKy);

    List<LopHocPhan> findByNamHoc(String namHoc);

    Optional<LopHocPhan> findTopByOrderByMaLopHocPhanDesc();
}