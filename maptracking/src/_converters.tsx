import { CoordinatesType } from './_customTypes';
import L from 'leaflet';

export function coordinatesToLatLng(coordinates: CoordinatesType) : L.LatLngTuple {
    let [lat, lng]: L.LatLngTuple = [coordinates.latitude, coordinates.longitude];
    return [lat, lng];
}
  
export function socketRequestToCoordinatesType(receiveData: any) : CoordinatesType {
    let result: CoordinatesType = {
        latitude: 0,
        longitude: 0
    };

    if (receiveData &&
        receiveData.coordinates) {
            result.latitude = receiveData.coordinates[0];
            result.longitude = receiveData.coordinates[1];
        }

    return result;
}