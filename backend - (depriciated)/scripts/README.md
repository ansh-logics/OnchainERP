# Database Seed Scripts

This directory contains scripts for seeding the database with sample data.

## Available Scripts

### 1. Comprehensive College Seed Data (`seed-college-data.js`)

This script creates a complete college setup with all academic-related data (excluding hostel management).

#### What it creates:

- **1 College** - Technological Institute of Engineering and Sciences (TIES)
- **1 Admin User** - College Administrator
- **5 Departments**:
  - Computer Science and Engineering (CSE) - 240 intake
  - Electronics and Communication Engineering (ECE) - 180 intake
  - Mechanical Engineering (MECH) - 180 intake
  - Civil Engineering (CIVIL) - 120 intake
  - Electrical and Electronics Engineering (EEE) - 120 intake

- **Faculty Members** - Based on department requirements
  - HOD for each department
  - Regular faculty (Professors, Associate Professors, Assistant Professors, Lecturers)
  
- **Students** - Across 4 batches (2021-2024)
  - Distributed across all departments
  - Different semesters based on admission year
  - ~90% capacity filled
  
- **Courses** - Department-specific courses
  - Core courses
  - Elective courses
  - Laboratory courses
  - Faculty assignments
  
- **Sections** - Based on department configuration
  - Multiple sections per department per batch
  - Class teacher assignments
  
- **Infrastructure**:
  - **80 Classrooms** - Across 4 buildings (A, B, C, D blocks)
  - **~32 Labs** - Department-specific laboratories
  - **10 Exam Halls** - With varying capacities
  
- **Library**:
  - **200 Books** - Across various categories
  - Multiple copies per book
  - Proper cataloging with ISBN and accession numbers
  
- **Academic Operations**:
  - **Exams** - Internal and Final exams for current semester
  - **Assignments** - Sample assignments for courses
  - **Timetable** - Weekly schedule for sections
  - **Transactions** - Fee payment records

#### Running the Script

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run the seed script
npm run seed:college
```

#### Login Credentials

After seeding, you can login with:

**Admin Login:**
- Email: `admin@teccollege.edu.in`
- Password: `Admin@123`
- Role: Admin

**Faculty Login:**
- Email: Check console output for generated faculty emails
- Password: `Admin@123`
- Role: Faculty

**Student Login:**
- Email: Check console output for generated student emails
- Password: `Admin@123`
- Role: Student

#### Data Structure

The seed data follows this hierarchy:

```
College (TIES)
├── Admin User (Dr. Rajesh Kumar)
├── Departments (5)
│   ├── Computer Science and Engineering
│   │   ├── HOD + Faculty (18)
│   │   ├── Students (~216 per batch × 4 batches)
│   │   ├── Courses (8)
│   │   ├── Sections (4 per batch)
│   │   └── Labs (6)
│   ├── Electronics and Communication
│   │   └── ... (similar structure)
│   └── ... (other departments)
├── Classrooms (80)
├── Exam Halls (10)
├── Library Books (200)
└── Academic Operations
    ├── Exams
    ├── Assignments
    ├── Timetable
    └── Transactions
```

#### Important Notes

1. **Prerequisites**: Ensure your database is set up and migrations are run before seeding
2. **Data Reset**: This script uses transactions, so if it fails, it will rollback automatically
3. **Hostel Data**: Hostel-related data is NOT included in this seed
4. **Email Format**: All emails follow the pattern: `firstname.lastname@teccollege.edu.in` (or `@student.teccollege.edu.in` for students)
5. **Sample Data**: This is sample data for development/testing purposes

#### Customization

You can modify the following in the script:

- Number of students per department (currently 90% of intake)
- Number of courses per department
- Number of faculty members
- Number of library books
- Academic year and semester details
- Fee amounts and transaction data

#### Database Requirements

Before running:
```bash
# Ensure PostgreSQL is running
# Ensure MongoDB is running (for future use)
# Database should be created
# Migrations should be run
```

#### Troubleshooting

**Error: Cannot find module**
```bash
npm install
```

**Error: Database connection failed**
- Check your `.env` file
- Ensure PostgreSQL is running
- Verify database credentials

**Error: Foreign key constraint**
- Ensure migrations are run
- Check database schema is up to date

**Script hangs or takes too long**
- The script creates a lot of data, it may take 30-60 seconds
- Wait for completion message

#### Next Steps After Seeding

1. Login to the admin panel with provided credentials
2. Explore the departments, faculty, and student data
3. Create additional courses, sections, or modify existing data
4. Set up timetables for remaining sections
5. Configure exam schedules
6. Manage library operations

---

## Other Scripts

### `fix-user-college-associations.js`

Fixes user-college associations for existing data (migration script).

