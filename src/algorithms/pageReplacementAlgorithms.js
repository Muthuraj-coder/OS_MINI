// Page Replacement Algorithm Implementations

// FIFO (First-In-First-Out) Algorithm
export const fifoAlgorithm = (pages, frameCount) => {
  const frames = [];
  const frameStates = [];
  let faults = 0;
  let pointer = 0;

  pages.forEach((page, index) => {
    let isFault = false;
    let replacedIndex = null;
    if (!frames.includes(page)) {
      if (frames.length < frameCount) {
        frames.push(page);
        replacedIndex = frames.length - 1;
      } else {
        replacedIndex = pointer;
        frames[replacedIndex] = page;
        pointer = (pointer + 1) % frameCount;
      }
      faults++;
      isFault = true;
    }
    frameStates.push({
      page,
      frames: [...frames],
      isFault,
      replacedIndex: isFault ? replacedIndex : null
    });
  });

  return {
    frameStates,
    totalFaults: faults
  };
};

// LRU (Least Recently Used) Algorithm
export const lruAlgorithm = (pages, frameCount) => {
  const frames = [];
  const frameStates = [];
  let faults = 0;
  const pageUsage = new Map();

  pages.forEach((page, index) => {
    let isFault = false;
    let replacedIndex = null;
    pageUsage.set(page, index);
    if (!frames.includes(page)) {
      if (frames.length < frameCount) {
        frames.push(page);
        replacedIndex = frames.length - 1;
      } else {
        // Find least recently used page
        let lruPage = frames[0];
        let lruIndex = pageUsage.get(frames[0]);
        frames.forEach(frame => {
          if (pageUsage.get(frame) < lruIndex) {
            lruIndex = pageUsage.get(frame);
            lruPage = frame;
          }
        });
        replacedIndex = frames.indexOf(lruPage);
        frames[replacedIndex] = page;
      }
      faults++;
      isFault = true;
    }
    frameStates.push({
      page,
      frames: [...frames],
      isFault,
      replacedIndex: isFault ? replacedIndex : null
    });
  });

  return {
    frameStates,
    totalFaults: faults
  };
};

// Optimal Algorithm
export const optimalAlgorithm = (pages, frameCount) => {
  const frames = [];
  const frameStates = [];
  let faults = 0;

  pages.forEach((page, index) => {
    let isFault = false;
    let replacedIndex = null;
    if (!frames.includes(page)) {
      if (frames.length < frameCount) {
        frames.push(page);
        replacedIndex = frames.length - 1;
      } else {
        // Find the page that will not be used for the longest time
        const futurePages = pages.slice(index + 1);
        let replaceIndex = -1;
        let farthestUse = -1;
        frames.forEach((frame, frameIndex) => {
          const nextUse = futurePages.indexOf(frame);
          if (nextUse === -1) {
            replaceIndex = frameIndex;
            return;
          }
          if (nextUse > farthestUse) {
            farthestUse = nextUse;
            replaceIndex = frameIndex;
          }
        });
        replacedIndex = replaceIndex;
        frames[replacedIndex] = page;
      }
      faults++;
      isFault = true;
    }
    frameStates.push({
      page,
      frames: [...frames],
      isFault,
      replacedIndex: isFault ? replacedIndex : null
    });
  });

  return {
    frameStates,
    totalFaults: faults
  };
}; 