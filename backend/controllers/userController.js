const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const io = require("../server");

async function registerUser(req, res){
  try {
    const { email, username, password } = req.body;

    if(!email || !username || !password){
      return res.status(201).json({error: 'Provide all the details'})
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(201).json({ error: 'User with same email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({ user:newUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function loginUser(req, res){
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(201).json({ error: 'User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(201).json({ error: 'Invalid password' });
    }

    // Create and send JWT token
    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getAllUsers() {
  try {
    const allUsers = await User.find();
    io.emit('userList', allUsers);
    res.json({ allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error });
  }
}

module.exports = { registerUser, loginUser }