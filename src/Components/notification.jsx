import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(`${API_BASE_URL}`, { withCredentials: true });

const NotificationProvider = ({ children }) => {
  const { data: user } = useSelector((state) => state.loggedInUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("first ")
    if (user?.id) {
        console.log("second ")
        socket.emit("join", user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
        console.log("third" , msg)
      const sender =
        user?.friends?.find((friend) => friend.id === msg.senderId) ||
        (user?.id === msg.senderId ? user : null);

      if (!sender) return;
      console.log(sender)

      toast.custom((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);

            if (sender && sender.id !== user.id) {
              if (location.pathname === "/chat") {
                navigate(location.pathname, { state: { friend: sender }, replace: true });
              } else {
                navigate("/chat", { state: { friend: sender } });
              }
            }
          }}
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 cursor-pointer`}
        >
          <div className="p-4 flex items-center gap-3">
            <img
              src={sender?.media_url}
              alt={sender?.username}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {sender?.username}
              </p>
              <p className="mt-1 text-sm text-gray-600 truncate" title={msg.message}>
                {msg.message}
              </p>
            </div>
          </div>
        </div>
      ));
        
    // toast.success(msg.message)

};

    socket.off("receive_message")
    socket.off("receive_message_notification")
    socket.on("receive_message_notification", handleReceiveMessage);

    return () => {
      socket.off("receive_message_notification", handleReceiveMessage);
    };
  }, [user?.id, navigate, location.pathname]);

  return (
    <>

      <Toaster position="top-right" reverseOrder={false} className= "flex flex-row" />
    </>
  );
};

export default NotificationProvider;
