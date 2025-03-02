import WaveSurfer from 'wavesurfer.js';
import { WaveFile } from 'wavefile';

// DOM Elements
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const timestampsList = document.getElementById(
  'timestamps-list',
) as HTMLDivElement;
const loadingSpinner = document.getElementById(
  'loading-spinner',
) as HTMLDivElement;
const progressBar = document.getElementById('progress') as HTMLDivElement;
const currentTimeDisplay = document.getElementById(
  'current-time',
) as HTMLSpanElement;
const totalTimeDisplay = document.getElementById(
  'total-time',
) as HTMLSpanElement;
const themeToggle = document.getElementById(
  'theme-toggle',
) as HTMLButtonElement;
const volumeBtn = document.querySelector('.volume-btn') as HTMLButtonElement;
const volumeSlider = document.querySelector(
  '.volume-slider',
) as HTMLInputElement;
const downloadBtn = document.getElementById(
  'download-results',
) as HTMLButtonElement;
const shortcutsBtn = document.getElementById(
  'show-shortcuts',
) as HTMLButtonElement;
const shortcutsModal = document.getElementById(
  'shortcuts-modal',
) as HTMLDivElement;
const closeModalBtn = document.querySelector(
  '.close-modal',
) as HTMLButtonElement;
const zoomInBtn = document.getElementById('zoom-in') as HTMLButtonElement;
const zoomOutBtn = document.getElementById('zoom-out') as HTMLButtonElement;

// Silence detection settings elements
const thresholdInput = document.getElementById('threshold') as HTMLInputElement;
const thresholdValue = document.getElementById(
  'threshold-value',
) as HTMLSpanElement;
const minSilenceInput = document.getElementById(
  'min-silence',
) as HTMLInputElement;
const minSilenceValue = document.getElementById(
  'min-silence-value',
) as HTMLSpanElement;
const mergeThresholdInput = document.getElementById(
  'merge-threshold',
) as HTMLInputElement;
const mergeThresholdValue = document.getElementById(
  'merge-threshold-value',
) as HTMLSpanElement;

// Constants
const ZOOM_STEP = 20;
const SKIP_TIME = 10;
const DEFAULT_VOLUME = 1;

// Create WaveSurfer instance
const ws = WaveSurfer.create({
  container: '.audio',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  backend: 'MediaElement',
  mediaControls: false,
  normalize: true,
  height: 100,
  minPxPerSec: 50,
  interact: true,
});

// Helper function to format time in seconds to MM:SS.mmm
function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Helper function to calculate duration
function calculateDuration(start: number, end: number): string {
  const duration = end - start;
  return `${duration.toFixed(3)}s`;
}

// Theme handling
function setTheme(isDark: boolean) {
  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light',
  );
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme === 'dark');

// Theme toggle
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

// Keyboard shortcuts
function handleKeyPress(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement) return;

  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      ws.playPause();
      break;
    case 'arrowleft':
      ws.skip(-SKIP_TIME);
      break;
    case 'arrowright':
      ws.skip(SKIP_TIME);
      break;
    case 'm':
      toggleMute();
      break;
    case 'd':
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(!isDark);
      break;
  }
}

document.addEventListener('keydown', handleKeyPress);

// Shortcuts modal
shortcutsBtn.addEventListener('click', () => {
  shortcutsModal.classList.add('show');
});

closeModalBtn.addEventListener('click', () => {
  shortcutsModal.classList.remove('show');
});

shortcutsModal.addEventListener('click', (e) => {
  if (e.target === shortcutsModal) {
    shortcutsModal.classList.remove('show');
  }
});

// Volume control
let previousVolume = DEFAULT_VOLUME;

function toggleMute() {
  if (ws.getVolume() > 0) {
    previousVolume = ws.getVolume();
    ws.setVolume(0);
    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    volumeSlider.value = '0';
  } else {
    ws.setVolume(previousVolume);
    updateVolumeIcon(previousVolume);
    volumeSlider.value = (previousVolume * 100).toString();
  }
}

function updateVolumeIcon(volume: number) {
  const icon =
    volume === 0
      ? 'mute'
      : volume < 0.3
      ? 'down'
      : volume < 0.7
      ? 'down'
      : 'up';
  volumeBtn.innerHTML = `<i class="fas fa-volume-${icon}"></i>`;
}

volumeBtn.addEventListener('click', toggleMute);

volumeSlider.addEventListener('input', (e) => {
  const volume = parseFloat((e.target as HTMLInputElement).value) / 100;
  ws.setVolume(volume);
  updateVolumeIcon(volume);
  if (volume > 0) previousVolume = volume;
});

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  const minPxPerSec = ws.options.minPxPerSec || 50;
  ws.setOptions({ minPxPerSec: minPxPerSec + ZOOM_STEP });
});

zoomOutBtn.addEventListener('click', () => {
  const minPxPerSec = ws.options.minPxPerSec || 50;
  ws.setOptions({ minPxPerSec: Math.max(50, minPxPerSec - ZOOM_STEP) });
});

// Progress bar
ws.on('audioprocess', () => {
  const currentTime = ws.getCurrentTime();
  const duration = ws.getDuration();
  const progress = (currentTime / duration) * 100;

  progressBar.style.width = `${progress}%`;
  currentTimeDisplay.textContent = formatTime(currentTime);
  totalTimeDisplay.textContent = formatTime(duration);
});

const progressBarElement = document.querySelector('.progress-bar');
if (progressBarElement) {
  progressBarElement.addEventListener('click', (event: Event) => {
    const e = event as MouseEvent;
    const progressBar = e.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    ws.seekTo(percent);
  });
}

