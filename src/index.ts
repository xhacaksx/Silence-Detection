import WaveSurfer from 'wavesurfer.js';
import { WaveFile } from 'wavefile';
interface AudioProcessingSettings {
  minValue: number;
  minSilenceDuration: number;
  mergeDuration: number;
}
// Specify the input element for file input
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
        console.log(wav);

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
// const form = document.querySelector('#myForm') as HTMLFormElement;
// form?.addEventListener('submit', processAudio);
// function processAudio(event: Event) {
//   event.preventDefault();
//   const minValueInput = document.querySelector(
//     '#minValueInput',
//   ) as HTMLFormElement;
//   //const minValue: number = minValueInput?.value;
//   const minValue: number = parseFloat(minValueInput.value) || 0;
//   const minSilenceDurationInput = document.querySelector(
//     '#minSilenceDurationInput',
//   ) as HTMLFormElement;
//   //const minSilenceDuration = minSilenceDurationInput?.value;
//   const minSilenceDuration: number =
//     parseFloat(minSilenceDurationInput.value) || 0;
//   const mergeDurationInput = document.querySelector(
//     '#mergeDurationInput',
//   ) as HTMLFormElement;
//   //const mergeDuration = mergeDurationInput?.value;
//   const mergeDuration: number = parseFloat(mergeDurationInput.value) || 0;
//   console.log(`${minValue},${mergeDuration},${minSilenceDuration}`);
// }
const extractRegions = (
  audioData: Float32Array,
  duration: number,
  // settings: AudioProcessingSettings,
) => {
  const minValue = 0.025;
  const minSilenceDuration = 0.01;
  const mergeDuration = 0.1;

  //const { minValue, minSilenceDuration, mergeDuration } = settings;
  const scale = duration / audioData.length;
  const silentRegions = [];

  // Find all silent regions longer than minSilenceDuration
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
  // Call your custom function to extract regions or process audio data

  // const settings: AudioProcessingSettings = {
  //   minValue: parseFloat(
  //     (<HTMLInputElement>document.querySelector('minValueInput')).value,
  //   ),
  //   minSilenceDuration: parseFloat(
  //     (<HTMLInputElement>document.querySelector('minSilenceDurationInput'))
  //       .value,
  //   ),
  //   mergeDuration: parseFloat(
  //     (<HTMLInputElement>document.querySelector('mergeDurationInput')).value,
  //   ),
  // };

  const timestamps = extractRegions(
    decodedData.getChannelData(0),
    duration,
    //settings,
  );

  // Log timestamps to console (you can store or use them as needed)
  console.log('Silent Region Timestamps:', timestamps);
}
// Create regions for each non-silent part of the audio
ws.on('decode', (duration) => {
  const decodedData = ws.getDecodedData();
  if (decodedData) {
    //const timestamps = extractRegions(decodedData.getChannelData(0), duration);
    //processAudio(decodedData, duration);
    handleAudioDecoding(decodedData, duration);
    // Log timestamps to console (you can store or use them as needed)
    //console.log('Silent Region Timestamps:', timestamps);

    // Add regions to the waveform
    // timestamps.forEach((timestamp, index) => {
    //   wsRegions.addRegion({
    //     start: timestamp.start,
    //     end: timestamp.end,
    //     content: index.toString(),
    //     drag: false,
    //     resize: false,
    //   });
    // });
  }
});
