import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiDocumentText, HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data.data || [])).catch(() => {});
  }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classFilter) params.class = classFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/assignments', { params });
      setAssignments(data.data || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [classFilter, statusFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/assignments/${confirm.id}`);
      toast.success('Assignment deleted');
      fetch();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-sm text-gray-500">
            {canManage ? 'Manage class assignments' : 'View your assignments'}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('/assignments/new')} icon={HiPlus}>
            Create Assignment
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : assignments.length === 0 ? (
        <EmptyState message="No assignments found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <Card key={a._id} className="hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-glow">
                  <HiDocumentText className="w-6 h-6" />
                </div>
                <Badge variant={a.status === 'published' ? 'green' : 'gray'}>{a.status}</Badge>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{a.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{a.description}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <p>Subject: <span className="font-medium">{a.subject?.name || '-'}</span></p>
                <p>Class: <span className="font-medium">{a.class?.name || '-'}</span></p>
                <p className="flex items-center gap-1">
                  <HiCalendar className="w-4 h-4" /> Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}
                </p>
                {a.totalMarks && <p>Marks: <span className="font-medium">{a.totalMarks}</span></p>}
              </div>
              {canManage && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => navigate(`/assignments/edit/${a._id}`)}
                    className="p-2 rounded-lg hover:bg-soft text-gray-600 hover:text-primary-600"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, id: a._id })}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure? This cannot be undone."
      />
    </div>
  );
};

export default Assignments;
