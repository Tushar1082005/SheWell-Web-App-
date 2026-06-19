import { createSlice } from "@reduxjs/toolkit";

const selectSlice = createSlice({
  name: "select",
  initialState: {
    isOpen: false,
    selectedValue: null,
  },
  reducers: {
    toggleOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSelectedValue: (state, action) => {
      state.selectedValue = action.payload;
      state.isOpen = false;
    },
  },
});

export const { toggleOpen, setSelectedValue } = selectSlice.actions;
export default selectSlice.reducer;
