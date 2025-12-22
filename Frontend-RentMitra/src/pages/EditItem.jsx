import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import itemService from "../services/itemService";
import {
  CloudUpload,
  Delete,
  ArrowBack,
  CheckCircle,
  Close,
} from "@mui/icons-material";
import CategoryFilter from "../components/items/CategoryFilter";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [name, setName] = useState("");

  const fetchItemData = useCallback(async () => {
    try {
      const item = await itemService.getItem(id);
      if (!item) {
        setSubmitError("Item not found or could not be loaded.");
        return;
      }
      reset({
        name: item?.name ?? "",
        description: item?.description ?? "",
        brand: item?.brand ?? "",
        condition: item?.condition ?? "",
      });
      setName(item.name || "");
      setSelectedCategory(item?.categoryId != null ? String(item.categoryId) : "");
      setSelectedSubcategory(item?.subcategoryId != null ? String(item.subcategoryId) : "");
      setImagePreviews(Array.isArray(item.images) ? item.images.map((img) => img.url) : []);
    } catch (error) {
      console.error("Failed to fetch item data", error);
      setSubmitError("Failed to load item data.");
    }
  }, [id, reset]);

  useEffect(() => {
    fetchItemData();
  }, [fetchItemData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      setSubmitError("You can upload a maximum of 5 images.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((files) => files.filter((_, i) => i !== index));
    setImagePreviews((previews) => previews.filter((_, i) => i !== index));
  };

  const handleCategorySelect = (cat) => {
    const nextId = cat?._id ?? cat?.id ?? cat?.categoryId;
    setSelectedCategory(nextId == null ? "" : String(nextId));
    setSelectedSubcategory("");
    // Update form value
    reset({ ...watch(), categoryId: nextId, subcategoryId: "" });
  };
  const handleSubcategorySelect = (sub) => {
    const nextId = sub?._id ?? sub?.id ?? sub?.subcategoryId;
    setSelectedSubcategory(nextId == null ? "" : String(nextId));
    reset({ ...watch(), subcategoryId: nextId });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError("");
    try {
      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        setSubmitError("Please upload at least one image to save changes.");
        return;
      }

      const productRequest = {
        productId: Number(id),
        name: name || data?.name || "",
        description: data?.description || "",
        brand: data?.brand || "",
        condition: data?.condition || "",
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        subcategoryId: selectedSubcategory ? Number(selectedSubcategory) : undefined,
      };

      await itemService.editProduct(productRequest, imageFiles);
      navigate(`/items/${id}`);
    } catch (error) {
      setSubmitError(error?.response?.data?.error || error?.message || "Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  if (submitError === "Item not found or could not be loaded.") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
          <p className="mb-4">The item you are trying to edit does not exist or was deleted.</p>
          <button
            onClick={() => navigate("/my-ads")}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to My Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <div className="p-8 mx-auto max-w-3xl bg-white rounded-2xl shadow-xl">
          <h1 className="mb-8 text-3xl font-bold text-center">
            Edit Your Item
          </h1>
          {submitError && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Item Name
              </label>
              <input
                id="name"
                value={name}
                autoCapitalize="words"
                onChange={(e) => {
                  const next = e.target.value;
                  const transformed = !name && next ? next.charAt(0).toUpperCase() + next.slice(1) : next;
                  setName(transformed);
                  reset({ ...watch(), name: transformed });
                }}
                className={`w-full p-3 border rounded-lg ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                  onChange: (e) => {
                    const current = watch("description");
                    if (!current && e?.target?.value) {
                      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                    }
                  },
                })}
                autoCapitalize="sentences"
                rows="4"
                className={`w-full p-3 border rounded-lg ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <CategoryFilter
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
            />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Item Images (up to 5)
              </label>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`preview ${index}`}
                      className="object-cover w-full h-24 rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 text-white bg-red-500 rounded-full"
                    >
                      <Close fontSize="small" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="flex flex-col justify-center items-center w-full h-24 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-100">
                    <CloudUpload />
                    <span className="text-xs">Upload</span>
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
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate(`/items/${id}`)}
                className="px-6 py-2 bg-gray-300 rounded-lg"
              >
                <ArrowBack /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white bg-green-600 rounded-lg disabled:bg-green-400"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
