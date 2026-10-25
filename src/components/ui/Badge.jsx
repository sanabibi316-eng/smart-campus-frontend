import { STATUS_COLORS } from '../../utils/constants';
import { capitalize } from '../../utils/helpers';

const Badge = ({ status, children, className = '' }) => {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color} ${className}`}
    >
      {children || capitalize(status)}
    </span>
  );
};

export default Badge;