import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import './Courses.css';

function Courses({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    syllabus: '',
    semester: '',
    year: new Date().getFullYear(),
    credits: 3,
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      await coursesAPI.create(formData);
      setShowCreateForm(false);
      setFormData({
        code: '',
        title: '',
        description: '',
        syllabus: '',
        semester: '',
        year: new Date().getFullYear(),
        credits: 3,
        startDate: '',
        endDate: ''
      });
      fetchCourses();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create course');
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Courses</h1>
        {(user.role === 'admin' || user.role === 'instructor') && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Course'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="card">
          <h2>Create New Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Course Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  min="1"
                  max="6"
                />
              </div>
            </div>
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
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Syllabus</label>
              <textarea
                name="syllabus"
                value={formData.syllabus}
                onChange={handleChange}
                rows="6"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-success">
              Create Course
            </button>
          </form>
        </div>
      )}

      <div className="courses-list">
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-item card">
              <div className="course-header">
                <div>
                  <h3>
                    <Link to={`/courses/${course.id}`}>
                      {course.code} - {course.title}
                    </Link>
                  </h3>
                  <p className="course-instructor">
                    Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
                <div className="course-badges">
                  <span className="badge badge-info">
                    {course.semester} {course.year}
                  </span>
                  <span className="badge badge-success">
                    {course.credits} Credits
                  </span>
                </div>
              </div>
              {course.description && (
                <p className="course-description">{course.description}</p>
              )}
              <div className="course-actions">
                <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
                  View Details
                </Link>
                <Link to={`/discussions/${course.id}`} className="btn btn-secondary btn-sm">
                  Discussions
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;
