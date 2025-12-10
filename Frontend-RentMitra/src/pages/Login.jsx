import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import authService from "../services/authService";

const Login = () => {
  // --- Phone/OTP Login State ---
  const [usePhoneLogin, setUsePhoneLogin] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Resend OTP countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, setRefreshToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    try {
      setError("");
      setLoading(true);
      const credentials = {
        email: data.email,
        password: data.password,
      };
      const response = await authService.login(credentials);
      if (response.data && response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      await login(credentials);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-3 py-3 bg-gray-100 sm:px-4 lg:px-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="mt-1 text-xl font-extrabold text-center text-gray-900">
            Welcome Back!
          </h2>
        </div>
        <div className="p-6 bg-white shadow-xl rounded-2xl">
          {/* Toggle login method */}
          <div className="flex justify-center mb-3">
            <button
              className={`px-4 py-2 rounded-l-lg border ${!usePhoneLogin ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setUsePhoneLogin(false)}
              type="button"
            >
              Email Login
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg border border-l-0 ${usePhoneLogin ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => {
                setUsePhoneLogin(true);
                if (!phone) {
                  setPhone("+91 ");
                }
              }}
              type="button"
            >
              Phone Login
            </button>
          </div>
          {/* Error message */}
          {error && !usePhoneLogin && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md" role="alert">
              <p>{error}</p>
            </div>
          )}
          {/* EMAIL LOGIN FORM */}
          {!usePhoneLogin && (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="relative">
                <EmailIcon className="absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Email address"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="relative">
                <LockIcon className="absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password", { required: "Password is required" })}
                  placeholder="Password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 right-4 text-gray-500"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-gray-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg group hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          )}
          {/* PHONE/OTP LOGIN FORM */}
          {usePhoneLogin && (
            <div>
              {/* Step 1: Phone input */}
              {!otpSent && (
                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setOtpError("");
                    setOtpSuccess("");
                    setOtpLoading(true);
                    try {
                      const resp = await authService.sendOtp(phone);
                      if (resp.status === "success") {
                        setOtpSent(true);
                        setOtpSuccess(resp.message || "OTP sent!");
                        setResendTimer(60);
                      } else {
                        setOtpError(resp.message || "Failed to send OTP");
                      }
                    } catch (err) {
                      setOtpError(err?.error || err?.message || "Failed to send OTP");
                    } finally {
                      setOtpLoading(false);
                    }
                  }}
                >
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        let value = e.target.value || "";
                        // Always enforce +91 prefix
                        if (!value.startsWith("+91 ")) {
                          // Remove any existing +91 then re-add cleanly
                          value = "+91 " + value.replace(/^\+91/, "");
                        }
                        setPhone(value);
                      }}
                      placeholder="Phone number (e.g. +919999999999)"
                      className="w-full py-3 pl-4 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
                  {otpSuccess && <p className="mt-1 text-xs text-green-600">{otpSuccess}</p>}
                  <div>
                    <button
                      type="submit"
                      disabled={otpLoading || resendTimer > 0}
                      className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg group hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                    >
                      {otpLoading ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
                    </button>
                  </div>
                </form>
              )}
              {/* Step 2: OTP input */}
              {otpSent && (
                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setOtpError("");
                    setOtpLoading(true);
                    try {
                      const resp = await authService.verifyOtp(phone, otp);
                      if (resp.status === "success" && resp.jwt) {
                        // Store JWT and mark user as logged in
                        await login({ token: resp.jwt });
                        navigate("/dashboard");
                      } else {
                        setOtpError(resp.message || "Invalid OTP");
                      }
                    } catch (err) {
                      setOtpError(err?.error || err?.message || "Failed to verify OTP");
                    } finally {
                      setOtpLoading(false);
                    }
                  }}
                >
                  <div className="relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full py-3 pl-4 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="relative flex justify-center flex-1 px-4 py-3 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg group hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP & Login"}
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      className="ml-2 text-sm text-gray-600 hover:underline"
                      onClick={async () => {
  setOtpError("");
  setOtpSuccess("");
  setOtpLoading(true);
  try {
    const resp = await authService.sendOtp(phone);
    if (resp.status === "success") {
      setOtpSuccess(resp.message || "OTP resent!");
      setResendTimer(60);
    } else {
      setOtpError(resp.message || "Failed to resend OTP");
    }
  } catch (err) {
    setOtpError(err?.error || err?.message || "Failed to resend OTP");
  } finally {
    setOtpLoading(false);
  }
}}

                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:underline"
                  onClick={() => {
                    setUsePhoneLogin(false);
                    setOtpSent(false);
                    setOtp("");
                    setOtpError("");
                  }}
                >
                  Back to Email Login
                </button>
              </div>
            </div>
          )}
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-gray-600 hover:text-gray-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
