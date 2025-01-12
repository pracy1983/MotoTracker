// Define adjusted anchor points for the logarithmic function
const anchorPoints = [
    { distance: 530, zoomFactor: 17 },
    { distance: 6800, zoomFactor: 14 },
    { distance: 83000, zoomFactor: 10 },
    { distance: 153000, zoomFactor: 8.6 },
    { distance: 7800000, zoomFactor: 4 },
];
const lastElementAnchorIndex = (anchorPoints.length - 1);

const logFunction = (x: number) => {
    const numerator = Math.log(x / anchorPoints[0].distance);
    const denominator = Math.log(anchorPoints[lastElementAnchorIndex].distance / anchorPoints[0].distance);
    return anchorPoints[0].zoomFactor - (numerator / denominator) * (anchorPoints[0].zoomFactor - anchorPoints[lastElementAnchorIndex].zoomFactor);
};

export const getZoomFactor = (distance: number): number => {
    // Ensure the distance is within the specified range
    const clampedDistance = Math.min(anchorPoints[lastElementAnchorIndex].distance, Math.max(anchorPoints[0].distance, distance));

    // Calculate the zoom factor using the adjusted logarithmic function
    const zoomFactor = logFunction(clampedDistance);

    // Ensure the zoom factor is within the specified range
    return Math.max(anchorPoints[lastElementAnchorIndex].zoomFactor, Math.min(anchorPoints[0].zoomFactor, zoomFactor));
};