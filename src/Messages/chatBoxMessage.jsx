import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaPaperPlane, FaSmile } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const socket = io(`${API_BASE_URL}`, { withCredentials: true });

const ChatBox = ({ friend }) => {
  const user = useSelector((state) => state.loggedInUser.data);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const chatContainerRef = useRef(null);
  
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading user...
      </div>
    );
  }

  useEffect(() => {
    socket.emit("join", user.id);
  }, [user]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchHistory();
  }, [friend]);

  const fetchHistory = async (beforeTimestamp = null) => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;

    try {
      let url = `${API_BASE_URL}/api/v1/history/${friend.id}?limit=20`;
      if (beforeTimestamp) url += `&beforeTimestamp=${beforeTimestamp}`;

      const res = await axios.get(url, { withCredentials: true });
      const newMessages = res.data.messages;

      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }

      const ordered = [...newMessages].reverse();

      setMessages((prev) => {
        if (beforeTimestamp) {
          const container = chatContainerRef.current;
          const scrollHeightBefore = container.scrollHeight;

          const updated = [...ordered, ...prev];

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - scrollHeightBefore;
          }, 0);

          return updated;
        } else {
          setTimeout(() => {
            const container = chatContainerRef.current;
            container.scrollTop = container.scrollHeight;
          }, 0);
          return ordered;
        }
      });
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      isFetching.current = false;
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 50 && messages.length > 0) {
      const oldestMsg = messages[0];
      fetchHistory(oldestMsg.timestamp);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        (msg.senderId === friend.id && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === friend.id)
      ) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          const container = chatContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }, 0);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [friend, user]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/message/${friend.id}`,
        { message: newMsg },
        { withCredentials: true }
      );

      const msg = res.data.message;
      socket.emit("send_message", msg);

      setMessages((prev) => [...prev, msg]);
      setNewMsg("");

      setTimeout(() => {
        const container = chatContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }, 0);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-4 flex items-center gap-3 bg-white/70 backdrop-blur-md shadow-sm border-b">
        <img
          src={friend.media_url}
          alt={friend.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <h2 className="font-semibold text-gray-800">{friend.username}</h2>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 flex items-center justify-center shadow-inner animate-pulse backdrop-blur-md">
                <span className="text-3xl">💬</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-gray-400/40 animate-ping"></div>
            </div>
            <p className="mt-6 text-lg font-semibold tracking-wide text-gray-600">
              No conversations yet
            </p>
            <p className="text-sm text-gray-400 italic">
              Be the first to start the story ✨
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.senderId === user.id;
            const imgUrl = isSender ? user.media_url : friend.media_url;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end max-w-[70%] ${
                  isSender ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <img
                  src={imgUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mx-2"
                />
                <div
                  className={`px-4 py-2 rounded-2xl shadow-md ${
                    isSender
                      ? "bg-gradient-to-r from-gray-700 to-gray-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.message}
                  <div className="text-xs opacity-60 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="p-3 flex items-center gap-2 border-t bg-white/80 backdrop-blur-md">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-md"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
