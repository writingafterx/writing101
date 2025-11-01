import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          LMS
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          {user.role === 'student' && (
            <li><Link to="/assignments">Assignments</Link></li>
          )}
          {(user.role === 'admin' || user.role === 'instructor') && (
            <li><Link to="/students">Students</Link></li>
          )}
          <li className="navbar-user">
            <span>{user.firstName} {user.lastName}</span>
            <span className="role-badge">{user.role}</span>
          </li>
          <li><Link to="/profile">Profile</Link></li>
          <li>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
