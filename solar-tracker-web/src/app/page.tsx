"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { time: "10:00", power: 20 },
  { time: "10:30", power: 30 },
  { time: "11:00", power: 25 },
  { time: "11:30", power: 40 },
  { time: "12:00", power: 50 }
];

export default function SolarTrackerDashboard() {
  const [chartData, setChartData] = useState<{ time: string; power: number }[]>([]);

  useEffect(() => {
    setChartData(mockData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Solar Tracker Data</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="power" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
