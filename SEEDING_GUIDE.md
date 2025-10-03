# Database Seeding Guide - OnchainERP

This guide will help you seed your OnchainERP database with comprehensive sample data for a complete college setup.

## 🎯 What Gets Created

The seed script creates a **fully functional college** with:

### 🏛️ College Information
- **Name**: Technological Institute of Engineering and Sciences (TIES)
- **Location**: Bangalore, Karnataka
- **Established**: 2005
- **Accreditation**: NAAC A+, NBA Accredited
- **Current Academic Year**: 2024-25

### 🏢 Departments (5)
1. **Computer Science Engineering (CSE)** - 240 intake, 18 faculty, 6 labs
2. **Electronics & Communication (ECE)** - 180 intake, 15 faculty, 5 labs
3. **Mechanical Engineering (MECH)** - 180 intake, 14 faculty, 4 labs
4. **Civil Engineering (CIVIL)** - 120 intake, 10 faculty, 3 labs
5. **Electrical & Electronics (EEE)** - 120 intake, 12 faculty, 4 labs

### 👥 Users
- **1 Admin** - College administrator
- **~69 Faculty Members** - Professors, Associate Professors, Assistant Professors
- **~800+ Students** - Across 4 batches (2021-2024), all departments

### 📚 Academic Data
- **Courses**: Department-specific courses with faculty assignments
- **Sections**: Multiple sections per department per batch
- **Timetable**: Weekly schedules for sections
- **Exams**: Internal and final exams
- **Assignments**: Sample assignments for courses

### 🏗️ Infrastructure
- **80 Classrooms** - Across 4 buildings (A, B, C, D blocks)
- **32 Labs** - Department-specific laboratories
- **10 Exam Halls** - Various capacities
- **200 Library Books** - Across multiple categories

### 💰 Financial
- **50 Sample Transactions** - Fee payment records

---

## 🚀 Quick Start

### Prerequisites

1. **PostgreSQL** running and accessible
2. **MongoDB** running (for future features)
3. **Node.js** installed (v18+)
4. **Database created** and migrations run

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies (if not done)

```bash
npm install
```

### Step 3: Configure Environment

Ensure your `.env` file has correct database credentials:

```env
# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=onchainerp
PG_USER=your_user
PG_PASSWORD=your_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/onchainerp

# JWT
JWT_SECRET=your_jwt_secret
```

### Step 4: Run the Seed Script

**Option A: Using npm script**
```bash
npm run seed:college
```

**Option B: Using shell script (with confirmations)**
```bash
./scripts/run-seed.sh
```

**Option C: Direct execution**
```bash
node scripts/seed-college-data.js
```

---

## 🔑 Default Login Credentials

After seeding completes, you can login with:

### Admin Account
```
Email: admin@teccollege.edu.in
Password: Admin@123
Role: admin
```

### Faculty Account (Example)
```
Email: [Check console output for generated emails]
Password: Admin@123
Role: faculty
```

### Student Account (Example)
```
Email: [Check console output for generated emails]
Password: Admin@123
Role: student
```

**Note**: All users have the same password `Admin@123` for development purposes.

---

## 📊 Data Statistics

After successful seeding, you'll have:

| Entity | Count |
|--------|-------|
| Colleges | 1 |
| Admin Users | 1 |
| Departments | 5 |
| Faculty | ~69 |
| Students | ~800+ |
| Courses | ~30 |
| Sections | ~80 |
| Classrooms | 80 |
| Labs | 22 |
| Exam Halls | 10 |
| Library Books | 200 |
| Exams | ~40 |
| Assignments | ~30 |
| Timetable Entries | ~250 |
| Transactions | 50 |

---

## ⚙️ Customization

You can customize the seed data by editing `/backend/scripts/seed-college-data.js`:

### Change Number of Students
```javascript
// Line ~200
const studentsInBatch = Math.floor(dept.totalIntake * 0.9); // Change 0.9 to desired percentage
```

### Change Password
```javascript
// Line ~35
const hashedPassword = await bcrypt.hash('YourPassword', 10);
```

### Modify College Information
```javascript
// Lines ~47-85
const college = await College.create({
  name: 'Your College Name',
  shortName: 'YCN',
  // ... modify as needed
});
```

### Add More Departments
```javascript
// Lines ~92-125
const departmentsData = [
  {
    name: 'Your Department',
    shortName: 'YD',
    code: 'YD',
    // ... other fields
  }
];
```

---

## 🔍 Verification

After seeding, verify the data:

### 1. Check Database

```bash
# Connect to PostgreSQL
psql -U your_user -d onchainerp

# Check counts
SELECT COUNT(*) FROM colleges;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM faculty;
SELECT COUNT(*) FROM students;
```

### 2. Test Login

1. Start your backend server: `npm run dev`
2. Try logging in with admin credentials
3. Navigate to different modules

### 3. Check Relationships

```sql
-- Faculty with departments
SELECT f.*, d.name as dept_name 
FROM faculty f 
JOIN departments d ON f."departmentId" = d.id 
LIMIT 5;

-- Students with departments
SELECT s.*, d.name as dept_name 
FROM students s 
JOIN departments d ON s."departmentId" = d.id 
LIMIT 5;
```

---

## ⚠️ Important Notes

1. **Development Only**: This seed data is for development/testing purposes
2. **Data Reset**: Running the seed script multiple times will create duplicate data unless you clear the database first
3. **Transactions**: The script uses database transactions, so failures will rollback
4. **Hostel Data**: Hostel-related data is NOT included (as per requirements)
5. **Performance**: Seeding ~800+ students may take 30-60 seconds

---

## 🛠️ Troubleshooting

### Error: Cannot find module

```bash
cd backend
npm install
```

### Error: Database connection failed

1. Check if PostgreSQL is running: `pg_isready`
2. Verify `.env` credentials
3. Ensure database exists: `createdb onchainerp`

### Error: Foreign key constraint

Run migrations first:
```bash
# If using Sequelize migrations
npx sequelize-cli db:migrate
```

### Script hangs

- Normal for large datasets
- Wait for completion message (up to 60 seconds)
- Check database locks: `SELECT * FROM pg_stat_activity;`

### Duplicate key errors

Clear existing data first:
```bash
# Connect to database
psql -U your_user -d onchainerp

# Drop and recreate (CAUTION: This deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON SCHEMA public TO public;

# Then re-run migrations and seed
```

---

## 🧹 Cleaning Up Seed Data

To remove seed data:

```bash
# Option 1: Drop and recreate database
dropdb onchainerp
createdb onchainerp

# Option 2: Truncate tables (keeps structure)
psql -U your_user -d onchainerp -c "TRUNCATE users, colleges, departments, faculty, students CASCADE;"
```

---

## 📝 Next Steps

After seeding:

1. ✅ Login to admin panel
2. ✅ Explore departments and users
3. ✅ Review courses and sections
4. ✅ Check timetable entries
5. ✅ Test student enrollment
6. ✅ Configure exam schedules
7. ✅ Manage library operations
8. ✅ Process fee transactions

---

## 📞 Support

For issues or questions:
- Check the console output for detailed error messages
- Review the `/backend/scripts/README.md` for detailed documentation
- Verify database schema matches the seed script expectations

---

**Happy Coding! 🎉**

