import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import createSocketConnection from '../../socket/socket';
import { fetchUserDataFromLocalStorage } from '../../redux/actions/userActions';

const ChatComponent = () => {

  const user = useSelector((state) => state.user.user);
  console.log(user)
  const userName = user?.username;
  // const socket = createSocketConnection(user.email);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState('');
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(()=>{
    // Initialize the socket connection only once when the component mounts
    socketRef.current = createSocketConnection(user.email);
  },[user])

  useEffect(() => {
    // Listen for incoming messages
    const handleChatMessage = (data) => {
      console.log(data)
      setMessages([...messages, data]);
    };
  
    // Listen for typing status
    const handleTyping = (userName) => {
      setIsTyping(`${userName} is typing...`);

      // Clear typing status after 30000 milliseconds
      typingTimeoutRef.current = setTimeout(() => {
      setIsTyping('');
      }, 30000);
    };
  
    socketRef.current.on('chatMessage', handleChatMessage);
    socketRef.current.on('typing', handleTyping);
  
    // Clean up on component unmount
    return () => {
      socketRef.current.off('chatMessage', handleChatMessage);
      socketRef.current.off('typing', handleTyping);
      
      // Clear the typing timeout when the component unmounts
      clearTimeout(typingTimeoutRef.current);

      // Disconnect the socket
      socketRef.current.disconnect();

    };
  }, [messages]);
  
  // useEffect(() => {
  //   console.log("before dispatch");
  //   // Dispatch the action when the app opens
  //   dispatch(fetchUserDataFromLocalStorage());
  //   console.log("after dispatch");
  // },[]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socketRef.current.emit('chatMessage', { from: user, to: message });
      setMessage('');
      // Clear typing status when a message is sent
      setIsTyping('');
    }
  };

  const handleTyping = () => {
    socketRef.current.emit('typing', userName);
  };

  return (
    <div className="container mx-auto my-8 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Chat App</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <p>
                  <strong>{msg.user}:</strong> {msg.message}{' '}
                  <span className="text-sm text-gray-300">({msg.timestamp})</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="typing">{isTyping && <p className="text-gray-500">{isTyping}</p>}</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        {/* <input
          type="text"
          placeholder="Your name"
          className="w-full p-2 mb-2 border rounded"
          onChange={(e) => setUser(e.target.value)}
        /> */}
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          className="w-full p-2 mb-2 border rounded"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;
