import type { Location } from '../types';

export const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateBounds = (locations: Location[]) => {
  if (locations.length === 0) return null;

  let minLat = locations[0].latitude;
  let maxLat = locations[0].latitude;
  let minLng = locations[0].longitude;
  let maxLng = locations[0].longitude;

  locations.forEach(loc => {
    minLat = Math.min(minLat, loc.latitude);
    maxLat = Math.max(maxLat, loc.latitude);
    minLng = Math.min(minLng, loc.longitude);
    maxLng = Math.max(maxLng, loc.longitude);
  });

  return {
    southWest: [minLat, minLng],
    northEast: [maxLat, maxLng]
  };
};

export const calculateOptimalZoom = (bounds: ReturnType<typeof calculateBounds>, config: { width: number; height: number }) => {
  if (!bounds) return 13; // default zoom

  const latDiff = bounds.northEast[0] - bounds.southWest[0];
  const lngDiff = bounds.northEast[1] - bounds.southWest[1];
  
  const maxDiff = Math.max(latDiff, lngDiff);
  
  // Fórmula aproximada para zoom baseado na diferença de coordenadas
  const zoom = Math.floor(14 - Math.log2(maxDiff));
  
  return Math.min(Math.max(zoom, 3), 18); // limita entre zoom 3 e 18
};

export const calculateSpeed = (loc1: Location, loc2: Location): number => {
  const distance = calculateDistance(loc1, loc2); // em km
  const timeDiff = (loc2.timestamp - loc1.timestamp) / 1000 / 3600; // em horas
  return distance / timeDiff; // km/h
};
