import React, { useState } from "react";
import { api } from "../api/axios";

function ChatBot({ onClose }) {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Thêm tin nhắn người dùng vào chat log
    setChatLog((prev) => [...prev, { from: "user", text: message }]);

    try {
      const response = await api.post("/chat", {
        userId: "user1",
        message,
      });

      // response.data là array các object { recipient_id, text }
      const botReplies = response.data.map((item) => ({
        from: "bot",
        text: item.text,
      }));

      setChatLog((prev) => [...prev, ...botReplies]);
      setMessage("");
    } catch (error) {
      setChatLog((prev) => [
        ...prev,
        { from: "bot", text: "Lỗi kết nối server, vui lòng thử lại." },
      ]);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        maxWidth: 400,
        width: "90vw",
        height: 400,
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        padding: 10,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <strong>Hỗ trợ Chatbot</strong>
        <button
          onClick={onClose}
          style={{
            cursor: "pointer",
            border: "none",
            background: "none",
            fontSize: 24,
            lineHeight: 1,
            fontWeight: "bold",
          }}
          aria-label="Đóng chat"
          title="Đóng"
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 200,
          border: "1px solid #ddd",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.from === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                backgroundColor: msg.from === "user" ? "#0b93f6" : "#e5e5ea",
                color: msg.from === "user" ? "white" : "black",
                padding: "8px 12px",
                borderRadius: 16,
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        style={{ width: "100%", padding: 8 }}
      />
      <button
        onClick={sendMessage}
        style={{
          width: "100%",
          marginTop: 5,
          padding: 8,
          backgroundColor: "#0b93f6",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Gửi
      </button>
    </div>
  );
}

export default ChatBot;
