import L from 'leaflet';

export const MARKER_ICON = L.divIcon({
  className: 'leaflet-div-icon',
  html: '<div class="ghost-marker-container"><div class="ghost-marker"><i class="fa-solid fa-ghost fa-2x" aria-hidden="true"></i></div></div>',
  iconSize: [0, 0]
});

export const HOUSE_MARKER_ICON = L.divIcon({
  className: 'leaflet-div-icon',
  html: '<div class="house-marker-container"><div class="house-marker"><i class="fa-solid fa-house fa-2x" aria-hidden="true"></i></div></div>',
  iconSize: [0, 0]
});

const MARKER_ICON_POINTER = L.divIcon({
  className: 'leaflet-div-icon',
  html: '<i></i>',
  iconSize: [10, 10],
  iconAnchor: [0, 0],
});

export const setZeroPointerMarker = (map: L.Map | null, latLng: L.LatLngTuple) => {
  if(map) {
    L.marker(latLng, { icon: MARKER_ICON_POINTER }).addTo(map);
  }
}

export default MARKER_ICON;
