import Config from './_appConfig';
import { CoordinatesType } from './_customTypes';
import { getCenter as geolibGetCenter, getDistance as geolibGetDistance } from 'geolib';
import { getZoomFactor } from './_zoomFactorCalculator';

const APP_CONFIG = Config();

export const getCurrentLocation = () => {
    return new Promise<CoordinatesType | null>(async (resolve, reject) => {
        try {
            var response = await fetch(APP_CONFIG.GEOCODE_URL);
            var retrievedData = await response.json();
            if (retrievedData) {
                if (retrievedData.length > 0) {
                    var lastIndexData = (retrievedData.length - 1);
                    var result: CoordinatesType = { 
                        latitude: retrievedData[lastIndexData].lat,
                        longitude: retrievedData[lastIndexData].lon
                    }
                    resolve(result);
                }
            }
        } catch {
            console.log('Error!');
            reject(null);
        }
    });
};

export const getCenter = (start: CoordinatesType, end: CoordinatesType) : CoordinatesType => {
    let result: CoordinatesType = {
        latitude: 0,
        longitude: 0
    }

    let payload = [
        { latitude: start.latitude, longitude: start.longitude },
        { latitude: end.latitude, longitude: end.longitude },
    ];
    let center = geolibGetCenter(payload);

    if (center) {
        result.latitude = center.latitude;
        result.longitude = center.longitude;
    }

    return result;
}

const getDistance = (start: CoordinatesType, end: CoordinatesType) : number => {
    let payload = [
        { latitude: start.latitude, longitude: start.longitude },
        { latitude: end.latitude, longitude: end.longitude },
    ];

    let distance = geolibGetDistance(payload[0], payload[1]);
    return distance;
}

export const getZoomFactorByDistance = (start: CoordinatesType, end: CoordinatesType): number => {
    let distance = getDistance(start, end);

    let zoomFactor = getZoomFactor(distance);
    return zoomFactor;
};