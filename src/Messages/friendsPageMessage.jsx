import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatBox from "./chatBoxMessage";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import axios from "axios";

const FriendsPage = () => {
  const dispatch = useDispatch();
  const { data: user, status } = useSelector((state) => state.loggedInUser);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [query, setQuery] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (status === "idle") dispatch(fetchLoggedinUser());
  }, [dispatch, status]);

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`http://localhost:3000/api/v1/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setAllFriends(res.data.user.friends);
      })
      .catch((err) => console.error("Error fetching friends:", err));

    axios
      .get(`http://localhost:3000/api/v1/recentChats`, { withCredentials: true })
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
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading user...
      </div>
    );
  }

  const friendsToShow = query.trim()
    ? searchResults
    : recentChats
        .map((chat) => (chat.sender.id === user.id ? chat.receiver : chat.sender))
        .filter((f, idx, arr) => f && arr.findIndex(a => a.id === f.id) === idx); // remove duplicates

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-300 bg-white p-4 flex flex-col">
        <h2 className="font-bold text-xl mb-4 text-gray-700">Chats</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all friends..."
          className="p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <div className="flex-1 overflow-y-auto">
          {friendsToShow.length === 0 ? (
            <p className="text-gray-500">
              {query.trim() ? "No friends found" : "No recent chats"}
            </p>
          ) : (
            friendsToShow.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFriend(f)}
                className={`flex items-center p-2 mb-2 cursor-pointer rounded-md transition ${
                  selectedFriend?.id === f.id
                    ? "bg-gray-100 text-gray-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <img
                  src={f.media_url}
                  alt={f.username}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                />
                <span>{f.username}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <ChatBox friend={selectedFriend} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
