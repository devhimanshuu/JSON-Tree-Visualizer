export function analyzeJSON(json) {
  let totalKeys = 0;
  let maxDepth = 0;
  let totalArrays = 0;
  
  function calculateSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }

  function traverse(obj, depth = 0) {
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(obj)) {
      totalArrays++;
      obj.forEach(item => traverse(item, depth + 1));
    } else if (typeof obj === 'object' && obj !== null) {
      totalKeys += Object.keys(obj).length;
      Object.values(obj).forEach(value => traverse(value, depth + 1));
    }
  }

  traverse(json);
  const memorySize = calculateSize(json);

  return {
    totalKeys,
    maxDepth,
    totalArrays,
    memorySize: `${(memorySize / 1024).toFixed(1)}KB`
  };
}