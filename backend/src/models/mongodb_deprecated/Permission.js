const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a permission name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    resource: {
      type: String,
      required: [true, 'Please specify the resource this permission applies to']
    },
    action: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage'],
      required: [true, 'Please specify the action this permission allows']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Permission', PermissionSchema);
