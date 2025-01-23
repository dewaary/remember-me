import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import axios from "axios";


interface VerifyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string | null;
  userId: string | null// Tambahkan userId agar dapat dikirim ke API
}

const VerifyCodeModal: React.FC<VerifyCodeModalProps> = ({ isOpen, onClose, qrCodeUrl, userId }) => {
    const [code, setCode] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string>("");
    const [ipAddress, setIpAddress] = useState<string>("");
    const router = useRouter();



    const handleDeviceId = () => {
      console.log("masuk sini")
      try {
        let storedDeviceId = localStorage.getItem("device_id");
        if (!storedDeviceId) {
          storedDeviceId = uuidv4();
        }
        setDeviceId(storedDeviceId);
      } catch (error) {
        console.error("Error handling device ID:", error);
      }
    };
  
    // Function to fetch IP Address
    const fetchIpAddress = async () => {
      console.log("masuk sini ipp adreess")
      try {
        const { data } = await axios.get("https://api.ipify.org?format=json");
        console.log("ip address", data.ip);
        setIpAddress(data.ip);
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
      }
    };

    useEffect(() => {
      console.log("useEffect triggered");
      handleDeviceId();
      fetchIpAddress();
    },[])

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage(null);
      if (rememberMe) {
        // Jika remember me = true, simpan deviceId dan ipAddress di localStorage
        localStorage.setItem("device_id", deviceId);
        localStorage.setItem("ip_address", ipAddress);
      }

        console.log('Headers yang dikirim:', {
          "Device-ID": deviceId || "",
          "X-Forwarded-For": ipAddress || "",
        });
  
      try {
        const response = await api.post("/verify-code", {
          user_id: userId,
          google2fa_code: code,
          remember_me: rememberMe,
        }, {
          headers: {
            "Device-ID": deviceId || "",
            "X-Forwarded-For": ipAddress || "", // Opsional untuk memastikan IP
          },
        });

        if (rememberMe) {
          // Jika remember me = true, simpan deviceId dan ipAddress di localStorage
          localStorage.setItem("device_id", deviceId);
          localStorage.setItem("ip_address", ipAddress);
        }
  
  
        if (response.status === 200) {
  
          alert("Verification successful!");
          onClose();
          router.push('/home');
        }
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.message || "An error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            ×
          </button>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Verify Code</h2>
          <div className="flex justify-center mb-4">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
            ) : (
              <p>Enter the verification code from your Google Authenticator app</p>
            )}
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Enter Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter the verification code"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 focus:ring-blue-400"
                />
                Remember Me
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white rounded-md transition duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  };
  

export default VerifyCodeModal;
