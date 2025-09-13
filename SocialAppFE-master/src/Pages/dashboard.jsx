import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaHome, FaSearch } from "react-icons/fa";
import logo from "../Logo/noBackgroundIcon.png";
import SearchModal from "../Models/friendSearchModel";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="justify-center bg-white items-center">
      <nav className="flex justify-between items-center pb-0  mb-0 pl-2 pr-5 bg-white shadow-md">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/feed")}
        >
          <img src={logo} alt="Logo" className="h-17 w-auto" />
        </div>

        <div className="flex gap-6 items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-lg text-gray-600 hover:text-black cursor-pointer"
          >
            <FaSearch size={22} />
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
              className="gap-2 px-5 py-2 flex items-center bg-blue-100 text-gray-600 rounded-lg shadow hover:bg-gray-600/90 hover:text-white transition-all"
            >
              <FaHome size={22} />
              Home
            </button>
          )}
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Dashboard;
