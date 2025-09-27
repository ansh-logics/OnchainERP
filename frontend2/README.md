# YuktiERP - College Management System

A lightweight, centralized ERP system for colleges designed to unify admissions, fee collection, hostel allocation, and examination records. Built with Next.js and ShadCN UI for a modern, Apple-inspired user experience.

## 🎯 Problem Statement

Current college management systems suffer from:
- **Fragmented processes**: Admissions, fees, hostel, and exams tracked separately
- **Student inefficiency**: Long queues and multiple counters
- **Staff overhead**: Repetitive data entry across systems
- **Admin blind spots**: Lack of real-time institutional insights
- **Cost barriers**: Comprehensive ERP suites too expensive for public colleges

## 💡 Solution

YuktiERP provides a unified, cost-effective platform that:
- Centralizes all college operations in one system
- Streamlines workflows for students, staff, and administrators
- Offers real-time analytics and insights
- Maintains Apple-inspired design for excellent UX
- Built with modern, scalable technologies

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: ShadCN UI components
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Authentication**: Mock system (demo purposes)

### Design Principles
- **Minimalistic**: Clean, professional, accessible interfaces
- **Modular**: Reusable components and clear separation of concerns
- **Role-based**: Dedicated views for students, staff, and administrators
- **Mobile-first**: Responsive design for all screen sizes
- **Performance**: Optimized for fast loading and smooth interactions

## 👥 User Roles & Features

### 🎓 Students
- **Dashboard**: CGPA, attendance, credits overview
- **Profile**: Personal information and academic documents
- **Fees**: Payment history, pending dues, online payment
- **Hostel**: Room allocation status and requests
- **Exams**: Results, schedules, and admit cards

### 👨‍🏫 Staff
- **Dashboard**: Department overview and pending tasks
- **Admissions**: Student intake and application management
- **Fee Collection**: Manual entry and receipt generation
- **Hostel Management**: Room allocation and occupancy tracking
- **Exam Management**: Marks entry and result processing

### 👨‍💼 Administrators
- **Dashboard**: Institution-wide analytics and metrics
- **User Management**: Faculty and student account management
- **Reports**: Exportable summaries and financial reports
- **System Logs**: Audit trails and system monitoring
- **Settings**: System configuration and preferences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/anshbhatt/Developer/OnchainERP/frontend2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🧪 Demo Accounts

The application includes three demo accounts to showcase different user roles:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Student** | `student@yukti.edu` | `demo123` | View profile, pay fees, check hostel, access results |
| **Staff** | `staff@yukti.edu` | `demo123` | Manage admissions, collect fees, allocate rooms, update marks |
| **Admin** | `admin@yukti.edu` | `demo123` | View analytics, manage users, generate reports, system settings |

## 📱 Key Features

### ✨ Student Experience
- **Unified Dashboard**: All important information at a glance
- **Digital Payments**: Secure online fee payment with instant receipts
- **Real-time Updates**: Live status of applications and requests
- **Document Access**: Download certificates and transcripts
- **Mobile Responsive**: Full functionality on mobile devices

### 🛠️ Staff Operations
- **Streamlined Workflows**: Reduce repetitive data entry
- **Bulk Operations**: Process multiple records efficiently
- **Task Management**: Clear overview of pending items
- **Quick Actions**: Common operations easily accessible
- **Department Views**: Focused on relevant data

### 📊 Admin Insights
- **Real-time Analytics**: Live dashboards with key metrics
- **Financial Overview**: Revenue tracking and fee collection rates
- **Occupancy Monitoring**: Hostel utilization and capacity planning
- **System Health**: Performance monitoring and alerts
- **Audit Capabilities**: Complete activity logs and reporting

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (professional, trustworthy)
- **Success**: Green (payments, completed tasks)
- **Warning**: Yellow (pending items, alerts)
- **Error**: Red (overdue items, critical alerts)
- **Neutral**: Gray scale (text, borders, backgrounds)

### Typography
- **Headings**: Geist Sans (clean, modern)
- **Body**: System fonts with fallbacks
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- **Cards**: Rounded corners, subtle shadows, clean layouts
- **Buttons**: Clear hierarchy, consistent sizing, hover states
- **Forms**: Clear labels, validation states, helpful hints
- **Navigation**: Intuitive icons, active states, breadcrumbs

## 📁 Project Structure

```
frontend2/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (student)/         # Student dashboard pages
│   ├── (staff)/           # Staff dashboard pages
│   ├── (admin)/           # Admin dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # ShadCN UI components
│   ├── layout/            # Layout components (header, sidebar)
│   ├── charts/            # Chart components
│   ├── forms/             # Form components
│   └── tables/            # Table components
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── mock-data.ts       # Demo data
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting
- Consistent component patterns

## 🚀 Deployment

The application can be deployed to various platforms:

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

This is a hackathon MVP project. For future development:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📋 Future Roadmap

### Phase 1 (Post-MVP)
- [ ] Real backend integration
- [ ] User authentication system
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] File upload functionality

### Phase 2 (Enhanced Features)
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API documentation
- [ ] Multi-language support
- [ ] Advanced role permissions

### Phase 3 (Enterprise Features)
- [ ] Multi-tenant architecture
- [ ] Advanced security features
- [ ] Integration with existing systems
- [ ] Custom workflows
- [ ] Advanced reporting engine

## 📄 License

This project is built for educational and demonstration purposes. 

## 🙋‍♂️ Support

For questions about this demo:
- Check the demo accounts above
- Review the component documentation
- Explore the mock data structure

---

**Built with ❤️ for the future of college management**

*YuktiERP - Streamlining education, one click at a time.*