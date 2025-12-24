import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import itemService from '../services/itemService';
import { Add, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/common/LoadingScreen';

const MyListings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { data, isLoading, error } = useQuery(
    ['myListings', userId],
    () => itemService.getUserItems(userId, { status: 'active' }),
    { enabled: !!userId }
  );
  console.log('MyListings userId:', userId);
  console.log('MyListings data:', data);

  const { mutate: deleteItem } = useMutation(itemService.deleteItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('myListings');
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    }
  });

  const { mutate: toggleAvailability } = useMutation(
    ({ id, isAvailable }) => itemService.toggleAvailability(id, isAvailable), {
      onSuccess: () => {
        queryClient.invalidateQueries('myListings');
        toast.success('Availability updated');
      },
      onError: () => {
        toast.error('Failed to update availability');
      }
    }
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Listings</h1>
          <button onClick={() => navigate('/add-item')} className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
            <Add /> Add New Item
          </button>
        </div>

        {isLoading ? (
          <LoadingScreen message="Loading your listings" />
        ) : error ? (
          <div>Error loading listings.</div>
        ) : (
          <>
            <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
              {Array.isArray(data?.data) && data.data.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Item</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map(item => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img className="object-cover w-10 h-10 rounded-md" src={item.images?.[0]?.url || ''} alt={item.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.category?.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.isAvailable ? 'available' : 'unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">₹{item.pricePerDay ?? 'N/A'}/day</td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleAvailability({ id: item._id, isAvailable: !item.isAvailable })}
                            className={`mr-2 text-gray-400 hover:text-gray-600 ${!item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!item.isAvailable}
                            title={item.isAvailable ? 'Hide listing' : 'Show listing'}
                          >
                            {item.isAvailable ? <VisibilityOff /> : <Visibility />}
                          </button>
                          <button
                            onClick={() => navigate(`/edit-item/${item._id}`)}
                            className={`mr-2 text-indigo-600 hover:text-indigo-900 ${!item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!item.isAvailable}
                            title={item.isAvailable ? 'Edit' : 'Unavailable item'}
                          >
                            <Edit />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className={`text-red-600 hover:text-red-900 ${!item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!item.isAvailable}
                            title={item.isAvailable ? 'Delete' : 'Unavailable item'}
                          >
                            <Delete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-gray-600">No listings found.</div>
                  <button onClick={() => navigate('/add-item')} className="mt-4 px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg">Add a Listing</button>
                </div>
              )}
            </div>
          </>
        )}
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            {Array.isArray(data?.items) && data.items.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Item</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map(item => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <img className="object-cover w-10 h-10 rounded-md" src={item.images[0]?.url} alt={item.title} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.availability.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.availability.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">₹{item.pricing.daily}/day</td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button onClick={() => toggleAvailability(item._id)} className="mr-2 text-gray-400 hover:text-gray-600">
                          {item.availability.status === 'available' ? <VisibilityOff /> : <Visibility />}
                        </button>
                        <button onClick={() => navigate(`/edit-item/${item._id}`)} className="mr-2 text-indigo-600 hover:text-indigo-900"><Edit /></button>
                        <button onClick={() => deleteItem(item._id)} className="text-red-600 hover:text-red-900"><Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-600">No listings found.</div>
                <button onClick={() => navigate('/add-item')} className="mt-4 px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg">Add a Listing</button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default MyListings;
