# Objective:

Develop an application that processes a μ-law (mulaw) encoded audio file, identifies
pauses in speech, and records the timestamps of these pauses in milliseconds

# Task Description:

1. Read a μ-law Encoded Audio File:

- Your application should be able to read an input file that is encoded in the μ-law format

2. Process Audio Data:

- Implement an algorithm to process the audio stream and detect pauses in speech.
- A pause in speech can be defined as a continuous segment of audio below a certainamplitude threshold. You can define a reasonable threshold based on the audio characteristics.

3. Timestamp Recording:

- Record the timestamps of these pauses in a human-readable format.
- Timestamps should be precise to the millisecond (e.g., a pause from 1,950 ms to 2,100 ms).

4. Output:

- The program should output a list of timestamps indicating the start and end of each pause.
- This output can be printed to the console or written to a file, based on your preference.

# Features:

- User is able to upload audio files(supports μ-law encoded audio files).
- User is able to see the visualization of the audio waves.
- User is able to see in the console the timestamps when the pauses are detected(Contains both start and end time).

## Installation

To start this project run

```
git clone https://github.com/xhacaksx/Silence-Detection.git
cd Silence-Detection
npm install
npm start
```

## Dependencies

List of npm packages used in this project:

- **[WaveSurfer.js](https://www.npmjs.com/package/wavesurfer.js):** A JavaScript library for creating interactive audio waveforms.
- **[WaveFile](https://www.npmjs.com/package/wavefile):** A library for working with WAV audio files.
