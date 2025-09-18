import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./loggedInUserSlice";
import likeReducer from "./likeSlice";
import commentReducer from "./commentSlice";
import friendReducer from "./friendSlice";

export const store = configureStore({
  reducer: {
    loggedInUser: userReducer,
    likes: likeReducer,
    comments: commentReducer,
    friends: friendReducer,
  },
});

export default store;
