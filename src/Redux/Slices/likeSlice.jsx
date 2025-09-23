import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../Api/api.js";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchLikes = createAsyncThunk(
  "likes/fetchLikes",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `${API_BASE_URL}/api/v1/likes/${postId}`,
        { withCredentials: true }
      );
      return {
        postId,
        likes: res.data.likes,
        likedByLoggedInUser: res.data.likedByLoggedInUser,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `${API_BASE_URL}/api/v1/like/${postId}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const likesSlice = createSlice({
  name: "likes",
  initialState: {
    likesByPost: {},
    likedStatusByPost: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { postId, likes, likedByLoggedInUser } = action.payload;
        state.likesByPost[postId] = likes;
        state.likedStatusByPost[postId] = likedByLoggedInUser;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(toggleLike.pending, (state, action) => {
        const postId = action.meta.arg;
        const currentStatus = state.likedStatusByPost[postId] || false;

        state.likedStatusByPost[postId] = !currentStatus;

        if (!state.likesByPost[postId]) {
          state.likesByPost[postId] = [];
        }
        if (currentStatus) {
          state.likesByPost[postId] = state.likesByPost[postId].slice(0, -1);
        } else {
          state.likesByPost[postId] = [
            ...state.likesByPost[postId],
            {
              id: "temp",
              user: { id: "me", username: "You", media_url: "" },
            },
          ];
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes, likedByLoggedInUser } = action.payload;
        state.likesByPost[postId] = likes;
        state.likedStatusByPost[postId] = likedByLoggedInUser;
      });
  },
});

export default likesSlice.reducer;
