import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="min-h-screen bg-soft-bg flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-9xl font-bold text-primary-500">404</h1>
      <p className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</p>
      <p className="text-gray-500 mt-2 mb-8">The page you are looking for doesn't exist.</p>
      <Link to="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;