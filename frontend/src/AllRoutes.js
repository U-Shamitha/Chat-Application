import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login/Login';
import SignUp from './components/signUp/SignUp';
import ChatorUserList from './components/ChatorUserList';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile/Profile';

const AllRoutes = ()=> {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<ProtectedRoute><ChatorUserList/></ProtectedRoute>}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><ChatorUserList/></ProtectedRoute>} path="/chat" exact/>
        <Route element={<ProtectedRoute><Profile /></ProtectedRoute>} path="/profile" exact/>
      </Routes>
    </Router>
  );
}

export default AllRoutes;
