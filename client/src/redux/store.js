import { configureStore } from "@reduxjs/toolkit"
import tabsReducer from "./slices/tabsSlice"
import selectReducer from "./slices/selectSlice"
import loginSlice from "./slices/loginSlice"

const store = configureStore({
  reducer: {
    tabs: tabsReducer,
    select: selectReducer,
    login: loginSlice
  },
})

export default store