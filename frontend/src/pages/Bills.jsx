import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/bills")
      .then(res => setBills(res.data));
  }, []);

  /* 🗑 DELETE BILL */
  const deleteBill = async (billId) => {
    if (!window.confirm("Delete this bill permanently?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/bills/${billId}`);
      setBills(prev => prev.filter(b => b.id !== billId));
    } catch {
      alert("Failed to delete bill");
    }
  };

  /* 🚗 GET UNIQUE VEHICLE TYPES */
  const vehicleTypes = [...new Set(bills.map(b => b.vehicle_type).filter(Boolean))];

  /* 🔍 FILTER LOGIC */
  const filteredBills = bills.filter(b => {
    const text = search.toLowerCase();

    const matchText =
      b.name?.toLowerCase().includes(text) ||
      b.vehicle_number?.toLowerCase().includes(text) ||
      b.mobile?.includes(text);

    const matchStatus = !status || b.payment_status === status;
    const matchVehicle = !vehicleType || b.vehicle_type === vehicleType;

    return matchText && matchStatus && matchVehicle;
  });

  return (
    <div className="p-4 md:p-6 text-white">
      <h2 className="text-xl mb-4 font-semibold">All Bills</h2>

      {/* 🔍 SEARCH & FILTER */}
      <div className="bg-gray-900 p-4 rounded-xl mb-6 grid gap-3 grid-cols-1 md:grid-cols-5">
        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Search name / vehicle / phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="p-2 bg-gray-800 rounded"
          value={vehicleType}
          onChange={e => setVehicleType(e.target.value)}
        >
          <option value="">All Vehicles</option>
          {vehicleTypes.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          className="p-2 bg-gray-800 rounded"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatus("");
            setVehicleType("");
          }}
          className="bg-gray-700 rounded px-4 py-2"
        >
          Clear
        </button>
      </div>

      {/* 📱 MOBILE VIEW */}
      <div className="space-y-4 md:hidden">
        {filteredBills.map(b => (
          <div key={b.id} className="bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-400">Customer</p>
                <p className="font-semibold">{b.name}</p>
              </div>

              <Link to={`/bill/${b.id}`} className="text-blue-400 text-sm">
                View →
              </Link>
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <div>
                <p className="text-gray-400">Vehicle</p>
                <p>{b.vehicle_number}</p>
              </div>

              <div className="text-right">
                <p className="text-gray-400">Total</p>
                <p className="font-bold">₹ {b.total_amount}</p>
              </div>
            </div>

            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-400">
                {new Date(b.bill_date).toLocaleDateString()}
              </span>
              <span className={
                b.payment_status === "PAID"
                  ? "text-green-400"
                  : "text-yellow-400"
              }>
                {b.payment_status}
              </span>
            </div>

            <button
              onClick={() => deleteBill(b.id)}
              className="mt-3 w-full bg-red-600 py-2 rounded-lg text-sm"
            >
              Delete Bill
            </button>
          </div>
        ))}
      </div>

      {/* 🖥 DESKTOP VIEW */}
      <table className="hidden md:table w-full bg-gray-800 rounded">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th className="p-3">Customer</th>
            <th>Vehicle</th>
            <th>Bill Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredBills.map(b => (
            <tr key={b.id} className="border-b border-gray-700">
              <td className="p-3">{b.name}</td>
              <td>{b.vehicle_number}</td>
              <td>{new Date(b.bill_date).toLocaleDateString()}</td>
              <td>₹ {b.total_amount}</td>
              <td>
                <span className={
                  b.payment_status === "PAID"
                    ? "text-green-400"
                    : "text-yellow-400"
                }>
                  {b.payment_status}
                </span>
              </td>
              <td className="flex gap-4">
                <Link to={`/bill/${b.id}`} className="text-blue-400">
                  View
                </Link>

                <button
                  onClick={() => deleteBill(b.id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredBills.length === 0 && (
        <p className="text-gray-400 mt-6 text-center">No bills found</p>
      )}
    </div>
  );
}
