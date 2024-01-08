import React, { useState, useEffect } from 'react';
import './userList.css'
import SearchBar from '../Search/SearchBar';
import { useSelector } from 'react-redux';



const UserList = ({ setRoom, socket, setOpponentUser, opponentUser }) => {
  const [searchOpponent, setSearchOpponent] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(users);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Get the list of users on component mount
    socket.emit('getUsers');

    // Listen for updates to the user list
    socket.on('userList', (userList) => {
      setUsers(userList.filter((otherUser)=> otherUser.email !== user?.email));
    });

    return () => {
      // Clean up socket on component unmount
      socket.off('userList');
    };
  }, []);

  useEffect(()=>{
    console.log(searchOpponent);
    const matchedUsers = users.filter((user)=> {
      return user.username.toLowerCase().includes(searchOpponent.toLowerCase())
    })
    console.log(matchedUsers)
    setFilteredUsers(matchedUsers);
    setOpponentUser(matchedUsers[0])
    setRoom(generateRoomName(user?.email, matchedUsers[0]?.email));
  }, [users, searchOpponent])

  const handleCreateRoom = (opponentUser) => {
    // Create a room between the current user and the selected user
    socket.emit('createRoom', opponentUser);
    setRoom(generateRoomName(user.email, opponentUser.email));
    setOpponentUser(opponentUser)
  };

  function generateRoomName(user1, user2) {
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}-${sortedUsers[1]}`;
  }

  return (
    <div className="">
      <h2 className='text-lg font-semibold'>User List</h2>
      <SearchBar setSearchOpponent={setSearchOpponent} />
      <div className="user-list">
        {filteredUsers.map((user) => (
          <div key={user._id} className={`user-card ${opponentUser === user ? 'selected' : '' } ${user.online ? 'online' : 'offline'}`}  onClick={() => handleCreateRoom(user)}>
            <div className={`avatar-circle ${user.online ? 'online' : 'offline'}`}>
              <p className='avatar-text'>{user.username.charAt(0)}</p>
            </div>
            <p className="text-gray-600">{user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
