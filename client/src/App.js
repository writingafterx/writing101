import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Navigation from './components/Navigation/Navigation';
import Courses from './components/Courses/Courses';
import CourseDetail from './components/Courses/CourseDetail';
import Assignments from './components/Assignments/Assignments';
import AssignmentDetail from './components/Assignments/AssignmentDetail';
import Discussions from './components/Discussions/Discussions';
import DiscussionDetail from './components/Discussions/DiscussionDetail';
import Students from './components/Students/Students';
import Profile from './components/Profile/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navigation user={user} onLogout={handleLogout} />}

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses"
            element={user ? <Courses user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses/:id"
            element={user ? <CourseDetail user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/assignments"
            element={user ? <Assignments user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/assignments/:id"
            element={user ? <AssignmentDetail user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/discussions/:courseId"
            element={user ? <Discussions user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/discussion/:id"
            element={user ? <DiscussionDetail user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/students"
            element={user ? <Students user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
