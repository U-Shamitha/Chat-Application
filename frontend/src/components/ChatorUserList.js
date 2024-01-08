import React, { useEffect, useRef, useState } from 'react';
import UserList from './userList/UserList';
import Chat from './Chat';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';


const ChatorUserList = () => {
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [opponentUser, setOpponentUser] = useState(null);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    console.log(process.env.REACT_APP_SOCKET_URL)
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, { query: user });
    setSocket(newSocket)

    return () => {
      // Clean up socket on component unmount
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className='flex justify-center items-center w-[100vw] h-[95vh] bg-gray-100 mt-[30px]'>
       {socket ? <div className='flex gap-10 w-[95%] h-[86%] mt-[20px]'>
          <UserList setRoom={setRoom} socket={socket} setOpponentUser={setOpponentUser} opponentUser={opponentUser} />
          <Chat room={room} setRoom={setRoom} socket={socket} opponentUser={opponentUser} className="flex-grow-1" />
        </div> : 'Connecting...'}
    </div>
  );
};

export default ChatorUserList;
