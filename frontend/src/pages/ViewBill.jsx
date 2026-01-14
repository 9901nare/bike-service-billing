import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ViewBill() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/bills/${id}`, {
        headers: { authorization: localStorage.getItem("token") },
      })
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (!data) return <p className="p-6 text-red-500">Bill not found</p>;

  const { bill, services, spares, images } = data;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto text-white pb-28 md:pb-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-xl md:text-2xl font-bold">
          Bill #{bill.id}
        </h2>

        <a
          href={`http://localhost:5000/api/bills/${bill.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-block bg-green-600 px-4 py-2 rounded font-semibold"
        >
          Download PDF
        </a>
      </div>

      {/* CUSTOMER / VEHICLE / PAYMENT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-800 p-4 rounded-xl">

        <div>
          <p className="text-xs text-gray-400">Customer</p>
          <p className="font-semibold">{bill.name}</p>
          <p className="text-sm text-gray-300">{bill.mobile1}</p>
          {bill.mobile2 && (
            <p className="text-sm text-gray-400">{bill.mobile2}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">Vehicle</p>
          <p className="font-semibold">{bill.vehicle_number}</p>
          <p className="text-sm text-gray-300">{bill.vehicle_type}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Mechanic</p>
          <p className="font-semibold">{bill.mechanic_name || "-"}</p>
          <p className="text-sm mt-1">
            Status:{" "}
            <span
              className={`font-bold ${
                bill.payment_status === "PAID"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {bill.payment_status}
            </span>
          </p>
        </div>
      </div>

      {/* SERVICES */}
      <h3 className="text-lg font-semibold mb-3">Services</h3>

      {/* MOBILE */}
      <div className="space-y-3 md:hidden">
        {services.map((s, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl">
            <p className="font-semibold">{s.service_name}</p>
            <p className="text-right mt-2 text-gray-300">
              ₹ {s.price}
            </p>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-gray-800 rounded mb-6">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-3">{s.service_name}</td>
                <td className="p-3 text-right">₹ {s.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SPARES */}
      {spares.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-3">Spares</h3>

          {/* MOBILE */}
          <div className="space-y-3 md:hidden">
            {spares.map((s, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-xl">
                <p className="font-semibold">{s.spare_name}</p>
                <div className="flex justify-between mt-2 text-sm text-gray-300">
                  <span>Qty: {s.qty}</span>
                  <span>₹ {s.price * s.qty}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-gray-800 rounded mb-6">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Spare</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {spares.map((s, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="p-3">{s.spare_name}</td>
                    <td className="p-3">{s.qty}</td>
                    <td className="p-3 text-right">
                      ₹ {s.price * s.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PAYMENT SUMMARY */}
      <div className="bg-gray-900 p-4 rounded-xl mt-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Amount</span>
          <span className="font-bold">₹ {bill.total_amount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Paid Amount</span>
          <span className="text-green-400 font-semibold">
            ₹ {bill.paid_amount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Pending Amount</span>
          <span className="text-yellow-400 font-semibold">
            ₹ {bill.pending_amount}
          </span>
        </div>
      </div>

      {/* NEXT SERVICE REMARKS */}
      {bill.next_service_remarks && (
        <div className="mt-6 bg-gray-800 p-4 rounded-xl">
          <p className="text-sm text-gray-400 mb-1">
            Remarks for Next Service
          </p>
          <p className="text-gray-200">
            {bill.next_service_remarks}
          </p>
        </div>
      )}

      {/* IMAGES */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Service Images</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images?.length ? (
            images.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000/uploads/${img.image_path}`}
                alt=""
                className="w-full h-32 object-cover rounded-lg border border-gray-700"
              />
            ))
          ) : (
            <p className="text-gray-400">No images uploaded</p>
          )}
        </div>
      </div>

      {/* MOBILE PDF BUTTON */}
      <div className="
        md:hidden fixed bottom-0 left-0 right-0
        bg-gray-900 border-t border-gray-700
        p-4 flex justify-end
      ">
        <a
          href={`http://localhost:5000/api/bills/${bill.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="bg-green-600 px-6 py-3 rounded-lg font-semibold"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
