"use client"
import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import axios from "axios";

interface ProfileData {
  name: string;
  email: string;
  updated_at: string;
  created_at: string;
  email_verified_at: string;
  remember_me_expires_at: string;
  id: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

useEffect(() => {
  console.log("Remember me token:", document.cookie);
  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get("/profile");

      console.log("response", response)

      if (response.status === 200) {
        setProfile(response.data.data);
      }
    } catch (error: unknown) {
      console.log("isis error", error);

      // Check if the error is an AxiosError
      if (axios.isAxiosError(error)) {
        // Periksa jika response mengandung redirect_url
        if (error.response?.data?.data?.redirect_url) {
          // Jika ada redirect_url, arahkan user ke halaman login
          window.location.href = error.response.data.data.redirect_url;
        } else {
          setErrorMessage(
            error.response?.data?.message || "Failed to fetch profile data."
          );
        }
      } else if (error instanceof Error) {
        // Handle regular JS Error
        setErrorMessage(error.message || "An error occurred. Please try again.");
      } else {
        // Handle unknown error types
        setErrorMessage("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


  if (loading) return <div>Loading...</div>;

  if (errorMessage) return <div>Error: {errorMessage}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {profile ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Account Created:</strong> {new Date(profile.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date(profile.updated_at).toLocaleString()}
          </p>
          <p>
            <strong>Email Verified:</strong> {new Date(profile.email_verified_at).toLocaleString()}
          </p>
          <p>
            <strong>Token Expiry:</strong> {new Date(profile.remember_me_expires_at).toLocaleString()}
          </p>
          <p>
            <strong>User ID:</strong> {profile.id}
          </p>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;
