const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors =  require('cors');
const {ObjectID} = require('mongodb');

//Config
dotenv.config()
mongoose.connect( process.env.MONGODB_URI, { dbName: process.env.DB_NAME ,useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {cors: {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
}});

const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const Message = require('./models/Message');
const Group = require('./models/Group');
const { group } = require('console');

const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/user", userRoutes);

const onlineUsers = new Map();

io.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

//Socket.IO
io.on('connection', (socket) => {

  const { email, username, _id: socketUserId } = socket.handshake.query;
  console.log('User connected', username, socketUserId, socket.id);
  onlineUsers.set(email, true); // set status to online
  updateUsersList();

  socket.on('getUsers', () => {
    updateUsersList();
  });

  socket.on('getGroups', () => {
    updateGroupsList();
  });

  socket.on('createRoom', (targetUserEmail) => {
    const roomName = generateRoomName(email, targetUserEmail);
    socket.join(roomName);
    io.to(targetUserEmail).emit('joinRoom', { roomName, userId: email});
  });

  socket.on('joinRoom', async ({ roomName, userEmail }) => {
    // Join the specified room
    socket.join(roomName);

    // Retrieve and send previous messages for the room
    const previousMessages = await Message.find({ roomName }).sort({ timestamp: 1 }).lean();

    socket.emit('existingMessages', previousMessages);
  });

  socket.on('createGroup', async ({groupName, selectedParticipants}) => {
    console.log(groupName, selectedParticipants)
    const groupId = await createGroup(name = groupName, participants = selectedParticipants, socketUserId);
    console.log(groupId)
    socket.join(groupId);

    io.to(groupId).emit('joinGroup', { groupId, participants });
  });

  // Handle chat messages within a room
  socket.on('sendMessage', async(data) => {
    console.log(data);
    const { roomName, message } = data;
    // Save the message to MongoDB
    const newMessage = new Message({
      roomName,
      userId: email,
      message,
      timestamp: new Date(),
    });

    try {
      const savedMessage = await newMessage.save();
      // console.log(savedMessage)

         // Emit the message only to the sender
        socket.emit('receiveMessage', {
          userId: email,
          message,
          timestamp: savedMessage.timestamp,
        });

        // Broadcast the message to all other users in the room
        socket.to(roomName).emit('receiveMessage', {
          userId: email,
          message,
          timestamp: savedMessage.timestamp,
        });
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
    }
  });

  socket.on('typing', ({ roomName,typingUser, isTyping }) => {
    console.log('typingUser', typingUser)
    io.to(roomName).emit('opponentTyping', { roomName, typingUser, isTyping });
  });

  socket.on('toggleMsgAccess',async({groupId, sendMsg})=>{
    await toggleMsgAccess(groupId, sendMsg)
    io.emit('toggleMsgAccess', {groupId, sendMsg})
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    onlineUsers.set(email, false);
    updateUsersList();
  });
});

function generateRoomName(user1, user2) {
  const sortedUsers = [user1, user2].sort();
  return `${sortedUsers[0]}-${sortedUsers[1]}`;
}

async function updateUsersList() {
  const allUsers = await User.find();

  // Add online status to each user
  const usersWithStatus = allUsers.map((user) => ({
    ...user.toObject(),
    online: onlineUsers.get(user.email) || false,
  }));

  io.emit('userList', usersWithStatus);
}

async function updateGroupsList() {
  const allGroups = await Group.find();
  const groupsWithUsers = await Promise.all(allGroups.map(async (group) => {
    const participants = await Promise.all(group.participants.map(async (participant) => {
      const user = await User.findById(participant.userId);
      return {
        _id: user._id,
        email: user.email,
        username: user.username,
        online: onlineUsers.get(user?.email) || false,
        ...participant.toObject()
      };
    }));
  
    return {
      ...group.toObject(),
      participants,
    };
  }));
  
  // console.log(groupsWithUsers);

  io.emit('groupList', groupsWithUsers);
}

async function toggleMsgAccess(groupId, toggle){
  console.log(toggle)
  await Group.findOneAndUpdate(
    {_id: groupId},
    {
      sendMsg : toggle,
    },
    )
}

async function createGroup(name, participants, socketUserId) {
  // Create a new group with participant roles
  console.log(socketUserId);
  const group = new Group({
    name : name,
    participants: [...participants.map(participant => ({ userId: participant, role: 'member' })),
                       { userId: socketUserId, role: 'admin' }],
  });

  const newGroup = await group.save();
  return newGroup._id;
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = io