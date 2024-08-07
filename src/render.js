const render = (data) => {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const nodes = data.nodes;
    const links = data.links;
    const tooltip = document.getElementById('tooltip');
  
  const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
  
  window.onresize = resize;
  resize();
  
  const resetHighlighting = () => {
    nodes.forEach(node => {
      node.highlighted = false;
      node.color = 'blue';
    });
    redrawCanvas();
  }
  
  const getNodeById = (id) => {
    return nodes.find(node => node.id === id);
  };

  const renderInitialCanvas = () => {
    links.forEach(link => {
      const sourceNode = getNodeById(link.source);
      const targetNode = getNodeById(link.target);
      
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
  }
  
  renderInitialCanvas();
  
  const isPointInNode = (x, y, node) => {
    const dx = x - node.coordinates.x;
    const dy = y - node.coordinates.y;
    return dx * dx + dy * dy <= node.size * node.size;
  }
  
  const showTooltip = (node, x, y) => {
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
  
  const highlightLinks = (nodeId, color) => {
    links.forEach(link => {
        if (link.source === nodeId || link.target === nodeId) {
            link.highlighted = true;
            link.color = color;
        } else {
            link.highlighted = false;
        }
    });
}
  const redrawCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    nodes.forEach(node => {
      context.beginPath();
      context.arc(node.coordinates.x, node.coordinates.y, node.size, 0, 2 * Math.PI);
      context.fillStyle = node.highlighted ? 'red' : node.color;
      context.fill();
      context.stroke();
    });

    links.forEach(link => {
      const sourceNode = getNodeById(link.source);
      const targetNode = getNodeById(link.target);
      
      if (sourceNode && targetNode) {
        context.beginPath();
        context.moveTo(sourceNode.coordinates.x, sourceNode.coordinates.y);
        context.lineTo(targetNode.coordinates.x, targetNode.coordinates.y);
        context.strokeStyle = link.color;
        context.lineWidth = Math.max(1, link.value * 5) / 100;
        context.stroke();
      }
    });
  }

  function extractTrackIdFromUrl(url) {
    const match = url.match(/track\/([a-zA-Z0-9]{22})/);
    return match ? match[1] : null;
  }
  
  // Пример использования функции
  const trackUrl = 'https://open.spotify.com/track/5Wz8kPzxCB8U86RWqzD4tH';
  const trackId = extractTrackIdFromUrl(trackUrl);
  
  if (trackId) {
    console.log('Track ID:', trackId);
    // Теперь вы можете использовать trackId для дальнейших запросов
  } else {
    console.log('No track ID found in the URL.');
  }

  async function getTrackId(trackName, accessToken) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Error fetching track data');
    }
  
    const data = await response.json();
    const track = data.tracks.items[0];
    
    return track ? track.id : null;
  }

  async function getRecommendations(trackId, accessToken) {
    const recommendationsUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=10`;
    const response = await fetch(recommendationsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Error fetching recommendations');
    }
  
    const data = await response.json();
    return data.tracks || [];
  }
  
  canvas.addEventListener('click', async (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const clickedNode = nodes.find(node => isPointInNode(mouseX, mouseY, node));
    if (clickedNode) {
      showTooltip(clickedNode, mouseX, mouseY);
      nodes.forEach(node => {
        node.highlighted = node.id === clickedNode.id;
      });
      redrawCanvas();
      const previewUrl = await fetchTrackPreview(clickedNode.label);
  
      if (previewUrl) {
        const trackId = await getTrackId(clickedNode.label, localStorage.getItem('access_token'));
        
        if (trackId) {
          // Используйте trackId для дальнейших действий, например, для получения рекомендаций
          const recommendations = await getRecommendations(trackId, localStorage.getItem('access_token'));
          document.getElementById('recommendations-container').style.display = 'block';
          document.getElementById('recommendations-title').textContent = `Похожие треки для ${clickedNode.label} ${clickedNode.artist}`;
          const recommendationsList = document.getElementById('recommendations');
          recommendationsList.innerHTML = '';
          if (recommendations.length > 0) {
            recommendations.forEach(rec => {
              const listItem = document.createElement('li');
              listItem.textContent = `${rec.name} by ${rec.artists.map(artist => artist.name).join(', ')}`;
              recommendationsList.appendChild(listItem);
            });
          } else {
            document.getElementById('error-message').style.display = 'block';
          }
        } else if (!trackId) {
          document.getElementById('error-message').style.display = 'block';
        }
        document.getElementById('track-prev').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('audio-source').src = previewUrl;
        document.getElementById('audio-player').load();
        document.getElementById('audio-player').play();
        document.getElementById('audio-player').muted = true;
      } else {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = `Sorry, no preview available for ${clickedNode.label} ${clickedNode.artist}`;
      }
    } else {
      resetHighlighting();
      renderInitialCanvas();
      tooltip.style.display = 'none';
      document.getElementById('track-prev').style.display = 'none';
      document.getElementById('error-message').style.display = 'none';
      document.getElementById('recommendations-container').style.display = 'none';}

    async function searchTrack(trackName, accessToken) {
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`;
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      const data = await response.json();
      return data.tracks.items[0];
    }
  
    async function fetchTrackPreview(trackName) {
      const accessToken = localStorage.getItem('access_token');
      const track = await searchTrack(trackName, accessToken);
  
      if (track) {
        return track.preview_url;
      } else {
        return null;
      }
    }
  });
  
  };

  export default render;