import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io("http://localhost:3000", { withCredentials: true });

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
      let url = `http://localhost:3000/api/v1/history/${friend.id}?limit=20`;
      if (beforeTimestamp) url += `&beforeTimestamp=${beforeTimestamp}`;

      const res = await axios.get(url, { withCredentials: true });
      const newMessages = res.data.messages;

      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }

      // Always reverse once (oldest first)
      const ordered = [...newMessages].reverse();

      setMessages((prev) => {
        if (beforeTimestamp) {
          // Insert older messages on top
          const container = chatContainerRef.current;
          const scrollHeightBefore = container.scrollHeight;

          const updated = [...ordered, ...prev];

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - scrollHeightBefore;
          }, 0);

          return updated;
        } else {
          // First load (replace everything)
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
        setMessages((prev) => [...prev, msg]); // push at bottom
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
        `http://localhost:3000/api/v1/message/${friend.id}`,
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
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="p-4 bg-gray-300/30 text-black font-semibold">
        Chat with {friend.username}
      </div>

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isSender = msg.senderId === user.id;
            const imgUrl = isSender ? user.media_url : friend.media_url;

            return (
              <div
                key={msg.id}
                className={`flex items-end my-2 max-w-2xl ${
                  isSender ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <img
                  src={imgUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mr-2 ml-2"
                />

                <div
                  className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
                    isSender
                      ? "bg-gray-500 text-white text-left"
                      : "bg-gray-300 text-gray-800 text-left"
                  }`}
                >
                  {msg.message}
                  <div className="text-xs text-black/40 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 flex border-t bg-white">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
