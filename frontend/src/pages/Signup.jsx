import { useState } from "react";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
      });
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded w-80 text-white">
        <h2 className="text-xl mb-4">Garage Signup</h2>

        <input
          className="w-full mb-3 p-2 bg-gray-700 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 bg-gray-700 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 bg-gray-700 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-green-600 w-full p-2 rounded"
        >
          Signup
        </button>
      </div>
    </div>
  );
}

export default Signup;
