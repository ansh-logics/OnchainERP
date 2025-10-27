const mongoose = require('mongoose');

// Flexible settings and configurations
const ConfigurationSchema = new mongoose.Schema(
  {
    // Scope
    scope: {
      type: String,
      enum: ['global', 'college', 'department', 'user'],
      required: true
    },
    
    // Entity reference
    entityId: {
      type: String, // UUID from PostgreSQL (college, department, or user)
      required: function() {
        return this.scope !== 'global';
      }
    },
    
    // Configuration details
    key: {
      type: String,
      required: true
    },
    
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    
    // Metadata
    description: String,
    
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      required: true
    },
    
    // Validation
    isRequired: {
      type: Boolean,
      default: false
    },
    
    defaultValue: mongoose.Schema.Types.Mixed,
    
    // Access control
    isPublic: {
      type: Boolean,
      default: false
    },
    
    canBeModified: {
      type: Boolean,
      default: true
    },
    
    // Versioning
    version: {
      type: Number,
      default: 1
    },
    
    // Audit
    createdBy: {
      type: String, // User UUID from PostgreSQL
      required: true
    },
    
    lastModifiedBy: {
      type: String // User UUID from PostgreSQL
    }
  },
  {
    timestamps: true
  }
);

// Compound index for unique configurations per scope and entity
ConfigurationSchema.index({ scope: 1, entityId: 1, key: 1 }, { unique: true });
ConfigurationSchema.index({ scope: 1, key: 1 });
ConfigurationSchema.index({ entityId: 1 });

module.exports = mongoose.model('Configuration', ConfigurationSchema);
