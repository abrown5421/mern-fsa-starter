import React, { useState, useMemo } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../searchBar/SearchBar';
import Pagination from '../pagination/Pagination';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  hideOnSmall?: boolean;
}

interface CollectionViewerProps<T> {
  featureName: string;
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

function CollectionViewer<T extends { _id: string }>({
  featureName,
  data,
  columns,
  searchKeys,
  itemsPerPage = 10,
  onEdit,
  onDelete,
}: CollectionViewerProps<T>) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return value
          ? String(value).toLowerCase().includes(searchTerm.toLowerCase())
          : false;
      })
    );
  }, [data, searchTerm, searchKeys]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);
  
  const truncateValue = (value: unknown, maxLength = 20) => {
    if (value == null) return "";
    const str = String(value);
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex flex-row gap-2">
        <div className="flex flex-col flex-8">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search..." />
        </div>
        {featureName !== 'order' && (
          <button className='btn-primary flex-1'
            onClick={() => navigate(`/admin-${featureName}/new`)}
          >
            <span className="block lg:hidden"><PlusIcon className="w-5 h-5" /></span>
            <span className="hidden lg:block">Add New</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto bg-neutral3 rounded-md">
        <table className="w-full text-left">
          <thead className="bg-neutral-700 text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2 ${col.hideOnSmall ? 'hidden md:table-cell' : ''}`}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item._id} className="border-b border-neutral-400">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-2 text-sm md:text-base ${
                      col.hideOnSmall ? 'hidden md:table-cell' : ''
                    }`}
                  >
                    {col.render ? (
                      col.render(item)
                    ) : (
                      <>
                        <span className="md:hidden">{truncateValue(item[col.key])}</span>
                        <span className="hidden md:inline">{item[col.key] != null ? String(item[col.key]) : ''}</span>
                      </>
                    )}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-2 flex md:space-x-2 justify-end items-center h-full">
                    {onEdit && (
                      <button
                        onClick={() => navigate(`/admin-${featureName}/${item._id}`)}
                        className="p-1 text-secondary hover:text-accent rounded cursor-pointer transition-all"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 text-red-600 hover:text-red-800 rounded cursor-pointer transition-all"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}

export default CollectionViewer;
