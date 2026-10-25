import Loading from './Loading';
import EmptyState from './EmptyState';

const Table = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  if (loading) return <Loading />;
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="table-wrap">
      <table className="w-full">
        <thead className="bg-soft border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-soft transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;