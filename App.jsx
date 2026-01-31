import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, BarChart3, MessageCircle, Bell, Search, Plus, Settings, LogOut, Users, Clock, CheckCircle, XCircle, AlertCircle, Menu, X, ChevronDown } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  auth: {
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    getProfile: () => api.request('/auth/me'),
  },

  events: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/events${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.request(`/events/${id}`),
    create: (eventData) => api.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
    update: (id, eventData) => api.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),
    updateStatus: (id, status) => api.request(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    delete: (id) => api.request(`/events/${id}`, { method: 'DELETE' }),
  },

  resources: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/resources${query ? `?${query}` : ''}`);
    },
    create: (resourceData) => api.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    }),
  },

  bookings: {
    getAll: () => api.request('/bookings'),
    create: (bookingData) => api.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
    updateStatus: (id, status) => api.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  },

  clubs: {
    getAll: () => api.request('/clubs'),
    create: (clubData) => api.request('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    }),
    join: (id) => api.request(`/clubs/${id}/join`, { method: 'POST' }),
  },

  messages: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/messages${query ? `?${query}` : ''}`);
    },
    send: (messageData) => api.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
  },

  notifications: {
    getAll: () => api.request('/notifications'),
    markAsRead: (id) => api.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  },

  analytics: {
    getDashboard: () => api.request('/analytics'),
    export: (format) => api.request(`/analytics/export?format=${format}`),
  },
};

// Authentication Component
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    year: '',
    role: 'participant'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin
        ? await api.auth.login({ email: formData.email, password: formData.password })
        : await api.auth.register(formData);

      localStorage.setItem('token', result.token);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: '"Space Mono", monospace'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        padding: '3rem',
        maxWidth: '450px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Campus Hub
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginBottom: '2rem' }}>
          Unified Resource & Event Management
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              >
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              marginBottom: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              marginBottom: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'transform 0.2s',
              fontFamily: '"Space Mono", monospace'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4facfe',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
              fontFamily: '"Space Mono", monospace'
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('events');
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentView]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentView === 'events') {
        const data = await api.events.getAll();
        setEvents(data);
      } else if (currentView === 'resources') {
        const [resourcesData, bookingsData] = await Promise.all([
          api.resources.getAll(),
          api.bookings.getAll()
        ]);
        setResources(resourcesData);
        setBookings(bookingsData);
      } else if (currentView === 'clubs') {
        const data = await api.clubs.getAll();
        setClubs(data);
      } else if (currentView === 'analytics' && user.role === 'admin') {
        const data = await api.analytics.getDashboard();
        setAnalytics(data);
      }
      
      const notifData = await api.notifications.getAll();
      setNotifications(notifData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
      fontFamily: '"DM Sans", sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(45deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Campus Hub
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={22} style={{ cursor: 'pointer', color: notifications.filter(n => !n.read).length > 0 ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)' }} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <User size={18} />
              <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                background: user.role === 'admin' ? '#8b5cf6' : user.role === 'organizer' ? '#3b82f6' : '#10b981',
                borderRadius: '1rem'
              }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <nav style={{
          width: '250px',
          padding: '2rem 1.5rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <NavItem icon={Calendar} label="Events" active={currentView === 'events'} onClick={() => setCurrentView('events')} />
          <NavItem icon={MapPin} label="Resources" active={currentView === 'resources'} onClick={() => setCurrentView('resources')} />
          <NavItem icon={Users} label="Clubs" active={currentView === 'clubs'} onClick={() => setCurrentView('clubs')} />
          <NavItem icon={MessageCircle} label="Messages" active={currentView === 'messages'} onClick={() => setCurrentView('messages')} />
          {user.role === 'admin' && (
            <NavItem icon={BarChart3} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
          )}
        </nav>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {currentView === 'events' && (
            <EventsView 
              events={events} 
              user={user} 
              onRefresh={loadData} 
              onCreateEvent={() => openModal('event')}
            />
          )}
          {currentView === 'resources' && (
            <ResourcesView 
              resources={resources} 
              bookings={bookings}
              user={user} 
              onRefresh={loadData} 
              onCreateBooking={() => openModal('booking')}
              onCreateResource={() => openModal('resource')}
            />
          )}
          {currentView === 'clubs' && (
            <ClubsView 
              clubs={clubs} 
              user={user} 
              onRefresh={loadData}
              onCreateClub={() => openModal('club')}
            />
          )}
          {currentView === 'analytics' && user.role === 'admin' && (
            <AnalyticsView analytics={analytics} />
          )}
          {currentView === 'messages' && (
            <MessagesView user={user} />
          )}
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === 'event' && <EventForm user={user} onClose={closeModal} onSuccess={loadData} />}
          {modalType === 'booking' && <BookingForm resources={resources} onClose={closeModal} onSuccess={loadData} />}
          {modalType === 'resource' && <ResourceForm onClose={closeModal} onSuccess={loadData} />}
          {modalType === 'club' && <ClubForm onClose={closeModal} onSuccess={loadData} />}
        </Modal>
      )}
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      background: active ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' : 'transparent',
      border: active ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
      color: active ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
      transition: 'all 0.3s',
      fontWeight: active ? '600' : '400'
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    <Icon size={20} />
    <span>{label}</span>
  </div>
);

