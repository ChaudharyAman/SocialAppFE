import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PrivateRoute = () => {
  const [auth, setAuth] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      console.log("useEffect me aya")
      try {
        console.log("try me aya")
        // Get token from cookies
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const token = getCookie("token");
        const res = await axios.get(`${API_BASE_URL}/api/v1/checkAuth`, {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });     
        console.log("set ke uppar me aya")
        console.log("resu :: ", res)
        setAuth(res?.data?.success);
        console.log("set ke niche me aya")
      } catch {
        console.log("catch me aya")
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return <p>Loading...</p>;

  return auth ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
