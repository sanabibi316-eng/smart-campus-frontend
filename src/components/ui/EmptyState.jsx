import { HiOutlineInbox } from 'react-icons/hi';

const EmptyState = ({ title = 'No data found', description = 'There is nothing to show here yet.', icon }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-400 text-3xl">
      {icon || <HiOutlineInbox />}
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{description}</p>
  </div>
);

export default EmptyState;