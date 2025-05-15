// repository/NganhHocRepository.java
package com.dangkyhocphan.repository;

import com.dangkyhocphan.model.NganhHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NganhHocRepository extends JpaRepository<NganhHoc, String> {
    boolean existsById(String maNganh);
}
