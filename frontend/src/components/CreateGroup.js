// CreateGroupComponent.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setUserSocket } from '../redux/userSlice';
import './userList/userList.css'
import SearchBar from './Search/SearchBar';
import classes from './Search/searchBar.module..css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserGroup } from '@fortawesome/free-solid-svg-icons';

const CreateGroupComponent = () => {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchOpponent, setSearchOpponent] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [groupName, setGroupName] = useState('');


  const user = useSelector((state) => state.user.user);
//   const socket = useSelector((state) => state.user.socket);

  const handleCheckboxChange = (userId) => {
    const isSelected = selectedParticipants.includes(userId);

    if (isSelected) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const handleCreateGroup = () => {
    console.log(groupName)
    
    if (!groupName) {
        setErrorMessage('Please enter Group name');
        return;
      }

    if (selectedParticipants.length < 2) {
      setErrorMessage('Please select at least two participants.');
      return;
    }

    // Emit a createRoom event to the server
    socket.emit('createGroup',{groupName, selectedParticipants});

    socket.on('joinGroup',  (response)=>{
        console.log('Group created successfully:', response.groupId);
        setSelectedParticipants([]);
        setErrorMessage('');
        setGroupName('');
    })



  };

  useEffect(() => {

    const newSocket = io(process.env.REACT_APP_SOCKET_URL, { query: user });
    setSocket(newSocket);
    setUserSocket(newSocket);

    newSocket.emit('getUsers');
    newSocket.on('userList', (userList) => {
      setUsers(userList.filter((otherUser)=> otherUser.email !== user?.email));
    });

    return () => {
      // Clean up socket on component unmount
      newSocket.off('userList');
      newSocket.disconnect();
    };
  }, []); 

  useEffect(()=>{
    // console.log(searchOpponent);
    const matchedUsers = users.filter((user)=> {
      return user.username.toLowerCase().includes(searchOpponent.toLowerCase())
    })
    // console.log(matchedUsers)
    setFilteredUsers(matchedUsers);
  }, [users, searchOpponent])

  useEffect(()=>{
    setErrorMessage(null)
  },[groupName, selectedParticipants])

  return (
    <div className='flex justify-evenly pt-[80px] h-[100vh] w-[100vw]'>
    <div className='relative'>
    <label>Select Participants: </label>
    <SearchBar setSearchOpponent={setSearchOpponent}/>
  <div className="user-list">
    {filteredUsers.map(user => (
        !selectedParticipants.includes(user._id) ?
      <div key={user._id} className="user-card" onClick={()=>handleCheckboxChange(user._id)}>
        <input
        className='ml-[0.5rem]'
          type="checkbox"
          id={user._id}
          checked={selectedParticipants.includes(user._id)}
          onChange={() => handleCheckboxChange(user._id)}
        />
        <div key={user._id} className='flex gap-4 items-center'>
            <div className="avatar-circle offline">
              <p className='avatar-text'>{user.username.charAt(0)}</p>
            </div>
            <p className="text-gray-600 mb-[2px]">{user.username}</p>
      </div>
      </div> : null
    ))}
  </div>
     </div>
    <div className='relative'>
        <label>Selected Participants - {selectedParticipants.length} </label>
        <div className='flex items-center'>
      <div>
      <div className="container p-4">
      <form className={classes.searchForm}>
        <div className="flex gap-5 flex-col sm:justify-evenly sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 min-w-[250px]">
          <div className='relative' style={{flexGrow:'1'}}>
          <input
            type="text"
            placeholder="Enter Group Name"
            value={groupName}
            onChange={(e)=>setGroupName(e.target.value)}
            className="p-2 border border-gray-300 rounded pl-10 w-3/4 sm:w-full"
          />
          <FontAwesomeIcon icon={ faUserGroup } className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>
      </form>
    </div>
      </div>
      <button onClick={handleCreateGroup} className='bg-blue-500'>Create Group</button>
      </div>
      {errorMessage && <p style={{ color: 'red' }} className='ml-5'>{errorMessage}</p>}
      <div className="user-list grid">
        {filteredUsers.map(user => 
          selectedParticipants.includes(user._id) ?
          <div className="user-card w-[65%]" key={user.userId} onClick={()=>handleCheckboxChange(user._id)}>
            <input
              className='ml-[0.5rem]'
              type="checkbox"
              id={user._id}
              checked={selectedParticipants.includes(user._id)}
              onChange={() => handleCheckboxChange(user._id)}
            />
            <div key={user._id} className='flex gap-4 items-center'>
            <div className="avatar-circle offline">
              <p className='avatar-text'>{user.username.charAt(0)}</p>
            </div>
            <p className="text-gray-600 mb-[2px]">{user.username}</p>
          </div>
          </div> :null
          
        )}
      </div>
      
    </div>
    </div>
  );
};

export default CreateGroupComponent;
