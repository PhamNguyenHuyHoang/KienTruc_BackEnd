package com.dangkyhocphan.repository;


import com.dangkyhocphan.model.LichHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichHocRepository extends JpaRepository<LichHoc, String> {
    List<LichHoc> findByLopHocPhan_MaLopHocPhan(String maLopHocPhan);
}

