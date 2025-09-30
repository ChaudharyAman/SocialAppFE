import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { FaUser, FaHome } from "react-icons/fa";
import logo from "../Logo/noBackgroundIcon.png";
import SearchModal from "../Models/friendSearchModel";
import { motion } from "framer-motion";
import { MessageSquare, Search } from "lucide-react";
import { useRef } from "react";


const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const mainRef = useRef(null)

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLoggedinUser());
  }, [dispatch]);

  return (
    <div className="fixed inset-1 flex flex-col bg-white">
    <div className="bg-white min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-6 bg-white shadow-md">
        <div
          className=" p-0 m-0 flex items-center cursor-pointer"
          onClick={() => navigate("/feed")}
        >
          <img src={logo} alt="Logo" className="h-18 w-19" />
        </div>

        <div className="flex items-center gap-15">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <motion.div
              className="text-black"
              whileHover={{ scale: 1.2, rotate: 8 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, -10, 0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Search size={24} strokeWidth={2} />
            </motion.div>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <motion.div
              className="text-black"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <MessageSquare size={24} />
            </motion.div>
          </button>

          {location.pathname === "/feed" ? (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-600 shadow hover:bg-red-600 hover:text-white transition-all"
            >
              <FaUser size={20} />
              <span className="font-medium">Profile</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/feed")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 shadow hover:bg-gray-600 hover:text-white transition-all"
            >
              <FaHome size={20} />
              <span className="font-medium">Home</span>
            </button>
          )}
        </div>
      </nav>

      <main ref={mainRef} className="flex-1 p-4 overflow-y-auto">
        <Outlet context={ {mainRef} }/>
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
    </div>
  );
};

export default Dashboard;
