"use client";
import React, { useState } from "react";
import api from "../../../utils/api";
import VerifyCodeModal from "../components/VerifyModalComponent";



const LoginPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
  
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.status === "success") {
        console.log("test qrcode", response.data);
  
        const { qrcode_url, user_id, statusQrCode } = response.data.data;

        console.log("user id", user_id)
  
        if (statusQrCode) {
          // QR code already scanned, ask the user for the 2FA code
          setIsModalOpen(true);

          setUserId(user_id);
          setQrCodeUrl(null);  // No need to show QR code
        } else {
          // QR code not scanned yet, show QR code
          setQrCodeUrl(qrcode_url);
          setUserId(user_id);
          setIsModalOpen(true);
        }
      } else {
        alert(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  const closeModal = () => {
    setIsModalOpen(false);
    setQrCodeUrl(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <form className="mt-6" onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
      <VerifyCodeModal isOpen={isModalOpen} onClose={closeModal} qrCodeUrl={qrCodeUrl} userId={userId}/>
    </div>
  );
};

export default LoginPage;
