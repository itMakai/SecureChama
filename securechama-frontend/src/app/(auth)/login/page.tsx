"use client";

import { useState, useContext } from "react";
import api from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    const response = await api.post("token/", {
      username,
      password,
    });

    auth?.login(response.data.access);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          SecureChama Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
        >
          Login
        </button>
      </div>
    </div>
  );
}
