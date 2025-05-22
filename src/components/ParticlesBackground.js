import { useCallback } from "react";
import Particles from "react-tsparticles";
// Sử dụng bản slim nhẹ hơn, đủ cho hiệu ứng mạng lưới
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  // Hàm khởi tạo engine tsparticles
  const particlesInit = useCallback(async (engine) => {
    // console.log(engine); // Dùng để debug nếu cần
    // Tải preset slim (chứa particles và links)
    await loadSlim(engine);
  }, []);

  // Hàm được gọi khi particles đã tải xong (tùy chọn)
  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container); // Dùng để debug nếu cần
  }, []);

  // Cấu hình chi tiết cho hiệu ứng particles
  const options = {
    background: {
      color: {
        value: "#050b1a", // Màu nền xanh đen đậm
      },
    },
    fpsLimit: 60, // Giới hạn FPS để tối ưu hiệu năng
    interactivity: {
      events: {
        // Có thể bật hover nếu muốn
        // onHover: {
        //   enable: true,
        //   mode: "repulse",
        // },
        resize: true, // Cho phép tự điều chỉnh khi resize
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#2a9dff", // Màu hạt (xanh dương sáng)
      },
      links: { // *** Tạo hiệu ứng mạng lưới ***
        color: "#2a9dff", // Màu đường nối
        distance: 150,    // Khoảng cách nối
        enable: true,     // Bật đường nối
        opacity: 0.4,     // Độ mờ đường nối
        width: 1,         // Độ dày đường nối
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce", // Dội lại khi chạm cạnh
        },
        random: false,
        speed: 1.5,         // Tốc độ hạt
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,      // Mật độ
        },
        value: 60,        // Số lượng hạt
      },
      opacity: {
        value: 0.4,       // Độ mờ hạt
      },
      shape: {
        type: "circle",   // Hình dạng hạt
      },
      size: {
        value: { min: 1, max: 3 }, // Kích thước ngẫu nhiên
      },
    },
    detectRetina: true, // Hỗ trợ màn hình Retina
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      className="particles-bg" // Thêm class để style CSS
      // Không đặt style inline ở đây để CSS dễ quản lý hơn
    />
  );
};

export default ParticlesBackground;