import axios from "axios";
import { RecommendationTrack, ClickedNode } from './types';

const setToken = async (): Promise<void> => {
  const clientId = localStorage.getItem('client_id');
  const clientSecret = localStorage.getItem('client_secret');

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const requestBody = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  
  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  
  try {
    const response = await axios.post(tokenUrl, requestBody, options);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

const searchTrack = async (trackName: string, accessToken: string) => {
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`;
  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.tracks.items[0];
};

const fetchTrackPreview = async (trackName: string): Promise<string | null> => {
  await setToken();
  const accessToken: string = localStorage.getItem('access_token') || '';
  try {
    const track = await searchTrack(trackName, accessToken);
    if (track) {
      return track.preview_url;
    }
  } catch (error) {
    console.error('Error fetching track preview:', error);
  }
  return null;
};

const getTrackId = async (trackName: string, accessToken: string): Promise<string | null> => {
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`;
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    const track = data.tracks.items[0];
    
    return track ? track.id : null;

  } catch (error) {
    console.error('Error fetching track ID:', error);
  }
  return null;
};

const getRecommendations = async (clickedNode: ClickedNode): Promise<RecommendationTrack[]> => {
  const accessToken: string = localStorage.getItem('access_token') || '';
  const trackId = await getTrackId(clickedNode.label, accessToken) || '';
  const recommendationsUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=10`;
  try {
    const response = await fetch(recommendationsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    
    const recommendations: RecommendationTrack[] = (data.tracks || []).map((track: any) => ({
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown artist'
    }));

    return recommendations;
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }
  return [];
};

export { fetchTrackPreview, getRecommendations };
