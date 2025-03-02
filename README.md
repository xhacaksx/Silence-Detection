# Audio Silence Detection

A modern web application that processes audio files, visualizes waveforms, and identifies silent regions in the audio. The application supports multiple audio formats and provides an interactive, feature-rich interface with dark mode support.

## Features

### Audio Support

- Multiple format support:
  - WAV (audio/wav)
  - MP3 (audio/mpeg)
  - OGG (audio/ogg)
  - AAC (audio/aac)
  - MP4 Audio (audio/mp4)

### Interactive Audio Controls

- Play/Pause with visual feedback
- Forward/Rewind buttons (10s skip)
- Interactive progress bar with seeking
- Real-time time display
- Volume control with mute option
- Waveform zoom controls
- Responsive waveform visualization

### Silence Detection

- Real-time silence detection
- Configurable parameters:
  - Silence threshold
  - Minimum silence duration
  - Merge threshold for adjacent regions
- Interactive timestamps list
- Click timestamps to seek
- Download results as CSV

### User Interface

- Dark/Light theme toggle
- Loading indicators
- Keyboard shortcuts
- Modern, responsive design
- Interactive waveform
- Visual feedback for all actions

### Keyboard Shortcuts

- **Space**: Play/Pause
- **←**: Rewind 10s
- **→**: Forward 10s
- **M**: Mute/Unmute
- **D**: Toggle Dark Mode

## Installation

1. Clone the repository:

```bash
git clone https://github.com/xhacaksx/Silence-Detection.git
cd Silence-Detection
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to:

```
http://localhost:8080
```

## Usage

1. **Upload Audio**

   - Click "Choose an audio file" or drag and drop
   - Supported formats: WAV, MP3, OGG, AAC, MP4 Audio

2. **Audio Playback**

   - Use play/pause button or Space key
   - Click on waveform to seek
   - Use forward/rewind buttons or arrow keys
   - Adjust volume with slider or M key
   - Zoom in/out with + and - buttons

3. **Silence Detection**

   - Adjust detection parameters:
     - Silence Threshold: Minimum amplitude to consider as silence
     - Minimum Silence Duration: Shortest silence to detect
     - Merge Threshold: Maximum gap to merge adjacent silences
   - Results update in real-time
   - Click on timestamps to seek to that position
   - Download results as CSV

4. **Theme**
   - Toggle between dark/light mode with theme button
   - Use D key as shortcut
   - Theme preference is saved

## Technical Details

- Built with TypeScript for type safety
- Uses WaveSurfer.js v7 for audio visualization
- Custom silence detection algorithm
- Local storage for theme preference
- Responsive design with CSS variables
- Shadow DOM for style isolation

### Default Parameters

- Silence Threshold: 0.025 (-25dB)
- Minimum Silence Duration: 0.01 seconds
- Merge Threshold: 0.1 seconds
- Initial zoom level: 50 pixels per second

## Dependencies

- WaveSurfer.js v7: Audio visualization
- TypeScript: Type-safe JavaScript
- Snowpack: Development server and build tool
- Font Awesome: UI icons

## Development

To build for production:

```bash
npm run build
```

The build output will be in the `build/` directory.

## Contributing

Feel free to open issues or submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.
