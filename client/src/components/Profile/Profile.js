import React, { useState } from 'react';
import { usersAPI } from '../../services/api';

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar || ''
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await usersAPI.update(user.id, formData);
      const updatedUser = response.data.user;

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div className="container">
      <h1>My Profile</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Profile Information</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
              />
            </div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <div>
              <button type="submit" className="btn btn-success">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar || ''
                  });
                }}
                className="btn btn-secondary"
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Role:</strong> <span className="badge badge-info">{user.role}</span>
            </div>
            {user.avatar && (
              <div>
                <strong>Avatar:</strong>
                <img src={user.avatar} alt="Avatar" style={{ maxWidth: '100px', marginLeft: '10px' }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Account Statistics</h2>
        <div className="stats-grid">
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Account Created</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Account Status</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              <span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
