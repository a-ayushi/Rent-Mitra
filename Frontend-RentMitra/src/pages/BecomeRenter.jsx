import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Verified,
  Security,
  LocalShipping,
  AttachMoney,
  CloudUpload,
} from "@mui/icons-material";

const BecomeRenter = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCta = () => {
    navigate(isAuthenticated ? "/add-item" : `/login?redirect=${encodeURIComponent("/add-item")}`);
  };

  const steps = [
    {
      title: "List your item",
      description: "Add photos, set rent price, and publish in minutes.",
      icon: <CloudUpload className="w-6 h-6" />,
    },
    {
      title: "Get requests",
      description: "Renters contact you. Approve requests when you’re ready.",
      icon: <Verified className="w-6 h-6" />,
    },
    {
      title: "Earn securely",
      description: "Receive payments and keep your item protected.",
      icon: <AttachMoney className="w-6 h-6" />,
    },
  ];

  const benefits = [
    {
      title: "Verified users",
      description: "We encourage verified profiles for safer rentals.",
      icon: <Verified className="w-6 h-6" />,
    },
    {
      title: "Secure renting",
      description: "Clear policies and rental terms to protect you.",
      icon: <Security className="w-6 h-6" />,
    },
    {
      title: "Delivery options",
      description: "Offer pickup or delivery depending on your preference.",
      icon: <LocalShipping className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Become a Renter</h1>
            <p className="text-gray-300 text-lg md:text-xl">
              Turn your unused items into income. List for free and start earning today on Rent Mitra.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCta}
                className="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                {isAuthenticated ? "Start Renting" : "Login to Start Renting"}
              </button>
              <button
                onClick={() => navigate("/categories")}
                className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Browse items
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
                <p className="text-gray-600 mt-1">Rent out in 3 simple steps</p>
              </div>
              <button
                onClick={handleCta}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                {isAuthenticated ? "List an item" : "Login"}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={s.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-900">
                      {s.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Step {i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 mt-1">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Ready to rent out? Create your first listing and start earning.
            </p>
            <div className="mt-4">
              <button
                onClick={handleCta}
                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                {isAuthenticated ? "Start Renting" : "Login to Start Renting"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeRenter;
