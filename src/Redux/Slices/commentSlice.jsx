import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/comments/${postId}`,
        { withCredentials: true }
      );
      return {
        postId,
        comments: res.data.Comments,
        count: res.data.commentCount,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/createComment`,
        { post_id: postId, text },
        { withCredentials: true }
      );
      return { postId, comment: res.data.comment };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/comments`, {
        data: { id: commentId, post_id: postId },
        withCredentials: true,
      });
      return { postId, commentId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    commentsByPost: {},
    countsByPost: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { postId, comments, count } = action.payload;
        state.commentsByPost[postId] = comments;
        state.countsByPost[postId] = count;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        state.commentsByPost[postId].push(comment);
        state.countsByPost[postId] = (state.countsByPost[postId] || 0) + 1;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId] = state.commentsByPost[postId].filter(
            (c) => c.id !== commentId
          );
          state.countsByPost[postId] = Math.max(
            (state.countsByPost[postId] || 1) - 1,
            0
          );
        }
      });
  },
});

export default commentSlice.reducer;
