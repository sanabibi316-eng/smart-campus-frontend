import { useEffect, useState } from 'react';
import { HiCheck, HiX, HiClock, HiExclamation, HiSave, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const Attendance = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentAttendance />;
  return <MarkAttendance />;
};

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setIsAlreadyMarked(false);
      return;
    }
    loadClassAttendance();
  }, [selectedClass, date]);

  const loadClassAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/class-date', {
        params: { classId: selectedClass, date },
      });
      const records = data.data?.records || [];
      const markedCount = data.data?.markedCount || 0;

      // True if attendance has already been saved for this date
      setIsAlreadyMarked(markedCount > 0);

      setStudents(records.map((r) => r.student));
      const statusMap = {};
      records.forEach((r) => {
        statusMap[r.student._id] = r.status === 'unmarked' ? 'present' : r.status;
      });
      setAttendance(statusMap);
    } catch (err) {
      try {
        const { data } = await api.get('/students', {
          params: { class: selectedClass, limit: 1000, status: 'active' },
        });
        const stus = data.data || [];
        setStudents(stus.map((s) => ({
          _id: s._id,
          studentId: s.studentId,
          name: s.user?.name || s.name,
          email: s.user?.email || s.email,
        })));
        const statusMap = {};
        stus.forEach((s) => (statusMap[s._id] = 'present'));
        setAttendance(statusMap);
        setIsAlreadyMarked(false);
      } catch (e) {
        toast.error('Failed to load students');
      }
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const map = {};
    students.forEach((s) => (map[s._id] = status));
    setAttendance(map);
  };

  const handleSubmit = async () => {
    if (!selectedClass) return toast.error('Please select a class');
    setSubmitting(true);
    try {
      const records = students.map((s) => ({
        student: s._id,
        status: attendance[s._id] || 'present',
      }));
      await api.post('/attendance', {
        classId: selectedClass,
        date,
        records,
      });
      toast.success(
        isAlreadyMarked
          ? 'Attendance updated successfully for today'
          : 'Attendance marked and saved successfully'
      );
      await loadClassAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBtn = (studentId, status, icon, color) => {
    const active = attendance[studentId] === status;
    return (
      <button
        type="button"
        onClick={() => setStatus(studentId, status)}
        className={`p-2 rounded-lg transition-all ${
          active ? color : 'bg-soft text-gray-400 hover:bg-gray-100'
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
        <p className="text-sm text-gray-500">Record daily student attendance</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
            ))}
          </Select>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </Card>

      {selectedClass && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${
            isAlreadyMarked
              ? 'bg-amber-50/70 border-amber-200 text-amber-800'
              : 'bg-blue-50/70 border-blue-200 text-blue-800'
          }`}
        >
          {isAlreadyMarked ? (
            <HiExclamationCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          ) : (
            <HiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}
          <div className="text-sm">
            <span className="font-semibold">
              {isAlreadyMarked
                ? `Attendance already marked for this date (${date}).`
                : `No attendance saved yet for this date (${date}).`}
            </span>
            <span className="ml-1 opacity-90">
              {isAlreadyMarked
                ? 'Submitting will safely update existing records without creating duplicates.'
                : 'Mark each student and save.'}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : students.length === 0 ? (
        <EmptyState message={selectedClass ? 'No students enrolled in this class' : 'Please select a class to mark attendance'} />
      ) : (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-border">
            <p className="text-sm font-medium text-gray-700">
              {students.length} students
            </p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => markAll('present')} className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium">
                All Present
              </button>
              <button type="button" onClick={() => markAll('absent')} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">
                All Absent
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {students.map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-soft">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {(s.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{s.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {statusBtn(s._id, 'present', <HiCheck className="w-4 h-4" />, 'bg-green-500 text-white')}
                  {statusBtn(s._id, 'absent', <HiX className="w-4 h-4" />, 'bg-red-500 text-white')}
                  {statusBtn(s._id, 'late', <HiClock className="w-4 h-4" />, 'bg-yellow-500 text-white')}
                  {statusBtn(s._id, 'excused', <HiExclamation className="w-4 h-4" />, 'bg-blue-500 text-white')}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-border">
            <Button onClick={handleSubmit} loading={submitting} icon={HiSave}>
              {isAlreadyMarked ? 'Update Attendance' : 'Save Attendance'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/attendance');
        const recs = data.data || [];
        setRecords(recs);
        const counts = { present: 0, absent: 0, late: 0, excused: 0 };
        recs.forEach((r) => {
          if (counts[r.status] !== undefined) counts[r.status]++;
        });
        const attended = counts.present + counts.late;
        const denom = recs.length - counts.excused;
        const pct = denom > 0 ? Math.round((attended / denom) * 100) : 0;
        setStats({ ...counts, percentage: pct });
      } catch (err) {
        toast.error('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loading />;

  const statusColor = {
    present: 'green',
    absent: 'red',
    late: 'yellow',
    excused: 'blue',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-sm text-gray-500">Your attendance history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.percentage}%</p>
          <p className="text-xs text-gray-500 mt-1">Overall</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-gray-500 mt-1">Late</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.excused}</p>
          <p className="text-xs text-gray-500 mt-1">Excused</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Records</h3>
        {records.length === 0 ? (
          <EmptyState message="No attendance records yet" />
        ) : (
          <div className="space-y-2">
            {records.slice(0, 50).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-soft">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(r.date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Class: {r.class?.name || '-'}
                  </p>
                </div>
                <Badge variant={statusColor[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Attendance;
