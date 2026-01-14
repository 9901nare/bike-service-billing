
import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/stats")
      .then(res => setStats(res.data));
  }, []);

  return (
    <div className="px-4 py-5 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <span className="text-xs text-gray-400">
          Today
        </span>
      </div>

      {/* Banner Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src="/public/hero.png" // Place your bike image in the public/images folder
          alt="Bike Banner"
          className="w-full h-100 object-cover"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <h2 className="text-white text-xl font-bold"></h2>
        </div>
      </div>

      {/* Highlight Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-5 shadow-lg">
        <p className="text-sm text-white/80">Today’s Income</p>
        <h2 className="text-3xl font-bold text-white mt-2">
          ₹{stats.today || 0}
        </h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Bills"
          value={stats.totalBills || 0}
          compact
        />
        <StatCard
          title="Monthly Income"
          value={stats.month || 0}
          compact
        />
      </div>
    </div>
  );
}
