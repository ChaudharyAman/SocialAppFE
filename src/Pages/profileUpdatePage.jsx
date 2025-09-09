import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import axios from "axios";
import { FaUserEdit, FaTimes } from "react-icons/fa";


const ProfileUpdateModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { data: loggedInUser, status } = useSelector(
    (state) => state.loggedInUser
  );

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    mobile: "",
    account_status: "public",
    media: null,
    password: "",
    date_of_birth: "",
    gender: "",
  });

  useEffect(() => {
    if (isOpen && status === "idle") {
      dispatch(fetchLoggedinUser());
    }
  }, [isOpen, status, dispatch]);

  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        username: loggedInUser.username || "",
        first_name: loggedInUser.first_name || "",
        last_name: loggedInUser.last_name || "",
        email: loggedInUser.email || "",
        bio: loggedInUser.bio || "",
        mobile: loggedInUser.mobile || "",
        account_status: loggedInUser.account_status || "public",
        media: null,
        password: loggedInUser.password ,
        date_of_birth: loggedInUser.date_of_birth ,
        gender: loggedInUser.gender || "other",
      });
    }
  }, [loggedInUser]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setFormData((prev) => ({ ...prev, media: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      for (const key in formData) {
        if (formData[key]) form.append(key, formData[key]);
      }

      await axios.put("http://localhost:3000/api/v1/updateProfile", form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-300/30 backdrop-blur-[30px] bg-opacity-70 bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-200/30 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-gray-700 cursor-pointer hover:text-black absolute top-3 right-3">
            <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Profile Picture</label>
            <input
              type="file"
              name="media"
              accept="image/*"
              onChange={handleChange}
              className="block w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Account Status</label>
            <select
              name="account_status"
              value={formData.account_status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <input type="hidden" name="password" value={formData.password} />
          <input
            type="hidden"
            name="date_of_birth"
            value={formData.date_of_birth}
          />
          <input type="hidden" name="gender" value={formData.gender} />

          <button
            type="submit"
            className="w-full mt-1 gap-2 cursor-pointer p-3 text-center whitespace-nowrap flex items-center justify-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
            <FaUserEdit />
            Update Profile
            </button>

        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;
