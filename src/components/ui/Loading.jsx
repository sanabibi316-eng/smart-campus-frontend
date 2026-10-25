const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
  const container = fullScreen
    ? 'fixed inset-0 bg-soft-bg z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={container}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default Loading;