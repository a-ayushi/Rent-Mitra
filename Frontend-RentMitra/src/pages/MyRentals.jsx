import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import itemService from '../services/itemService';
import { useAuth } from '../hooks/useAuth';
import { Edit as EditIcon } from '@mui/icons-material';

const MyRentals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mobileNumber = user?.phone || user?.mobilenumber || user?.mobileNumber || '';

  const { data, isLoading, error } = useQuery(
    ['myRentals', mobileNumber],
    () => (mobileNumber ? itemService.getProductsByMobileNumber(mobileNumber) : itemService.getMyOwnedProducts())
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Rentals</h1>

        {isLoading ? <div>Loading...</div> : error ? <div>Error loading rentals.</div> : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Days</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(data?.items) ? data.items : []).map(item => (
                  <tr
                    key={item._id}
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={item.images?.[0]?.url || ''} alt={item.title || item.name || ''} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title || item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Min: {item.minRentalDays ?? 0} / Max: {item.maxRentalDays ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {item.pricePerDay != null ? `₹${item.pricePerDay}/day` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-item/${item._id}`);
                        }}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-900"
                      >
                        <EditIcon fontSize="small" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;
