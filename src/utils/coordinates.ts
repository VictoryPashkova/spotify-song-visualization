const generateUniqueCoordinates = (
  centroidX: number,
  centroidY: number,
  offset: number,
  clusterId: number,
  usedCoordinates: Map<string, number>
): { x: number; y: number } => {
  let unique = false;
  let x: number = 0;
  let y: number = 0;
    
  while (!unique) {
    x = centroidX + (Math.random() - 0.5) * offset;
    y = centroidY + (Math.random() - 0.5) * offset;
      
    const key = `${x.toFixed(2)}-${y.toFixed(2)}`;
    if (!usedCoordinates.has(key)) {
      usedCoordinates.set(key, clusterId);
      unique = true;
    }
  }
    
  return { x, y };
};
  
const scaleCoordinate = (value: number, min: number, max: number, newMin: number, newMax: number): number => {
  return newMin + ((value - min) / (max - min)) * (newMax - newMin);
};

export { generateUniqueCoordinates, scaleCoordinate };
