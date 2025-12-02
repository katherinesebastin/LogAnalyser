import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function EventChart({ events }) {
  const labels = Object.keys(events);
  const data = {
    labels,
    datasets: [
      {
        label: "Count",
        data: labels.map((k) => events[k]),
        backgroundColor: "#3498DB",
        borderRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "System Events Summary",
        color: "#2C3E50",
      }
    },
    scales: {
      x: { ticks: { color: "#2C3E50" } },
      y: { ticks: { color: "#2C3E50" } }
    }
  };

  return <Bar data={data} options={options} />;
}
