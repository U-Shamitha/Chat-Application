import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  userList: [],
  groupList: [],
  socket: null,
  isLoading: false,
  error: null,
}

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async () => {
    try {
        let data = null;
        if(!!localStorage.getItem('currentUser')){
        // Fetch user data from localStorage
        data = JSON.parse(localStorage.getItem('currentUser'));
        console.log(data);
        }
        return data
        } catch (error) {
        console.error('Error fetching user data from localStorage:', error);
        }

  }
)

export const setUser = createAsyncThunk(
    'user/setUser',
    async (data) => {
    
          return data
    
    }
  )

  export const setUserSocket = createAsyncThunk(
    'user/setUserSocket',
    async (data) => {
      return data
    }
  )

  export const setUserList = createAsyncThunk(
    'user/setUserList',
    async (data) => {
      return data
    }
  )
  
  export const setGroupList= createAsyncThunk(
    'user/setGroupList',
    async (data) => {
      return data
    }
  )

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.isLoading = false
      console.log(action.payload)
      state.user = action.payload
    })
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message
    })
    builder.addCase(setUser.fulfilled,(state,action)=>{
        state.user = action.payload
    })
    builder.addCase(setUserSocket.fulfilled,(state,action)=>{
      state.socket = action.payload
    })
    builder.addCase(setUserList.fulfilled,(state,action)=>{
      state.userList = action.payload
    })
    builder.addCase(setGroupList.fulfilled,(state,action)=>{
      state.groupList = action.payload
    })
  },
})

export default userSlice.reducer