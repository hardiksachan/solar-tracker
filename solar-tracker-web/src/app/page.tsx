"use client";

import { Charter } from "@/components/Charter";
import { DateRangeForm } from "@/components/DateRangeForm";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { time: "10:00", power: 20 },
  { time: "10:10", power: 22 },
  { time: "10:20", power: 30 },
  { time: "10:30", power: 25 },
  { time: "10:40", power: 40 },
  { time: "10:50", power: 50 },
];

export default function SolarTrackerDashboard() {
  return (
    <>
      <Charter
        fields={[
          { displayName: "Top Left", queryKey: "topLeft", color: "cyan" },
          { displayName: "Top Right", queryKey: "topRight", color: "orange" },
          { displayName: "Bottom Left", queryKey: "bottomLeft", color: "blue" },
          {
            displayName: "Bottom Right",
            queryKey: "bottomRight",
            color: "red",
          },
        ]}
      />
      <Charter
        fields={[
          { displayName: "X Adjustment", queryKey: "dx", color: "cyan" },
          { displayName: "Y Adjustment", queryKey: "dy", color: "orange" },
        ]}
      />
    </>
  );
}