// Events View
const EventsView = ({ events, user, onRefresh, onCreateEvent }) => {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Events</h2>
        {(user.role === 'organizer' || user.role === 'admin') && (
          <button
            onClick={onCreateEvent}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Create Event
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['all', 'approved', 'draft', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              border: filter === status ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
              background: filter === status ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: filter === status ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: filter === status ? '600' : '400'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} user={user} onRefresh={onRefresh} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem' }} />
          <p>No events found</p>
        </div>
      )}
    </div>
  );
};

// Event Card
const EventCard = ({ event, user, onRefresh }) => {
  const handleStatusChange = async (status) => {
    try {
      await api.events.updateStatus(event.id, status);
      onRefresh();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const statusColors = {
    approved: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', color: '#6ee7b7' },
    draft: { bg: 'rgba(251, 191, 36, 0.1)', border: '#fbbf24', color: '#fcd34d' },
    rejected: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', color: '#fca5a5' },
  };

  const status = statusColors[event.status] || statusColors.draft;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', flex: 1 }}>{event.title}</h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.75rem',
          background: status.bg,
          border: `1px solid ${status.border}`,
          color: status.color,
          fontWeight: '600'
        }}>
          {event.status}
        </span>
      </div>

      <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {event.description}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} />
          <span>{new Date(event.startDate).toLocaleDateString()}</span>
        </div>
        {event.budget > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>₹{event.budget.toLocaleString()}</span>
          </div>
        )}
      </div>

      {user.role === 'admin' && event.status === 'draft' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={() => handleStatusChange('approved')}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '0.5rem',
              color: '#6ee7b7',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '0.5rem',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

// Resources View
const ResourcesView = ({ resources, bookings, user, onRefresh, onCreateBooking, onCreateResource }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Resources & Bookings</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'admin' && (
            <button
              onClick={onCreateResource}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
            >
              <Plus size={20} />
              Add Resource
            </button>
          )}
          <button
            onClick={onCreateBooking}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Book Resource
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {resources.map(resource => (
          <div key={resource.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>{resource.name}</h3>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: resource.available ? '#10b981' : '#ef4444',
                display: 'block'
              }} />
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Type: {resource.type}
            </p>
            {resource.description && (
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                {resource.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>My Bookings</h3>
      <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {bookings.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '2rem' }}>
            No bookings yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {booking.resource?.name || 'Resource'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                  </p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  background: booking.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : booking.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  border: `1px solid ${booking.status === 'approved' ? '#10b981' : booking.status === 'rejected' ? '#ef4444' : '#fbbf24'}`,
                  color: booking.status === 'approved' ? '#6ee7b7' : booking.status === 'rejected' ? '#fca5a5' : '#fcd34d',
                  fontWeight: '600'
                }}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Clubs View
const ClubsView = ({ clubs, user, onRefresh, onCreateClub }) => {
  const handleJoinClub = async (clubId) => {
    try {
      await api.clubs.join(clubId);
      onRefresh();
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Clubs & Communities</h2>
        {user.role === 'admin' && (
          <button
            onClick={onCreateClub}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Create Club
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {clubs.map(club => (
          <div key={club.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>{club.name}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {club.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                {club.members?.length || 0} members
              </span>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #8b5cf6',
                color: '#a78bfa'
              }}>
                {club.category}
              </span>
            </div>
            {!club.members?.includes(user.id) && (
              <button
                onClick={() => handleJoinClub(club.id)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Join Club
              </button>
            )}
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          <Users size={48} style={{ margin: '0 auto 1rem' }} />
          <p>No clubs available</p>
        </div>
      )}
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ analytics }) => {
  if (!analytics) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading analytics...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Analytics Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard
          title="Total Events"
          value={analytics.eventStats.total}
          subtitle={`${analytics.eventStats.thisMonth} this month`}
          icon={Calendar}
          color="#8b5cf6"
        />
        <StatCard
          title="Resources"
          value={analytics.resourceStats.total}
          subtitle={`${analytics.resourceStats.utilizationRate}% utilization`}
          icon={MapPin}
          color="#3b82f6"
        />
        <StatCard
          title="Clubs"
          value={analytics.clubStats.total}
          subtitle={`${analytics.clubStats.totalMembers} total members`}
          icon={Users}
          color="#ec4899"
        />
        <StatCard
          title="Total Budget"
          value={`₹${analytics.budgetStats.totalBudget.toLocaleString()}`}
          subtitle={`Avg: ₹${analytics.budgetStats.averageBudget}`}
          icon={BarChart3}
          color="#10b981"
        />
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Activity</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {analytics.recentActivity.recentEvents.map(event => (
            <div key={event.id} style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <p style={{ fontWeight: '600' }}>{event.title}</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                {new Date(event.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: '-20px',
      right: '-20px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}20, transparent)`,
      opacity: 0.5
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          background: `${color}20`,
          border: `1px solid ${color}40`
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        <h4 style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' }}>{title}</h4>
      </div>
      <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{value}</p>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>{subtitle}</p>
    </div>
  </div>
);

// Messages View
const MessagesView = ({ user }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await api.messages.getAll();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Messages</h2>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '400px'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.4)' }}>
            <MessageCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <p>No messages yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                padding: '1rem',
                background: msg.senderId === user.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginLeft: msg.senderId === user.id ? 'auto' : '0',
                maxWidth: '70%'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.5rem' }}>
                  {msg.sender?.name || 'Unknown'}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>{msg.content}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '2rem'
  }} onClick={onClose}>
    <div
      style={{
        background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

// Event Form
const EventForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'single-day',
    budget: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.events.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create Event</h3>
      
      <input
        type="text"
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        style={inputStyle}
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows="4"
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      
      <input
        type="datetime-local"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
        style={inputStyle}
      />
      
      <input
        type="datetime-local"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        required
        style={inputStyle}
      />
      
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        style={inputStyle}
      >
        <option value="single-day">Single Day</option>
        <option value="multi-day">Multi Day</option>
      </select>
      
      <input
        type="number"
        placeholder="Budget"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
        style={inputStyle}
      />
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" style={primaryButtonStyle}>Create Event</button>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
      </div>
    </form>
  );
};

// Booking Form
const BookingForm = ({ resources, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.bookings.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Book Resource</h3>
      
      <select
        value={formData.resourceId}
        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
        required
        style={inputStyle}
      >
        <option value="">Select Resource</option>
        {resources.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      
      <input
        type="datetime-local"
        value={formData.startTime}
        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
        required
        style={inputStyle}
      />
      
      <input
        type="datetime-local"
        value={formData.endTime}
        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
        required
        style={inputStyle}
      />
      
      <textarea
        placeholder="Purpose"
        value={formData.purpose}
        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        rows="3"
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" style={primaryButtonStyle}>Book Resource</button>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
      </div>
    </form>
  );
};

// Resource Form
const ResourceForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'room',
    description: '',
    capacity: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.resources.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Add Resource</h3>
      
      <input
        type="text"
        placeholder="Resource Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        style={inputStyle}
      />
      
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        style={inputStyle}
      >
        <option value="room">Room</option>
        <option value="hall">Hall</option>
        <option value="lab">Lab</option>
        <option value="equipment">Equipment</option>
      </select>
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows="3"
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" style={primaryButtonStyle}>Add Resource</button>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
      </div>
    </form>
  );
};

// Club Form
const ClubForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.clubs.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating club:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create Club</h3>
      
      <input
        type="text"
        placeholder="Club Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        style={inputStyle}
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows="4"
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        style={inputStyle}
      >
        <option value="technical">Technical</option>
        <option value="cultural">Cultural</option>
        <option value="sports">Sports</option>
        <option value="social">Social</option>
      </select>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" style={primaryButtonStyle}>Create Club</button>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
      </div>
    </form>
  );
};

// Shared Styles
const inputStyle = {
  width: '100%',
  padding: '0.875rem',
  marginBottom: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.75rem',
  color: 'white',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: '"DM Sans", sans-serif'
};

const primaryButtonStyle = {
  flex: 1,
  padding: '0.875rem',
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  border: 'none',
  borderRadius: '0.75rem',
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: '"DM Sans", sans-serif'
};

const secondaryButtonStyle = {
  flex: 1,
  padding: '0.875rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.75rem',
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: '"DM Sans", sans-serif'
};

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <AuthScreen onLogin={setUser} />
  );
}
