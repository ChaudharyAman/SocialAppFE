import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PrivateRoute = () => {
  const [auth, setAuth] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("function me aya")

  useEffect(() => {
    const checkAuth = async () => {
      console.log("useEffect me aya")
      try {
        console.log("try me aya")
        const res = await axios.get(`${API_BASE_URL}/api/v1/checkAuth`, {
          withCredentials: true,
        });     
        setAuth(res?.data?.success);
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
