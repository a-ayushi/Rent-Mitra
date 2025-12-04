import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import api from "../services/api";
import {
  CloudUpload,
  Delete,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Close,
  Category,
  LocationOn,
  AttachMoney,
  RateReview,
} from "@mui/icons-material";
import { useCity } from '../hooks/useCity';
import CityDropdown from '../components/common/CityDropdown';

const steps = [
  { title: "Basic Information", icon: <Category /> },
  { title: "Pricing & Availability", icon: <AttachMoney /> },
  { title: "Location & Images", icon: <LocationOn /> },
  { title: "Review & Submit", icon: <RateReview /> },
];

const AddItem = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [submitError, setSubmitError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const { city } = useCity();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subcategory: "",
      condition: "excellent",
      brand: "",
      pricePerDay: "",
      securityDeposit: "",
      minimumRentalPeriod: 1,
      maximumRentalPeriod: 30,
      address: "",
      city: city || "",
      state: "",
      zipCode: "",
      instantBooking: false,
      features: [],
    },
  });

  const watchedValues = watch();
  const selectedCategory = watch("category");


  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      const mainCategories = response.filter((cat) => !cat.parentCategory);
      setCategories(mainCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);


  const fetchSubcategories = useCallback(async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}/subcategories`);
      setSubcategories(response || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
      setValue("subcategory", "");
    } else {
      setSubcategories([]);
      setValue("subcategory", "");
    }
  }, [selectedCategory, setValue, fetchSubcategories]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      setSubmitError("You can upload a maximum of 5 images.");
      return;
    }
    const newImageFiles = [...imageFiles, ...files];
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles(newImageFiles);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setSubmitError("");
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((files) => files.filter((_, i) => i !== index));
    setImagePreviews((previews) => previews.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const fieldsToValidate = [
      ["name", "description", "category", "condition"],
      [
        "pricePerDay",
        "securityDeposit",
        "minimumRentalPeriod",
        "maximumRentalPeriod",
      ],
      ["address", "city", "state", "zipCode"],
    ][activeStep];

    const isValid = await trigger(fieldsToValidate);
    if (activeStep === 2 && imageFiles.length === 0) {
      setSubmitError("Please upload at least one image.");
      return;
    }
    if (isValid) {
      setActiveStep((prev) => prev + 1);
      setSubmitError("");
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError("");
    const formData = new FormData();



    // Remove location fields from top-level
    const dataCopy = { ...data };
    delete dataCopy.address;
    delete dataCopy.city;
    delete dataCopy.state;
    delete dataCopy.zipCode;

    // Append all other fields
    Object.entries(dataCopy).forEach(([key, value]) => {
      if (value)
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        );
    });
    // Add 'title' field for backend validation
    formData.append('title', data.name);
    // Append location fields as nested keys for backend validator
    formData.append("location.address", data.address);
    formData.append("location.city", data.city);
    formData.append("location.state", data.state);
    formData.append("location.pincode", data.zipCode);

    // Append images
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      const response = await api.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        navigate(`/items/${response.data.data._id}`);
      }
    } catch (error) {
      setSubmitError(error.response?.data?.error || "Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: "Item name is required" })}
                placeholder="e.g., Canon EOS R5 Camera"
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  errors.name ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
                })}
                rows="4"
                placeholder="Describe your item in detail..."
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  errors.description ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category", { required: "Category is required" })}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.category ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Subcategory
                </label>
                <select
                  {...register("subcategory")}
                  disabled={!selectedCategory || subcategories.length === 0}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    !selectedCategory || subcategories.length === 0
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">
                    {!selectedCategory
                      ? "Select category first"
                      : subcategories.length === 0
                      ? "No subcategories available"
                      : "Select a subcategory"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("condition", { required: "Condition is required" })}
                  className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Brand
                </label>
                <input
                  {...register("brand")}
                  placeholder="e.g., Canon, Apple, etc."
                  className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Price per Day (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("pricePerDay", {
                    required: "Price is required",
                    min: { value: 1, message: "Price must be greater than 0" },
                  })}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.pricePerDay ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.pricePerDay && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.pricePerDay.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Security Deposit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("securityDeposit", {
                    required: "Security deposit is required",
                    min: { value: 0, message: "Deposit cannot be negative" },
                  })}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.securityDeposit ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.securityDeposit && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.securityDeposit.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Minimum Rental Period (days)
                </label>
                <input
                  type="number"
                  {...register("minimumRentalPeriod", {
                    min: { value: 1, message: "Minimum 1 day" },
                  })}
                  className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Maximum Rental Period (days)
                </label>
                <input
                  type="number"
                  {...register("maximumRentalPeriod", {
                    min: { value: 1, message: "Minimum 1 day" },
                  })}
                  className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("instantBooking")}
                  className="w-5 h-5 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Instant Booking
                </span>
              </label>
              <p className="mt-1 ml-8 text-sm text-gray-600">
                Allow renters to book immediately without your approval
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register("address", { required: "Address is required" })}
                placeholder="123 Main Street"
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  errors.address ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="city"
                  rules={{ required: "City is required" }}
                  render={({ field: { onChange, value } }) => (
                    <CityDropdown
                      value={value}
                      onCityChange={val => {
                        onChange(val);
                        setValue("city", val, { shouldValidate: true });
                      }}
                      placeholder="Select a city"
                      local={true}
                    />
                  )}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div>
                               <label className="block mb-2 text-sm font-semibold text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("state", { required: "State is required" })}
                  placeholder="Maharashtra"
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.state ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("zipCode", {
                    required: "ZIP code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Invalid ZIP code",
                    },
                  })}
                  placeholder="400001"
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.zipCode ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                Item Images <span className="text-red-500">*</span>
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Upload up to 5 images)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`preview ${index}`}
                      className="object-cover w-full h-32 rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full shadow-lg opacity-0 -top-2 -right-2 group-hover:opacity-100"
                    >
                      <Close fontSize="small" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <CloudUpload className="mb-2 text-gray-400" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              {imageFiles.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  At least one image is required
                </p>
              )}
            </div>
          </div>
        );

      case 3: {
        const selectedCategoryObj = categories.find(
          (cat) => cat._id === watchedValues.category
        );
        const selectedSubcategoryObj = subcategories.find(
          (sub) => sub._id === watchedValues.subcategory
        );

        return (
          <div className="space-y-6">
            <h3 className="mb-6 text-2xl font-bold text-gray-800">
              Review Your Listing
            </h3>

            <div className="p-6 space-y-4 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-semibold text-gray-700">Basic Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">Name:</span>{" "}
                      <span className="text-gray-800">{watchedValues.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">Category:</span>{" "}
                      <span className="text-gray-800">
                        {selectedCategoryObj?.name || "-"}
                      </span>
                    </p>
                    {selectedSubcategoryObj && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">Subcategory:</span>{" "}
                        <span className="text-gray-800">
                          {selectedSubcategoryObj.name}
                        </span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">Condition:</span>{" "}
                      <span className="text-gray-800 capitalize">
                        {watchedValues.condition}
                      </span>
                    </p>
                    {watchedValues.brand && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">Brand:</span>{" "}
                        <span className="text-gray-800">{watchedValues.brand}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-gray-700">Pricing Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">Daily Rate:</span>{" "}
                      <span className="font-semibold text-gray-800">
                        ₹{watchedValues.pricePerDay}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">
                        Security Deposit:
                      </span>{" "}
                      <span className="text-gray-800">
                        ₹{watchedValues.securityDeposit}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">
                        Rental Period:
                      </span>{" "}
                      <span className="text-gray-800">
                        {watchedValues.minimumRentalPeriod} -{" "}
                        {watchedValues.maximumRentalPeriod} days
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">
                        Instant Booking:
                      </span>{" "}
                      <span className="text-gray-800">
                        {watchedValues.instantBooking ? "Enabled" : "Disabled"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-gray-700">Location</h4>
                <p className="text-sm text-gray-800">
                  {watchedValues.address}, {watchedValues.city},{" "}
                  {watchedValues.state} - {watchedValues.zipCode}
                </p>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-gray-700">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {watchedValues.description}
                </p>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-gray-700">
                  Images ({imageFiles.length})
                </h4>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`preview ${index}`}
                      className="object-cover w-full h-20 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-center text-gray-800">
              List Your Item for Rent
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Share your items with the community and earn money
            </p>
          </div>

          {/* Stepper */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 ${index !== steps.length - 1 ? "relative" : ""}`}
                >
                  <div
                    className={`flex items-center ${
                      index !== steps.length - 1 ? "w-full" : ""
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          index <= activeStep
                            ? "bg-gray-800 border-gray-800 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {index < activeStep ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                    {index !== steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-all ${
                          index < activeStep ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    <p
                      className={`text-xs font-medium ${
                        index <= activeStep ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="flex items-center px-4 py-3 mx-8 mb-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {submitError}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8">
            <div className="min-h-[400px]">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  activeStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ArrowBack className="mr-2" fontSize="small" />
                Previous
              </button>

              {activeStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                    loading
                      ? "bg-green-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" fontSize="small" />
                      Submit Listing
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-8 py-3 font-medium text-white transition-all bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl"
                >
                  Next
                  <ArrowForward className="ml-2" fontSize="small" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
