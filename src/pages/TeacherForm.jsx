import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    teacherId: '',
    phone: '',
    specialization: '',
    joiningDate: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        const { data } = await api.get(`/teachers/${id}`);
        const t = data.data;
        setForm({
          name: t.user?.name || t.name || '',
          email: t.user?.email || t.email || '',
          password: '',
          teacherId: t.teacherId || '',
          phone: t.phone || '',
          specialization: t.specialization || '',
          joiningDate: t.joiningDate ? t.joiningDate.split('T')[0] : '',
        });
      } catch (err) {
        toast.error('Failed to load teacher');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (!payload.joiningDate) delete payload.joiningDate;

      if (isEdit) {
        await api.patch(`/teachers/${id}`, payload);
        toast.success('Teacher updated');
      } else {
        await api.post('/teachers', payload);
        toast.success('Teacher created');
      }
      navigate('/teachers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/teachers')} className="p-2 rounded-lg hover:bg-soft">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
          </h1>
          <p className="text-sm text-gray-500">Fill in the teacher details below</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required disabled={isEdit} />
            {!isEdit && (
              <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
            )}
            <Input label="Teacher ID" name="teacherId" value={form.teacherId} onChange={handleChange} required disabled={isEdit} placeholder="e.g. TCH-001" />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 03001234567" />
            <Input label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Mathematics" />
            <Input label="Joining Date" type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Update Teacher' : 'Create Teacher'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/teachers')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TeacherForm;
