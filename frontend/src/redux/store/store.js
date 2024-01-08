import { configureStore } from '@reduxjs/toolkit';
import userSlice from '../userSlice';

const store = configureStore({
  reducer: {
    user : userSlice,
  }
});

// try {
//   // Fetch user data from localStorage
//   const storedUserData = JSON.parse(localStorage.getItem('currentUser'));

//   console.log(storedUserData);

//   // Dispatch the setUser action with the retrieved data
//   store.dispatch(setUser(storedUserData));
// } catch (error) {
// console.error('Error fetching user data from localStorage:', error);
// }


export default store;
