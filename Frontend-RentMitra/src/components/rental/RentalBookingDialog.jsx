import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { differenceInDays, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import rentalService from '../../services/rentalService';

const steps = ['Select Dates', 'Delivery Options', 'Payment Method'];

const RentalBookingDialog = ({ open, onClose, item, selectedDates, totalPrice }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    dates: selectedDates,
    deliveryType: 'pickup',
    deliveryAddress: '',
    paymentMethod: 'card'
  });

  const createRentalMutation = useMutation(
    (data) => rentalService.createRental(data),
    {
      onSuccess: (response) => {
        toast.success('Rental request created successfully!');
        navigate(`/rentals/${response.rental._id}`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create rental');
      }
    }
  );

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit booking
      const rentalData = {
        itemId: item._id,
        from: bookingData.dates.from,
        to: bookingData.dates.to,
        deliveryType: bookingData.deliveryType,
        deliveryAddress: bookingData.deliveryType === 'delivery' ? bookingData.deliveryAddress : null,
        paymentMethod: bookingData.paymentMethod
      };
      createRentalMutation.mutate(rentalData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select your rental period
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={bookingData.dates.from}
                  onChange={(date) => setBookingData({
                    ...bookingData,
                    dates: { ...bookingData.dates, from: date }
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={bookingData.dates.to}
                  onChange={(date) => setBookingData({
                    ...bookingData,
                    dates: { ...bookingData.dates, to: date }
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={bookingData.dates.from || new Date()}
                />
              </Grid>
            </Grid>
            
            {bookingData.dates.from && bookingData.dates.to && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Total rental period: {differenceInDays(bookingData.dates.to, bookingData.dates.from) + 1} days
              </Alert>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              How would you like to receive the item?
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={bookingData.deliveryType}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  deliveryType: e.target.value
                })}
              >
                <FormControlLabel
                  value="pickup"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Pickup</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pick up from: {item.location.address}
                      </Typography>
                    </Box>
                  }
                />
                {item.delivery?.available && (
                  <FormControlLabel
                    value="delivery"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          Delivery (+₹{item.delivery.charges})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Within {item.delivery.radius}km radius
                        </Typography>
                      </Box>
                    }
                  />
                )}
              </RadioGroup>
            </FormControl>
            
            {bookingData.deliveryType === 'delivery' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Delivery Address"
                value={bookingData.deliveryAddress}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  deliveryAddress: e.target.value
                })}
                sx={{ mt: 2 }}
                required
              />
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select payment method
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={bookingData.paymentMethod}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  paymentMethod: e.target.value
                })}
              >
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="upi" control={<Radio />} label="UPI" />
                <FormControlLabel value="netbanking" control={<Radio />} label="Net Banking" />
                <FormControlLabel value="wallet" control={<Radio />} label="Wallet" />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Item</Typography>
                <Typography variant="body2">{item.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Period</Typography>
                <Typography variant="body2">
                  {format(bookingData.dates.from, 'MMM dd')} - {format(bookingData.dates.to, 'MMM dd')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Rental Cost</Typography>
                <Typography variant="body2">₹{totalPrice - item.pricing.deposit}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Security Deposit</Typography>
                <Typography variant="body2">₹{item.pricing.deposit}</Typography>
              </Box>
              {bookingData.deliveryType === 'delivery' && (
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                               <Typography variant="body2">Delivery Charges</Typography>
                               <Typography variant="body2">₹{item.delivery.charges}</Typography>
                             </Box>
                           )}
                           <Divider sx={{ my: 1 }} />
                           <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                             <Typography variant="h6">Total</Typography>
                             <Typography variant="h6">
                               ₹{totalPrice + (bookingData.deliveryType === 'delivery' ? item.delivery.charges : 0)}
                             </Typography>
                           </Box>
                         </Box>
                       </Box>
                     );
                   
                   default:
                     return 'Unknown step';
                 }
               };
             
               return (
                 <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                   <DialogTitle>
                     Book {item?.title}
                   </DialogTitle>
                   <DialogContent>
                     <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                       {steps.map((label) => (
                         <Step key={label}>
                           <StepLabel>{label}</StepLabel>
                         </Step>
                       ))}
                     </Stepper>
                     
                     {getStepContent(activeStep)}
                   </DialogContent>
                   <DialogActions>
                     <Button onClick={onClose}>Cancel</Button>
                     <Button onClick={handleBack} disabled={activeStep === 0}>
                       Back
                     </Button>
                     <Button
                       variant="contained"
                       onClick={handleNext}
                       disabled={createRentalMutation.isLoading}
                     >
                       {activeStep === steps.length - 1 ? 
                         (createRentalMutation.isLoading ? 'Processing...' : 'Confirm Booking') : 
                         'Next'
                       }
                     </Button>
                   </DialogActions>
                 </Dialog>
               );
             };
             
             export default RentalBookingDialog;