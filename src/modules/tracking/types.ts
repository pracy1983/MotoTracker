export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface TrackingMessage {
  type: 'location' | 'status' | 'error';
  data: Location | string;
  motoId?: string;
}

export interface ZoomConfig {
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  zoomFactor: number;
}
