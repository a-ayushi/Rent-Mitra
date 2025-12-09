import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Google,
  Facebook,
} from "@mui/icons-material";
import OTPVerification from "../components/auth/OTPVerification";
import logo from "../assets/RENTMITRALOGO.png";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [showOTP, setShowOTP] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+$/i.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Invalid phone number";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlertMessage("Please fix the errors below.");
      setAlertSeverity("error");
      return;
    }
    setLoading(true);
    setAlertMessage("");
    try {
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      setRegisteredUserId(response.data?.user?.id || null);
      setShowOTP(true);
      setAlertMessage("Registration successful! Please verify OTP.");
      setAlertSeverity("success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Registration failed. Please try again.";
      setAlertMessage(errorMessage);
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setAlertMessage(`${provider} login is not yet implemented.`);
    setAlertSeverity("info");
  };

  const InputField = ({
    id,
    name,
    type,
    placeholder,
    value,
    onChange,
    error,
    icon,
    children,
  }) => (
    <div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="mr-1">←</span>
            <span>Back</span>
          </Link>
          {/* <img src={logo} alt="Rent Mitra" className="h-10 sm:h-12 ml-3" /> */}
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-3 py-3 sm:px-4 lg:px-6">
        <div className="w-full max-w-3xl space-y-3 mt-1">
          <div>
            <h2 className="text-xl font-extrabold text-center text-gray-900">
              Create your account
            </h2>
            
          </div>
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            {showOTP && registeredUserId ? (
              <OTPVerification
                userId={registeredUserId}
                onSuccess={() => {
                  setShowOTP(false);
                  setAlertMessage("OTP verified! Logging you in...");
                  setAlertSeverity("success");
                  setTimeout(
                    () =>
                      login({
                        email: formData.email,
                        password: formData.password,
                      }).then(() => navigate("/dashboard")),
                    1000
                  );
                }}
              />
            ) : (
              <>
                {alertMessage && (
                  <div
                    className={`p-4 mb-6 rounded-md text-sm ${
                      alertSeverity === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {alertMessage}
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                  {/* Left: signup form */}
                  <form className="w-full md:w-7/12 space-y-6" onSubmit={handleSubmit}>
                    <InputField
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon={<Person className="text-gray-400" />}
                    />
                    <InputField
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon={<Email className="text-gray-400" />}
                    />
                    <InputField
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={<Phone className="text-gray-400" />}
                    />
                    <InputField
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={<Lock className="text-gray-400" />}
                    >
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </button>
                    </InputField>
                    <InputField
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      icon={<Lock className="text-gray-400" />}
                    >
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </button>
                    </InputField>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="font-medium text-gray-600 hover:underline"
                          >
                            Terms & Conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="font-medium text-gray-600 hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>

                  {/* Center: vertical OR with lines */}
                  <div className="hidden md:flex flex-col items-center justify-center px-3 mt-38">
                    <div className="h-22 border-l border-gray-300 mb-1" />
                    <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
                      OR
                    </div>
                    <div className="h-22 border-l border-gray-300 mt-1" />
                  </div>

                  {/* Right: external login options */}
                  <div className="mt-6 md:mt-0 w-full md:w-5/12 md:pl-2">
                    <div className="relative md:hidden mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-white">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-8 mt-40">
                      <button
                        onClick={() => handleSocialLogin("Google")}
                        className="inline-flex justify-center w-full md:w-52 px-4 py-2 text-sm font-medium text-white bg-[#DB4437] rounded-md shadow-sm hover:bg-[#c33c30]"
                      >
                        <Google className="w-5 h-5 mr-2" /> Google
                      </button>
                      <button
                        onClick={() => handleSocialLogin("Facebook")}
                        className="inline-flex justify-center w-full md:w-52 px-4 py-2 text-sm font-medium text-white bg-[#1877F2] rounded-md shadow-sm hover:bg-[#145fcc]"
                      >
                        <Facebook className="w-5 h-5 mr-2" /> Facebook
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-gray-600 hover:text-gray-500"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
