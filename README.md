# Campus Hub - Unified Campus Resource & Event Management System

A comprehensive full-stack web platform that centralizes the management of campus resources, student clubs/committees, and events with real-world campus workflows, proper access control, and actionable insights through analytics.

## 🎯 Features

### Authentication & Authorization
- ✅ Secure user authentication (email/password)
- ✅ Role-based access control (RBAC) with three user roles:
  - **Admin**: System-level control, approvals, analytics, resource management
  - **Organizer**: Club/committee leads who can create and manage events/resources
  - **Participant**: Club members and general users
- ✅ JWT-based session management
- ✅ Fine-grained permissions (event approval rights, resource booking rights)

### User Profiles & Community Membership
- ✅ Individual user profiles with:
  - Basic details (name, department, year, role)
  - Clubs/committees the user is a member of
  - Clubs/committees the user heads or coordinates
- ✅ Support for multiple memberships across clubs, committees, or communities
- ✅ Visibility controls for public and internal profile details

### Event Lifecycle Management
- ✅ End-to-end event workflow:
  - Event creation by organizers
  - Admin-based approval flow
  - Event publishing with visibility rules
- ✅ Support for:
  - Single-day and multi-day events
  - Collaborative events involving multiple clubs or committees
  - Draft, approved, rejected, and completed event states
  - Budget tracking
- ✅ Event filtering by status, club, and type

### Resource Booking System
- ✅ Centralized management of campus resources:
  - Rooms, halls, labs
  - Equipment (projectors, cameras, sound systems, etc.)
- ✅ Booking features:
  - Time-slot-based reservations
  - Automatic conflict detection and prevention
  - Configurable approval-based or auto-approved bookings
- ✅ Booking history and usage logs
- ✅ Real-time availability status

### Analytics & Insights Dashboard
- ✅ Admin dashboards displaying:
  - Event participation trends
  - Club-wise activity and engagement metrics
  - Resource utilization rates
  - Budget usage
- ✅ Exportable reports in JSON and CSV formats
- ✅ Recent activity tracking

### In-App Communication
- ✅ Built-in messaging system supporting:
  - One-to-one messaging
  - Group chats for clubs, committees, or event teams
  - Context-aware communication (event-specific or project-specific chats)

### Multi-Club Collaboration
- ✅ Ability to:
  - Create joint events managed by multiple clubs
  - Assign roles and permissions per collaborating club
  - Track contributions and participation across clubs

### Notifications & Reminders
- ✅ Automated notifications for:
  - Event approvals or rejections
  - Upcoming events and deadlines
  - Resource booking status updates
- ✅ Real-time notification badges

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon system
- **Custom CSS-in-JS** - Distinctive, production-grade design
- **DM Sans & Space Mono** fonts - Professional typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Design Philosophy
- **Brutalist-Tech Aesthetic** - Dark gradient backgrounds with neon accents
- **Glassmorphism** - Translucent cards with backdrop blur
- **Smooth Animations** - Hover effects and transitions
- **Responsive Layout** - Grid-based responsive design

## 📁 Project Structure

```
campus-resource-management/
├── backend/
│   ├── server.js           # Express server with all API endpoints
│   └── package.json        # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main React application
    │   └── main.jsx        # React entry point
    ├── index.html          # HTML template
    ├── vite.config.js      # Vite configuration
    └── package.json        # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Events
- `GET /api/events` - Get all events (filtered by role)
- `POST /api/events` - Create new event (Organizer/Admin)
- `PUT /api/events/:id` - Update event
- `PATCH /api/events/:id/status` - Approve/Reject event (Admin)
- `DELETE /api/events/:id` - Delete event

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Approve/Reject booking (Admin)

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create club (Admin)
- `POST /api/clubs/:id/join` - Join a club

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Analytics
- `GET /api/analytics` - Get dashboard data (Admin)
- `GET /api/analytics/export?format=csv` - Export analytics

## 👥 User Roles & Permissions

### Admin
- Full system control
- Approve/reject events and bookings
- Create resources and clubs
- Access analytics dashboard
- View all data

### Organizer
- Create and manage events
- Book resources
- Join clubs
- View own events and bookings

### Participant
- View approved events
- Book resources
- Join clubs
- Send messages

## 🎨 Design Features

### Color Palette
- Primary: Purple gradients (#8b5cf6, #a78bfa)
- Secondary: Pink accents (#ec4899)
- Success: Green (#10b981)
- Warning: Yellow (#fbbf24)
- Error: Red (#ef4444)
- Background: Dark purple gradients (#1a1625, #2d1b3d)

### UI Components
- Glassmorphic cards with backdrop blur
- Gradient buttons with hover animations
- Status badges with color coding
- Responsive grid layouts
- Custom scrollbar styling
- Notification badges

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Protected API endpoints
- Input validation
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1400px+)
- Laptop (1024px - 1399px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔄 State Management

- React hooks (useState, useEffect)
- Local storage for JWT tokens
- Component-level state management
- API-driven data fetching

## 🚧 Future Enhancements

- [ ] Email notifications
- [ ] Calendar integration
- [ ] File upload for events
- [ ] Advanced search and filters
- [ ] Real-time chat with WebSocket
- [ ] Mobile app (React Native)
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Image upload for clubs/events
- [ ] Attendance tracking
- [ ] Payment integration for event fees

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding proper database (MongoDB, PostgreSQL)
- Implementing email service (SendGrid, AWS SES)
- Adding file storage (AWS S3, Cloudinary)
- Setting up CI/CD pipeline
- Adding comprehensive testing
- Implementing rate limiting
- Adding security headers
- Setting up logging and monitoring

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Campus Resource Management**
