import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiBookOpen, HiSearch } from 'react-icons/hi';
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

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', class: '', teacher: '', description: '' });

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (classFilter) params.class = classFilter;
      const { data } = await api.get('/subjects', { params });
      setSubjects(data.data || []);

      if (isAdmin && classes.length === 0) {
        const [cls, tch] = await Promise.all([
          api.get('/classes'),
          api.get('/teachers', { params: { limit: 1000 } }),
        ]);
        setClasses(cls.data.data || []);
        setTeachers(tch.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', class: '', teacher: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      code: s.code || '',
      class: s.class?._id || s.class || '',
      teacher: s.teacher?._id || s.teacher || '',
      description: s.description || '',
    });
    setModalOpen(true);
  };

  const toggleStatus = async (s) => {
    try {
      const newStatus = s.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/subjects/${s._id}/status`, { status: newStatus });
      toast.success(`Subject ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update subject status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.teacher) delete payload.teacher;
      if (editing) {
        await api.patch(`/subjects/${editing._id}`, payload);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', payload);
        toast.success('Subject created');
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
          <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Manage all subjects' : 'View subjects'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} icon={HiPlus}>
            Add Subject
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by subject name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
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
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : subjects.length === 0 ? (
        <EmptyState message="No subjects found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Card key={s._id} className="hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-glow">
                  <HiBookOpen className="w-6 h-6" />
                </div>
                <Badge variant={s.status === 'active' ? 'green' : 'red'}>{s.status}</Badge>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{s.name}</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">Code: {s.code}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <p>Class: <span className="font-medium">{s.class?.name || '-'}</span></p>
                <p>Teacher: <span className="font-medium">{s.teacher?.user?.name || s.teacher?.name || '-'}</span></p>
                {s.description && <p className="text-gray-500">{s.description}</p>}
              </div>
              {isAdmin && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleStatus(s)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                      s.status === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {s.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-soft text-gray-600 hover:text-primary-600"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subject' : 'Add Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Subject Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Subject Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Select label="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Teacher" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.user?.name || t.name} ({t.teacherId})</option>
            ))}
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default Subjects;