// Settings panel
function updateSilenceSettings() {
  const threshold = parseFloat(thresholdInput.value) / 1000;
  const minSilence = parseFloat(minSilenceInput.value);
  const mergeThreshold = parseFloat(mergeThresholdInput.value);

  thresholdValue.textContent = threshold.toString();
  minSilenceValue.textContent = minSilence.toString();
  mergeThresholdValue.textContent = mergeThreshold.toString();

  if (ws.getDecodedData()) {
    handleAudioDecoding(ws.getDecodedData()!, ws.getDuration());
  }
}

thresholdInput.addEventListener('input', updateSilenceSettings);
minSilenceInput.addEventListener('input', updateSilenceSettings);
mergeThresholdInput.addEventListener('input', updateSilenceSettings);

// Download results
function downloadResults(timestamps: Array<{ start: number; end: number }>) {
  const results = timestamps.map((region, index) => ({
    index: index + 1,
    start: formatTime(region.start),
    end: formatTime(region.end),
    duration: calculateDuration(region.start, region.end),
  }));

  const csv = [
    ['Index', 'Start Time', 'End Time', 'Duration'],
    ...results.map((r) => [r.index, r.start, r.end, r.duration]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'silence_detection_results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event listener for when a file is selected
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files[0];

  // Define accepted audio formats
  const acceptedFormats = [
    'audio/wav',
    'audio/mpeg', // MP3
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
  ];

  if (!file) {
    console.error('No file selected.');
    alert('Please select an audio file.');
    return;
  }

  if (!acceptedFormats.includes(file.type)) {
    console.error('Invalid file format. Please select a supported audio file.');
    alert(
      'Invalid file format. Supported formats are: WAV, MP3, OGG, AAC, and MP4 Audio',
    );
    return;
  }

  // Show loading spinner
  loadingSpinner.classList.remove('hidden');

  // Clear previous results
  timestampsList.innerHTML =
    '<div class="loading">Processing audio file...</div>';

  ws.empty();

  // Create a URL for the file
  const url = URL.createObjectURL(file);

  // Load the audio file into WaveSurfer using the URL
  ws.load(url);

  // Remove any existing event listeners
  const playBtn = document.querySelector('.play-btn');
  const oldPlayBtn = playBtn?.cloneNode(true) as HTMLElement;
  if (playBtn?.parentNode && oldPlayBtn) {
    playBtn.parentNode.replaceChild(oldPlayBtn, playBtn);
  }

  // Add new event listener
  oldPlayBtn?.addEventListener('click', () => {
    ws.playPause();
    if (ws.isPlaying()) {
      oldPlayBtn.classList.add('playing');
    } else {
      oldPlayBtn.classList.remove('playing');
    }
  });

  // Clean up the URL when the audio is loaded
  ws.on('ready', () => {
    loadingSpinner.classList.add('hidden');
    currentTimeDisplay.textContent = '00:00.000';
    totalTimeDisplay.textContent = formatTime(ws.getDuration());
    URL.revokeObjectURL(url);
  });

  // Handle loading errors
  ws.on('destroy', () => {
    loadingSpinner.classList.add('hidden');
    console.error('Error loading audio');
    alert('Error loading audio file. Please try again.');
  });
}

const extractRegions = (audioData: Float32Array, duration: number) => {
  const threshold = parseFloat(thresholdInput.value) / 1000;
  const minSilenceDuration = parseFloat(minSilenceInput.value);
  const mergeDuration = parseFloat(mergeThresholdInput.value);

  const scale = duration / audioData.length;
  const silentRegions = [];

  let start = 0;
  let end = 0;
  let isSilent = false;
  for (let i = 0; i < audioData.length; i++) {
    if (Math.abs(audioData[i]) < threshold) {
      if (!isSilent) {
        start = i;
        isSilent = true;
      }
    } else if (isSilent) {
      end = i;
      isSilent = false;
      if (scale * (end - start) > minSilenceDuration) {
        silentRegions.push({
          start: scale * start,
          end: scale * end,
        });
      }
    }
  }

  const mergedRegions = [];
  let lastRegion = null;
  for (let i = 0; i < silentRegions.length; i++) {
    if (lastRegion && silentRegions[i].start - lastRegion.end < mergeDuration) {
      lastRegion.end = silentRegions[i].end;
    } else {
      lastRegion = silentRegions[i];
      mergedRegions.push(lastRegion);
    }
  }

  return mergedRegions;
};

function handleAudioDecoding(decodedData: AudioBuffer, duration: number) {
  const timestamps = extractRegions(decodedData.getChannelData(0), duration);

  // Clear the loading message
  timestampsList.innerHTML = '';

  if (timestamps.length === 0) {
    timestampsList.innerHTML =
      '<div class="no-results">No silent regions detected</div>';
    return;
  }

  // Display timestamps in the UI
  timestamps.forEach((region, index) => {
    const timestampItem = document.createElement('div');
    timestampItem.className = 'timestamp-item';

    const formattedStart = formatTime(region.start);
    const formattedEnd = formatTime(region.end);
    const duration = calculateDuration(region.start, region.end);

    timestampItem.innerHTML = `
      <div class="time">
        <span class="index">#${index + 1}</span>
        ${formattedStart} - ${formattedEnd}
      </div>
      <div class="duration">${duration}</div>
    `;

    // Add click handler to seek to timestamp
    timestampItem.addEventListener('click', () => {
      ws.seekTo(region.start / ws.getDuration());
    });

    timestampsList.appendChild(timestampItem);
  });

  // Enable download button
  downloadBtn.addEventListener('click', () => downloadResults(timestamps));
}

// Create regions for each non-silent part of the audio
ws.on('decode', (duration) => {
  const decodedData = ws.getDecodedData();
  if (decodedData) {
    handleAudioDecoding(decodedData, duration);
  }
});
