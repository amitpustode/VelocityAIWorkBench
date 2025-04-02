import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    photo: null, // URL or file path
    nickname: 'Guest',
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        updatePhoto(state, action) {
            state.photo = action.payload;
        },
        updateNickname(state, action) {
            state.nickname = action.payload;
        },
    },
});

export const { updatePhoto, updateNickname } = profileSlice.actions;
export default profileSlice.reducer;
