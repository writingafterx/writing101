import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, assignmentsAPI } from '../../services/api';

function Assignments({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const coursesRes = await coursesAPI.getAll();
      const assignmentsPromises = coursesRes.data.courses.map(course =>
        assignmentsAPI.getByCourse(course.id)
      );
      const assignmentsResponses = await Promise.all(assignmentsPromises);
      const allAssignments = assignmentsResponses.flatMap((res, index) =>
        res.data.assignments.map(a => ({
          ...a,
          courseName: coursesRes.data.courses[index].code
        }))
      );
      setAssignments(allAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  const now = new Date();
  const upcomingAssignments = assignments.filter(a => new Date(a.dueDate) > now);
  const pastAssignments = assignments.filter(a => new Date(a.dueDate) <= now);

  return (
    <div className="container">
      <h1>My Assignments</h1>

      <div className="card">
        <h2>Upcoming Assignments</h2>
        {upcomingAssignments.length === 0 ? (
          <p>No upcoming assignments.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Due Date</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td><span className="badge badge-info">{assignment.courseName}</span></td>
                  <td>{assignment.title}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{assignment.maxPoints}</td>
                  <td>
                    <Link to={`/assignments/${assignment.id}`} className="btn btn-primary btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Past Assignments</h2>
        {pastAssignments.length === 0 ? (
          <p>No past assignments.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Due Date</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pastAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td><span className="badge badge-info">{assignment.courseName}</span></td>
                  <td>{assignment.title}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{assignment.maxPoints}</td>
                  <td>
                    <Link to={`/assignments/${assignment.id}`} className="btn btn-primary btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Assignments;
