import React, { createContext, useState } from 'react';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [city, setCity] = useState(
    localStorage.getItem('selectedCity') || 'India'
  );

  const updateCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem('selectedCity', newCity);
  };

  return (
    <CityContext.Provider value={{ city, setCity: updateCity }}>
      {children}
    </CityContext.Provider>
  );
};
