# Video link
Click Here 👉 https://youtu.be/nPXXOz-qQys?si=f5qsVCiSbX3l6HH0

---

# Hosted link
Click Here 👉 https://chrome-screen-recorder-gamma.vercel.app/

---

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
* **ZIP Downloads**: download all recorded video inside a single `.zip` file compiled from scratch using binary JavaScript.

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

## 📸 Implementaion Screenshots

## Step: 1 Select the quality of the video you want to record.
<img width="929" height="460" alt="Select the quality of the video you want to record" src="https://github.com/user-attachments/assets/5d62c488-60ba-467c-aa6e-46d78ea62251" />

## Step: 2 Select whether you want to record audio.
<img width="928" height="462" alt="Select whether you want to record audio" src="https://github.com/user-attachments/assets/9a158dfd-7559-47e8-ac25-850a51b1fd94" />

## Step: 3 Click "Start Capture" to start recording.
<img width="928" height="462" alt="Click _Start Capture_ to start recording" src="https://github.com/user-attachments/assets/3f651f5c-fb88-40e2-924f-91b4d1d37696" />

## Step: 4 choose which table whould you like to record.
<img width="884" height="471" alt="choose which table whould you like to record" src="https://github.com/user-attachments/assets/d009d02d-89d2-4126-a135-731f0d89915f" />

## Step: 5 Allow microphone access.
<img width="982" height="471" alt="Allow microphone access" src="https://github.com/user-attachments/assets/0125cd4e-b81c-4f68-a711-7ef069990e86" />

## Step: 6 Click "Pause" to pause your screen recording.
<img width="932" height="457" alt="Click _Pause_ to pause your screen recording" src="https://github.com/user-attachments/assets/5b14f6d7-852c-4f8c-9b93-6c7d66cce6a0" />

## Step: 7 Click "Resume" to Resume your screen recording
<img width="934" height="464" alt="Click _Resume_ to Resume your screen recording" src="https://github.com/user-attachments/assets/b48f90ed-b738-448d-801a-9d9d9942d72f" />

## Step: 8 Click "Stop & Save" to Save your screen recording.
<img width="934" height="464" alt="Click _Stop   Save_ to Save your screen recording" src="https://github.com/user-attachments/assets/38847102-782a-40c4-89de-470bdfff73d7" />

## Step: 9 Double-click the video title to rename the recorded video.
<img width="926" height="460" alt="Double-click the video title to rename the recorded video" src="https://github.com/user-attachments/assets/cb7f1155-9839-4916-8839-43a1428ae805" />

## Step: 10 Click and drag the hamburger icon to rearrange the videos.
<img width="929" height="457" alt="Click and drag the hamburger icon to rearrange the videos" src="https://github.com/user-attachments/assets/e96ba940-cfdc-4418-b9fd-92503e37c9dd" />

## Step: 11 Click "Preview" to view your recorded video
<img width="929" height="457" alt="Click _Preview_ to view your recorded video" src="https://github.com/user-attachments/assets/fa31ae6c-a8c2-4aa6-830a-2c03409527c1" />

## Step: 12 Click the Left Navigation button to navigate left or Right.
<img width="926" height="466" alt="Click the Left Navigation button to navigate" src="https://github.com/user-attachments/assets/5c727a75-f72f-48ab-8d2c-988e49f833e3" />

## Step: 13 Click "Download" to Download your recorded video.
<img width="929" height="457" alt="Click _Download_ to Download your recorded video" src="https://github.com/user-attachments/assets/580f2f28-e2bb-476f-bce7-3d1c962bddfe" />

## Step: 14 Click "Delete" to Delete your recorded video.
<img width="929" height="457" alt="Click _Delete_ to Delete your recorded video" src="https://github.com/user-attachments/assets/867ee187-ac50-4d52-bc83-90591ba5da3e" />

## Step: 15 Click "Delete" to Conform Delete your recorded video.
<img width="920" height="443" alt="Click _Delete_ to Conform Delete your recorded video" src="https://github.com/user-attachments/assets/38181173-f0e2-40e7-a053-629676cad823" />

## Step: 16 Click "Download All as ZIP" to download all your recordings as a single ZIP file.
<img width="929" height="457" alt="Click _Download All as ZIP_ to download all your recordings as a single ZIP file" src="https://github.com/user-attachments/assets/849026d4-93bd-4666-b2dd-faa277dab8df" />


---

## 🌐 Testing (Browser Compatibility)

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
