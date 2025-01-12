type ConfigVarsReturnType = {
  SOCKET_URL: string;
  GEOCODE_URL: string;
  OPENSTREEMAP_URL: string;
};

const Config = (): ConfigVarsReturnType => {
  const SOCKET_URL = getSocketUrl();
  const GEOCODE_URL = getGeocodeUrl();
  const OPENSTREEMAP_URL = getOpenStreetMapUrl();
  return {
    SOCKET_URL,
    GEOCODE_URL,
    OPENSTREEMAP_URL
  };
};

function getSocketUrl() {
  var url = "ws://localhost:3001";
  if (process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_PORT) {
    url = process.env.NEXT_PUBLIC_SOCKET_URL + process.env.NEXT_PUBLIC_SOCKET_PORT;
  }
  return url;
}

function getGeocodeUrl() {
  var url = "https://geocode.maps.co/search?q=Av Paulista";
  if (process.env.NEXT_PUBLIC_GEOCODE_URL && process.env.NEXT_PUBLIC_MY_ADDRESS) {
    url = process.env.NEXT_PUBLIC_GEOCODE_URL + process.env.NEXT_PUBLIC_MY_ADDRESS + "&api_key=" + process.env.NEXT_PUBLIC_GEOCODE_APIKEY;
  }
  return url;
}

function getOpenStreetMapUrl() {
  var url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  if (process.env.NEXT_PUBLIC_OPENSTREETMAP_URL) {
    url = process.env.NEXT_PUBLIC_OPENSTREETMAP_URL;
  }
  return url;
}

export default Config;
