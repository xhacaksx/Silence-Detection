import WaveSurfer from 'wavesurfer.js';
import { WaveFile } from 'wavefile';

//input element for file input
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

// Create WaveSurfer instance
const ws = WaveSurfer.create({
  container: '.audio',
  waveColor: '#4F4A85',
  progressColor: '#383351',
});

// Event listener for when a file is selected
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files[0];

  if (file) {
    // Use FileReader to read the file as an ArrayBuffer
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        // Create a Uint8Array from the ArrayBuffer
        const uint8Array = new Uint8Array(e.target.result);

        // Create a WaveFile instance with the Uint8Array
        let wav = new WaveFile(uint8Array);

        // Now you can work with the 'wav' object as needed
        //console.log(wav);

        // Convert the Uint8Array to a Blob
        const blob = new Blob([uint8Array], { type: 'audio/wav' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Load the audio file into WaveSurfer using the URL
        ws.load(url);
      }
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  }
}

const playBtn = document.querySelector('.play-btn');

playBtn?.addEventListener('click', () => {
  ws.playPause();

  if (ws.isPlaying()) {
    playBtn?.classList.add('playing');
  } else {
    playBtn?.classList.remove('playing');
  }
});

const extractRegions = (audioData: Float32Array, duration: number) => {
  const minValue = 0.025; // Minimum amplitude threshold for silence detection
  const minSilenceDuration = 0.01; // Minimum duration of silent regions
  const mergeDuration = 0.1; // Maximum gap duration to merge adjacent silent regions

  const scale = duration / audioData.length;
  const silentRegions = [];

  // Find all silent regions longer than minSilenceDuration
  // The function iterates through the audio data, identifying the start and end indices of silent regions based on the
  // minValue threshold.
  // When a silent region is detected, it checks if its duration (scaled to time) is greater than minSilenceDuration. If
  // yes, it records the region in the silentRegions array.

  let start = 0;
  let end = 0;
  let isSilent = false;
  for (let i = 0; i < audioData.length; i++) {
    if (audioData[i] < minValue) {
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

  // Merge silent regions that are close together
  // The function then iterates through the detected silent regions and merges adjacent ones if the gap between them is
  // smaller than mergeDuration. This step helps to avoid splitting long pauses into multiple shorter ones.
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

  // Record timestamps of silent regions
  return mergedRegions;
};

function handleAudioDecoding(decodedData: AudioBuffer, duration: number) {
  const timestamps = extractRegions(decodedData.getChannelData(0), duration);

  // Log timestamps to console
  console.log('Silent Region Timestamps:', timestamps);
}
// Create regions for each non-silent part of the audio
ws.on('decode', (duration) => {
  const decodedData = ws.getDecodedData();
  if (decodedData) {
    handleAudioDecoding(decodedData, duration);
  }
});
