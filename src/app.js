
import { kmeans } from 'ml-kmeans';
import cleanCsvFileData from './parser';
import render from './render';

const runApp = async () => {
  const generateUniqueCoordinates = (centroidX, centroidY, offset, clusterId, usedCoordinates) => {
    let unique = false;
    let x, y;
    
    while (!unique) {
      x = centroidX + (Math.random() - 0.5) * offset;
      y = centroidY + (Math.random() - 0.5) * offset;
      
      // Проверка уникальности
      const key = `${x.toFixed(2)}-${y.toFixed(2)}`;
      if (!usedCoordinates.has(key)) {
        usedCoordinates.set(key, clusterId);
        unique = true;
      }
    }
    
    return { x, y };
  };
  
  const scaleCoordinate = (value, min, max, newMin, newMax) => {
    return newMin + ((value - min) / (max - min)) * (newMax - newMin);
  };
  
  const createClasterNodes = (data) => {
    const nodes = [];
    const numClusters = 7;
    const featureVectors = data.map(item => item.features);
    const { clusters, centroids } = kmeans(featureVectors, numClusters);
    const xValues = centroids.map(c => c[0]);
    const yValues = centroids.map(c => c[1]);
  
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
  
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const margin = 400;
    const usedCoordinates = new Map();
    const mostPopularNumber = data.sort((a, b) => b.spotifyStreams - a.spotifyStreams)[0].spotifyStreams;
    
    data.forEach((item, index) => {
      const clusterId = clusters[index];
      const {
        spotifyStreams, 
        id, 
        track, 
        artist, 
        releaseDate, 
        albumName,
        amazonPlaylistCount,
        deezerPlaylistCount,
        spotifyPlaylistCount,
      } = item;
      const nodeWeight = (spotifyStreams / mostPopularNumber).toFixed(3);
      const centroidX = scaleCoordinate(centroids[clusterId][0], xMin, xMax, margin, screenWidth - margin);
      const centroidY = scaleCoordinate(centroids[clusterId][1], yMin, yMax, margin, screenHeight - margin);
      const minSize = 2;
      const size = Math.max(minSize, nodeWeight * 10);
    
      const offset = 700;
      const { x, y } = generateUniqueCoordinates(centroidX, centroidY, offset, clusterId, usedCoordinates);
    
      nodes.push({
        id: id.toString(),
        label: track,
        size,
        color: '#00f',
        artist: artist,
        releaseDate,
        spotifyStreams,
        albumName,
        amazonPlaylistCount,
        deezerPlaylistCount,
        spotifyPlaylistCount,
        coordinates: {
          x: x,
          y: y
        }
      });
    });

    return nodes;
  };
  
  const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, value, index) => sum + value * vec2[index], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, value) => sum + value * value, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, value) => sum + value * value, 0));
    return dotProduct / (magnitude1 * magnitude2);
  };
  
  const createLinks = (data) => {
    const links = [];
    const thresholdSimilarity = 0.99999999;
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) { // Исправлено с items.length на data.length
        const features1 = data[i].features;
        const features2 = data[j].features;
        const similarity = cosineSimilarity(features1, features2);
        if (similarity > thresholdSimilarity) {
          links.push({
            source: data[i].id.toString(),
            target: data[j].id.toString(),
            value: similarity,
            color: `rgba(0, 0, 0, ${similarity})`,
          });
        }
      }
    }
    return links;
  };
  
  const createDataForVisualisation = async () => {
    const data = await cleanCsvFileData();
    const nodes = createClasterNodes(data);
    const links = createLinks(data);
    return { nodes, links };
  };

  const dataForRender = await createDataForVisualisation();
  render(dataForRender);
};

export default runApp;
