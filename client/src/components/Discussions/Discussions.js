import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discussionsAPI, coursesAPI } from '../../services/api';
import './Discussions.css';

function Discussions({ user }) {
  const { courseId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDiscussions();
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getById(courseId);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await discussionsAPI.getByCourse(courseId);
      setDiscussions(response.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await discussionsAPI.create({ ...formData, courseId });
      setShowCreateForm(false);
      setFormData({ title: '', content: '' });
      fetchDiscussions();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create discussion');
    }
  };

  if (loading) {
    return <div className="loading">Loading discussions...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Course Discussions</h1>
          {course && <p className="course-title">{course.code} - {course.title}</p>}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'New Discussion'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h2>Create New Discussion</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-success">
              Create Discussion
            </button>
          </form>
        </div>
      )}

      <div className="discussions-list">
        {discussions.length === 0 ? (
          <div className="card">
            <p>No discussions yet. Start one!</p>
          </div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion.id} className="discussion-item card">
              <div className="discussion-header">
                <div>
                  {discussion.isPinned && <span className="badge badge-warning">Pinned</span>}
                  {discussion.isLocked && <span className="badge badge-danger">Locked</span>}
                </div>
              </div>
              <h3>
                <Link to={`/discussion/${discussion.id}`}>{discussion.title}</Link>
              </h3>
              <p className="discussion-preview">{discussion.content.substring(0, 200)}...</p>
              <div className="discussion-meta">
                <span>
                  By {discussion.author.firstName} {discussion.author.lastName}
                </span>
                <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                <span>{discussion.replies?.length || 0} replies</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Discussions;
