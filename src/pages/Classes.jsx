import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiUsers, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', academicYear: '', classTeacher: '', description: '' });

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/classes', { params });
      setClasses(data.data || []);
      if (isAdmin && teachers.length === 0) {
        const { data: t } = await api.get('/teachers', { params: { limit: 1000 } });
        setTeachers(t.data || []);
      }
    } catch (err) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', academicYear: '', classTeacher: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      code: c.code || '',
      academicYear: c.academicYear || '',
      classTeacher: c.classTeacher?._id || c.classTeacher || '',
      description: c.description || '',
    });
    setModalOpen(true);
  };

  const toggleStatus = async (c) => {
    try {
      const newStatus = c.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/classes/${c._id}/status`, { status: newStatus });
      toast.success(`Class ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update class status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.classTeacher) delete payload.classTeacher;
      if (editing) {
        await api.patch(`/classes/${editing._id}`, payload);
        toast.success('Class updated');
      } else {
        await api.post('/classes', payload);
        toast.success('Class created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Manage all classes' : 'View your classes'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} icon={HiPlus}>
            Add Class
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by class name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : classes.length === 0 ? (
        <EmptyState message="No classes found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Card key={c._id} className="hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-glow">
                  {c.name?.charAt(0)}
                </div>
                <Badge variant={c.status === 'active' ? 'green' : 'red'}>{c.status}</Badge>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
              <p className="text-sm text-gray-500 font-mono">Code: {c.code || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Year: {c.academicYear || '-'}</p>
              {c.description && <p className="text-xs text-gray-600 mt-1">{c.description}</p>}
              {c.classTeacher && (
                <p className="text-xs text-gray-600 mt-2">
                  Teacher: <span className="font-medium">{c.classTeacher?.user?.name || c.classTeacher?.name || 'Assigned'}</span>
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <HiUsers className="w-4 h-4" /> {c.studentCount || 0} students
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(c)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                        c.status === 'active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {c.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-soft text-gray-600 hover:text-primary-600"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Class' : 'Add Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Class Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Class 9-A" required />
          <Input label="Class Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CLS-9A" required />
          <Input label="Academic Year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="e.g. 2026-2027" required />
          <Select label="Class Teacher" value={form.classTeacher} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })}>
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.user?.name || t.name} ({t.teacherId})</option>
            ))}
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Grade 9 Section A" />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting}>
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
