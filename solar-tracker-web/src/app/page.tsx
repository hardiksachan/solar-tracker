

// import { useEffect, useState } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// const mockData = [
//   { time: "10:00", power: 20 },
//   { time: "10:10", power: 22 },
//   { time: "10:20", power: 30 },
//   { time: "10:30", power: 25 },
//   { time: "10:45", power: 40 },
//   { time: "10:50", power: 50 },
//   { time: "11:00", power: 60 }
// ];

// export default function SolarTrackerDashboard() {
//   const [chartData, setChartData] = useState<{ time: string; power: number }[]>([]);
//   const [filter, setFilter] = useState("10min");

//   useEffect(() => {
//     let filteredData = mockData;
//     if (filter === "10min") {
//       filteredData = mockData.slice(-2);
//     } else if (filter === "15min") {
//       filteredData = mockData.slice(-3);
//     } else if (filter === "1hr") {
//       filteredData = mockData;
//     }
//     setChartData(filteredData);
//   }, [filter]);

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Solar Tracker Data</h1>
//       <label className="mr-2 font-semibold">Select Time Range:</label>
//       <select className="border p-2 rounded" value={filter} onChange={(e) => setFilter(e.target.value)}>
//         <option value="10min">Last 10 min</option>
//         <option value="15min">Last 15 min</option>
//         <option value="1hr">Last 1 hr</option>
//       </select>
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" label={{ value: "Time", position: "insideBottomRight", offset: -5 }} />
//           <YAxis label={{ value: "Power", angle: -90, position: "insideLeft" }} />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="power" stroke="#8884d8" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { time: "10:00", power: 20 },
  { time: "10:10", power: 22 },
  { time: "10:20", power: 30 },
  { time: "10:30", power: 25 },
  { time: "10:40", power: 40 },
  { time: "10:50", power: 50 }
];

export default function SolarTrackerDashboard() {
  const [chartData, setChartData] = useState<{ time: string; power: number }[]>([]);
  const [filter, setFilter] = useState("10min");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    let filteredData = mockData;
    if (filter === "10min") {
      filteredData = mockData.slice(-2);
    } else if (filter === "15min") {
      filteredData = mockData.slice(-3);
    } else if (filter === "1hr") {
      filteredData = mockData;
    } else if (filter === "custom" && customRange.start && customRange.end) {
      filteredData = mockData.filter(
        (entry) => entry.time >= customRange.start && entry.time <= customRange.end
      );
    }
    setChartData(filteredData);
  }, [filter, customRange]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Solar Tracker Data</h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Time Range:</label>
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="10min">Last 10 min</option>
          <option value="15min">Last 15 min</option>
          <option value="1hr">Last 1 hr</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {filter === "custom" && (
        <div className="mb-4 flex space-x-4">
          <input
            type="time"
            className="border p-2 rounded bg-white text-black"
            value={customRange.start}
            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
          />
          <input
            type="time"
            className="border p-2 rounded bg-white text-black"
            value={customRange.end}
            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
          />
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "Time", position: "insideBottomRight", offset: -5 }} />
          <YAxis label={{ value: "Power", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="power" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
