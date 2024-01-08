import React, { useEffect, useState } from "react";
import axios from "../../axios/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEnvelope, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { setUser } from "../../redux/userSlice";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
  
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    const isEmailValid = (email) => {
      // Regular expression for basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
  
    const handleSignup = async () => {
      // Reset error messages
      setEmailError("");
      setUsernameError("");
      setPasswordError("");
  
      // Validate input values
      if (!email.trim()) {
        setEmailError("Email is required");
        return;
      }

      if(!isEmailValid(email)){
        setEmailError("Enter Valid Email");
        return;
      }
  
      if (!username.trim()) {
        setUsernameError("Username is required");
        return;
      }
  
      if (!password.trim()) {
        setPasswordError("Password is required");
        return;
      }
  
      try {
        const response = await axios.post("/user/register", {
          email,
          username,
          password,
        });
  
        console.log(response.data); // Handle the response as needed
        if(response.data.user){
          dispatch(setUser(response.data.user));
          localStorage.setItem("currentUser", JSON.stringify(response.data.user));
          navigate('/chat');
        }
        else{
          setPasswordError(response.data.error);
        }
      } catch (error) {
        console.error(error.response.data.message);
      }
    };
  
    useEffect(() => {
      if (user) {
        navigate('/chat');
      }
    }, [user]);
  
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 min-w-[350px]">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
          <h2 className="text-3xl font-semibold mb-6">Signup</h2>
          <div className="mb-4 flex items-center relative">
            <FaEnvelope className="absolute left-3 text-blue-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 pl-9 border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500 flex-1"
            />
          </div>
          {emailError && <p className="text-red-500 mb-2">{emailError}</p>}
          <div className="mb-4 flex items-center relative">
            <FaUser className="absolute left-3 text-blue-500 mr-2" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 pl-9 border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500 flex-1"
            />
          </div>
          {usernameError && <p className="text-red-500 mb-2">{usernameError}</p>}
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
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center pr-2 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash className="text-blue-500" /> : <FaEye className="text-blue-500" />}
              </div>
            </div>
          </div>
          {passwordError && <p className="text-red-500 mb-2">{passwordError}</p>}
          <button
            className="bg-blue-500 text-white p-2 mt-4 rounded hover:bg-blue-600 w-full"
            onClick={handleSignup}
          >
            Signup
          </button>
        </div>
      </div>
    );
  };
  
  export default SignUp;
  