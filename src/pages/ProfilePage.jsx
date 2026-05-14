import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-3xl font-extrabold mb-2">Profile</h1>
        <p className="text-gray-600 mb-6">Account details.</p>

        {!user ? (
          <div className="text-red-800 font-bold border border-red-200 bg-red-50 p-3 rounded-lg">
            You are not logged in.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-bold">Username: {user.username || "-"}</div>
            <div className="font-bold">Email: {user.email || "-"}</div>
          </div>
        )}

        <button
          onClick={onLogout}
          disabled={!user}
          className="mt-8 w-full bg-red-600 text-white font-extrabold px-4 py-3 rounded-lg disabled:opacity-60"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
