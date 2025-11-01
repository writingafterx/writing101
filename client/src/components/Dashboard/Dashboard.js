import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, assignmentsAPI } from '../../services/api';
import './Dashboard.css';

function Dashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const coursesResponse = await coursesAPI.getAll();
      setCourses(coursesResponse.data.courses);

      if (user.role === 'student' && coursesResponse.data.courses.length > 0) {
        const assignmentsPromises = coursesResponse.data.courses.map(course =>
          assignmentsAPI.getByCourse(course.id)
        );
        const assignmentsResponses = await Promise.all(assignmentsPromises);
        const allAssignments = assignmentsResponses.flatMap(res => res.data.assignments);
        const upcoming = allAssignments
          .filter(a => new Date(a.dueDate) > new Date())
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);
        setRecentAssignments(upcoming);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container dashboard">
      <h1>Welcome back, {user.firstName}!</h1>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <Link to="/courses" className="btn btn-primary btn-sm">View All</Link>
          </div>
          <div className="courses-grid">
            {courses.length === 0 ? (
              <p>No courses available. {user.role === 'student' ? 'Enroll in a course to get started!' : 'Create a course to get started!'}</p>
            ) : (
              courses.slice(0, 4).map(course => (
                <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                  <h3>{course.code}</h3>
                  <p>{course.title}</p>
                  <div className="course-meta">
                    <span>{course.semester} {course.year}</span>
                    <span className="instructor">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {user.role === 'student' && (
          <div className="dashboard-section">
            <h2>Upcoming Assignments</h2>
            {recentAssignments.length === 0 ? (
              <p>No upcoming assignments.</p>
            ) : (
              <ul className="assignments-list">
                {recentAssignments.map(assignment => (
                  <li key={assignment.id} className="assignment-item">
                    <Link to={`/assignments/${assignment.id}`}>
                      <h4>{assignment.title}</h4>
                      <p className="due-date">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="dashboard-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">
                {user.role === 'instructor' ? 'Teaching' : 'Enrolled'} Courses
              </div>
            </div>
            {user.role === 'student' && (
              <div className="stat-card">
                <div className="stat-value">{recentAssignments.length}</div>
                <div className="stat-label">Pending Assignments</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
