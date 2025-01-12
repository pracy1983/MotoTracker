export type MapContextVarsType = {
    socketClient: WebSocket | null;
    setSocketClient: React.Dispatch<React.SetStateAction<WebSocket | null>>;
    marker: L.Marker | null;
    setMarker: React.Dispatch<React.SetStateAction<L.Marker | null>>;
    map: L.Map | null;
    setMap: React.Dispatch<React.SetStateAction<L.Map | null>>;
    myLocation: CoordinatesType| null,
    setMyLocation: React.Dispatch<React.SetStateAction<CoordinatesType| null>>;
    homeMarker: L.Marker | null;
    setHomeMarker: React.Dispatch<React.SetStateAction<L.Marker | null>>;
};

export type CoordinatesType = {
    latitude: number,
    longitude: number
}