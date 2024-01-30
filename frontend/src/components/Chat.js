import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGroupList } from '../redux/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';

const Chat = ({ room, setRoom, socket, opponentUser}) => {
    // console.log(opponentUser)
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const user = useSelector((state) => state.user.user);
  const userList = useSelector((state) => state.user.userList);
  const groupList = useSelector((state) => state.user.groupList);

  const dispatch = useDispatch();

  const messageContainerRef = useRef(null);

  useEffect(()=>{
    setOpponentTyping(false);
  },[opponentUser])


  useEffect(() => {
    setMessage('');
    socket.emit('joinRoom', { roomName: room, userId: user?.email });

    socket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages);
    });

    socket.on('opponentTyping', ({roomName, typingUser, isTyping }) => {
      // console.log(typingUser);
        if (roomName===room && typingUser.email !== user.email) {
          setTypingUser(typingUser)
          setOpponentTyping(isTyping);
        }
    });

    socket.on('receiveMessage', (data) => {
        // console.log("recieved", data);
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

    socket.on('toggleMsgAccess', ({groupId, sendMsg})=>{
      // console.log('sendMsg', sendMsg);
      dispatch(setGroupList({...groupList, [groupId] : {...groupList[groupId], sendMsg: sendMsg}}));
      // console.log('groupList', groupList);
    })

    return () => {
      socket.off('existingMessages');
      socket.off('opponentTyping');
      socket.off('receiveMessage');
      socket.off('toggleMsgAccess');
    };
  }, [room]);

  useEffect(() => {
    // Scroll to the bottom of the message container
    if(user) messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  }, [messages]);


    const getUsersInGroup = (group) => {
      // console.log(group)
      if(group?.participants){
      const otherMembers = group.participants.filter((participant)=>participant.userId!==user._id);
      return otherMembers.map((member)=>member.username).join(', ')
      }
      return null
    }

 
    const handleTyping = () => {

      // Notify the server that the user is typing
      socket.emit('typing', { roomName: room, typingUser: user, isTyping: true });
      // Clear typing status after 10000 milliseconds
      setTimeout(() => {
          socket.emit('typing', { roomName: room, typingUser: user, isTyping: false });
        }, 10000);
      
    };

  const handleMsgAcesssChange = () => {
    socket.emit('toggleMsgAccess', {groupId: opponentUser._id, sendMsg:  groupList[opponentUser._id].sendMsg==="all" ? "admin" : "all"});
  }

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { roomName: room, message });
      setMessage('');

      // Notify the server that the user has stopped typing
      socket.emit('typing', { roomName: room, typingUser: user, isTyping: false });
    }
  };

  const handleSendMsgKeyDown = (e) => {
    if(e.key=="Enter"){
      handleSendMessage();
    }
  }

  const formatTime = (timestamp) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(timestamp).toLocaleTimeString([], options);
  };

  const formatMessageDate = (timestamp) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(timestamp).toLocaleDateString([], options);
  };

  const isAdmin=()=>{
    // console.log(opponentUser._id, user._id)
    // console.log(groupList[opponentUser._id])
    // console.log('isAdmin', groupList[opponentUser._id].participants.find((participant)=> participant.userId===user._id))
    return groupList[opponentUser._id].participants.find((participant)=> participant.userId===user._id).role==="admin"
  }

  return (
    <>
    {user ? <div className='w-full flex flex-col bg-white rounded'>
      <div className='flex flex items-center justify-between py-2 px-5 m-1 bg-blue-500 text-white rounded'>
      <div className='flex flex-col items-left justify-left gap-1'>
        <h2 className='text-2xl font-bold'>{opponentUser ?( opponentUser.type==="group" ? opponentUser.name : opponentUser.username ): 'No Users Found'}</h2>
        {opponentTyping ? (
            <div className='text-xs mt-1'>
              {typingUser && <span>{typingUser.username}</span>} Typing...
            </div> ):(
             <div className='text-xs mt-1 overflow-hidden h-4'>
              {/* {console.log(opponentUser)} */}
             {opponentUser && (opponentUser.type==="group" ? getUsersInGroup(opponentUser) : (opponentUser.online ? 'Online' : 'Offline'))}
             </div>
        )}
      </div>
      {(opponentUser && opponentUser.type==="group" && isAdmin()) && 
          <>
          { groupList[opponentUser._id].sendMsg==="all" ? 
          <button
            onClick={handleMsgAcesssChange}
            className='bg-red-500 text-white px-4 h-10 rounded-md hover:bg-red-600 ml-4'
            title="Don't allow other members to message"
          >
            <span><FontAwesomeIcon icon={faLock} size="sm" style={{paddingRight:'2px'}}/> Block</span>
          </button>
          :
          <button
            onClick={handleMsgAcesssChange}
            className='bg-green-500 text-white px-4 h-10 rounded-md hover:bg-green-600 ml-4'
            title="Allow all members to message"
          >
            <span><FontAwesomeIcon icon={faUnlockAlt} size="sm" style={{paddingRight:'2px'}}/> Allow</span>
          </button>
          }
          </>
        }
      </div>
      <div className='flex-1 overflow-y-auto p-4' ref={messageContainerRef} >
        {messages.map((msg, index) => (
          <>

          {opponentUser.type==="group" && groupList[opponentUser._id].participants.some((participant)=>participant.userId===user._id) ?
          <div key={msg._id} className='mb-4'>
   
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
                <div className={`avatar-circle offline max-w-[35px] min-w-[35px] max-h-[35px]`}>
                  {/* {console.log("Username of sender in group")} */}
                  {/* {console.log(msg.userId)} */}
                  {/* {console.log(userList[msg.userId])} */}
                  <p className='avatar-text'>{userList[msg.userId]?.username?.charAt(0)}</p>
                </div>
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <p className="text-sm break-all">{msg.message}</p>
                  <span className="text-black text-xs">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )}
          </div>:
          <div key={msg._id} className='mb-4'>
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
          }
          </>
        ))}
      </div>
      <div className='p-4 bg-white border-t border-gray-300'>
        <div className='flex items-center'>
          <input
            type="text"
            onKeyDown={handleSendMsgKeyDown}
            disabled= {opponentUser && !(opponentUser.type==="non-grp" || isAdmin() || groupList[opponentUser._id].sendMsg==="all")}
            placeholder={
              (opponentUser && opponentUser?.type==="group") ? 
                (!isAdmin() && groupList[opponentUser._id].sendMsg==="admin") ?
                   "🔒 Only Admins can Message"
                   : 
                   "Type a message..."
              : "Type a message..." }
            value={message} 
            onChange={(e) => {setMessage(e.target.value); handleTyping()}}
            className='flex-1 p-3 border border-gray-300 rounded-md outline-none focus:border-blue-500'
          />
          {/* {console.log('send', opponentUser && (opponentUser.type==="non-grp" || isAdmin() || groupList[opponentUser._id].sendMsg==="all"))} */}
          {opponentUser && (opponentUser.type==="non-grp" || isAdmin() || groupList[opponentUser._id].sendMsg==="all") && 
          <button
            onClick={handleSendMessage}
            className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 ml-4'
          >
            Send
          </button>}
        </div>
      </div>
    </div>
    : 'Loading'}
    </>
  );
};

export default Chat;
