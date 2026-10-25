import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    class: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    admissionDate: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: cls } = await api.get('/classes');
        setClasses(cls.data || []);
        if (isEdit) {
          const { data } = await api.get(`/students/${id}`);
          const s = data.data;
          setForm({
            name: s.user?.name || s.name || '',
            email: s.user?.email || s.email || '',
            password: '',
            studentId: s.studentId || '',
            class: s.class?._id || s.class || '',
            phone: s.phone || '',
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
            address: s.address || '',
            admissionDate: s.admissionDate ? s.admissionDate.split('T')[0] : '',
          });
        }
      } catch (err) {
        toast.error('Failed to load data');
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
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.admissionDate) delete payload.admissionDate;

      if (isEdit) {
        await api.patch(`/students/${id}`, payload);
        toast.success('Student updated');
      } else {
        await api.post('/students', payload);
        toast.success('Student created');
      }
      navigate('/students');
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
        <button
          onClick={() => navigate('/students')}
          className="p-2 rounded-lg hover:bg-soft"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h1>
          <p className="text-sm text-gray-500">Fill in the student details below</p>
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
            <Input label="Student ID" name="studentId" value={form.studentId} onChange={handleChange} required disabled={isEdit} placeholder="e.g. STU-001" />
            <Select label="Class" name="class" value={form.class} onChange={handleChange} required>
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
              ))}
            </Select>
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 03001234567" />
            <Input label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            <Input label="Admission Date" type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} />
          </div>
          <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" />

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Update Student' : 'Create Student'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/students')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
