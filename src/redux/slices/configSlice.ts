import { createSlice } from '@reduxjs/toolkit';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    basePath: '',
  },
  reducers: {
    setBasePath: (state, action) => {
      state.basePath = action.payload;
    },
  },
});

export const { setBasePath } = configSlice.actions;
export default configSlice.reducer;
