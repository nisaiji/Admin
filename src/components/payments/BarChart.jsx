import React from "react";
import { BarChart, barClasses, barElementClasses } from "@mui/x-charts";

export default function BarChartComponent({
  xAxisData = [],
  series = [],
  isDarkMode = false,
  height = 320,
  barColor = "#0A81D1",
}) {
  const axisColor = isDarkMode ? "#ffffff" : "#0f172a";
  const strokeColor = isDarkMode ? "#ffffff" : "#cbd5e1";

  return (
    <>
      {series?.length === 0 ? (
        <div
          className={` text-center ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}
        >
          No Data To Display
        </div>
      ) : (
        <BarChart
          height={height}
          margin={{ left: 56, right: 16, top: 16, bottom: 40 }}
          xAxis={[
            {
              data: xAxisData,
              tickLabelStyle: { fill: axisColor },
              labelStyle: { fill: axisColor },
              stroke: strokeColor,
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: { fill: axisColor },
              labelStyle: { fill: axisColor },
              stroke: strokeColor,
              width: 70,
              valueFormatter: (value) =>
                `₹${Number(value || 0).toLocaleString("en-IN")}`,
            },
          ]}
          series={[
            {
              data: series,
              valueFormatter: (value) =>
                `₹${Number(value || 0).toLocaleString("en-IN")}`,
            },
          ]}
          sx={{
            [`& .${barClasses.series} .${barElementClasses.root}`]: {
              fill: barColor,
              rx: 4,
              ry: 4,
            },
            "& .MuiChartsAxis-tickLabel": {
              fontSize: 11,
            },
          }}
        />
      )}
    </>
  );
}
