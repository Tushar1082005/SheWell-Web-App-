import { createSlice } from "@reduxjs/toolkit"

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    value: null,
  },
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setValue } = tabsSlice.actions
export default tabsSlice.reducer
