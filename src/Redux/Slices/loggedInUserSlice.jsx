import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../Api/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchLoggedinUser = createAsyncThunk(
  "user/fetchLoggedin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/v1/me`, {
        withCredentials: true,
      });
      return response.data.user;
    } catch (error) {
      console.error(`Failed to load logged in user:`, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "loggedInUser",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoggedinUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLoggedinUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchLoggedinUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.data = null;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
