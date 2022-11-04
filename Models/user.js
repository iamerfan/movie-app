const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
   {
      email: { type: String, unique: true, required: true, lowercase: true },
      password: String,
      accessToken: { required: false, type: String, minlength: 0 },
      watchList: Array,
      likedItems: Array,
      image: String,
      date: { type: String, default: Date.now },
   },
   { collection: 'users' },
);

const model = mongoose.model('UserSchema', UserSchema);
module.exports = model;
