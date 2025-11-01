import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI, assignmentsAPI } from '../../services/api';

function CourseDetail({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, assignmentsRes] = await Promise.all([
        coursesAPI.getById(id),
        assignmentsAPI.getByCourse(id)
      ]);
      setCourse(courseRes.data.course);
      setAssignments(assignmentsRes.data.assignments);
    } catch (error) {
      setError('Failed to load course details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await coursesAPI.enroll(id);
      alert('Successfully enrolled in course!');
      fetchCourseDetails();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll');
    }
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (error || !course) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  const isEnrolled = course.students?.some(s => s.id === user.id);
  const isInstructor = course.instructorId === user.id;

  return (
    <div className="container">
      <div className="card">
        <div className="course-header">
          <div>
            <h1>{course.code} - {course.title}</h1>
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
          <div>
            <h3>Description</h3>
            <p>{course.description}</p>
          </div>
        )}

        {course.syllabus && (
          <div>
            <h3>Syllabus</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{course.syllabus}</pre>
          </div>
        )}

        {user.role === 'student' && !isEnrolled && (
          <button onClick={handleEnroll} className="btn btn-primary">
            Enroll in Course
          </button>
        )}
      </div>

      <div className="card">
        <div className="section-header">
          <h2>Assignments</h2>
          {isInstructor && (
            <Link to={`/assignments/create?courseId=${id}`} className="btn btn-primary btn-sm">
              Create Assignment
            </Link>
          )}
        </div>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Due Date</th>
                <th>Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.title}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{assignment.maxPoints}</td>
                  <td>
                    {assignment.isPublished ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-warning">Draft</span>
                    )}
                  </td>
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

      {(isInstructor || user.role === 'admin') && (
        <div className="card">
          <h2>Enrolled Students ({course.students?.length || 0})</h2>
          {course.students && course.students.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {course.students.map(student => (
                  <tr key={student.id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="badge badge-success">
                        {student.Enrollment?.status || 'active'}
                      </span>
                    </td>
                    <td>
                      {student.Enrollment?.letterGrade || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students enrolled yet.</p>
          )}
        </div>
      )}

      <div className="card">
        <Link to={`/discussions/${course.id}`} className="btn btn-secondary">
          View Course Discussions
        </Link>
      </div>
    </div>
  );
}

export default CourseDetail;
