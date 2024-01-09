const mongoose = require('mongoose');

const roles = ['admin', 'member', 'none'];

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  sendMsg: {type:String, enum: ['all','admin'], default:'all'},
  participants: [{ userId: { type: String}, role: { type: String, enum: roles, default: 'member'}}],
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
