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

const AssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    dueDate: '',
    totalMarks: '',
    status: 'draft',
  });

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data.data || []));
    if (isEdit) {
      api
        .get(`/assignments/${id}`)
        .then(({ data }) => {
          const a = data.data;
          setForm({
            title: a.title || '',
            description: a.description || '',
            class: a.class?._id || a.class || '',
            subject: a.subject?._id || a.subject || '',
            dueDate: a.dueDate ? a.dueDate.split('T')[0] : '',
            totalMarks: a.totalMarks || '',
            status: a.status || 'draft',
          });
        })
        .catch(() => toast.error('Failed to load'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!form.class) {
      setSubjects([]);
      return;
    }
    api
      .get('/subjects', { params: { class: form.class } })
      .then(({ data }) => setSubjects(data.data || []));
  }, [form.class]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.totalMarks) delete payload.totalMarks;
      if (isEdit) {
        await api.patch(`/assignments/${id}`, payload);
        toast.success('Assignment updated');
      } else {
        await api.post('/assignments', payload);
        toast.success('Assignment created');
      }
      navigate('/assignments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/assignments')} className="p-2 rounded-lg hover:bg-soft">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Assignment' : 'Create Assignment'}
          </h1>
          <p className="text-sm text-gray-500">Fill in the assignment details</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Class" name="class" value={form.class} onChange={handleChange} required>
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Select label="Subject" name="subject" value={form.subject} onChange={handleChange} required>
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
            <Input label="Due Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            <Input label="Total Marks" type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} />
            <Select label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/assignments')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentForm;