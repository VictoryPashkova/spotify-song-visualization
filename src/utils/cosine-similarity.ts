const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  const dotProduct = vec1.reduce((sum, value, index) => sum + value * vec2[index], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, value) => sum + value * value, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (magnitude1 * magnitude2);
};

export default cosineSimilarity;
