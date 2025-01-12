export interface ConfigVars {
  SOCKET_URL: string;
  GEOCODE_URL: string;
  OPENSTREETMAP_URL: string;
}

const getSocketUrl = (): string => {
  const defaultUrl = "ws://localhost:3001";
  return import.meta.env.VITE_SOCKET_URL || defaultUrl;
};

const getGeocodeUrl = (): string => {
  const defaultUrl = "https://geocode.maps.co/search";
  const apiKey = import.meta.env.VITE_GEOCODE_APIKEY;
  return apiKey ? `${defaultUrl}?api_key=${apiKey}` : defaultUrl;
};

const getOpenStreetMapUrl = (): string => {
  const defaultUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  return import.meta.env.VITE_OPENSTREETMAP_URL || defaultUrl;
};

export const config: ConfigVars = {
  SOCKET_URL: getSocketUrl(),
  GEOCODE_URL: getGeocodeUrl(),
  OPENSTREETMAP_URL: getOpenStreetMapUrl()
};
