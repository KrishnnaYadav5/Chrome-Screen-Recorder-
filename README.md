# ScreenRecorder

A clean, responsive, and completely client-side screen and audio recorder. This application runs entirely in your web browser with **zero external libraries or CDNs**, meaning your data never leaves your computer, ensuring maximum speed and complete privacy.

---

## 📝 Summary

ScreenRecorder is a single-page utility tool that helps users record their screen displays (desktop, window, browser tab) alongside microphone voiceovers. It features a customizable settings dashboard, a real-time live preview window, and an interactive recordings gallery. The list of recordings supports reordering, inline renaming, fullscreen modal previews, individual downloads, and batch ZIP archiving.

---

## 🌟 Features

* **Custom Quality Presets**: Select from high-definition presets including 1080p at 60 FPS, 1080p at 30 FPS, 720p, and 480p to fit your computer’s performance.
* **Audio Track Mixer**: Automatically merges system/tab audio and microphone voice tracks together in real-time.
* **Always-Visible Navigation Arrows**: Fullscreen player includes left (`<`) and right (`>`) overlay buttons to cycle between recordings. These automatically disable if you only have one video.
* **Keyboard Hotkeys**: Cycle through previews using your keyboard’s **Left Arrow** and **Right Arrow** keys, or close the player with the **Escape** key.
* **Inline Renaming**: Click a recording's title to swap it with a square-corner input field. The text cursor automatically selects the name while leaving out the `.webm` extension for fast typing.
* **Drag-and-Drop Reordering**: Drag recording cards using their grab handle (`≡`) to change their list sequence.
* **Delete Confirmation Modal**: Protects you from deleting recordings by accident with a custom popup window. Deleting a video frees up browser memory automatically.
* **Zero-Library ZIP Downloads**: Package and download all session clips inside a single `.zip` file compiled from scratch using binary JavaScript.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Vanilla CSS3, modern Vanilla JavaScript (ES6+).
* **Browser APIs**:
  * **Screen Capture**: `navigator.mediaDevices.getDisplayMedia`
  * **Microphone Capture**: `navigator.mediaDevices.getUserMedia`
  * **Media Recording**: `MediaRecorder`
  * **Audio Processing**: Web Audio API (`AudioContext`)
  * **File Access**: Object URLs (`URL.createObjectURL`)
  * **Binary Archiving**: `ArrayBuffer` & `DataView`

---

## 📂 Project Structure

The project has a minimalist, three-file architecture:

```
screen-recorder/
├── index.html     # Semantic elements, vector SVG icons, and modal dialogue overlays.
├── style.css      # Design tokens, center layout grid, buttons, and animations.
└── app.js         # Capture states, audio nodes, list management, and binary ZIP packer.
```

---

## ⚙️ How It Works

1. **Media Capture**: The app calls the browser's capture engines to fetch video and audio tracks from the screen.
2. **Audio Mixing**: If the microphone toggle is turned on, the app creates a virtual `AudioContext` and connects both the screen audio track and the microphone audio track into a single destination node to combine them.
3. **Data Recording**: Combined streams are fed into a `MediaRecorder` object, which saves data chunks every second. When stopped, these chunks are combined into a `.webm` file.
4. **Local Archiving**: The ZIP generator reads each file as an `ArrayBuffer` and creates a compliant ZIP file structure. It calculates a standard CRC-32 checksum and writes standard headers directly in the browser's memory.

---

## 🔄 Project Workflow

```mermaid
graph TD
    A[Configure Settings] --> B[Click Start Capture]
    B --> C[Select Screen and Audio Share]
    C --> D[Active Recording State]
    D -->|Pause / Resume| D
    D --> E[Click Stop and Save]
    E --> F[Compile WebM Blob]
    F --> G[Display in Gallery]
    G -->|Drag to Reorder| G
    G -->|Click to Rename| G
    G -->|Click Preview| H[Lightbox Modal]
    H -->|Arrow Keys Navigation| H
    G -->|Click Trash| I[Delete Confirm popup]
    I -->|Yes| J[Free Memory and Remove Card]
    G -->|Download All| K[Compile ZIP and Download]
```

---

## 📸 Screenshots

![ScreenRecorder UI Mockup](./screenshot.jpg)

---

## 🌐 Browser Compatibility

| Browser | Screen Sharing | Mic Mixing | ZIP Compilation | Keybindings |
| :--- | :--- | :--- | :--- | :--- |
| **Google Chrome** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Microsoft Edge** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Mozilla Firefox** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Apple Safari** | ✅ Yes (macOS 13+) | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔮 Future Implementations

* **Drawing Annotations**: Add overlay pens, arrows, and highlighters to draw on the screen while recording.
* **Recording Hotkeys**: Set keyboard combinations (like `Ctrl` + `Alt` + `R`) to quickly start or stop recording.
* **Sound Filters**: Add noise cancellation and echo removal filters directly into the microphone audio node.
* **Alternate Formats**: Add support to export/convert video files into MP4 or MKV formats.

---

## 🎓 Learning Outcomes

* **Audio Mixing Nodes**: Learned how to mix multiple screen and hardware audio inputs together using Web Audio API nodes.
* **Binary File Formatting**: Gained experience working with `ArrayBuffers`, `DataViews`, and calculating CRC-32 tables to build valid ZIP archives client-side.
* **DOM State Syncing**: Learned to build drag-and-drop lists, inline text fields, and modals in pure JavaScript without relying on libraries like React or jQuery.
* **Responsive Styling**: Standardized spacing, flexboxes, and media queries to center layouts and prevent text cutoff bugs.

---

## 👤 Author

* **Krishna Yadav**
