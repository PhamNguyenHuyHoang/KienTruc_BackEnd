
import { useEffect, useRef, useState } from "react"; // Thêm useState nếu chưa có

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null); // Sử dụng state để lưu effect

  useEffect(() => {
    // Chỉ khởi tạo Vanta nếu chưa có effect và thư viện đã sẵn sàng
    if (!vantaEffect && window.VANTA) {
      const effect = window.VANTA.NET({ // *** Đổi sang hiệu ứng NET ***
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        // --- Tùy chỉnh màu sắc và giao diện ---
        color: 0x2a9dff,      // Màu chính của các đường nét (xanh dương sáng) - ví dụ: #2a9dff
        backgroundColor: 0x050b1a, // Màu nền (xanh đen rất đậm) - ví dụ: #050b1a
        points: 10.00,         // Số lượng điểm (có thể tăng/giảm)
        maxDistance: 20.00,    // Khoảng cách tối đa để vẽ đường nối
        spacing: 15.00,        // Khoảng cách giữa các điểm
        // --------------------------------------
      });
      setVantaEffect(effect); // Lưu effect vào state
    }

    // Cleanup function: hủy effect khi component unmount
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null); // Reset state
      }
    };
  }, [vantaEffect]); // Dependency array chỉ chứa vantaEffect

  // Thêm class CSS để có thể style z-index
  return <div ref={vantaRef} className="vanta-bg" style={{ width: '100%', height: '100%' }} />;
};

export default VantaBackground;