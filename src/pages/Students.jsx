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

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, student: null });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data.data || [])).catch(() => {});
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 10 };
      if (classFilter) params.class = classFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/students', { params });
      setStudents(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [search, classFilter, statusFilter, page]);

  const toggleStatus = async () => {
    try {
      const s = confirm.student;
      const newStatus = s.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/students/${s._id}/status`, { status: newStatus });
      toast.success(`Student ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchStudents();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setConfirm({ open: false, student: null });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {(s.user?.name || s.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{s.user?.name || s.name}</p>
            <p className="text-xs text-gray-500">{s.user?.email || s.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'studentId', label: 'Student ID', render: (s) => <span className="font-mono text-xs">{s.studentId || '-'}</span> },
    { key: 'class', label: 'Class', render: (s) => s.class?.name || '-' },
    { key: 'phone', label: 'Phone', render: (s) => s.phone || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (s) => (
        <Badge variant={s.status === 'active' ? 'green' : 'red'}>{s.status}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/students/edit/${s._id}`)}
            className="p-2 rounded-lg hover:bg-soft text-gray-600 hover:text-primary-600"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirm({ open: true, student: s })}
            className={`px-3 py-1 text-xs rounded-lg font-medium ${
              s.status === 'active'
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {s.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-sm text-gray-500">Manage all enrolled students</p>
        </div>
        <Button onClick={() => navigate('/students/new')} icon={HiPlus}>
          Add Student
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
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

        <Table columns={columns} data={students} loading={loading} emptyMessage="No students found" />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, student: null })}
        onConfirm={toggleStatus}
        title="Change Status"
        message={`Are you sure you want to ${
          confirm.student?.status === 'active' ? 'deactivate' : 'activate'
        } ${confirm.student?.user?.name || confirm.student?.name}?`}
      />
    </div>
  );
};

export default Students;
