#!/bin/bash

# Script to seed main attendance system with 360 students

echo "🧹 This script will seed the attendance system for 360 students"
echo "   - 2 Departments: CSE and AIML"
echo "   - 2 Sections each (4 total)"
echo "   - 90 students per section"
echo ""
echo "⚠️  WARNING: This will add data to your database"
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🌱 Starting attendance system seeding..."
    cd "$(dirname "$0")/.."
    node scripts/seed-main-attendance.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Attendance system seeding completed successfully!"
        echo ""
        echo "🎯 You can now:"
        echo "   1. Start the backend server"
        echo "   2. Login as faculty to test attendance marking"
        echo "   3. Use the attendance API endpoints"
        echo ""
    else
        echo ""
        echo "❌ Attendance seeding failed!"
        echo "Please check the error messages above."
        echo ""
        exit 1
    fi
else
    echo "❌ Seeding cancelled"
    exit 0
fi

