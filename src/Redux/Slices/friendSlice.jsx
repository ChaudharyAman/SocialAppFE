import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../Api/api.js";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUsers = createAsyncThunk(
  "friends/fetchUsers",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `${API_BASE_URL}/api/v1/users?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  "friends/fetchSentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/v1/requestSent`, {
        withCredentials: true,
      });
      return res.data.requests;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sent requests"
      );
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `${API_BASE_URL}/api/v1/sendRequest/${username}`,
        {},
        { withCredentials: true }
      );
      return {
        username,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send request"
      );
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  "friends/cancelFriendRequest",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `${API_BASE_URL}/api/v1/cancelRequest/${username}`,
        { withCredentials: true }
      );
      return { username, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to cancel request"
      );
    }
  }
);

export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `${API_BASE_URL}/api/v1/removeFriend/${username}`,
        { withCredentials: true }
      );
      return { username, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove friend"
      );
    }
  }
);

export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/v1/friends`, {
        withCredentials: true,
      });
      return res.data.friends;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "friends/fetchPendingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `${API_BASE_URL}/api/v1/pendingRequests`,
        { withCredentials: true }
      );
      return res.data.pendingRequests;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch pending requests"
      );
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptFriendRequest",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `${API_BASE_URL}/api/v1/acceptRequest/${username}`,
        {},
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to accept friend request"
      );
    }
  }
);

const friendSlice = createSlice({
  name: "friends",
  initialState: {
    allUsers: [],
    sentRequests: [],
    myFriends: [],
    pendingRequests: [],
    requestStatus: {},
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearFriendError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      state.allUsers = [];
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalUsers = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { users, totalUsers, totalPages, currentPage } = action.payload;
        if (currentPage === 1) state.allUsers = users;
        else state.allUsers = [...state.allUsers, ...users];
        state.totalUsers = totalUsers;
        state.totalPages = totalPages;
        state.currentPage = currentPage;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
        action.payload.forEach((req) => {
          state.requestStatus[req.friend_id] = "sent";
        });
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.requestStatus[data.friend_id] = "sent";
        state.sentRequests.push({
          friend_id: data.friend_id,
          friend_username: data.friend_username,
          status: data.status,
        });
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        const username = action.payload.username;
        const user = state.allUsers.find((u) => u.username === username);
        if (user) state.requestStatus[user.id] = "none";
        state.sentRequests = state.sentRequests.filter(
          (u) => u.friend_username !== username
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
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        const { username } = action.payload;
        state.myFriends = state.myFriends.filter(
          (friend) => friend.username !== username
        );
        const removedUser = state.allUsers.find((u) => u.username === username);
        if (removedUser) state.requestStatus[removedUser.id] = "none";
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const acceptedFriend = action.payload;
        state.myFriends.push(acceptedFriend);

        state.pendingRequests = state.pendingRequests.filter(
          (req) => req.username !== acceptedFriend.friend_username
        );
      });
  },
});

export const { clearFriendError, resetUsers } = friendSlice.actions;
export default friendSlice.reducer;
