import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/User/${username}`, {
          withCredentials: true,
        });
        setUser(res.data.user[0]);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, navigate]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return <p className="text-center mt-20">User not found</p>;

  const sortedPosts = [...(user.posts || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="p-6 bg-gradient-to-b  from-white to-gray-200 min-h-screen">
      <div className="relative w-full h-[40vh] rounded-lg overflow-hidden mb-20">
        <img
          src={user.media_url}
          alt="cover"
          className="w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 mb-2 flex justify-between items-end w-[95%] left-4">
          <div className="flex items-center gap-6">
            <img
              src={user.media_url}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="flex flex-col text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <h3 className="font-semibold text-gray-700 mt-2">
                @{user.username}
              </h3>
              <p className="font-semibold text-gray-600">{user.bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100"
          >
            <div className="relative w-full h-56 bg-gray-100">
              {post.media_type === "video" ? (
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={post.media_url}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              {post.text && (
                <p className="text-gray-800 text-sm line-clamp-2 mb-3">
                  {post.text}
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>❤️ {post.likes?.length || 0} Likes</span>
                <span>💬 {post.comments?.length || 0} Comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfilePage;
