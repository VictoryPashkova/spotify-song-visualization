import { ClickedNode } from "../types";

const isPointInNode = (x: number, y: number, node: ClickedNode): boolean => {
  const dx = x - node.coordinates.x;
  const dy = y - node.coordinates.y;
  return dx * dx + dy * dy <= node.size * node.size;
}

export default isPointInNode;
