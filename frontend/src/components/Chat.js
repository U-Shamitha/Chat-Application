import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const Chat = ({ room, setRoom, socket, opponentUser}) => {
    console.log(opponentUser)
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);

  const user = useSelector((state) => state.user.user);

  const messageContainerRef = useRef(null);

  useEffect(() => {
    socket.emit('joinRoom', { roomName: room, userId: user?.email });

    socket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages);
    });

    socket.on('opponentTyping', ({ userId, isTyping }) => {
        if (userId !== user.email) {
          setOpponentTyping(isTyping);
        }
    });

    socket.on('receiveMessage', (data) => {
        console.log("recieved", data);
      // Check if the message is already in the state
      const isMessageAlreadyInState = messages.some(
        (msg) =>{
         return msg.userId === data.userId && msg.message === data.message && msg.timestamp === data.timestamp
        }
      );
  
      // Add the message to the state only if it's not already there
      if (!isMessageAlreadyInState) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off('existingMessages');
      socket.off('opponentTyping');
      socket.off('receiveMessage')
    };
  }, [room]);

  useEffect(() => {
    // Scroll to the bottom of the message container
    if(user) messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  }, [messages]);

 
    const handleTyping = () => {
        // Notify the server that the user is typing
        socket.emit('typing', { roomName: room, userId: user?.email, isTyping: true });
        // Clear typing status after 10000 milliseconds
        setTimeout(() => {
            socket.emit('typing', { roomName: room, userId: user.email, isTyping: false });
          }, 10000);
    };

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { roomName: room, message });
      setMessage('');

      // Notify the server that the user has stopped typing
      socket.emit('typing', { roomName: room, isTyping: false });
    }
  };

  const formatTime = (timestamp) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(timestamp).toLocaleTimeString([], options);
  };

  const formatMessageDate = (timestamp) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(timestamp).toLocaleDateString([], options);
  };

  return (
    <>
    {user ? <div className='w-full flex flex-col bg-white rounded'>
      <div className='flex flex-col items-left justify-left gap-1 p-2 m-1 bg-blue-500 text-white rounded'>
        <h2 className='text-2xl font-bold'>{opponentUser ? opponentUser.username : 'No Users Found'}</h2>
        {opponentTyping ? (
            <div className='text-xs mt-1'>
                Typing...
            </div> ):(
             <div className='text-xs mt-1'>
             {opponentUser && opponentUser.online ? 'Online' : 'Offline'}
         </div>
        )}
      </div>
      <div className='flex-1 overflow-y-auto p-4' ref={messageContainerRef} >
        {messages.map((msg, index) => (
          <div key={index} className='mb-4'>
            {index === 0 || formatMessageDate(msg.timestamp) !== formatMessageDate(messages[index - 1].timestamp) ? (
              <div className='text-center mb-2 text-gray-500'>
                {index!=0 && <hr/>}
                {formatMessageDate(msg.timestamp)}
              </div>
            ) : null}
            {msg.userId === user.email ? (
              <div className="flex justify-end mb-4">
                <div className="bg-gray-200 p-3 rounded-lg">
                  <p className="text-sm break-all">{msg.message}</p>
                  <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-start mb-4">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <p className="text-sm break-all">{msg.message}</p>
                  <span className="text-black text-xs">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className='p-4 bg-white border-t border-gray-300'>
        <div className='flex items-center'>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {setMessage(e.target.value); handleTyping()}}
            className='flex-1 p-3 border border-gray-300 rounded-md outline-none focus:border-blue-500'
          />
          <button
            onClick={handleSendMessage}
            className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 ml-4'
          >
            Send
          </button>
        </div>
      </div>
    </div>
    : 'Loading'}
    </>
  );
};

export default Chat;
