package com.dangkyhocphan.repository;


import com.dangkyhocphan.model.MonHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonHocRepository extends JpaRepository<MonHoc, String> {
    boolean existsByMaMonHoc(String maMonHoc);

    List<MonHoc> findByTrangThai(String trangThai);

    @Query("SELECT m FROM MonHoc m WHERE :maMonHoc MEMBER OF m.monTienQuyet")
    List<MonHoc> findMonHocByTienQuyet(String maMonHoc);
}