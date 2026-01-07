import React from "react";
import { BarChart, barClasses, barElementClasses } from "@mui/x-charts";

export default function BarChartComponent({ xAxisData, series }) {
  return (
    <BarChart
      // margin={{ left: 70 }}
      xAxis={[
        {
          data: xAxisData,
          tickLabelStyle: { fill: "#fff" }, // X-axis text color
          labelStyle: { fill: "#fff" },
          stroke: "#fff", // X-axis line color
        },
      ]}
      yAxis={[
        {
          tickLabelStyle: { fill: "#fff" }, // Y-axis text color
          labelStyle: { fill: "#fff" },
          stroke: "#fff", // Y-axis line color
          width:70
          // valueFormatter: (v) => `₹${v.toLocaleString("en-IN")}`,
        },
      ]}
      series={[
        {
          data: series,
        },
      ]}
      sx={{
        [`& .${barClasses.series} .${barElementClasses.root}`]: {
          fill: "url(#bar-gradient)",
          rx: 4,
          ry: 4,
        },
      }}
    >
      <defs>
        <linearGradient gradientTransform="rotate(90)" id="bar-gradient">
          <stop offset="0%" stopColor="#0A81D1" />
          <stop offset="100%" stopColor="#4CBC9A" />
        </linearGradient>
      </defs>
    </BarChart>
  );
}
