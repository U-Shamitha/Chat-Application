import React from 'react';
import { useSelector } from 'react-redux';
import {Navigate } from 'react-router-dom';


const ProtectedRoute = ({children}) => {
    const user = useSelector((state) => state.user.user);
    console.log(user)
    return (
        user ? children : <Navigate to="/signup" replace/>
    );
  };
  
  export default ProtectedRoute;
