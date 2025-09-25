import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ChatBox from "./chatBoxMessage";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import api from "../Api/api";
import { FaComments, FaTimes, FaUserFriends, FaSearch } from "react-icons/fa";
import Loader from "../Logo/loader";


const FriendsPage = () => {
  const dispatch = useDispatch();
  const { data: user, status } = useSelector((state) => state.loggedInUser);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [query, setQuery] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const friendFromNotification = location.state?.friend || null;

  useEffect(() => {
    if (friendFromNotification) {
      setSelectedFriend(friendFromNotification);
    }
  }, [friendFromNotification]);

  useEffect(() => {
    if (status === "idle") dispatch(fetchLoggedinUser());
  }, [dispatch, status]);

  useEffect(() => {
    if (!user?.id) return;

    api
      .get(`${API_BASE_URL}/api/v1/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setAllFriends(res.data.user.friends);
      })
      .catch((err) => console.error("Error fetching friends:", err));

    api
      .get(`${API_BASE_URL}/api/v1/recentChats`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setRecentChats(res.data.recentChats);
      })
      .catch((err) => console.error("Error fetching recent chats:", err));
  }, [user]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
    } else {
      const filtered = allFriends.filter((f) =>
        f.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [query, allFriends]);

  if (status === "loading" || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-600 text-xl font-semibold">
        <FaComments className="mr-3 text-gray-500 animate-pulse" />
        <Loader />
      </div>
    );
  }

  const getFriendsSortedByRecentChat = (chats, myId) => {
    const map = new Map();
    chats.forEach((chat) => {
      const friend = chat.senderId === myId ? chat.receiver : chat.sender;
      if (
        !map.has(friend.id) ||
        new Date(chat.timestamp) > new Date(map.get(friend.id).timestamp)
      ) {
        map.set(friend.id, { ...friend, timestamp: chat.timestamp });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const friendsToShow = query.trim()
    ? searchResults
    : getFriendsSortedByRecentChat(recentChats, user.id);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="w-1/3 border-r border-gray-300 backdrop-blur-lg bg-white/80 shadow-lg flex flex-col">
        <div className="p-5 border-b border-gray-300 flex items-center gap-3">
          <FaUserFriends className="text-gray-700 text-2xl" />
          <h2 className="font-bold text-2xl text-gray-800 tracking-wide">
            Chats
          </h2>
        </div>

        <div className="p-4 relative">
          <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-10 pr-10 py-3 bg-white/70 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          {friendsToShow.length === 0 ? (
            <p className="text-gray-400 text-center mt-10 text-sm italic">
              {query.trim()
                ? "No matching friends found"
                : "No recent chats yet"}
            </p>
          ) : (
            friendsToShow.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFriend(f)}
                className={`flex items-center p-3 mb-3 rounded-xl cursor-pointer transition-all transform hover:scale-[1.01] hover:shadow-md ${
                  selectedFriend?.id === f.id
                    ? "bg-gradient-to-r from-gray-200 to-gray-100 border-l-4 border-gray-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <img
                  src={f.media_url}
                  alt={f.username}
                  className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-400 shadow-sm"
                />
                <span className="text-gray-800 font-medium tracking-wide text-lg">
                  {f.username}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-100 shadow-inner">
        {selectedFriend ? (
          <ChatBox friend={selectedFriend} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-500 text-lg font-semibold space-y-3">
            <FaComments className="text-5xl text-gray-400" />
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
