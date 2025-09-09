import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchLikes = createAsyncThunk(
  "likes/fetchLikes",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/likes/${postId}`,
        { withCredentials: true }
      );
      return { postId, likes: res.data.likes };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/like/${postId}`,
        {},
        { withCredentials: true }
      );
      return { postId, likes: res.data.likes };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const likesSlice = createSlice({
  name: "likes",
  initialState: {
    likesByPost: {}, 
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
        const { postId, likes } = action.payload;
        state.likesByPost[postId] = likes;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        state.likesByPost[postId] = likes;
      });
  },
});

export default likesSlice.reducer;
