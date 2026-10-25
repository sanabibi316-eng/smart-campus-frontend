import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiSearch, HiPencil } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, teacher: null });
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/teachers', { params });
      setTeachers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchTeachers, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const toggleStatus = async () => {
    try {
      const t = confirm.teacher;
      const newStatus = t.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/teachers/${t._id}/status`, { status: newStatus });
      toast.success(`Teacher ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchTeachers();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setConfirm({ open: false, teacher: null });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Teacher',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {(t.user?.name || t.name || 'T').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{t.user?.name || t.name}</p>
            <p className="text-xs text-gray-500">{t.user?.email || t.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'teacherId', label: 'Teacher ID', render: (t) => <span className="font-mono text-xs">{t.teacherId || '-'}</span> },
    { key: 'specialization', label: 'Specialization', render: (t) => t.specialization || '-' },
    { key: 'phone', label: 'Phone', render: (t) => t.phone || '-' },
    { key: 'classes', label: 'Classes', render: (t) => t.assignedClasses?.length || 0 },
    {
      key: 'status',
      label: 'Status',
      render: (t) => <Badge variant={t.status === 'active' ? 'green' : 'red'}>{t.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (t) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/teachers/edit/${t._id}`)}
            className="p-2 rounded-lg hover:bg-soft text-gray-600 hover:text-primary-600"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirm({ open: true, teacher: t })}
            className={`px-3 py-1 text-xs rounded-lg font-medium ${
              t.status === 'active'
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {t.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <p className="text-sm text-gray-500">Manage all teaching staff</p>
        </div>
        <Button onClick={() => navigate('/teachers/new')} icon={HiPlus}>
          Add Teacher
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative md:col-span-2">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or teacher ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <Table columns={columns} data={teachers} loading={loading} emptyMessage="No teachers found" />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, teacher: null })}
        onConfirm={toggleStatus}
        title="Change Status"
        message={`Are you sure you want to ${
          confirm.teacher?.status === 'active' ? 'deactivate' : 'activate'
        } ${confirm.teacher?.user?.name || confirm.teacher?.name}?`}
      />
    </div>
  );
};

export default Teachers;
