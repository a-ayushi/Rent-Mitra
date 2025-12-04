import React, { useState } from "react";
import authService from "../services/authService";

const ForgotPassword = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await authService.forgotPassword(input);
      setMessage(
        "If your email or phone is registered, you will receive a reset link or OTP."
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send reset instructions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-4 text-2xl font-bold text-center">Forgot Password</h2>
        {message && (
          <div className="mb-4 text-center text-green-600">{message}</div>
        )}
        {error && <div className="mb-4 text-center text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your email or phone"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
