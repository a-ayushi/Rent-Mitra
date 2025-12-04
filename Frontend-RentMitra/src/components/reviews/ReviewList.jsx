import React from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Paper,
  Divider,
  Chip,
  Grid,
  Button
} from '@mui/material';
import { format } from 'date-fns';
import { Verified as VerifiedIcon } from '@mui/icons-material';

const ReviewList = ({ reviews = [], itemId }) => {
  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No reviews yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reviews ({reviews.length})
      </Typography>

      {/* Rating Summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </Typography>
              <Rating
                value={reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length}
                readOnly
                precision={0.1}
                size="large"
              />
              <Typography variant="body2" color="text.secondary">
                Based on {reviews.length} reviews
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8}>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {rating}
                  </Typography>
                  <Box sx={{ flexGrow: 1, mx: 2, bgcolor: 'grey.200', height: 8, borderRadius: 1 }}>
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews List */}
      {reviews.map((review, index) => (
        <Box key={review._id}>
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
              <Avatar
                src={review.reviewer?.profileImage?.url}
                sx={{ mr: 2 }}
              >
                {review.reviewer?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">
                    {review.reviewer?.name}
                  </Typography>
                  {review.reviewer?.verification?.identity && (
                    <VerifiedIcon sx={{ ml: 0.5, fontSize: 18, color: 'primary.main' }} />
                  )}
                  {review.isVerified && (
                    <Chip
                      label="Verified Rental"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {review.comment}
                </Typography>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {review.images.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img.url}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Aspect Ratings */}
                {review.aspects && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {Object.entries(review.aspects).map(([aspect, rating]) => (
                      <Box key={aspect} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {aspect.charAt(0).toUpperCase() + aspect.slice(1)}:
                        </Typography>
                        <Rating value={rating} readOnly size="small" />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Owner Response */}
                {review.response && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Response from owner
                    </Typography>
                    <Typography variant="body2">
                      {review.response.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.response.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Box>
          </Box>
          {index < reviews.length - 1 && <Divider />}
        </Box>
      ))}

      {/* Load More Button */}
      {reviews.length >= 10 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined">
            Load More Reviews
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;