import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import axios from "../axios/axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { setUser } from "../redux/userSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isEmailValid = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset error messages
    setEmailError("");
    setPasswordError("");

    // Validate input values
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!isEmailValid(email)) {
      setEmailError("Enter a valid Email");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    try {
      const response = await axios.post("/user/login", {
        email,
        password,
      });

      if(response.data.user){
        // dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch(setUser(response.data.user))
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
        Cookies.set('currentUserToken', response.data.token, { expires: 2 });
        navigate('/chat');
      }else{
        setPasswordError(response.data.error  || "error")
      }
    } catch (error) {
      console.error(error);
      // Handle login error (you may set an error state here)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-3xl font-semibold mb-6">Login</h2>
        <div className="mb-4 flex items-center relative">
          <FaEnvelope className="absolute left-3 text-blue-500 mr-2" />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 pl-9 border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500 flex-1"
          />
        </div>
        {emailError && <p className="text-red-500 mb-2">{emailError}</p>}
        <div className="mb-4 flex items-center relative">
          <FaLock className="absolute left-3 text-blue-500 mr-2" />
          <div className="flex-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pl-9 border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500"
            />
            <div
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-2 flex items-center pr-2 cursor-pointer"
            >
              {showPassword ? (
                <FaEyeSlash className="text-blue-500" />
              ) : (
                <FaEye className="text-blue-500" />
              )}
            </div>
          </div>
        </div>
        {passwordError && <p className="text-red-500 mb-2">{passwordError}</p>}
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white p-2 mt-5 rounded hover:bg-blue-600 w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
