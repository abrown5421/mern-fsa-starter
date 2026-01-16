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
  maxLength?: number;
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
  
  const truncateValue = (value: unknown, maxLength?: number) => {
    if (value == null) return '';
    const str = String(value);
    if (!maxLength) return str;
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
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
            {paginatedData.map((item, idx) => (
              <tr key={item._id} className={`border-2 border-neutral-contrast/5 ${idx % 2 ? "bg-neutral-contrast/5" : "bg-neutral"}`}>
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-2 text-sm md:text-base ${
                      col.hideOnSmall ? 'hidden md:table-cell' : ''
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : truncateValue(item[col.key], col.maxLength)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-2">
                    <div className="flex justify-end items-center md:space-x-2 h-full">
                      {onEdit && (
                        <div className="relative group">
                          <button
                            onClick={() => navigate(`/admin-${featureName}/${item._id}`)}
                            className="p-1 text-secondary hover:text-accent rounded cursor-pointer transition-all"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>

                          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap
                                          rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0
                                          transition-opacity group-hover:opacity-100">
                            Edit
                          </span>
                        </div>
                      )}

                      {onDelete && (
                        <div className="relative group">
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1 text-red-600 hover:text-red-800 rounded cursor-pointer transition-all"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>

                          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap
                                          rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0
                                          transition-opacity group-hover:opacity-100">
                            Delete
                          </span>
                        </div>
                      )}
                    </div>
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
