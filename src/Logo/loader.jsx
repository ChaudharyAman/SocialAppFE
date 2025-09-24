import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-20">
      <span
        className="w-1 h-5 bg-green-900 rounded-full"
        style={{
          animation: "scaleY 1s linear infinite",
          animationDelay: "0s",
        }}
      ></span>
      <span
        className="w-1 h-8 bg-green-900 rounded-full"
        style={{
          animation: "scaleY 1s linear infinite",
          animationDelay: "0.25s",
        }}
      ></span>
      <span
        className="w-1 h-5 bg-green-900 rounded-full"
        style={{
          animation: "scaleY 1s linear infinite",
          animationDelay: "0.5s",
        }}
      ></span>

      <style>
        {`
          @keyframes scaleY {
            0%, 40%, 100% { transform: scaleY(1); }
            20% { transform: scaleY(1.5); background-color: #ffffff; }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
