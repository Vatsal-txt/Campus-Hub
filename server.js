const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for JWT
const JWT_SECRET = 'your-secret-key-change-in-production';

// In-memory database (replace with MongoDB/PostgreSQL in production)
const db = {
  users: [],
  events: [],
  resources: [],
  bookings: [],
  messages: [],
  clubs: [],
  notifications: []
};

// Helper function to generate ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, department, year, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      department: department || '',
      year: year || '',
      role: role || 'participant',
      clubs: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        clubs: user.clubs
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    year: user.year,
    clubs: user.clubs
  });
});

// ==================== EVENT ROUTES ====================

// Create event
app.post('/api/events', authenticateToken, authorizeRoles('organizer', 'admin'), (req, res) => {
  try {
    const { title, description, startDate, endDate, type, club, budget, collaborators } = req.body;

    const event = {
      id: generateId(),
      title,
      description,
      startDate,
      endDate,
      type: type || 'single-day',
      club: club || null,
      budget: budget || 0,
      collaborators: collaborators || [],
      organizerId: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'draft',
      participantCount: 0,
      createdAt: new Date().toISOString()
    };

    db.events.push(event);

    // Create notification for admin if organizer created event
    if (req.user.role === 'organizer') {
      const notification = {
        id: generateId(),
        userId: 'admin',
        type: 'event_approval',
        message: `New event "${title}" requires approval`,
        eventId: event.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.push(notification);
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

// Get all events
app.get('/api/events', authenticateToken, (req, res) => {
  try {
    const { status, club, type } = req.query;
    let events = [...db.events];

    // Filter based on user role
    if (req.user.role === 'participant') {
      events = events.filter(e => e.status === 'approved');
    } else if (req.user.role === 'organizer') {
      events = events.filter(e => 
        e.status === 'approved' || e.organizerId === req.user.id
      );
    }

    // Apply filters
    if (status) {
      events = events.filter(e => e.status === status);
    }
    if (club) {
      events = events.filter(e => e.club === club);
    }
    if (type) {
      events = events.filter(e => e.type === type);
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Get single event
app.get('/api/events/:id', authenticateToken, (req, res) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Update event
app.put('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const eventIndex = db.events.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = db.events[eventIndex];

    // Check permissions
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    // Update event
    db.events[eventIndex] = {
      ...event,
      ...req.body,
      id: event.id,
      organizerId: event.organizerId,
      updatedAt: new Date().toISOString()
    };

    res.json(db.events[eventIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

// Approve/Reject event (Admin only)
app.patch('/api/events/:id/status', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { status } = req.body;
    const eventIndex = db.events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.events[eventIndex].status = status;

    // Create notification for organizer
    const event = db.events[eventIndex];
    const notification = {
      id: generateId(),
      userId: event.organizerId,
      type: 'event_status',
      message: `Event "${event.title}" has been ${status}`,
      eventId: event.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(notification);

    res.json(db.events[eventIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event status' });
  }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const eventIndex = db.events.findIndex(e => e.id === req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const event = db.events[eventIndex];
  if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this event' });
  }

  db.events.splice(eventIndex, 1);
  res.json({ message: 'Event deleted successfully' });
});

// ==================== RESOURCE ROUTES ====================

// Create resource
app.post('/api/resources', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { name, type, description, capacity } = req.body;

    const resource = {
      id: generateId(),
      name,
      type,
      description: description || '',
      capacity: capacity || null,
      available: true,
      createdAt: new Date().toISOString()
    };

    db.resources.push(resource);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error creating resource' });
  }
});

// Get all resources
app.get('/api/resources', authenticateToken, (req, res) => {
  try {
    const { type, available } = req.query;
    let resources = [...db.resources];

    if (type) {
      resources = resources.filter(r => r.type === type);
    }
    if (available !== undefined) {
      resources = resources.filter(r => r.available === (available === 'true'));
    }

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching resources' });
  }
});

// ==================== BOOKING ROUTES ====================

// Create booking
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { resourceId, startTime, endTime, purpose, eventId } = req.body;

    // Check for conflicts
    const conflicts = db.bookings.filter(b => 
      b.resourceId === resourceId &&
      b.status !== 'rejected' &&
      (
        (new Date(startTime) >= new Date(b.startTime) && new Date(startTime) < new Date(b.endTime)) ||
        (new Date(endTime) > new Date(b.startTime) && new Date(endTime) <= new Date(b.endTime)) ||
        (new Date(startTime) <= new Date(b.startTime) && new Date(endTime) >= new Date(b.endTime))
      )
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Resource is already booked for this time slot' });
    }

    const booking = {
      id: generateId(),
      resourceId,
      userId: req.user.id,
      startTime,
      endTime,
      purpose,
      eventId: eventId || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.bookings.push(booking);

    // Create notification for admin
    const resource = db.resources.find(r => r.id === resourceId);
    const notification = {
      id: generateId(),
      userId: 'admin',
      type: 'booking_request',
      message: `New booking request for ${resource?.name || 'resource'}`,
      bookingId: booking.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(notification);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Get all bookings
app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    let bookings = [...db.bookings];

    // Filter based on user role
    if (req.user.role === 'participant' || req.user.role === 'organizer') {
      bookings = bookings.filter(b => b.userId === req.user.id);
    }

    // Populate resource details
    bookings = bookings.map(b => ({
      ...b,
      resource: db.resources.find(r => r.id === b.resourceId)
    }));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Approve/Reject booking (Admin only)
app.patch('/api/bookings/:id/status', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { status } = req.body;
    const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    db.bookings[bookingIndex].status = status;

    // Create notification for user
    const booking = db.bookings[bookingIndex];
    const resource = db.resources.find(r => r.id === booking.resourceId);
    const notification = {
      id: generateId(),
      userId: booking.userId,
      type: 'booking_status',
      message: `Booking for ${resource?.name || 'resource'} has been ${status}`,
      bookingId: booking.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(notification);

    res.json(db.bookings[bookingIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating booking status' });
  }
});

// ==================== CLUB ROUTES ====================

// Create club
app.post('/api/clubs', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { name, description, category } = req.body;

    const club = {
      id: generateId(),
      name,
      description,
      category,
      members: [],
      organizers: [],
      createdAt: new Date().toISOString()
    };

    db.clubs.push(club);
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club' });
  }
});

// Get all clubs
app.get('/api/clubs', authenticateToken, (req, res) => {
  try {
    res.json(db.clubs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clubs' });
  }
});

// Join club
app.post('/api/clubs/:id/join', authenticateToken, (req, res) => {
  try {
    const clubIndex = db.clubs.findIndex(c => c.id === req.params.id);
    if (clubIndex === -1) {
      return res.status(404).json({ error: 'Club not found' });
    }

    if (!db.clubs[clubIndex].members.includes(req.user.id)) {
      db.clubs[clubIndex].members.push(req.user.id);
    }

    // Update user's clubs
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      if (!db.users[userIndex].clubs) {
        db.users[userIndex].clubs = [];
      }
      if (!db.users[userIndex].clubs.includes(req.params.id)) {
        db.users[userIndex].clubs.push(req.params.id);
      }
    }

    res.json(db.clubs[clubIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error joining club' });
  }
});

// ==================== MESSAGE ROUTES ====================

// Send message
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { recipientId, content, eventId, clubId } = req.body;

    const message = {
      id: generateId(),
      senderId: req.user.id,
      recipientId,
      content,
      eventId: eventId || null,
      clubId: clubId || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    db.messages.push(message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Get messages
app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    const { clubId, eventId } = req.query;
    
    let messages = db.messages.filter(m => 
      m.senderId === req.user.id || m.recipientId === req.user.id
    );

    if (clubId) {
      messages = messages.filter(m => m.clubId === clubId);
    }
    if (eventId) {
      messages = messages.filter(m => m.eventId === eventId);
    }

    // Populate sender details
    messages = messages.map(m => ({
      ...m,
      sender: db.users.find(u => u.id === m.senderId)
    }));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// ==================== NOTIFICATION ROUTES ====================

// Get notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const notifications = db.notifications.filter(n => 
      n.userId === req.user.id || n.userId === 'admin' && req.user.role === 'admin'
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const notificationIndex = db.notifications.findIndex(n => n.id === req.params.id);
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.notifications[notificationIndex].read = true;
    res.json(db.notifications[notificationIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating notification' });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get analytics dashboard data
app.get('/api/analytics', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const analytics = {
      eventStats: {
        total: db.events.length,
        approved: db.events.filter(e => e.status === 'approved').length,
        pending: db.events.filter(e => e.status === 'draft').length,
        thisMonth: db.events.filter(e => {
          const eventDate = new Date(e.createdAt);
          const now = new Date();
          return eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear();
        }).length
      },
      resourceStats: {
        total: db.resources.length,
        available: db.resources.filter(r => r.available).length,
        booked: db.bookings.filter(b => b.status === 'approved').length,
        utilizationRate: db.resources.length > 0 
          ? ((db.bookings.filter(b => b.status === 'approved').length / db.resources.length) * 100).toFixed(1)
          : 0
      },
      clubStats: {
        total: db.clubs.length,
        totalMembers: db.clubs.reduce((sum, club) => sum + club.members.length, 0),
        averageMembers: db.clubs.length > 0 
          ? (db.clubs.reduce((sum, club) => sum + club.members.length, 0) / db.clubs.length).toFixed(1)
          : 0
      },
      budgetStats: {
        totalBudget: db.events.reduce((sum, event) => sum + (event.budget || 0), 0),
        averageBudget: db.events.length > 0
          ? (db.events.reduce((sum, event) => sum + (event.budget || 0), 0) / db.events.length).toFixed(2)
          : 0
      },
      recentActivity: {
        recentEvents: db.events.slice(-5).reverse(),
        recentBookings: db.bookings.slice(-5).reverse()
      }
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Export analytics report
app.get('/api/analytics/export', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { format } = req.query;
    
    const data = {
      events: db.events,
      resources: db.resources,
      bookings: db.bookings,
      clubs: db.clubs,
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      // Simple CSV format for events
      const csv = [
        'Event Title,Status,Type,Budget,Created Date',
        ...db.events.map(e => `${e.title},${e.status},${e.type},${e.budget},${e.createdAt}`)
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error exporting analytics' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API endpoints available at http://localhost:' + PORT + '/api');
});
