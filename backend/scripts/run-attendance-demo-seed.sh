#!/bin/bash

# Script to seed attendance demo data
# This will create sample faculty, students, courses, sections, and timetable entries

echo "🌱 Starting Attendance Demo Data Seeding..."
echo ""
echo "This will create:"
echo "  - 1 Faculty member (faculty@demo.edu)"
echo "  - 15 Students in Section A"
echo "  - 3 Courses (DSA, DBMS, OS)"
echo "  - 2 Sections"
echo "  - Timetable entries for the week"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

# Run the seed script
echo "Running seed script..."
node scripts/seed-attendance-demo.js

echo ""
echo "✅ Demo data seeding completed!"
echo ""
echo "📋 You can now login with:"
echo "   Email: faculty@demo.edu"
echo "   Password: password123"
echo ""
echo "🎯 Navigate to /staff/attendance to mark attendance!"

