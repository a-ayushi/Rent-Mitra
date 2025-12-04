import { useContext } from 'react';
import { CityContext } from '../contexts/CityContext';

export const useCity = () => useContext(CityContext);
