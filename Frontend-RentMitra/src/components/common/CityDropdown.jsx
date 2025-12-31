import React, { useState, useEffect } from "react";
import { Search, ExpandMore } from "@mui/icons-material";
import { useCity } from '../../hooks/useCity';
import LoadingScreen from './LoadingScreen';

/**
 * Reusable city dropdown component for selecting a city.
 * Fetches all cities and allows search/filtering.
 * Props:
 *   - className: Additional classes for wrapper
 *   - dropdownClassName: Additional classes for dropdown
 *   - buttonClassName: Additional classes for button
 *   - placeholder: Placeholder text if no city selected
 *   - onCityChange: Callback when city changes
 */
const CityDropdown = ({
  className = '',
  dropdownClassName = '',
  buttonClassName = '',
  placeholder = 'Select City',
  onCityChange = () => {},
  value,
  local = false,
}) => {
  const { city, setCity } = useCity();
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [allCities, setAllCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityFetchError, setCityFetchError] = useState(null);

  useEffect(() => {
    if (locationDropdownOpen && allCities.length === 0 && !loadingCities) {
      setLoadingCities(true);
      import('../../services/cityService').then(({ default: cityService }) => {
        cityService.getAllIndianCities()
          .then((data) => {
            setAllCities(data);
            setCityFetchError(null);
          })
          .catch(() => {
            setCityFetchError('Failed to fetch cities');
          })
          .finally(() => setLoadingCities(false));
      });
    }
  }, [locationDropdownOpen, allCities.length, loadingCities]);

  const handleSelect = (selectedCity) => {
    if (!local) setCity(selectedCity);
    onCityChange(selectedCity);
    setLocationDropdownOpen(false);
    setLocationSearch('');
  };


  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 min-w-[120px] transition-colors ${buttonClassName}`}
      >
        <Search className="w-4 h-4" />
        <span className="truncate max-w-[80px]">{value || city || placeholder}</span>
        <ExpandMore className={`w-4 h-4 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {locationDropdownOpen && (
        <div className={`absolute left-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-80 ${dropdownClassName}`}>
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center px-3 py-2 transition-all border border-gray-200 rounded-md bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Search className="w-4 h-4 mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none"
              />
            </div>
          </div>
          {/* All Indian Cities List */}
          <div className="p-3 overflow-y-auto max-h-64">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">All Locations</div>
            {loadingCities ? (
              <div className="px-3 py-2">
                <LoadingScreen message="Loading cities" minHeight="auto" size={18} />
              </div>
            ) : cityFetchError ? (
              <div className="px-3 py-2 text-sm text-red-500">{cityFetchError}</div>
            ) : (
              allCities
                .filter(cityName =>
                  locationSearch === '' ||
                  cityName.toLowerCase().includes(locationSearch.toLowerCase())
                )
                .slice(0, 100)
                .map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => handleSelect(cityName)}
                    className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cityName}</span>
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityDropdown;
