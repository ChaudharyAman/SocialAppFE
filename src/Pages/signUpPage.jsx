import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/api";
import loginLogo from "../Logo/undraw_enter_nwx3.svg";
import heroLogo from "../Logo/undraw_login_weas.svg";
import sticker1 from "../Logo/undraw_make-it-rain_vyg9.svg";
import sticker2 from "../Logo/undraw_cool-break_cipj.svg";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    bio: "",
    date_of_birth: "",
    mobile: "",
    gender: "male",
    account_status: "public",
    media: null,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true)

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "date_of_birth" && formData[key]) {
          const d = new Date(formData[key]);
          const isoDate = d.toISOString().split("T")[0];
          data.append(key, isoDate);
        } else {
          data.append(key, formData[key]);
        }
      });

      const res = await api.post(
        `${API_BASE_URL}/api/v1/createUser2`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        navigate("/login");
      }
    } 
    catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <div className="flex w-[1000px] bg-gray-400/30 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-gray-50 to-gray-200 text-gray-700 p-8 relative">
          <img src={heroLogo} alt="hero" className="w-64 mb-6 drop-shadow-lg" />
          <h2 className="text-2xl font-bold">Join Our Community 🚀</h2>
          <p className="mt-2 text-center text-sm opacity-80">
            Create an account, connect with friends, and start your journey 🌍
          </p>
          <img
            src={sticker1}
            alt="sticker"
            className="absolute top-8 left-10 w-12 animate-bounce"
          />
          <img
            src={sticker2}
            alt="sticker"
            className="absolute bottom-8 right-10 w-12 animate-pulse"
          />
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative">
          <div className="flex justify-center mb-6">
            <img
              src={loginLogo}
              alt="signup character"
              className="w-28 h-28 drop-shadow-lg"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Fill in your details to get started ✨
          </p>

          {error && (
            <p className="text-red-500 bg-red-100 px-3 py-2 rounded-lg mb-4 text-center shadow-sm">
              ❌ {error}
            </p>
          )}

          <form
            onSubmit={handleSignup}
            className="space-y-3 max-h-[65vh] overflow-x-hidden overflow-y-auto pr-2"
          >
            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">👤</span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm w-1/2">
                <span className="px-3 text-gray-400">🧑</span>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm w-1/2">
                <span className="px-3 text-gray-400">👨</span>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">🔑</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">✍️</span>
              <textarea
                name="bio"
                placeholder="Bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">🎂</span>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">📱</span>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">⚧️</span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Strictly Male">Strictly Male</option>
                <option value="Strictly Female">Strictly Female</option>
                <option value="Agender">Agender</option>
                <option value="Bigender">Bigender</option>
                <option value="Cisgender">Cisgender</option>
                <option value="Genderflux">Genderflux</option>
                <option value="Pangender">Pangender</option>
                <option value="Polygender">Polygender</option>
                <option value="Two-spirit">Two-spirit</option>
                <option value="Born and taken care by an helicopter">
                  Born and taken care by an helicopter
                </option>
                <option value="Androgyne">Androgyne</option>
                <option value="Asexual">Asexual</option>
                <option value="Aromantic">Aromantic</option>
                <option value="Intersex">Intersex</option>
                <option value="Raised by a bee">Raised by a bee</option>
                <option value="Xenogender">Xenogender</option>
                <option value="Autigender">Autigender</option>
                <option value="Caelgender">Caelgender</option>
                <option value="Aerogender">Aerogender</option>
                <option value="Amaregender">Amaregender</option>
                <option value="Blurgender">Blurgender</option>
                <option value="non-binary">non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">🔒</span>
              <select
                name="account_status"
                value={formData.account_status}
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center border border-gray-300 bg-white/70 rounded-xl overflow-hidden shadow-sm">
              <span className="px-3 text-gray-400">📷</span>
              <input
                type="file"
                name="media"
                onChange={handleChange}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <button
              type = "submit"
              disabled = {loading}
              className = { `w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transform transition-all duration-300 
                ${loading ? "opacity-70 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
            >
               {loading ? (
                <div className="flex items-center justify-center gap-2">
                  Signing in...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-gray-800 font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

          <img
            src={sticker1}
            alt="floating"
            className="absolute -top-3 -right-3 w-10 animate-spin"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
