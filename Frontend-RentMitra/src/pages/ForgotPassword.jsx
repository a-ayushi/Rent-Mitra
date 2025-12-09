import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-100 py-6 px-4">
      <h2 className="mb-4 text-2xl font-semibold text-center text-gray-900">
        Forgot your password?
      </h2>
      <div className="w-full max-w-md px-6 py-6 bg-white shadow-xl rounded-2xl">
        {message && (
          <div className="mb-4 text-center text-green-600">{message}</div>
        )}
        {error && <div className="mb-4 text-center text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Sending..." : "send email"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center text-gray-600">
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
