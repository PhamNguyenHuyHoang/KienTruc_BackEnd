package com.dangkyhocphan.service;

import com.dangkyhocphan.model.HocKy;
import com.dangkyhocphan.repository.HocKyRepository;
import org.springframework.stereotype.Service;

@Service
public class HocKyService {
    private final HocKyRepository hocKyRepository;

    public HocKyService(HocKyRepository hocKyRepository) {
        this.hocKyRepository = hocKyRepository;
    }

    public HocKy findHocKyDangMoDangKy() {
        return hocKyRepository.findFirstByDangMoDangKyTrue()
                .orElse(null);
    }
}
