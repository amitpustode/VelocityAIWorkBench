import { configureStore } from '@reduxjs/toolkit';
import appReducer, { AppState } from './slices/appSlice';
import profileReducer from './slices/profileSlice';
import configReducer from './slices/configSlice';

export interface RootState {
  app: AppState;
}

const store = configureStore({
  reducer: {
    app: appReducer,
    profile: profileReducer,
    config: configReducer
  },
});

export default store;
