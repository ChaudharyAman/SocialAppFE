import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { FaUser, FaHome, FaSearch } from "react-icons/fa";
import logo from "../Logo/noBackgroundIcon.png";
import SearchModal from "../Models/friendSearchModel";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Search } from "lucide-react";


const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLoggedinUser());
  }, [dispatch]);

  return (
    <div className="justify-center bg-white items-center">
      <nav className="flex justify-between items-center pb-0 mb-0 pl-2 pr-5 bg-white shadow-md">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/feed")}
        >
          <img src={logo} alt="Logo" className="h-17 w-auto" />
        </div>

        <div className="flex gap-15 items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-lg text-gray-600 hover:text-black cursor-pointer"
          >
            <motion.div
              className="text-black"
              whileHover={{ scale: 1.2, rotate: 8 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, -10, 0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Search size={26} strokeWidth={2} />
            </motion.div>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="rounded-lg text-gray-600 hover:text-black cursor-pointer"
          >
          <motion.div
              className="text-black"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <MessageSquare size ={26} />
            </motion.div>
          </button>

          {location.pathname === "/feed" ? (
            <button
              onClick={() => navigate("/profile")}
              className="gap-2 px-5 py-2 flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
              <FaUser size={22} />
              Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/feed")}
              className="gap-2 px-5 py-2 flex items-center bg-gray-100 text-gray-600 rounded-lg shadow hover:bg-gray-600/90 hover:text-white transition-all"
            >
              <FaHome size={22} />
              Home
            </button>
          )}
        </div>
      </nav>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
