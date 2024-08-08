import { kmeans } from 'ml-kmeans';
import { CleanDataItem, NodesItem, LinksItem, DataForVisualisation, KMeansOptions, KMeansResult } from './types';
import cleanCsvFileData from './parser';
import cosineSimilarity from './utils/cosine-similarity';
import { generateUniqueCoordinates } from './utils/coordinates';
import { scaleCoordinate } from './utils/coordinates';

const createClusterNodes = (data: CleanDataItem[]): NodesItem[] => {
  const nodes: NodesItem[] = [];
  const numClusters = 7;

  const featureVectors: number[][] = data.map(item => item.features ?? [0, 0]);
  const options: KMeansOptions = { maxIterations: 1000, tolerance: 1e-4 };
  const result: KMeansResult = kmeans(featureVectors, numClusters, options);

  const xValues = result.centroids.map(c => c[0]);
  const yValues = result.centroids.map(c => c[1]);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const margin = 400;
  const usedCoordinates = new Map<string, number>();

  const sortedData = data.sort((a, b) => (b.spotifyStreams ?? 0) - (a.spotifyStreams ?? 0));
  const mostPopularNumber = sortedData.length > 0 ? sortedData[0].spotifyStreams ?? 0 : 1;

  data.forEach((item, index) => {
    const clusterId = result.clusters[index];
    const {
      spotifyStreams = 0,
      id = '',
      track = '',
      artist = '',
      releaseDate = '',
      albumName = '',
      amazonPlaylistCount = 0,
      deezerPlaylistCount = 0,
      spotifyPlaylistCount = 0,
    } = item;

    const nodeWeight = (spotifyStreams / mostPopularNumber).toFixed(3);
    const centroidX = scaleCoordinate(result.centroids[clusterId][0], xMin, xMax, margin, screenWidth - margin);
    const centroidY = scaleCoordinate(result.centroids[clusterId][1], yMin, yMax, margin, screenHeight - margin);
    const minSize = 2;
    const size = Math.max(minSize, Number(nodeWeight) * 10);

    const offset = 700;
    const { x, y } = generateUniqueCoordinates(centroidX, centroidY, offset, clusterId, usedCoordinates);

    nodes.push({
      id: id.toString(),
      label: track,
      size,
      color: '#00f',
      artist,
      releaseDate,
      spotifyStreams,
      albumName,
      amazonPlaylistCount,
      deezerPlaylistCount,
      spotifyPlaylistCount,
      coordinates: {
        x,
        y
      }
    });
  });

  return nodes;
};

const createLinks = (data: CleanDataItem[]): LinksItem[] => {
  const links: LinksItem[] = [];
  const thresholdSimilarity = 0.99999999;

  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const features1 = data[i].features ?? [];
      const features2 = data[j].features ?? [];

      const similarity = cosineSimilarity(features1, features2);

      if (similarity > thresholdSimilarity) {
        links.push({
          source: data[i].id?.toString() ?? '',
          target: data[j].id?.toString() ?? '',
          value: similarity,
          color: `rgba(0, 0, 0, ${similarity})`,
        });
      }
    }
  }
  return links;
};

const createDataForVisualisation = async (): Promise<DataForVisualisation> => {
  const data = await cleanCsvFileData();
  if (!data) {
    throw new Error('No data available');
  }
  const nodes = createClusterNodes(data);
  const links = createLinks(data);
  return { nodes, links };
};

export default createDataForVisualisation;
