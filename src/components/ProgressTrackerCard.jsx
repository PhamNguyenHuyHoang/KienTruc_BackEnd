import React, { useEffect, useState } from "react";
import { CardHeader, CardContent, CardTitle } from "./ui/card";
import GlassCard from "./ui/GlassCard";
import { Progress } from "./ui/progress";
import { api } from "../api/axios";

const ProgressTrackerCard = () => {
  const [data, setData] = useState({
    accumulatedCredits: 0,
    requiredCredits: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get("/sinhvien/tien-do-hoc-tap");
        setData(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy tiến độ học tập:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  // Tính toán tỷ lệ phần trăm
  const percentage = Math.round(
    (data.accumulatedCredits / data.requiredCredits) * 100
  );

  // Màu sắc thanh tiến độ
  const progressColor =
    percentage >= 75
      ? "bg-green-600"
      : percentage >= 30
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-700">
          📈 Tiến độ học tập
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground italic">
            Đang tải tiến độ học tập...
          </p>
        ) : (
          <>
            <p className="text-base mb-2">
              Bạn đã tích lũy{" "}
              <strong className="font-semibold">
                {data.accumulatedCredits}/{data.requiredCredits} tín chỉ
              </strong>{" "}
              (<span className="font-semibold">{percentage}%</span>)
            </p>

            {/* Thanh tiến độ với hiệu ứng chuyển động */}
            <div className="relative mb-2">
              <Progress
                value={percentage}
                max={100} // Đảm bảo thanh tiến độ có giá trị tối đa là 100
                className={`h-6 rounded-full transition-all duration-500 ${progressColor}`}
              />
              {/* Hiển thị phần trăm trực tiếp trên thanh tiến độ */}
              <span
                className="absolute left-1/2 transform -translate-x-1/2 top-1/2 transform -translate-y-1/2 text-white font-bold"
                style={{ fontSize: "14px" }}
              >
                {percentage}%
              </span>
            </div>

            <p className="mt-2 text-sm italic text-muted-foreground">
              Cố gắng duy trì tiến độ để tốt nghiệp đúng hạn nhé!
            </p>
          </>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default ProgressTrackerCard;
