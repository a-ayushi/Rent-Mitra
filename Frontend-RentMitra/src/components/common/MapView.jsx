import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography, Button } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;

// Import marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapView = ({ items, center = [19.0760, 72.8777], zoom = 12, onItemClick }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && items.length > 0) {
      const bounds = L.latLngBounds(
        items.map(item => [
          item.location.coordinates.coordinates[1],
          item.location.coordinates.coordinates[0]
        ])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [items]);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {items.map((item) => (
        <Marker
          key={item._id}
          position={[
            item.location.coordinates.coordinates[1],
            item.location.coordinates.coordinates[0]
          ]}
        >
          <Popup>
            <Box sx={{ minWidth: 200 }}>
              <img
                src={item.images[0]?.url || '/placeholder.jpg'}
                alt={item.title}
                style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 8 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ₹{item.pricing.daily}/day
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                fullWidth
                onClick={() => onItemClick(item)}
              >
                View Details
              </Button>
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;