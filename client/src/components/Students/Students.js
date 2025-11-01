import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

function Students({ user }) {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [studentsRes, instructorsRes] = await Promise.all([
        usersAPI.getAll('student'),
        usersAPI.getAll('instructor')
      ]);
      setStudents(studentsRes.data.users);
      setInstructors(instructorsRes.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="container">
      <h1>User Management</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students ({students.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'instructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructors')}
        >
          Instructors ({instructors.length})
        </button>
      </div>

      <div className="card">
        {activeTab === 'students' && (
          <>
            <h2>Students</h2>
            {students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Enrolled Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td>
                        <span className={`badge badge-${student.isActive ? 'success' : 'danger'}`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{student.enrolledCourses?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'instructors' && (
          <>
            <h2>Instructors</h2>
            {instructors.length === 0 ? (
              <p>No instructors found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map(instructor => (
                    <tr key={instructor.id}>
                      <td>{instructor.firstName} {instructor.lastName}</td>
                      <td>{instructor.email}</td>
                      <td>
                        <span className={`badge badge-${instructor.isActive ? 'success' : 'danger'}`}>
                          {instructor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Students;
