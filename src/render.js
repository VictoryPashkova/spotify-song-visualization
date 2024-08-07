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
  }
  
  canvas.addEventListener('click', (e) => {
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
    } else {
      resetHighlighting();
      renderInitialCanvas();
      tooltip.style.display = 'none';
    }
  });
  
  };

  export default render;