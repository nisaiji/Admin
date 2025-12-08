import React from "react";

export default function FlipCard({ isFlipped, front, back, onClick }) {
  return (
    <div
      className="relative w-40 h-40 mx-4 cursor-pointer"
      onClick={onClick}
      style={{ perspective: "1000px" }}
    >
      <div
        className={`w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>

        {/* BACK */}
        <div
          className="absolute w-full h-full rotate-y-180 backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
