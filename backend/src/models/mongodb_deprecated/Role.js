const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a role name'],
      unique: true,
      enum: ['student', 'faculty', 'admin'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Role', RoleSchema);
