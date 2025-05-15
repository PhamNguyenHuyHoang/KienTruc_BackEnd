package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.ChuongTrinhKhung;
import com.dangkyhocphan.model.ChuongTrinhKhungId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChuongTrinhKhungRepository extends JpaRepository<ChuongTrinhKhung, ChuongTrinhKhungId> {}
