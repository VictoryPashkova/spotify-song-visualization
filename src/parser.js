import Papa from 'papaparse';
import csvFile from './assets/data.csv';
import uniqueId from 'lodash/uniqueId';

const cleanCsvFileData = async () => {
  try {
    const response = await fetch(csvFile);
    const text = await response.text();

    const results = Papa.parse(text, { header: true });
    const fileData = results.data;
    console.log(fileData.find(item => item.Track === 'Look What You Made Me Do'));
    const regex = /^[a-zA-Z.()\s"']+$/;
    const cleanData = fileData.filter(item => regex.test(item.Track) && regex.test(item.Artist) && regex.test(item['Album Name']));
    console.log(cleanData.find(item => item.Track === 'Look What You Made Me Do'));
    const dataForApp = cleanData.map(item => {
      const amazonPlaylistCount = Number(item['Amazon Playlist Count'].replace(/,/g, '')) || 0;
      const deezerPlaylistCount = Number(item['Deezer Playlist Count'].replace(/,/g, '')) || 0;
      const spotifyPlaylistCount = Number(item['Spotify Playlist Count'].replace(/,/g, '')) || 0;
      const numberStringSpotifyStreams = item['Spotify Streams'] || '0';
      const releaseDate = item['Release Date'].split('/');
      const numberSpotifyStreams = parseInt(numberStringSpotifyStreams.replace(/,/g, ''), 10);
      return {
        track: item.Track,
        features: [Number(releaseDate[2]), amazonPlaylistCount, deezerPlaylistCount, spotifyPlaylistCount],
        spotifyStreams: numberSpotifyStreams, //правила нейминг
        id: Number(uniqueId()),
        artist: item.Artist,
        releaseDate: item['Release Date'],
        albumName: item['Album Name'],
        amazonPlaylistCount,
        deezerPlaylistCount,
        spotifyPlaylistCount,
      };
    });
    console.log(dataForApp.find(item => item.track === 'Look What You Made Me Do'));
    return dataForApp;
  }
  catch (error) {
    console.error('Ошибка чтения файла:', error);
  }
};

export default cleanCsvFileData;
