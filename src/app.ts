
import onChange from 'on-change';
import { RecommendationTrack, ClickedNode, AppState } from './types';
import { renderIsActiveCanvas, renderInitialCanvas } from './render';
import isPointInNode from './utils/isPointInNode';
import { getRecommendations, fetchTrackPreview } from './api';
import createDataForVisualisation from './model';

const runApp = async (): Promise<void> => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  let clickedNode: ClickedNode;
  let previewUrl: string;
  let recommendations: RecommendationTrack[];

  const dataForRender = await createDataForVisualisation();
  const appState: AppState = {
    nodes: dataForRender.nodes,
    links: dataForRender.links,
    uiState: {
      isCanvasTouched: false,
      isClickedOnNode: false,
      mouseX: 0,
      mouseY: 0,
    }
  };

  const watchedState = onChange(appState, (path: string, value: any): void => {
    switch (path) {
      case 'uiState.isCanvasTouched':
        renderIsActiveCanvas(
          value,
          appState.nodes,
          appState.links,
          clickedNode,
          previewUrl,
          recommendations,
          appState.uiState.isClickedOnNode,
          appState.uiState.mouseX,
          appState.uiState.mouseY
        );
        break;
      case 'uiState.mouseY':
        renderIsActiveCanvas(
          appState.uiState.isCanvasTouched,
          appState.nodes,
          appState.links,
          clickedNode,
          previewUrl,
          recommendations,
          appState.uiState.isClickedOnNode,
          appState.uiState.mouseX,
          value
        );
        break;
      default:
        break;
    }
  });

  canvas.addEventListener('click', async (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    clickedNode = appState.nodes.find(node => isPointInNode(mouseX, mouseY, node)) as ClickedNode;
    if (!clickedNode) {
      watchedState.uiState.isCanvasTouched = false;
      watchedState.uiState.isClickedOnNode = false;
      return;
    }

    watchedState.uiState.isClickedOnNode = !!clickedNode;
    previewUrl = await fetchTrackPreview(clickedNode.label) || '';
    recommendations = await getRecommendations(clickedNode || '');
    watchedState.uiState.isCanvasTouched = true;
    watchedState.uiState.mouseX = mouseX;
    watchedState.uiState.mouseY = mouseY;
  });

  renderInitialCanvas(appState.nodes, appState.links);
};

export default runApp;
