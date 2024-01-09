import React, { useState, useEffect } from 'react';
import './userList.css'
import classes from '../Search/searchBar.module..css';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faSearch, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { setGroupList, setUserList } from '../../redux/userSlice';



const UserList = ({ setRoom, socket, setOpponentUser, opponentUser }) => {
  const [searchOpponent, setSearchOpponent] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [chats, setChats] = useState([]);

  const user = useSelector((state) => state.user.user);
  const groupList = useSelector((state) => state.user.groupList);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.emit('getUsers');
    socket.on('userList', (userList) => {
      setUsers(userList.filter((otherUser)=> otherUser.email !== user?.email));
      
      socket.emit('getGroups');
      socket.on('groupList',(groupList)=>{console.log('groupList',groupList);setGroups(groupList)});
    });

    return () => {
      // Clean up socket on component unmount
      socket.off('userList');
      socket.off('groupList');
    };
  }, []);

  useEffect(()=>{
    console.log(searchOpponent);
    const matchedUsers = users.filter((user)=> {
      return user.username.toLowerCase().includes(searchOpponent.toLowerCase())
    })

    const matchedGroups = groups.filter((group)=> {
      return group.name.toLowerCase().includes(searchOpponent.toLowerCase())
    })

    setChats(matchedUsers.map((user)=>({...user,type:'non-grp'})).concat(matchedGroups.map((group)=>({...group,type:'group'}))))

  }, [users, groups, searchOpponent])

  useEffect(()=>{
    if(chats.length>0){
      if(chats[0].type==="group"){
        setOpponentUser(chats[0])
        setRoom(chats[0]?._id);  
      }else{
        setOpponentUser(chats[0])
        setRoom(generateRoomName(user?.email, chats[0]?.email));
      }
    }
    console.log(chats)
  },[chats])

  useEffect(()=>{
    dispatch(setUserList(users.reduce((usrList, user) => {
      usrList[user.email] = user;
      return usrList;
    }, {})));
  }, [users])

  useEffect(()=>{
    dispatch(setGroupList(groups.reduce((grpList, group) => {
      grpList[group._id] = group;
      return grpList;
    }, {})));
  }, [groups])

  const handleCreateRoom = (opponentUser) => {
    // Create a room between the current user and the selected user
    socket.emit('createRoom', opponentUser);
    setRoom(generateRoomName(user.email, opponentUser.email));
    setOpponentUser(opponentUser)
  };

  const handleJoinGroup = (opponentUser) => {
    // Create a room between the current user and the selected user
    socket.emit('joinGroup', opponentUser._id);
    setRoom(opponentUser._id);
    setOpponentUser(opponentUser)
  };

  function generateRoomName(user1, user2) {
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}-${sortedUsers[1]}`;
  }

  return (
    <div className="">
      <h2 className='text-lg font-semibold pl-10'>Chats</h2>
      <div className='flex justify-between items-center px-5'>
      {/* Search bar */}
      <div className="container p-4">
        <form className={classes.searchForm}>
          <div className="flex gap-5 flex-col sm:justify-evenly sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 min-w-[250px]">
            <div className='relative' style={{flexGrow:'1'}}>
            <input
              type="text"
              placeholder="Search..."
              value={searchOpponent}
              onChange={(e)=>setSearchOpponent(e.target.value)}
              className="p-2 border border-gray-300 rounded pl-10 w-3/4 sm:w-full"
            />
            <FontAwesomeIcon icon={ faSearch } className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>
        </form>
      </div>
      <Link to="/create-grp" style={{ textDecoration: 'none' }}>
      <FontAwesomeIcon icon={faAdd} color='white' className='bg-blue-500 p-3 rounded'/>
      </Link>
      </div>

      <div className="user-list pl-7 pr-4">
        {console.log(chats)}
        {chats.length>0 && chats.map((chat) => 
        <>
        {console.log(chat)}
          {chat && chat.type==="group" ?
          //Show Group if the user is member or admin of group
          (groupList[chat._id]?.participants?.some((participant)=>participant.userId===user._id) &&
            <div key={chat.email} className={`user-card ${opponentUser ? (opponentUser._id === chat._id ? 'selected' : ''):'' }`}  onClick={() => handleJoinGroup(chat)}>
            <div className={`avatar-circle offline`}>
              <p className='avatar-text'><FontAwesomeIcon icon={faUserGroup}/></p>
            </div>
            <p className="text-gray-600">{chat.name}</p>
          </div> )
          :
          <>
          <div key={chat.email} className={`user-card ${opponentUser === chat ? 'selected' : '' } ${chat.online ? 'online' : 'offline'}`}  onClick={() => handleCreateRoom(chat)}>
            <div className={`avatar-circle ${chat.online ? 'online' : 'offline'}`}>
              <p className='avatar-text'>{chat.username?.charAt(0)}</p>
            </div>
            <p className="text-gray-600">{chat.username}</p>
          </div></>
        }
        </>
      )}
      </div>
    </div>
  );
};

export default UserList;
