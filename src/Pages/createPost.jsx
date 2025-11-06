import React, { useState } from "react";
import api from "../Api/api";
import { useNavigate } from "react-router-dom";
import Loader from "../Logo/loader";

const CreatePost = () => {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!text.trim() && !media) {
        setError("📌 Please provide text or upload an image/video.");
        setLoading(false);
        return;
      }

      const coords = await getLocation();
      const latitude = coords?.latitude;
      const longitude = coords?.longitude;

      const formData = new FormData();
      formData.append("text", text);
      if (media) formData.append("media", media);
      if (latitude && longitude) {
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
      }

      const res = await api.post(
        `${API_BASE_URL}/api/v1/createPost`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        navigate("/feed");
        navigate(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-2 bg-white shadow-lg mt-1  rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">💭 What’s on your mind?</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded-lg focus:ring focus:ring-gray-200"
          rows="2"
        />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-gray-200 file:text-gray-700
            hover:file:bg-gray-300 cursor-pointer"
        />

        {preview && (
          <div className="mt-3">
            {media?.type.startsWith("video/") ? (
              <video src={preview} controls className="w-full rounded-lg" />
            ) : (
              <img src={preview} alt="preview" className="w-full rounded-lg" />
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 
          ${loading ? " opacity-70 cursor-not-allowed hover:scale-100" : "hover:scale-105 "}`}>
          {loading ? `Posting... ${Loader}` : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
