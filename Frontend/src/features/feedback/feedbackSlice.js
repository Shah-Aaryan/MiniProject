import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: "",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setFeedback: (state, action) => {
      state.message = action.payload;
    },
  },
});

export const { setFeedback } = feedbackSlice.actions;
export const feedbackState = (state) => state.feedback.message;
export default feedbackSlice.reducer;
