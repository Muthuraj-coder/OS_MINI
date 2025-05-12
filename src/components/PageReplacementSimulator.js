import { useState, useEffect } from 'react';
import './PageReplacementSimulator.css';

// FIFO Algorithm implementation
const fifoAlgorithm = (pages, frameCount) => {
  const frames = [];
  const frameStates = [];
  let faults = 0;
  let pointer = 0;

  pages.forEach((page) => {
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

// LRU Algorithm implementation
const lruAlgorithm = (pages, frameCount) => {
  const frames = [];
  const frameStates = [];
  let faults = 0;
  const recent = [];

  pages.forEach((page) => {
    let isFault = false;
    let replacedIndex = null;

    if (!frames.includes(page)) {
      if (frames.length < frameCount) {
        frames.push(page);
        recent.push(page);
        replacedIndex = frames.length - 1;
      } else {
        // Find the least recently used page
        let lruPage = recent.shift();
        let lruIndex = frames.indexOf(lruPage);
        frames[lruIndex] = page;
        replacedIndex = lruIndex;
        recent.push(page);
      }
      faults++;
      isFault = true;
    } else {
      // Move the page to the most recently used
      recent.splice(recent.indexOf(page), 1);
      recent.push(page);
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

// Optimal Algorithm implementation
const optimalAlgorithm = (pages, frameCount) => {
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
        // Find the page with the farthest next use
        let farthest = -1;
        let idxToReplace = -1;
        for (let i = 0; i < frames.length; i++) {
          let nextUse = pages.slice(index + 1).indexOf(frames[i]);
          if (nextUse === -1) {
            idxToReplace = i;
            break;
          }
          if (nextUse > farthest) {
            farthest = nextUse;
            idxToReplace = i;
          }
        }
        replacedIndex = idxToReplace;
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

// Helper functions
const getAlgorithmName = (algo) => {
  switch (algo) {
    case 'fifo': return 'First In First Out (FIFO)';
    case 'lru': return 'Least Recently Used (LRU)';
    case 'optimal': return 'Optimal';
    default: return '';
  }
};

const getAlgorithmDescription = (algo) => {
  switch (algo) {
    case 'fifo': 
      return 'Replaces the oldest page in memory, works on a queue principle where the first page in is the first page out.';
    case 'lru': 
      return 'Replaces the page that has not been used for the longest period of time, tracking usage history.';
    case 'optimal': 
      return 'Replaces the page that will not be used for the longest period of time in the future, requires knowledge of future references.';
    default: 
      return '';
  }
};

export default function PageReplacementSimulator() {
  // State declarations
  const [pageString, setPageString] = useState('3 4 5 6 3 4 7 3 4 5 6 7 2 4 6');
  const [frameCount, setFrameCount] = useState(3);
  const [algorithm, setAlgorithm] = useState('fifo');
  const [results, setResults] = useState(null);
  const [pages, setPages] = useState([]);
  const [animationStep, setAnimationStep] = useState(-1);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [randomSequenceLength, setRandomSequenceLength] = useState(10);
  const [sequenceType, setSequenceType] = useState('custom');

  // Example presets
  const presets = {
    simple: '1 2 3 4 1 2 5 1 2 3 4 5',
    repeated: '1 2 3 4 1 2 3 4 1 2 3 4',
    localityOfReference: '1 2 3 4 1 2 1 2 5 6 5 6 7 6 7 6',
    thrashing: '1 2 3 4 5 6 7 8 9 1 2 3 4 5'
  };

  // Reset animation when algorithm or results change
  useEffect(() => {
    if (results) {
      setAnimationStep(-1);
      setIsAnimationRunning(false);
    }
  }, [algorithm, results]);

  // Handle animation
  useEffect(() => {
    let timer;
    if (isAnimationRunning && results && results.frameStates && animationStep < results.frameStates.length - 1) {
      timer = setTimeout(() => {
        setAnimationStep(prevStep => prevStep + 1);
      }, animationSpeed);
    } else if (results && results.frameStates && animationStep >= results.frameStates.length - 1) {
      setIsAnimationRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isAnimationRunning, animationStep, results, animationSpeed]);

  // Core functionality
  const handleSimulate = () => {
    const parsedPages = pageString.split(/[\s,]+/).filter(Boolean).map(Number);
    setPages(parsedPages);
    
    let simulationResults;
    switch (algorithm) {
      case 'fifo':
        simulationResults = fifoAlgorithm(parsedPages, frameCount);
        break;
      case 'lru':
        simulationResults = lruAlgorithm(parsedPages, frameCount);
        break;
      case 'optimal':
        simulationResults = optimalAlgorithm(parsedPages, frameCount);
        break;
      default:
        return;
    }
    
    setResults(simulationResults);
    setAnimationStep(-1);
    setIsAnimationRunning(false);
  };

  // Animation controls
  const handleStartAnimation = () => {
    if (results && results.frameStates) {
      if (animationStep >= results.frameStates.length - 1) {
        setAnimationStep(0);
      }
      setIsAnimationRunning(true);
    }
  };

  const handlePauseAnimation = () => {
    setIsAnimationRunning(false);
  };

  const handleStepForward = () => {
    if (results && results.frameStates && animationStep < results.frameStates.length - 1) {
      setAnimationStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (results && results.frameStates && animationStep > 0) {
      setAnimationStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setAnimationStep(-1);
    setIsAnimationRunning(false);
  };

  const handleRandomSequence = () => {
    const length = randomSequenceLength;
    const min = 0;
    const max = 9;
    const randomSeq = Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min).join(' ');
    setPageString(randomSeq);
    setSequenceType('custom');
  };

  const handleLoadPreset = (preset) => {
    setPageString(presets[preset]);
    setSequenceType(preset);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle body class for theme
    document.body.classList.toggle('dark-mode');
  };

  // Calculate hits and hit rate
  let hits = 0;
  let hitRate = 0;
  if (results && results.frameStates && pages && pages.length > 0) {
    hits = results.frameStates.length - results.totalFaults;
    hitRate = ((hits / pages.length) * 100).toFixed(2);
  }

  // Generate current animation frame data
  const currentFrameData = animationStep >= 0 && results && results.frameStates 
    ? results.frameStates[animationStep] 
    : null;

  // Create the table data for visualization
  const getTableData = () => {
    if (!results || !results.frameStates) return { table: [], highlighted: [] };
    
    const table = Array.from({ length: frameCount }, () => Array(pages.length).fill(''));
    const highlighted = Array.from({ length: frameCount }, () => Array(pages.length).fill(false));
    
    results.frameStates.forEach((state, col) => {
      for (let row = 0; row < frameCount; row++) {
        table[row][col] = state.frames[row] !== undefined ? state.frames[row] : '';
        if (state.isFault && state.replacedIndex === row) {
          highlighted[row][col] = true;
        }
      }
    });
    
    return { table, highlighted };
  };

  const tableData = getTableData();

  return (
    <div className={`container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="content">
        {/* Header Section */}
        <div className="card header-card">
          <div className="header">
            <h1>Page Replacement Algorithm Visualizer</h1>
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="input-form-stack">
            {/* First row: Page Reference String controls */}
            <div className="input-row" style={{marginBottom: '1rem'}}>
              <select 
                className="select-input"
                value={sequenceType}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    handleLoadPreset(e.target.value);
                  }
                  setSequenceType(e.target.value);
                }}
                style={{minWidth: '140px'}}
              >
                <option value="custom">Custom Input</option>
                <option value="simple">Simple Sequence</option>
                <option value="repeated">Repeated Pattern</option>
                <option value="localityOfReference">Locality of Reference</option>
                <option value="thrashing">Thrashing Example</option>
              </select>
              <input 
                type="number" 
                min="5" 
                max="50" 
                value={randomSequenceLength} 
                onChange={(e) => setRandomSequenceLength(Number(e.target.value))}
                className="number-input"
                style={{width: '70px'}}
              />
              <button 
                onClick={handleRandomSequence}
                className="primary-button random-btn"
                style={{minWidth: '110px'}}
              >
                <span role="img" aria-label="dice">🎲</span> Random
              </button>
            </div>
            {/* Second row: Frame Size and Algorithm */}
            <div className="input-row" style={{marginBottom: '1rem'}}>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1, marginRight: '1rem'}}>
                <label className="label">Frame Size</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={frameCount}
                  onChange={(e) => setFrameCount(parseInt(e.target.value))}
                  className="input"
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <label className="label">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="select-input"
                >
                  <option value="fifo">FIFO</option>
                  <option value="lru">LRU</option>
                  <option value="optimal">Optimal</option>
                </select>
              </div>
            </div>
            {/* Third row: Textarea */}
            <textarea
              value={pageString}
              onChange={(e) => {
                setPageString(e.target.value);
                setSequenceType('custom');
              }}
              className="textarea-input"
              placeholder="Enter page reference string (e.g., 1 2 3 4 1 2 5)"
              style={{marginBottom: '1.2rem'}}
            />
            {/* Fourth row: Info and Simulate button */}
            <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.2rem'}}>
              <div className="info-header">
                <label className="label">Algorithm Info</label>
                <button 
                  onClick={() => setShowDescription(!showDescription)}
                  className="secondary-button"
                >
                  {showDescription ? 'Hide Info' : 'Show Info'}
                </button>
              </div>
              <button
                onClick={handleSimulate}
                className="primary-button large"
              >
                Simulate
              </button>
            </div>
            {showDescription && (
              <div className="info-box" style={{marginTop: '1rem'}}>
                <h3 className="info-title">{getAlgorithmName(algorithm)}</h3>
                <p>{getAlgorithmDescription(algorithm)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="card results-card">
            <h2 className="section-title">Simulation Results</h2>
            
            {/* Key Stats */}
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Page References</div>
                <div className="stat-value">{pages.length}</div>
              </div>
              
              <div className="stat-box">
                <div className="stat-label">Page Faults</div>
                <div className="stat-value fault">{results.totalFaults}</div>
              </div>
              
              <div className="stat-box">
                <div className="stat-label">Hit Rate</div>
                <div className="stat-value hit">{hitRate}%</div>
              </div>
            </div>
            
            {/* Animation Controls */}
            <div className="controls-section">
              <div className="controls">
                <button
                  onClick={handleReset}
                  className="control-button"
                  disabled={animationStep < 0}
                >
                  Reset
                </button>
                <button
                  onClick={handleStepBackward}
                  className="control-button"
                  disabled={animationStep <= 0}
                >
                  ◀ Prev
                </button>
                {isAnimationRunning ? (
                  <button
                    onClick={handlePauseAnimation}
                    className="primary-button"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={handleStartAnimation}
                    className="primary-button"
                    disabled={!results}
                  >
                    Play ▶
                  </button>
                )}
                <button
                  onClick={handleStepForward}
                  className="control-button"
                  disabled={!results || animationStep >= results.frameStates.length - 1}
                >
                  Next ▶
                </button>
                
                <div className="speed-control">
                  <span>Speed:</span>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={2100 - animationSpeed}
                    onChange={(e) => setAnimationSpeed(2100 - parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
              
              {/* Animation Progress */}
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: results && results.frameStates 
                      ? `${((animationStep + 1) / results.frameStates.length) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {animationStep >= 0 && results && results.frameStates 
                  ? `Step ${animationStep + 1} of ${results.frameStates.length}` 
                  : 'Ready to start'}
              </div>
            </div>
            
            {/* Current Step Visualization */}
            {animationStep >= 0 && currentFrameData && (
              <div className="current-step">
                <h3 className="step-title">Current Step: Processing Page {currentFrameData.page}</h3>
                
                <div className="status-container">
                  <div className={`status-badge ${currentFrameData.isFault ? 'fault' : 'hit'}`}>
                    {currentFrameData.isFault ? 'PAGE FAULT' : 'PAGE HIT'}
                  </div>
                </div>
                
                <div className="frames-container">
                  <div className="frames">
                    {Array.from({ length: frameCount }).map((_, idx) => {
                      const isReplaced = currentFrameData.isFault && currentFrameData.replacedIndex === idx;
                      const frameValue = currentFrameData.frames[idx];
                      
                      return (
                        <div
                          key={idx}
                          className={`frame ${isReplaced ? 'replaced' : ''} ${frameValue !== undefined ? '' : 'empty'}`}
                        >
                          {frameValue !== undefined ? frameValue : '-'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Page Reference Sequence */}
            <div className="reference-sequence">
              <h3 className="sequence-title">Reference Sequence</h3>
              <div className="sequence-container">
                {pages.map((page, idx) => (
                  <div 
                    key={idx}
                    className={`page-box ${animationStep === idx ? 'current' : ''}`}
                  >
                    {page}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Full Visualization Table */}
            <div className="table-container">
              <h3 className="table-title">Full Visualization</h3>
              <table className="viz-table">
                <thead>
                  <tr>
                    <th className="table-header">Frame</th>
                    {pages.map((page, idx) => (
                      <th 
                        key={idx} 
                        className={`table-header ${animationStep === idx ? 'current-column' : ''}`}
                      >
                        {page}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.table.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="table-cell frame-label">
                        Frame {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td 
                          key={cellIdx} 
                          className={`table-cell ${
                            tableData.highlighted[rowIdx][cellIdx] ? 'highlighted' : ''
                          } ${animationStep === cellIdx ? 'current-step' : ''}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="footer">
          © 2025 Page Replacement Algorithm Visualizer
        </div>
      </div>
    </div>
  );
}