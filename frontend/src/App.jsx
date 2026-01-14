import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewBill from "./pages/NewBill";
import Bills from "./pages/Bills";
import ViewBill from "./pages/ViewBill";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function App() {
  const token = localStorage.getItem("token");
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar open={open} setOpen={setOpen} />

          {/* Main content */}
          <div className="flex flex-col flex-1">
            <Navbar setOpen={setOpen} />

            <main className="flex-1 overflow-y-auto bg-gray-900 text-white">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new-bill" element={<NewBill />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/bill/:id" element={<ViewBill />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
