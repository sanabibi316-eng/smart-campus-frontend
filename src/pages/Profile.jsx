import { useEffect, useState } from 'react';
import { HiMail, HiPhone, HiAcademicCap, HiKey, HiUser, HiCalendar, HiLocationMarker } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.role === 'student') {
          const { data } = await api.get('/students/me');
          setProfileData(data.data);
        } else if (user?.role === 'teacher') {
          const { data } = await api.get('/teachers/me');
          setProfileData(data.data);
        } else {
          const { data } = await api.get('/auth/me');
          setProfileData(data.data?.user || user);
        }
      } catch (err) {
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) return <Loading />;

  // User entity can be inside profileData.user (for teacher/student) or profileData itself (for admin)
  const userData = profileData?.user || profileData || user;
  const name = userData?.name || user?.name || '';
  const email = userData?.email || user?.email || '';
  const status = profileData?.status || userData?.status || 'active';

  const Field = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-soft">
      <Icon className="w-5 h-5 text-primary-600 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500">View your personal information</p>
        </div>
        <Button onClick={() => navigate('/change-password')} variant="secondary" icon={HiKey}>
          Change Password
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{name}</h2>
            <p className="text-sm text-gray-500">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary" className="capitalize">{user?.role}</Badge>
              <Badge variant={status === 'active' ? 'green' : 'red'}>{status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <Field icon={HiUser} label="Full Name" value={name} />
          <Field icon={HiMail} label="Email" value={email} />
          <Field icon={HiPhone} label="Phone" value={profileData?.phone} />

          {user?.role === 'student' && (
            <>
              <Field icon={HiAcademicCap} label="Student ID" value={profileData?.studentId} />
              <Field icon={HiAcademicCap} label="Class" value={profileData?.class?.name ? `${profileData?.class?.name} (${profileData?.class?.code})` : '-'} />
              <Field icon={HiCalendar} label="Date of Birth" value={profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : '-'} />
              <Field icon={HiCalendar} label="Admission Date" value={profileData?.admissionDate ? new Date(profileData.admissionDate).toLocaleDateString() : '-'} />
              <Field icon={HiLocationMarker} label="Address" value={profileData?.address} />
            </>
          )}

          {user?.role === 'teacher' && (
            <>
              <Field icon={HiAcademicCap} label="Teacher ID" value={profileData?.teacherId} />
              <Field icon={HiAcademicCap} label="Specialization" value={profileData?.specialization} />
              <Field icon={HiCalendar} label="Joining Date" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : '-'} />
              <Field icon={HiAcademicCap} label="Assigned Classes" value={profileData?.assignedClasses?.map(c => c.name).join(', ') || 'None'} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
