import React, { useState, useEffect } from 'react';
import './userList/userList.css'
import SearchBar from './Search/SearchBar';
import { useSelector } from 'react-redux';



const GroupList = ({ setRoom, socket, setOpponentUser, opponentUser }) => {
  const [searchOpponent, setSearchOpponent] = useState('');
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState(groups);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    socket.emit('getGroups');
    socket.on('groupList',(groupList)=>setGroups(groupList));

    return () => {
      socket.off('groupList');
    };
  }, []);

  useEffect(()=>{
    const matchedGroups = groups.filter((group)=> {
      return group.name.toLowerCase().includes(searchOpponent.toLowerCase())
    })
    console.log(matchedGroups)
    setFilteredGroups(matchedGroups);
    setOpponentUser(matchedGroups[0])
    setRoom(matchedGroups[0]?._id);

  }, [groups, searchOpponent])

  const handleJoinGroup = (opponentUser) => {
    // Create a room between the current user and the selected user
    socket.emit('joinGroup', opponentUser._id);
    setRoom(opponentUser._id);
    setOpponentUser(opponentUser)
  };


  return (
    <div className="">
      <h2 className='text-lg font-semibold'>Group List</h2>
      <SearchBar setSearchOpponent={setSearchOpponent} />
      <div className="user-list">
        {filteredGroups.map((group) => (
          <div key={group._id} className={`user-card ${opponentUser === group ? 'selected' : '' }`}  onClick={() => handleJoinGroup(group)}>
            <div className={`avatar-circle offline`}>
              <p className='avatar-text'>{group.name.charAt(0)}</p>
            </div>
            <p className="text-gray-600">{group.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
