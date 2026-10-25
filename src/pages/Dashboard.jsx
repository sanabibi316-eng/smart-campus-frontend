import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  HiUsers,
  HiAcademicCap,
  HiBookOpen,
  HiClipboardCheck,
  HiDocumentText,
  HiTrendingUp,
} from 'react-icons/hi';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-400 to-primary-600',
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    yellow: 'from-yellow-400 to-yellow-600',
  };

  return (
    <Card className="hover:shadow-card transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-glow`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint =
          user.role === 'admin'
            ? '/dashboard/admin'
            : user.role === 'teacher'
            ? '/dashboard/teacher'
            : '/dashboard/student';
        const { data } = await api.get(endpoint);
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white shadow-glow">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-primary-50 text-sm lg:text-base">
          Here's what's happening in your campus today.
        </p>
      </div>

      {user.role === 'admin' && <AdminDashboard stats={stats} />}
      {user.role === 'teacher' && <TeacherDashboard stats={stats} />}
      {user.role === 'student' && <StudentDashboard stats={stats} />}
    </div>
  );
};

const AdminDashboard = ({ stats }) => {
  const counts = stats?.stats || stats?.counts || {};
  const todayAtt = stats?.attendance?.today || stats?.todayAttendance || {};
  const attendanceData = [
    { name: 'Present', value: todayAtt.present || 0, color: '#10B981' },
    { name: 'Absent', value: todayAtt.absent || 0, color: '#EF4444' },
    { name: 'Late', value: todayAtt.late || 0, color: '#F59E0B' },
    { name: 'Excused', value: todayAtt.excused || 0, color: '#3B82F6' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiUsers} label="Total Students" value={counts.totalStudents ?? counts.students ?? 0} color="primary" />
        <StatCard icon={HiAcademicCap} label="Total Teachers" value={counts.totalTeachers ?? counts.teachers ?? 0} color="blue" />
        <StatCard icon={HiBookOpen} label="Classes" value={counts.totalClasses ?? counts.classes ?? 0} color="green" />
        <StatCard icon={HiDocumentText} label="Subjects" value={counts.totalSubjects ?? counts.subjects ?? 0} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attendanceData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Students</h3>
          <div className="space-y-3">
            {(stats?.recentStudents || []).slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-soft">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(s.user?.name || s.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.user?.name || s.name}</p>
                  <p className="text-xs text-gray-500">{s.class?.name || s.studentId}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentStudents || stats.recentStudents.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const TeacherDashboard = ({ stats }) => {
  const assigned = stats?.assignedClasses || stats?.classes || [];
  const todayAtt = stats?.todayAttendance || {};

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiBookOpen} label="My Classes" value={assigned.length} color="primary" />
        <StatCard icon={HiUsers} label="Total Students" value={stats?.totalStudents || 0} color="blue" />
        <StatCard icon={HiDocumentText} label="Assignments" value={(stats?.upcomingAssignments?.length || 0) + (stats?.recentAssignments?.length || 0)} color="green" />
        <StatCard icon={HiClipboardCheck} label="Today Marked" value={todayAtt.totalMarked || todayAtt.present || 0} color="yellow" />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Assigned Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assigned.map((c) => (
            <div key={c._id} className="p-4 rounded-xl border border-border hover:border-primary-400 transition-colors">
              <h4 className="font-semibold text-gray-800">{c.name}</h4>
              <p className="text-xs text-gray-500 mt-1">Code: {c.code || 'N/A'}</p>
              <p className="text-xs text-gray-500">Year: {c.academicYear || '-'}</p>
            </div>
          ))}
          {assigned.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full text-center py-4">No classes assigned</p>
          )}
        </div>
      </Card>
    </>
  );
};

const StudentDashboard = ({ stats }) => {
  const pct = stats?.attendance?.percentage ?? stats?.attendancePercentage ?? 0;
  const totalDays = stats?.attendance?.totalDays ?? stats?.totalClasses ?? 0;
  const data = [
    { name: 'Attended', value: pct, color: '#F97316' },
    { name: 'Missed', value: Math.max(0, 100 - pct), color: '#F3EEE6' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiTrendingUp} label="Attendance %" value={`${pct}%`} color="primary" />
        <StatCard icon={HiClipboardCheck} label="Total Days" value={totalDays} color="blue" />
        <StatCard icon={HiDocumentText} label="Assignments" value={(stats?.upcomingAssignments?.length || 0) + (stats?.overdueAssignments?.length || 0)} color="green" />
        <StatCard icon={HiAcademicCap} label="Class" value={stats?.profile?.classCode || stats?.profile?.className || '-'} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Details</h3>
          <div className="space-y-3">
            <div className="p-3 bg-soft rounded-xl">
              <p className="text-xs text-gray-500">Student ID</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">{stats?.profile?.studentId || '-'}</p>
            </div>
            <div className="p-3 bg-soft rounded-xl">
              <p className="text-xs text-gray-500">Enrolled Class</p>
              <p className="text-sm font-semibold text-gray-800">{stats?.profile?.className || '-'}</p>
            </div>
            <div className="p-3 bg-soft rounded-xl">
              <p className="text-xs text-gray-500">Academic Year</p>
              <p className="text-sm font-semibold text-gray-800">{stats?.profile?.academicYear || '-'}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
