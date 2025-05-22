const NotFound = () => {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h1 style={{ fontSize: "4rem", color: "#ff4d4f" }}>404</h1>
        <p style={{ fontSize: "1.5rem" }}>Không tìm thấy trang bạn yêu cầu.</p>
        <a href="/login" style={{ color: "#007bff", textDecoration: "underline" }}>
          Quay về trang đăng nhập
        </a>
      </div>
    );
  };
  
  export default NotFound;
  