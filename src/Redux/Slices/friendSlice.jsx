import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUsers = createAsyncThunk(
  "friends/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/users", {
        withCredentials: true,
      });
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  "friends/fetchSentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/requestSent", {
        withCredentials: true,
      });
      return res.data.requests;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch sent requests");
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (friend_id, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/sendRequest/${friend_id}`,
        {},
        { withCredentials: true }
      );
      return { friend_id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  "friends/cancelFriendRequest",
  async (friend_id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/v1/cancelRequest/${friend_id}`,
        { withCredentials: true }
      );
      return { friend_id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel request");
    }
  }
);


export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/friends", {
        withCredentials: true,
      });
      return res.data.friends;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



const friendSlice = createSlice({
  name: "friends",
  initialState: {
    allUsers: [],
    sentRequests: [], 
    myFriends: [],
    requestStatus: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearFriendError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
        action.payload.forEach((user) => {
          state.requestStatus[user.id] = "sent";
        });
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.requestStatus[action.payload.friend_id] = "sent";
        state.sentRequests.push({ id: action.payload.friend_id });
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.requestStatus[action.payload.friend_id] = "none";
        state.sentRequests = state.sentRequests.filter(
          (u) => u.id !== action.payload.friend_id
        );
      })
       .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.myFriends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFriendError } = friendSlice.actions;
export default friendSlice.reducer;
