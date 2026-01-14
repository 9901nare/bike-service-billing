import { useState } from "react";
import axios from "axios";

export default function NewBill() {

  /* ================= STATES ================= */

  // CUSTOMER
  const [customerName, setCustomerName] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [mechanic, setMechanic] = useState("");

  // SERVICES
  const [services, setServices] = useState([
    { service_name: "", price: 0 }
  ]);

  // SPARES
  const [spares, setSpares] = useState([
    { spare_name: "", price: 0, qty: 1 }
  ]);

  // AUTOCOMPLETE
  const [spareSuggestions, setSpareSuggestions] = useState([]);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [activeSpare, setActiveSpare] = useState(null);
  const [activeService, setActiveService] = useState(null);

  // OTHER
  const [nextServiceRemarks, setNextServiceRemarks] = useState("");
  const [images, setImages] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const bikeCompanies = [
    "Hero", "Honda", "TVS", "Bajaj", "Yamaha",
    "Royal Enfield", "KTM", "Suzuki",
    "Jawa", "BMW", "Kawasaki", "Other"
  ];

  /* ================= HANDLERS ================= */

  const addService = () =>
    setServices([...services, { service_name: "", price: 0 }]);

  const updateService = (i, field, value) => {
    const copy = [...services];
    copy[i][field] = value;
    setServices(copy);
  };

  const addSpare = () =>
    setSpares([...spares, { spare_name: "", price: 0, qty: 1 }]);

  const updateSpare = (i, field, value) => {
    const copy = [...spares];
    copy[i][field] = value;
    setSpares(copy);
  };

  /* ================= TOTAL ================= */

  const serviceTotal = services.reduce(
    (sum, s) => sum + (Number(s.price) || 0), 0
  );

  const spareTotal = spares.reduce(
    (sum, s) => sum + (Number(s.price) || 0) * (Number(s.qty) || 0), 0
  );

  const totalAmount = serviceTotal + spareTotal;

  const pendingAmount = Math.max(
    totalAmount - (Number(paidAmount) || 0), 0
  );

  const paymentStatus = pendingAmount === 0 ? "PAID" : "PENDING";

  /* ================= SUBMIT ================= */

  const submitBill = async () => {
    if (!customerName || !vehicleNumber) {
      alert("Customer & Vehicle required");
      return;
    }

    const formData = new FormData();
    formData.append("customer_name", customerName);
    formData.append("mobile1", mobile1);
    formData.append("mobile2", mobile2);
    formData.append("vehicle_number", vehicleNumber);
    formData.append("vehicle_type", vehicleType);
    formData.append("mechanic_name", mechanic);
    formData.append("total_amount", totalAmount);
    formData.append("paid_amount", paidAmount);
    formData.append("pending_amount", pendingAmount);
    formData.append("payment_status", paymentStatus);
    formData.append("next_service_remarks", nextServiceRemarks);
    formData.append("services", JSON.stringify(services));
    formData.append("spares", JSON.stringify(spares));
    images.forEach(img => formData.append("images", img));

    await axios.post("http://localhost:5000/api/bills", formData);
    alert("✅ Bill Created Successfully");
  };

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 max-w-5xl text-white pb-28 md:pb-6">

      <h2 className="text-xl md:text-2xl mb-6 font-semibold">
        Create New Bill
      </h2>

      {/* CUSTOMER DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input className="p-3 bg-gray-800 rounded" placeholder="Customer Name"
          value={customerName} onChange={e => setCustomerName(e.target.value)} />

        <input className="p-3 bg-gray-800 rounded" placeholder="Mobile Number 1"
          value={mobile1} onChange={e => setMobile1(e.target.value)} />

        <input className="p-3 bg-gray-800 rounded" placeholder="Mobile Number 2"
          value={mobile2} onChange={e => setMobile2(e.target.value)} />

        <input className="p-3 bg-gray-800 rounded" placeholder="Vehicle Number"
          value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />

        <input list="vehicle-companies" className="p-3 bg-gray-800 rounded"
          placeholder="Vehicle Type"
          value={vehicleType}
          onChange={e => setVehicleType(e.target.value)} />

        <datalist id="vehicle-companies">
          {bikeCompanies.map((c, i) => <option key={i} value={c} />)}
        </datalist>

        <input className="p-3 bg-gray-800 rounded" placeholder="Mechanic Name"
          value={mechanic} onChange={e => setMechanic(e.target.value)} />
      </div>

      {/* SPARES */}
      <h3 className="text-lg mt-6 mb-3">Parts</h3>

      {spares.map((s, i) => (
        <div key={i}
          className="bg-gray-800 p-4 rounded-xl md:grid md:grid-cols-4 gap-3 mb-3 relative">

          <input
            className="p-2 bg-gray-700 rounded md:col-span-2"
            placeholder="Spare Name"
            value={s.spare_name}
            onChange={async e => {
              const val = e.target.value;
              updateSpare(i, "spare_name", val);
              setActiveSpare(i);

              if (val.length >= 1) {
                const res = await axios.get(
                  `http://localhost:5000/api/autocomplete/spares?q=${val}`
                );
                setSpareSuggestions(res.data);
              } else {
                setSpareSuggestions([]);
              }
            }}
          />

          {activeSpare === i && spareSuggestions.length > 0 && (
            <div className="absolute bg-gray-900 border border-gray-700 rounded w-full mt-12 z-10">
              {spareSuggestions.map((item, idx) => (
                <div key={idx}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    updateSpare(i, "spare_name", item.spare_name);
                    updateSpare(i, "price", item.price);
                    setSpareSuggestions([]);
                  }}>
                  {item.spare_name}
                </div>
              ))}
            </div>
          )}

          <input type="number" className="p-2 bg-gray-700 rounded"
            placeholder="Price"
            value={s.price}
            onChange={e => updateSpare(i, "price", e.target.value)} />

          <input type="number" className="p-2 bg-gray-700 rounded"
            placeholder="Qty"
            value={s.qty}
            onChange={e => updateSpare(i, "qty", e.target.value)} />
        </div>
      ))}

      <button onClick={addSpare}
        className="mt-2 px-4 py-2 bg-purple-600 rounded">
        + Add Part
      </button>

      {/* SERVICES */}
      <h3 className="text-lg mt-8 mb-3">Labour</h3>

      {services.map((s, i) => (
        <div key={i}
          className="bg-gray-800 p-4 rounded-xl md:grid md:grid-cols-3 gap-3 mb-3 relative">

          <input
            className="p-2 bg-gray-700 rounded md:col-span-2"
            placeholder="Service Name"
            value={s.service_name}
            onChange={async e => {
              const val = e.target.value;
              updateService(i, "service_name", val);
              setActiveService(i);

              if (val.length >= 1) {
                const res = await axios.get(
                  `http://localhost:5000/api/autocomplete/services?q=${val}`
                );
                setServiceSuggestions(res.data);
              } else {
                setServiceSuggestions([]);
              }
            }}
          />

          {activeService === i && serviceSuggestions.length > 0 && (
            <div className="absolute bg-gray-900 border border-gray-700 rounded w-full mt-12 z-10">
              {serviceSuggestions.map((item, idx) => (
                <div key={idx}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    updateService(i, "service_name", item.service_name);
                    updateService(i, "price", item.price);
                    setServiceSuggestions([]);
                  }}>
                  {item.service_name}
                </div>
              ))}
            </div>
          )}

          <input type="number" className="p-2 bg-gray-700 rounded"
            placeholder="Price"
            value={s.price}
            onChange={e => updateService(i, "price", e.target.value)} />
        </div>
      ))}

      <button onClick={addService}
        className="mt-2 px-4 py-2 bg-blue-600 rounded">
        + Add Labour
      </button>

      {/* NEXT SERVICE REMARKS */}
      <div className="mt-6">
        <textarea
          className="w-full p-3 bg-gray-800 rounded min-h-[90px]"
          placeholder="Remarks for Next Service"
          value={nextServiceRemarks}
          onChange={e => setNextServiceRemarks(e.target.value)}
        />
      </div>

      {/* IMAGES */}
      <input
        type="file"
        multiple
        className="block mt-6"
        onChange={e => setImages([...e.target.files])}
      />

      {/* PAYMENT */}
      <div className="bg-gray-900 p-4 mt-6 rounded space-y-3">
        <div className="flex justify-between text-lg">
          <span>Total</span>
          <span className="font-bold">₹ {totalAmount}</span>
        </div>

        <input type="number" className="p-2 bg-gray-800 rounded"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={e => setPaidAmount(e.target.value)} />

          {/* ✅ PENDING AMOUNT FIELD (MISSING FIXED) */}
        <input
          type="number"
          className="p-2 bg-gray-700 rounded w-full"
          value={pendingAmount}
          readOnly
        />

        <p className="text-sm text-gray-400">
          Status: <b>{paymentStatus}</b>
        </p>
      </div>

      <button onClick={submitBill}
        className="mt-6 w-full py-3 bg-green-600 rounded text-lg">
        Generate Bill
      </button>

    </div>
  );
}
