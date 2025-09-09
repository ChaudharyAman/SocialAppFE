
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/header";
import { FaSignOutAlt, FaUser  } from "react-icons/fa";
import HomePostPage from "./feed";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { useDispatch, useSelector } from "react-redux";
import ProfilePostPage from "../Pages/profilePostPage";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: loggedInUser ,status, error} = useSelector((state) => state.loggedInUser)

  useEffect(() => {
      dispatch(fetchLoggedinUser())
      .unwrap()
      .catch(() => navigate("/login"));
  }, [dispatch, navigate]);


  if (status === "loading") return <p className="text-center mt-20">Loading...</p>;
  if (status === "failed") return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!loggedInUser) return null;


  return (
    <div className = 'justify-center bg-gradient-to-b from bg-white to-gray-300 items-center min-h-screen'>
      <Header/>
         <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {loggedInUser.first_name} {loggedInUser.last_name}</h1>
          <button
            onClick={() => navigate("/profile")}
            className="gap-2 cursor-pointer px-7 mt-[-20px] py-2 whitespace-nowrap flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
          >
             <FaUser />
            View Profile
          </button>
      </div>

      <div className="grid grid-cols-3 gap-6  ">
        <div className="p-4 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p>ID: {loggedInUser.id}</p>
          <p>Email: {loggedInUser.email}</p>
        </div>

        <div className="p-4 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold">Posts</h2>
          <p>Total: {loggedInUser.posts?.length}</p>
        </div>

        <div className="p-4 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold">Comments</h2>
          <p>Total: {loggedInUser.comments?.length}</p>
        </div>
      </div>
    </div>
    <div>
      {/* <ProfilePostPage /> */}
    </div>
    </div>
  );
}

export default Dashboard;
