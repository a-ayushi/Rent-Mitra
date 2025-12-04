import axios from 'axios';

const cityService = {
  // Fetch all Indian cities using a public API
  getAllIndianCities: async () => {
    // Using countriesnow.space API for all cities in India
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/cities', {
      country: 'India'
    });
    // The API returns { data: { data: [cities] } }
    return response.data?.data || [];
  },

  // Reverse geocode coordinates to city/state using Nominatim
  reverseGeocode: async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`;
    const response = await axios.get(url);
    // Try to get city/state from response
    const address = response.data?.address || {};
    return address.city || address.town || address.village || address.state || '';
  }
};

export default cityService;
