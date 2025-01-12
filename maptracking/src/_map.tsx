import '@fortawesome/fontawesome-free/css/all.css';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import Config from './_appConfig';
import { MapContextVarsType, CoordinatesType } from './_customTypes'
import { getCurrentLocation, getCenter, getZoomFactorByDistance } from "./_geolib"
import { connectSocketClient, closeSocket } from "./_socket"
import { coordinatesToLatLng, socketRequestToCoordinatesType } from "./_converters"
import { HOUSE_MARKER_ICON, MARKER_ICON, setZeroPointerMarker } from './_mapResources';

const APP_CONFIG = Config();

const mapContext = (): MapContextVarsType => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [myLocation, setMyLocation] = useState<CoordinatesType | null>(null);
  const [socketClient, setSocketClient] = useState<WebSocket | null>(null);
  const [homeMarker, setHomeMarker] = useState<L.Marker | null>(null);

  return {
    socketClient,
    setSocketClient,
    marker,
    setMarker,
    map,
    setMap,
    myLocation,
    setMyLocation,
    homeMarker,
    setHomeMarker
  };
};

const LeafletMap: React.FC = () => {
  const { marker, myLocation, map, setMap, setMyLocation, setMarker } = mapContext();
  const { socketClient, setSocketClient } = mapContext();
  const { homeMarker, setHomeMarker } = mapContext();
  const ZOOM_CONST = 17;

  const initializeMap = async() => {
    if(!map) {
      var initialCoordinates = await getCurrentLocation();
      if(initialCoordinates) {
        var coordinates = coordinatesToLatLng(initialCoordinates);
        setMyLocation(initialCoordinates);
        
        let leafletMap = L.map('map').setView(coordinates, ZOOM_CONST);

        L.tileLayer(APP_CONFIG.OPENSTREEMAP_URL, {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(leafletMap);
  
        setMap(leafletMap);
      }
    }
  }
  const setMarkerHome = () => {
    if(!homeMarker && map && myLocation) {
      var latLng = coordinatesToLatLng(myLocation);
      let homeMarker = L.marker(latLng, { icon: HOUSE_MARKER_ICON }).addTo(map)
      setHomeMarker(homeMarker);
    }
  }

  const updateMapCoords = async (coordinates: CoordinatesType) => {
    if (map && myLocation) {
      var centerView = getCenter(myLocation, coordinates);
      var zoomFactor = getZoomFactorByDistance(myLocation, coordinates);
      if(centerView) {
        let latLng = coordinatesToLatLng(centerView);
        map.setView(latLng, zoomFactor);
      }
    }
  }

  const updateMarkerCoords = async (coordinates: CoordinatesType) => {
    let latLng = coordinatesToLatLng(coordinates);
    if(!marker && map) {
      setMarker(L.marker(latLng, { icon: MARKER_ICON }).addTo(map));
    }

    if (marker) {
      marker.setLatLng(latLng);
    }
  }

  function receiveCoords(receiveData: any) {
    if (receiveData.coordinates) {
      if (map) {
        let coordinates = socketRequestToCoordinatesType(receiveData);
        updateMapCoords(coordinates);
        updateMarkerCoords(coordinates);
      }
    }
  }

  useEffect(() => {
    initializeMap();
    setMarkerHome();
    connectSocketClient(socketClient, APP_CONFIG.SOCKET_URL, receiveCoords, setSocketClient);

    return () => {
      closeSocket(socketClient);
    };
  }, [map, marker]);

  return (
    <div id="map" style={{ height: '900px' }}>
      {(
        <MapContainer center={[48.8566, 2.3522]} zoom={12}>
          <TileLayer
            url={APP_CONFIG.OPENSTREEMAP_URL}
            attribution='&copy; OpenStreetMap contributors'
          />
        </MapContainer>
      )}
    </div>
  );
};

export default LeafletMap;
