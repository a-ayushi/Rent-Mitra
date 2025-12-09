import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Google,
  Facebook,
  CheckCircle,
  Error,
  ArrowBack,
} from "@mui/icons-material";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [showOTP, setShowOTP] = useState(false);

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
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email) newErrors.email = "Required";
    else if (!/^\S+@\S+\.\S+$/i.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 8)
      newErrors.password = "Min. 8 chars";
    if (!formData.phone) newErrors.phone = "Required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "10 digits";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlertMessage("Please fix errors");
      setAlertSeverity("error");
      return;
    }
    setLoading(true);
    setAlertMessage("");
    
    setTimeout(() => {
      setShowOTP(true);
      setAlertMessage("Success!");
      setAlertSeverity("success");
      setLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    setAlertMessage(`${provider} login coming soon!`);
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
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none transition-colors group-focus-within:text-gray-900">
          {React.cloneElement(icon, { className: "text-gray-400 w-4 h-4" })}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-9 pr-10 py-2 text-sm border rounded-lg text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
            error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-400 bg-white"
          }`}
        />
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );

  if (showOTP) {
    return (
      <div className="h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md text-center transform transition-all">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
          <p className="text-gray-600 mb-6">We've sent a verification code to verify your account.</p>
          <button 
            onClick={() => setShowOTP(false)}
            className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
          >
            ← Back to registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-3xl mb-10">
        {/* Back Button */}
        <Link
  to="/login"
  className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
>
  <ArrowBack className="w-4 h-4" />
  <span>Back</span>
</Link>

        {/* Main Card */}
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
            <h1 className="text-2xl font-bold text-white relative z-10">Create Account</h1>
            <p className="text-gray-300 text-sm mt-1 relative z-10">Join us today</p>
          </div>

          <div className="p-6">
            {/* Alert */}
            {alertMessage && (
              <div
                className={`flex items-center gap-2 p-3 mb-4 rounded-xl text-xs font-medium ${
                  alertSeverity === "error"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : alertSeverity === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-gray-50 text-gray-700 border border-gray-100"
                }`}
              >
                {alertSeverity === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Error className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{alertMessage}</span>
              </div>
            )}

            <div className="grid md:grid-cols-[1.3fr_auto_0.9fr] gap-6 items-center">
              {/* Registration Form */}
              <div className="space-y-3">
                <InputField
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={<Person />}
                />
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<Email />}
                />
                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={<Phone />}
                />
                <InputField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock />}
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
                  </button>
                </InputField>

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900 cursor-pointer transition-all"
                    />
                    <span className="text-xs text-gray-600 leading-tight">
                      I agree to the{" "}
                      <a href="#" className="font-semibold text-gray-900 hover:underline">
                        Terms
                      </a>{" "}
                      &{" "}
                      <a href="#" className="font-semibold text-gray-900 hover:underline">
                        Privacy
                      </a>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 ml-6 text-xs text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full px-4 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg shadow-lg hover:shadow-xl hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="hidden md:flex flex-col items-center justify-center px-4">
                <div className="h-16 w-px bg-gray-200" />
                <div className="my-3 px-2 py-1 text-xs font-bold text-gray-400 bg-gray-50 rounded-full border border-gray-200">
                  OR
                </div>
                <div className="h-16 w-px bg-gray-200" />
              </div>

              <div className="relative md:hidden my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 text-xs font-bold text-gray-400 bg-white border border-gray-200 rounded-full">
                    OR
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex flex-col justify-center space-y-3">
                <button
                  onClick={() => handleSocialLogin("Google")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Google className="w-4 h-4" />
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                
                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-600">
                    Already have an account?{" "}
                     <Link
    to="/login"
    className="font-bold text-gray-900 hover:underline"
  >
    Sign in
  </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;