import Papa from 'papaparse';
import csvFile from './assets/data.csv';
import uniqueId from 'lodash/uniqueId';
import { CleanDataItem, CsvItem } from './types';

const parseCsvFileData = async (): Promise<CsvItem[] | undefined> => {
  try {
    const response = await fetch(csvFile);
    const text: string = await response.text();

    const results = Papa.parse<CsvItem>(text, {
      header: true,
      complete: (result) => result.data
    });

    const fileData: CsvItem[] = results.data;
    return fileData;
  }
  catch (error) {
    console.error('Ошибка чтения файла:', error);
  }
};

const cleanCsvFileData = async (): Promise<CleanDataItem[] | undefined> => {
  const fileData: CsvItem[] = await parseCsvFileData() || [];

  const regex: RegExp = /^[a-zA-Z.()\s"']+$/;
  const cleanData: CsvItem[] = fileData.filter(item =>
    regex.test(item.Track || '') &&
    regex.test(item.Artist || '') &&
    regex.test(item['Album Name'] || '')
  );

  const dataForApp: CleanDataItem[] = cleanData.map(item => {
    const amazonPlaylistCount: number = Number(item['Amazon Playlist Count'].replace(/,/g, '')) || 0;
    const deezerPlaylistCount: number = Number(item['Deezer Playlist Count'].replace(/,/g, '')) || 0;
    const spotifyPlaylistCount: number = Number(item['Spotify Playlist Count'].replace(/,/g, '')) || 0;
    const numberStringSpotifyStreams: string = item['Spotify Streams'] || '0';
    const releaseDate: string[] = item['Release Date'].split('/') || [];
    const numberSpotifyStreams: number = parseInt(numberStringSpotifyStreams.replace(/,/g, ''), 10);
    
    return {
      track: item.Track,
      features: [Number(releaseDate[2]), amazonPlaylistCount, deezerPlaylistCount, spotifyPlaylistCount],
      spotifyStreams: numberSpotifyStreams,
      id: Number(uniqueId()),
      artist: item.Artist,
      releaseDate: item['Release Date'],
      albumName: item['Album Name'],
      amazonPlaylistCount,
      deezerPlaylistCount,
      spotifyPlaylistCount,
    };
  });

  return dataForApp;
};

export default cleanCsvFileData;
