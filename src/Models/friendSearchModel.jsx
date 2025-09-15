import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const SearchModal = ({ isOpen, onClose }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      try {
        const res = await axios.get(`${API_BASE_URL}/fetchUser/${value}`, {
          withCredentials: true, 
        });

        console.log("Search response:", res.data); 
        setSearchResults(res.data.users || []);
      } 
      catch (error) {
        console.error(
          "Error fetching users:",
          error.response?.data || error.message
        );
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => {
        onClose();
        setQuery("");
        setSearchResults([]);
      }}
    >
      <div
        className="bg-gray-400/40 rounded-lg shadow-lg w-full max-w-4xl mt-20 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onClose();
            setQuery("");
            setSearchResults([]);
          }}
          className="absolute top-2 m-3.5 right-2 p-2 text-gray-500 hover:text-black"
        >
          <FaTimes />
        </button>

        <input
          type="text"
          value={query}
          onChange={handleSearch}
          autoFocus
          className="w-full p-2 border rounded mb-3"
          placeholder="Search users..."
        />

        <div className="max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.slice(0, 10).map((user) => (
              <div
                key={user.username}
                onClick={() => {
                  navigate(`/user/${user.username}`); // ✅ lowercase route
                  onClose();
                  setQuery("");
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
              >
                <img
                  src={user.media_url}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                />
                <div>
                  <p className="font-semibold">@{user.username}</p>
                  <p className="text-sm text-gray-600">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            query && <p className="text-sm text-gray-500">No users found</p>
          )}
        </div>

        {searchResults.length > 10 && (
          <p className="text-xs text-gray-900 mt-2 hover:underline">
            Showing top 10 results. Refine your search for more...
          </p>
        )}
      </div>
    </div>
  );
};


export default SearchModal;
