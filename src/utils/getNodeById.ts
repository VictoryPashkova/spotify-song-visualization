import { NodesItem } from '../types';

const getNodeById = (id: string, nodes: NodesItem[]) => nodes.find(node => node.id === id);

export default getNodeById;
