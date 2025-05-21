package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.HocKy;
import com.dangkyhocphan.model.HocKyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HocKyRepository extends JpaRepository<HocKy, HocKyId> {
    Optional<HocKy> findFirstByDangMoDangKyTrue();
}


