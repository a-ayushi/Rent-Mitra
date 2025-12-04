import api from './api';

const rentalService = {
  // Create rental
  createRental: (rentalData) => {
    return api.post('/rentals', rentalData);
  },

  // Get rentals
  getRentals: (params) => {
    return api.get('/rentals', { params });
  },

  // Get rental details
  getRental: (id) => {
    return api.get(`/rentals/${id}`);
  },

  // Update rental status
  updateRentalStatus: (id, status, note) => {
    return api.put(`/rentals/${id}/status`, { status, note });
  },

  // Add message
  addMessage: (id, message) => {
    return api.post(`/rentals/${id}/message`, { message });
  },

  // Submit review
  submitReview: (id, reviewData) => {
    return api.post(`/rentals/${id}/review`, reviewData);
  },

  // Raise dispute
  raiseDispute: (id, disputeData) => {
    return api.post(`/rentals/${id}/dispute`, disputeData);
  }
};

export default rentalService;