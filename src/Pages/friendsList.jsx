import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchSentRequests, fetchFriends, sendFriendRequest, cancelFriendRequest } from "../Redux/Slices/friendSlice";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FriendsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allUsers, loading, error, requestStatus, myFriends } = useSelector((state) => state.friends);
  const loggedInUser = useSelector((state) => state.loggedInUser.data);

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(fetchLoggedinUser());
    dispatch(fetchUsers());
    dispatch(fetchSentRequests());
    dispatch(fetchFriends());
  }, [dispatch]);

  if (loading) return <p className="text-center">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const filteredUsers = allUsers
    .filter((u) => u.id !== loggedInUser?.id)
    .filter((u) => !myFriends?.some((f) => f.id === u.id));

  const visibleUsers = showAll ? filteredUsers : filteredUsers.slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto bg-white backdrop-blur-lg rounded-3xl shadow-xl">
      <h2 className="text-2xl flex font-bold text-gray-800 mb-4">
        👥 Explore Users
      </h2>

      <ul className="space-y-4">
        {visibleUsers.map((user) => {
          const status = requestStatus[user.id];

          return (
            <li
              key={user.id}
              className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.media_url}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p
                    onClick={() => navigate(`/user/${user.id}`)}
                    className="text-sm hover:text-gray-700 hover:font-semibold cursor-pointer text-gray-500"
                  >
                    @{user.username}
                  </p>
                </div>
              </div>

              {status === "sent" ? (
                <button
                  onClick={() => dispatch(cancelFriendRequest(user.id))}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <FaTimes />
                </button>
              ) : (
                <button
                  onClick={() => dispatch(sendFriendRequest(user.id))}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition"
                >
                  <FaUserPlus />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!showAll && filteredUsers.length > 15 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 w-full mt-6 bg-gray-300 text-gray-800 hover:text-white font-semibold rounded-lg hover:bg-gray-600 cursor-pointer transition flex items-center justify-center gap-2"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
