import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiEye, HiEyeOff, HiKey } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');

    setSubmitting(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const PasswordField = ({ label, name, value, showKey }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          required
          className="input-field pr-10"
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-soft">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 border border-primary-200 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white">
            <HiKey className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-800">Security Tip</p>
            <p className="text-xs text-primary-700">Use a strong password with at least 6 characters.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField label="Current Password" name="currentPassword" value={form.currentPassword} showKey="current" />
          <PasswordField label="New Password" name="newPassword" value={form.newPassword} showKey="new" />
          <PasswordField label="Confirm New Password" name="confirmPassword" value={form.confirmPassword} showKey="confirm" />

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" loading={submitting}>
              Update Password
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;