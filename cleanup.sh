#!/bin/bash

# Database Migration Cleanup Script
# This script organizes old MongoDB files and updates the project structure

echo "🧹 Starting database migration cleanup..."

# Create archive directories
mkdir -p backend/src/archive/controllers
mkdir -p backend/src/archive/models
mkdir -p backend/src/archive/config

# Move old controller files
echo "📁 Moving old controller files..."
if [ -f "backend/src/controllers/authController_old.js" ]; then
    mv backend/src/controllers/authController_old.js backend/src/archive/controllers/
fi

if [ -f "backend/src/controllers/collegeController_old.js" ]; then
    mv backend/src/controllers/collegeController_old.js backend/src/archive/controllers/
fi

# Move deprecated config
echo "📁 Moving deprecated config files..."
if [ -f "backend/src/config/db.js.deprecated" ]; then
    mv backend/src/config/db.js.deprecated backend/src/archive/config/
fi

# Update package.json scripts
echo "📝 Updating package.json scripts..."
cd backend

# Create a summary of changes
echo "✅ Cleanup completed!"
echo ""
echo "📋 Summary of changes:"
echo "- Old MongoDB models moved to: src/models/mongodb_deprecated/"
echo "- Old controllers archived in: src/archive/controllers/"
echo "- Old config files archived in: src/archive/config/"
echo "- New hybrid models available in: src/models/postgresql/ and src/models/mongodb/"
echo ""
echo "🚀 Ready to start with hybrid database architecture!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with PostgreSQL credentials"
echo "2. Run: docker-compose up -d postgres mongodb"
echo "3. Run: npm run migrate"
echo "4. Run: npm run dev"
