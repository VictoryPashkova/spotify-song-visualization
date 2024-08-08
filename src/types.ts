export type CleanDataItem = {
  track?: string;
  features?: number[];
  spotifyStreams?: number;
  id?: number;
  artist?: string;
  releaseDate?: string;
  albumName?: string;
  amazonPlaylistCount?: number;
  deezerPlaylistCount?: number;
  spotifyPlaylistCount?: number;
};

export type NodesItem = {
  id: string;
  label: string;
  size: number;
  color: string;
  artist: string;
  releaseDate: string;
  spotifyStreams: number;
  albumName: string;
  amazonPlaylistCount: number;
  deezerPlaylistCount: number;
  spotifyPlaylistCount: number;
  coordinates: {
    x: number;
    y: number;
  };
  highlighted?: boolean;
};

export type ClickedNode = {
  id: string;
  label: string;
  size: number;
  color: string;
  artist: string;
  releaseDate: string;
  spotifyStreams: number;
  albumName: string;
  amazonPlaylistCount: number;
  deezerPlaylistCount: number;
  spotifyPlaylistCount: number;
  coordinates: {
    x: number;
    y: number;
  };
  highlighted?: boolean;
};

export type LinksItem = {
  source: string;
  target: string;
  value: number;
  color: string;
  highlighted?: boolean;
};

export type DataForVisualisation = {
  nodes: NodesItem[];
  links: LinksItem[];
};

export type KMeansOptions = {
  maxIterations?: number;
  tolerance?: number;
};

export type KMeansResult = {
  clusters: number[];
  centroids: number[][];
};

export type CsvItem = {
  "Air Play Spins": string;
  "Album Name": string;
  "All Time Rank": string;
  "Amazon Playlist Count": string;
  "Apple Music Playlist Count": string;
  Artist: string;
  "Deezer Playlist Count": string;
  "Deezer Playlist Reach": string;
  "Explicit Track": string;
  ISRC: string;
  "Pandora Streams": string;
  "Pandora Track Stations": string;
  "Release Date": string;
  "Shazam Counts": string;
  "Sirius XMSpins": string;
  "Soundcloud Streams": string;
  "Spotify Playlist Count": string;
  "Spotify Playlist Reach": string;
  "Spotify Popularity": string;
  "Spotify Streams": string;
  "TIDAL Popularity": string;
  "TikTok Likes": string;
  "TikTok Posts": string;
  "TikTok Views": string;
  Track: string;
  "Track Score": string;
  "YouTube Likes": string;
  "YouTube Playlist Reach": string;
  "YouTube Views": string;
};

export type RecommendationTrack = {
  name: string;
  artist: string;
};

export type UiState = {
  isCanvasTouched: boolean;
  isClickedOnNode: boolean;
  mouseX: number;
  mouseY: number;
};

export type AppState = {
  nodes: NodesItem[];
  links: LinksItem[];
  uiState: UiState;
};