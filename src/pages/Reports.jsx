import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    class: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data.data || []));
  }, []);

  const generateReport = async () => {
    if (!filters.class) return toast.error('Select a class');
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/reports', { params: filters });
      setReport(data.data);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Backend returns: data: { summary: [ { student, totalDays, presentDays, absentDays, lateDays, excusedDays, percentage } ], overallPercentage, totalRecords }
  // Aggregate total counts across all student items for the overview chart
  const aggregates = report?.summary?.reduce(
    (acc, curr) => {
      acc.present += (curr.presentDays - curr.lateDays);
      acc.late += curr.lateDays;
      acc.absent += curr.absentDays;
      acc.excused += curr.excusedDays;
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0 }
  ) || { present: 0, late: 0, absent: 0, excused: 0 };

  const chartData = [
    { name: 'Present', value: aggregates.present, color: '#10B981' },
    { name: 'Late', value: aggregates.late, color: '#F59E0B' },
    { name: 'Absent', value: aggregates.absent, color: '#EF4444' },
    { name: 'Excused', value: aggregates.excused, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
        <p className="text-sm text-gray-500">Generate detailed attendance reports</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Class" value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
            ))}
          </Select>
          <Input label="From" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <Input label="To" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <div className="flex items-end">
            <Button onClick={generateReport} loading={loading} className="w-full">
              Generate
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : report ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-soft">
                  <span className="text-sm text-gray-600">Total Records</span>
                  <span className="font-bold text-gray-800">{report.totalRecords || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-green-50">
                  <span className="text-sm text-green-700">Present (inc. Late)</span>
                  <span className="font-bold text-green-700">{aggregates.present + aggregates.late}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-red-50">
                  <span className="text-sm text-red-700">Absent</span>
                  <span className="font-bold text-red-700">{aggregates.absent}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-primary-50">
                  <span className="text-sm text-primary-700">Overall Attendance</span>
                  <span className="font-bold text-primary-700">{report.overallPercentage || 0}%</span>
                </div>
              </div>
            </Card>
          </div>

          {report.summary?.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Student-wise Attendance Report</h3>
              <div className="table-wrap">
                <table className="w-full">
                  <thead className="bg-soft border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Days</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Present</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Absent</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Late</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.summary.map((r) => (
                      <tr key={r._id} className="hover:bg-soft">
                        <td className="px-4 py-3 text-sm">
                          <p className="font-medium text-gray-800">{r.student?.user?.name || r.student?.name || 'Student'}</p>
                          <p className="text-xs text-gray-500 font-mono">{r.student?.studentId}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{r.totalDays}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{r.presentDays}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{r.absentDays}</td>
                        <td className="px-4 py-3 text-sm text-yellow-600 font-medium">{r.lateDays}</td>
                        <td className="px-4 py-3">
                          <Badge variant={r.percentage >= 75 ? 'green' : r.percentage >= 50 ? 'yellow' : 'red'}>
                            {r.percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <EmptyState message="Select filters and generate a report" />
      )}
    </div>
  );
};

export default Reports;
