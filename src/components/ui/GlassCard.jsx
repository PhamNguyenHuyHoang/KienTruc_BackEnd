import React from "react";
import { Card } from "./card";

const GlassCard = ({ children, className = "", ...props }) => {
  return (
    <Card
      className={`bg-white/80 backdrop-blur-md shadow-xl rounded-lg ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
