package com.dangkyhocphan.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface SomeRelatedEntityRepository  {
    void deleteByQuanTriVienId(String maQuanTriVien);

}
