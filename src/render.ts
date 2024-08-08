import { NodesItem, LinksItem, ClickedNode, RecommendationTrack } from './types';
import getNodeById from './utils/getNodeById';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

const errorMessage = document.getElementById('error-message') as HTMLDivElement | null;
const tooltip = document.getElementById('tooltip') as HTMLDivElement;
const recommendationsContainer = document.getElementById('recommendations-container') as HTMLDivElement | null;
const recommendationsTitle = document.getElementById('recommendations-title') as HTMLElement | null;
const recommendationsList = document.getElementById('recommendations') as HTMLUListElement | null;
const trackPrev = document.getElementById('track-prev') as HTMLDivElement | null;
const audioPlayer = document.getElementById('audio-player') as HTMLAudioElement;
const audioSource = document.getElementById('audio-source') as HTMLAudioElement;

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const resetHighlightingLinks = (links: LinksItem[]) => {
  links.forEach(link => {
    link.highlighted = false;
    link.color = `rgba(0, 0, 0, ${link.value})`;
  });
};

const redrawCanvas = (nodes: NodesItem[], links: LinksItem[]) => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  nodes.forEach(node => {
    context.beginPath();
    context.arc(node.coordinates.x, node.coordinates.y, node.size, 0, 2 * Math.PI);
    context.fillStyle = node.highlighted ? 'red' : node.color;
    context.fill();
    context.stroke();
  });

  links.forEach(link => {
    const sourceNode = getNodeById(link.source, nodes);
    const targetNode = getNodeById(link.target, nodes);
    const isHighlighted = link.highlighted;

    if (sourceNode && targetNode) {
      context.beginPath();
      context.moveTo(sourceNode.coordinates.x, sourceNode.coordinates.y);
      context.lineTo(targetNode.coordinates.x, targetNode.coordinates.y);
      context.strokeStyle = link.color;
      context.lineWidth = isHighlighted ? Math.max(1, link.value * 5) / 10 : Math.max(1, link.value * 5) / 100;
      context.stroke();
    }
  });
};

const showTooltip = (node: ClickedNode, x: number, y: number) => {
  tooltip.style.display = 'block';
  tooltip.innerHTML = `
    <strong>Track:</strong> ${node.label}<br>
    <strong>Artist:</strong> ${node.artist}<br>
    <strong>Album:</strong> ${node.albumName}<br>
    <strong>Spotify Streams:</strong> ${node.spotifyStreams}<br>
    <strong>Amazon Playlists:</strong> ${node.amazonPlaylistCount}<br>
    <strong>Deezer Playlists:</strong> ${node.deezerPlaylistCount}<br>
    <strong>Spotify Playlists:</strong> ${node.spotifyPlaylistCount}<br>
    <strong>Release Date:</strong> ${node.releaseDate}
  `;
  tooltip.style.left = `${x + 15}px`;
  tooltip.style.top = `${y + 15}px`;
};

const renderInitialCanvas = (nodes: NodesItem[], links: LinksItem[]) => {
  window.onresize = resize;
  resize();

  links.forEach(link => {
    const sourceNode = getNodeById(link.source, nodes);
    const targetNode = getNodeById(link.target, nodes);

    if (sourceNode && targetNode) {
      context.beginPath();
      context.moveTo(sourceNode.coordinates.x, sourceNode.coordinates.y);
      context.lineTo(targetNode.coordinates.x, targetNode.coordinates.y);
      context.strokeStyle = link.color;
      context.lineWidth = Math.max(1, link.value * 5) / 100;
      context.stroke();
    }
  });

  nodes.forEach(node => {
    context.beginPath();
    context.arc(node.coordinates.x, node.coordinates.y, node.size, 0, Math.PI * 2, true);
    context.fillStyle = node.color;
    context.fill();
  });
};

const highlightLinks = (nodeId: string, links: LinksItem[]) => {
  links.forEach(link => {
    if (link.source === nodeId || link.target === nodeId) {
      link.highlighted = true;
      link.color = 'red';
    } else {
      link.highlighted = false;
    }
  });
};

const stopHideAudioPlayer = () => {
  if (audioPlayer) {
    audioPlayer.pause();
  }
  if (trackPrev) trackPrev.style.display = 'none';
};

const renderPreview = (previewUrl: string) => {
  if (trackPrev) trackPrev.style.display = 'block';
  if (audioSource) {
    audioSource.src = previewUrl;
    if (audioPlayer) {
      audioPlayer.load();
      audioPlayer.addEventListener('canplay', () => {
        audioPlayer.play().catch((error) => {
          console.error('Ошибка воспроизведения:', error);
        });
      });
    }
  }
};

const renderRecommendations = (recommendations: RecommendationTrack[], clickedNode: ClickedNode) => {
  if (recommendationsContainer) recommendationsContainer.style.display = 'block';
  if (recommendationsTitle) recommendationsTitle.textContent = `Похожие треки для ${clickedNode.label} ${clickedNode.artist}`;
  if (recommendationsList) {
    recommendationsList.innerHTML = '';
    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        const listItem = document.createElement('li');
        listItem.textContent = `${rec.name} by ${rec.artist}`;
        recommendationsList.appendChild(listItem);
      });
    }
  }
};

const renderNoActiveFeatures = () => {
  if (tooltip) tooltip.style.display = 'none';
  if (trackPrev) trackPrev.style.display = 'none';
  if (errorMessage) errorMessage.style.display = 'none';
  if (recommendationsContainer) recommendationsContainer.style.display = 'none';
};

const renderIsActiveCanvas = (
  value: boolean,
  nodes: NodesItem[],
  links: LinksItem[],
  clickedNode: ClickedNode,
  previewUrl: string,
  recommendations: RecommendationTrack[],
  isClickedOnNode: boolean,
  mouseX: number,
  mouseY: number
) => {
  stopHideAudioPlayer();
  resetHighlightingLinks(links);
  if (!value) {
    renderInitialCanvas(nodes, links);
    renderNoActiveFeatures();
    return;
  }

  if (isClickedOnNode) {
    showTooltip(clickedNode, mouseX, mouseY);
    nodes.forEach(node => {
      node.highlighted = node.id === clickedNode.id;
    });
    highlightLinks(clickedNode.id, links);
    redrawCanvas(nodes, links);
  }

  if (recommendations) {
    renderRecommendations(recommendations, clickedNode);
    if (errorMessage) errorMessage.style.display = 'none';
  } else {
    if (errorMessage) errorMessage.style.display = 'block';
  }

  if (previewUrl) {
    renderPreview(previewUrl);
    if (errorMessage) errorMessage.style.display = 'none';
  } else {
    if (errorMessage) {
      errorMessage.style.display = 'block';
      errorMessage.textContent = `Извините для ${clickedNode.label} ${clickedNode.artist} нет превью`;
    }
  }
};

export { renderIsActiveCanvas, renderInitialCanvas };
