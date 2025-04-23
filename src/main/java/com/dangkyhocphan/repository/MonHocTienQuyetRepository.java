package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.MonHocTienQuyet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonHocTienQuyetRepository extends JpaRepository<MonHocTienQuyet, Long> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh tại đây nếu cần
}
