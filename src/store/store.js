import {configureStore} from '@reduxjs/toolkit';
import appConfigSlice from './AppConfigSlice';
import appAuthSlice from './AppAuthSlice';

const store = configureStore ({
  reducer: {
    appConfig: appConfigSlice.reducer,
    appAuth:appAuthSlice.reducer,
  },
});

export default store;
