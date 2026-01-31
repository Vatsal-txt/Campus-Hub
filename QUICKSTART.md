# Quick Start Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start the Servers

### Terminal 1 - Backend
```bash
cd backend
npm start
```
Server will run on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Application will run on http://localhost:3000

## Step 3: Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Don't have an account? Sign Up"
3. Fill in the registration form:
   - Email: admin@campus.edu
   - Password: admin123
   - Name: Admin User
   - Department: Administration
   - Year: N/A
   - Role: Admin
4. Click "Create Account"

## Step 4: Explore Features

### As Admin:
1. **Create Events**: Go to Events → Create Event
2. **Add Resources**: Go to Resources → Add Resource
3. **Create Clubs**: Go to Clubs → Create Club
4. **View Analytics**: Go to Analytics to see dashboard

### Create Additional Users:
- Create an Organizer account to test event creation workflow
- Create a Participant account to test booking and club joining

## Default Test Accounts

You can create these test accounts for different roles:

**Admin:**
- Email: admin@campus.edu
- Password: admin123

**Organizer:**
- Email: organizer@campus.edu
- Password: organizer123

**Participant:**
- Email: student@campus.edu
- Password: student123

## Key Features to Try

✅ **Event Management**
- Create an event as organizer (will be in draft status)
- Login as admin and approve the event
- View approved events as participant

✅ **Resource Booking**
- As admin, create a resource (e.g., "Auditorium", type: "hall")
- As any user, book the resource for a time slot
- As admin, approve the booking

✅ **Club Management**
- As admin, create a club
- As participant, join the club
- Check club membership in user profile

✅ **Notifications**
- Watch notification badge update when events are approved
- Check notifications for booking status updates

✅ **Analytics**
- As admin, view the analytics dashboard
- Export data in CSV format

## Troubleshooting

**Port Already in Use:**
- Backend: Change PORT in backend/server.js
- Frontend: Change port in frontend/vite.config.js

**Cannot Connect to Backend:**
- Ensure backend is running on port 5000
- Check that CORS is enabled in backend/server.js

**Dependencies Not Installing:**
- Delete node_modules folder
- Delete package-lock.json
- Run npm install again

## Next Steps

1. Explore all features in the UI
2. Test different user roles
3. Review the API endpoints in README.md
4. Customize the design and add your own features

Enjoy using Campus Hub! 🎉
