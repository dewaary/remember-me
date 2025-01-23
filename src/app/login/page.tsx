"use client";
import React, { useState } from "react";
import api from "../../../utils/api";
import VerifyCodeModal from "../components/VerifyModalComponent";
import { useRouter } from "next/navigation";



const LoginPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Ambil nilai email dan password dari form
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
  
    // Ambil deviceId dan ipAddress dari localStorage (jika ada)
    const storedDeviceId = localStorage.getItem("device_id");
    const storedIpAddress = localStorage.getItem("ip_address");
  
    // Set headers dengan device_id dan ip_address jika ada
    const headers: Record<string, string> = {};
    if (storedDeviceId) headers["Device-ID"] = storedDeviceId;
    if (storedIpAddress) headers["X-Forwarded-For"] = storedIpAddress;
  
    try {
      // Kirim permintaan login
      const response = await api.post("/login", { email, password }, { headers });
  
      if (response.data.status === "success") {
        console.log("test qrcode", response.data);
  
        const { qrcode_url, user_id, statusQrCode } = response.data.data;
        
      // Jika device_id dan ip_address sudah cocok, langsung redirect ke home
      console.log("response data match", response.data.data.device_id_matches)
      console.log("response data", response.data)
      if (response.data.data.device_id_matches && response.data.data.ip_address_matches) {
        // Jika cocok, redirect langsung ke halaman home
        router.push("/home");
        return;
      }
  
        if (statusQrCode) {
          // QR code sudah dipindai, minta kode 2FA
          setIsModalOpen(true);
          setUserId(user_id);
          setQrCodeUrl(null);  // Tidak perlu menampilkan QR code lagi
        } else {
          // QR code belum dipindai, tampilkan QR code
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
