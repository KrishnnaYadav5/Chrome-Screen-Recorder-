// ScreenRecorder - Application Logic

// State management
let screenStream = null;
let micStream = null;
let mixedStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let audioContext = null;

let timerInterval = null;
let secondsElapsed = 0;
let isPaused = false;
let sessionRecordings = [];

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const activeControls = document.getElementById('activeControls');

const previewVideo = document.getElementById('previewVideo');
const playbackVideo = document.getElementById('playbackVideo');
const viewportPlaceholder = document.getElementById('viewportPlaceholder');
const recordingOverlay = document.getElementById('recordingOverlay');
const recordingTimer = document.getElementById('recordingTimer');
const recIndicatorText = document.getElementById('recIndicatorText');

const qualitySelect = document.getElementById('qualitySelect');
const micToggle = document.getElementById('micToggle');
const recordingsList = document.getElementById('recordingsList');
const listEmptyState = document.getElementById('listEmptyState');
const libraryFooter = document.getElementById('libraryFooter');
const downloadAllZipBtn = document.getElementById('downloadAllZipBtn');
const systemStatusDot = document.getElementById('systemStatusDot');
const systemStatusText = document.getElementById('systemStatusText');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Fullscreen Video Preview Modal DOM elements
const videoModal = document.getElementById('videoModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalVideo = document.getElementById('modalVideo');
const modalPlayIndicator = document.getElementById('modalPlayIndicator');
const prevVideoBtn = document.getElementById('prevVideoBtn');
const nextVideoBtn = document.getElementById('nextVideoBtn');
let activePreviewIndex = -1;

// Custom Delete Confirmation Modal elements
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
let activeDeleteId = null;

// Quality profiles definitions
const QUALITY_PROFILES = {
  '1080p60': { width: 1920, height: 1080, frameRate: 60 },
  '1080p30': { width: 1920, height: 1080, frameRate: 30 },
  '720p30': { width: 1280, height: 720, frameRate: 30 },
  '480p30': { width: 854, height: 480, frameRate: 30 }
};

// Event Listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
pauseBtn.addEventListener('click', pauseRecording);
resumeBtn.addEventListener('click', resumeRecording);

// Drag over sorting logic for recordings list
recordingsList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const draggingItem = document.querySelector('.dragging');
  if (!draggingItem) return;
  const siblings = [...recordingsList.querySelectorAll('.recording-item:not(.dragging)')];
  const nextSibling = siblings.find(sibling => {
    const box = sibling.getBoundingClientRect();
    const offset = e.clientY - box.top - box.height / 2;
    return offset < 0;
  });
  recordingsList.insertBefore(draggingItem, nextSibling);
});

// Helper: Show custom toast message
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// Helper: Format file size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper: Format Time Duration (seconds to HH:MM:SS)
function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map(v => v < 10 ? '0' + v : v).join(':');
}

// Timer Controls
function startTimer() {
  secondsElapsed = 0;
  recordingTimer.textContent = formatTime(secondsElapsed);
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      secondsElapsed++;
      recordingTimer.textContent = formatTime(secondsElapsed);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Main functionality: Start Capture & Mix streams
async function startRecording() {
  recordedChunks = [];
  isPaused = false;

  try {
    const profile = QUALITY_PROFILES[qualitySelect.value] || QUALITY_PROFILES['1080p30'];
    
    // 1. Get screen stream (video + system audio if selected by user)
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: profile.width,
        height: profile.height,
        frameRate: profile.frameRate
      },
      audio: true // Prompt screen audio capture if Chrome supports it
    });

    // Handle user stopping screen share from standard Chrome overlay
    const videoTrack = screenStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        showToast('Screen share ended by system.');
        stopRecording();
      };
    }

    // 2. Get mic stream (if toggled)
    if (micToggle.checked) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (micErr) {
        console.warn('Microphone capture failed or was denied:', micErr);
        showToast('Microphone access denied. Recording screen only.');
        micStream = null;
      }
    }

    // 3. Audio Mixing using Web Audio API
    let finalAudioTrack = null;
    const screenAudioTracks = screenStream.getAudioTracks();
    const micAudioTracks = micStream ? micStream.getAudioTracks() : [];

    if (screenAudioTracks.length > 0 && micAudioTracks.length > 0) {
      // Both audio sources are present, mix them together
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const screenSource = audioContext.createMediaStreamSource(new MediaStream([screenAudioTracks[0]]));
      const micSource = audioContext.createMediaStreamSource(new MediaStream([micAudioTracks[0]]));
      const destination = audioContext.createMediaStreamDestination();
      
      screenSource.connect(destination);
      micSource.connect(destination);
      
      finalAudioTrack = destination.stream.getAudioTracks()[0];
      console.log('Audio sources mixed successfully.');
    } else if (screenAudioTracks.length > 0) {
      // Only screen audio is present
      finalAudioTrack = screenAudioTracks[0];
    } else if (micAudioTracks.length > 0) {
      // Only microphone audio is present
      finalAudioTrack = micAudioTracks[0];
    }

    // 4. Create output combined MediaStream
    const combinedTracks = [];
    if (videoTrack) combinedTracks.push(videoTrack);
    if (finalAudioTrack) combinedTracks.push(finalAudioTrack);
    mixedStream = new MediaStream(combinedTracks);

    // Set Live Preview source
    previewVideo.srcObject = screenStream;
    previewVideo.classList.remove('hidden');
    viewportPlaceholder.classList.add('hidden');
    playbackVideo.classList.add('hidden');
    recordingOverlay.classList.remove('hidden');

    // 5. Initialize MediaRecorder
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
    }
    
    mediaRecorder = new MediaRecorder(mixedStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      saveRecording();
      cleanupStreams();
    };

    // Start recording chunks in slices (e.g. every 1 second)
    mediaRecorder.start(1000);
    startTimer();

    // Update UI states
    startBtn.classList.add('hidden');
    activeControls.classList.remove('hidden');
    pauseBtn.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
    
    if (systemStatusDot) systemStatusDot.className = 'status-indicator recording';
    if (systemStatusText) systemStatusText.textContent = 'Recording Screen';
    recIndicatorText.textContent = 'RECORDING';

    showToast('Screen Recording started!');

  } catch (err) {
    console.error('Error starting capture stream:', err);
    showToast('Could not start capture: ' + err.message);
    cleanupStreams();
  }
}

// Pause Recording
function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    isPaused = true;
    
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    
    if (systemStatusDot) systemStatusDot.className = 'status-indicator paused';
    if (systemStatusText) systemStatusText.textContent = 'Recording Paused';
    recIndicatorText.textContent = 'PAUSED';
    
    showToast('Recording paused.');
  }
}

// Resume Recording
function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    isPaused = false;
    
    resumeBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    
    if (systemStatusDot) systemStatusDot.className = 'status-indicator recording';
    if (systemStatusText) systemStatusText.textContent = 'Recording Screen';
    recIndicatorText.textContent = 'RECORDING';
    
    showToast('Recording resumed.');
  }
}

// Stop Recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    stopTimer();
    showToast('Recording completed! Processing...');
  }
}

// Save and export final recording blob
function saveRecording() {
  if (recordedChunks.length === 0) return;

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const videoUrl = URL.createObjectURL(blob);

  // Generate metadata
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10);
  const timeStr = timestamp.toTimeString().slice(0, 5).replace(':', '-');
  const filename = `ScreenRecord_${dateStr}_${timeStr}.webm`;
  const formattedDuration = formatTime(secondsElapsed);
  const formattedSize = formatBytes(blob.size);

  const recordingObject = {
    id: 'rec_' + Date.now(),
    blob: blob,
    url: videoUrl,
    name: filename,
    duration: formattedDuration,
    size: formattedSize,
    date: timestamp.toLocaleTimeString()
  };

  sessionRecordings.unshift(recordingObject);
  renderLibrary();

  // Load recording into playback player
  previewVideo.classList.add('hidden');
  playbackVideo.src = videoUrl;
  playbackVideo.classList.remove('hidden');
  recordingOverlay.classList.add('hidden');
}

// Render recordings list panel
function renderLibrary() {
  recordingsList.innerHTML = '';

  if (sessionRecordings.length === 0) {
    listEmptyState.classList.remove('hidden');
    if (libraryFooter) libraryFooter.classList.add('hidden');
    return;
  }

  listEmptyState.classList.add('hidden');
  if (libraryFooter) libraryFooter.classList.remove('hidden');

  sessionRecordings.forEach((rec) => {
    const item = document.createElement('div');
    item.className = 'recording-item';
    item.setAttribute('draggable', 'true');
    item.setAttribute('data-id', rec.id);
    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </div>
      <div class="item-content">
        <div class="item-info">
          <span class="item-title" title="${rec.name}">${rec.name}</span>
          <div class="item-meta">
            <span style="display: inline-flex; align-items: center;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="margin-right: 4px; color: #000000;">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
              ${rec.duration}
            </span>
            <span style="display: inline-flex; align-items: center;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="margin-right: 4px; color: #000000;">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              ${rec.size}
            </span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary play-btn" data-id="${rec.id}">
            Preview
          </button>
          <a href="${rec.url}" download="${rec.name}" class="btn btn-sm btn-outline download-btn">
            Download
          </a>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${rec.id}" title="Delete recording">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Title rename click listener
    const titleSpan = item.querySelector('.item-title');
    titleSpan.addEventListener('click', () => {
      if (item.querySelector('.item-title-input')) return;
      
      const originalName = rec.name;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'item-title-input';
      input.value = originalName;
      
      titleSpan.replaceWith(input);
      input.focus();
      
      const dotIndex = originalName.lastIndexOf('.');
      if (dotIndex > 0) {
        input.setSelectionRange(0, dotIndex);
      } else {
        input.select();
      }
      
      let isSaved = false;
      const saveRename = () => {
        if (isSaved) return;
        isSaved = true;
        
        let newName = input.value.trim();
        if (!newName) {
          newName = originalName;
        }
        if (!newName.toLowerCase().endsWith('.webm')) {
          newName += '.webm';
        }
        
        rec.name = newName;
        titleSpan.textContent = newName;
        titleSpan.title = newName;
        input.replaceWith(titleSpan);
        
        const downloadBtn = item.querySelector('.download-btn');
        if (downloadBtn) {
          downloadBtn.setAttribute('download', newName);
        }
        
        showToast('Recording renamed');
      };
      
      input.addEventListener('blur', saveRename);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveRename();
        } else if (e.key === 'Escape') {
          isSaved = true;
          input.replaceWith(titleSpan);
        }
      });
    });

    // Delete recording click listener
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeDeleteId = rec.id;
      if (deleteModal) deleteModal.classList.remove('hidden');
    });

    // Drag and drop event listeners for this item
    item.addEventListener('dragstart', (e) => {
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', rec.id);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      
      // Update sessionRecordings state array based on current DOM order
      const currentDOMItems = [...recordingsList.querySelectorAll('.recording-item')];
      const reordered = currentDOMItems.map(domItem => {
        const id = domItem.getAttribute('data-id');
        return sessionRecordings.find(r => r.id === id);
      }).filter(Boolean);
      sessionRecordings = reordered;
      showToast('Recordings list reordered!');
    });

    recordingsList.appendChild(item);
  });

  // Attach preview events
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const rec = sessionRecordings.find(r => r.id === id);
      if (rec) {
        openVideoModal(rec.url, rec.name);
      }
    });
  });
}

// Release media streams and close contexts
function cleanupStreams() {
  // Stop all capture tracks
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (mixedStream) {
    mixedStream.getTracks().forEach(track => track.stop());
    mixedStream = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }

  // Restore UI settings
  startBtn.classList.remove('hidden');
  activeControls.classList.add('hidden');
  previewVideo.srcObject = null;
  
  if (systemStatusDot) systemStatusDot.className = 'status-indicator idle';
  if (systemStatusText) systemStatusText.textContent = 'Ready to Record';
}

// Fullscreen Video Preview Modal control functions
let indicatorTimeout = null;

function openVideoModal(url, name) {
  modalVideo.src = url;
  videoModal.classList.remove('hidden');
  
  activePreviewIndex = sessionRecordings.findIndex(r => r.url === url);

  if (sessionRecordings.length <= 1) {
    prevVideoBtn.disabled = true;
    nextVideoBtn.disabled = true;
  } else {
    prevVideoBtn.disabled = false;
    nextVideoBtn.disabled = false;
  }

  // Start in paused state showing the play indicator
  modalVideo.pause();
  modalVideo.currentTime = 0;
  updatePlayIndicatorState(false);

  showToast(`Previewing ${name}`);
}

function closeVideoModal() {
  modalVideo.pause();
  modalVideo.src = '';
  videoModal.classList.add('hidden');
  activePreviewIndex = -1;
}

function navigatePreview(direction) {
  if (sessionRecordings.length <= 1) return;
  
  activePreviewIndex = (activePreviewIndex + direction + sessionRecordings.length) % sessionRecordings.length;
  const rec = sessionRecordings[activePreviewIndex];
  if (rec) {
    modalVideo.src = rec.url;
    modalVideo.pause();
    modalVideo.currentTime = 0;
    updatePlayIndicatorState(false);
    showToast(`Previewing ${rec.name}`);
  }
}

function fadeOutIndicator() {
  if (indicatorTimeout) clearTimeout(indicatorTimeout);
  indicatorTimeout = setTimeout(() => {
    modalPlayIndicator.classList.add('hidden-indicator');
  }, 800);
}

function updatePlayIndicatorState(isPlaying) {
  const playIcon = modalPlayIndicator.querySelector('.play-svg');
  const pauseIcon = modalPlayIndicator.querySelector('.pause-svg');

  if (isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    modalPlayIndicator.classList.add('indicator-pause');
    modalPlayIndicator.classList.remove('indicator-play');
    modalPlayIndicator.classList.remove('hidden-indicator');
    fadeOutIndicator();
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    modalPlayIndicator.classList.add('indicator-play');
    modalPlayIndicator.classList.remove('indicator-pause');
    modalPlayIndicator.classList.remove('hidden-indicator');
    if (indicatorTimeout) clearTimeout(indicatorTimeout);
  }
}

// Modal Interaction Event Listeners
modalCloseBtn.addEventListener('click', closeVideoModal);

// Navigation arrows click events
prevVideoBtn.addEventListener('click', () => navigatePreview(-1));
nextVideoBtn.addEventListener('click', () => navigatePreview(1));

// Close on background click
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    closeVideoModal();
  }
});

// Play / Pause video on click
modalVideo.addEventListener('click', () => {
  if (modalVideo.paused) {
    modalVideo.play();
    updatePlayIndicatorState(true);
  } else {
    modalVideo.pause();
    updatePlayIndicatorState(false);
  }
});

// Key down event handler for Escape and Arrow navigation
window.addEventListener('keydown', (e) => {
  if (!videoModal.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeVideoModal();
    } else if (e.key === 'ArrowLeft') {
      navigatePreview(-1);
    } else if (e.key === 'ArrowRight') {
      navigatePreview(1);
    }
  }
});

// Download all recordings as a single ZIP file
downloadAllZipBtn.addEventListener('click', async () => {
  if (sessionRecordings.length === 0) {
    showToast('No recordings to download!');
    return;
  }
  
  try {
    showToast('Generating ZIP file... Please wait');
    downloadAllZipBtn.disabled = true;
    downloadAllZipBtn.textContent = 'Generating ZIP...';

    const zipBlob = await createZipBlob(sessionRecordings);
    
    // Create a temporary link to download the zip file
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScreenRecordings_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ZIP file downloaded successfully!');
  } catch (err) {
    console.error('Error generating ZIP archive:', err);
    showToast('Failed to create ZIP file: ' + err.message);
  } finally {
    downloadAllZipBtn.disabled = false;
    downloadAllZipBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right: 6px; transform: translateY(1px);">
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
      </svg>
      Download All as ZIP
    `;
  }
});

// Pure JS Zip Archive Generator (STORE mode)
async function createZipBlob(recordings) {
  // Precompute CRC-32 Lookup Table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function calculateCrc32(arrayBuffer) {
    const uint8 = new Uint8Array(arrayBuffer);
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < uint8.length; i++) {
      crc = crcTable[(crc ^ uint8[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const files = [];
  for (const rec of recordings) {
    const buffer = await rec.blob.arrayBuffer();
    const data = new Uint8Array(buffer);
    const crc = calculateCrc32(buffer);
    files.push({
      name: rec.name,
      data: data,
      crc: crc,
      size: data.length
    });
  }

  const localHeadersAndData = [];
  const centralDirHeaders = [];
  let currentOffset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const localHeaderSize = 30 + nameBytes.length;
    const totalLocalSize = localHeaderSize + file.size;
    
    const buffer = new ArrayBuffer(localHeaderSize);
    const view = new DataView(buffer);

    // Write Local File Header fields
    view.setUint32(0, 0x04034b50, true); // signature
    view.setUint16(4, 10, true);         // version needed to extract
    view.setUint16(6, 0, true);          // flags
    view.setUint16(8, 0, true);          // compression (0 = STORE)
    view.setUint16(10, 0, true);         // time
    view.setUint16(12, 0, true);         // date
    view.setUint32(14, file.crc, true);  // crc
    view.setUint32(18, file.size, true); // compressed size
    view.setUint32(22, file.size, true); // uncompressed size
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);         // extra field len

    const headerBytes = new Uint8Array(buffer);
    headerBytes.set(nameBytes, 30);

    // Store local header bytes followed by raw data
    localHeadersAndData.push(headerBytes);
    localHeadersAndData.push(file.data);

    // Save metadata for Central Directory Header
    centralDirHeaders.push({
      nameBytes: nameBytes,
      crc: file.crc,
      size: file.size,
      offset: currentOffset
    });

    currentOffset += totalLocalSize;
  }

  const startOfCentralDir = currentOffset;
  const centralDirParts = [];
  let centralDirSize = 0;

  for (const cdf of centralDirHeaders) {
    const cdfHeaderSize = 46 + cdf.nameBytes.length;
    const buffer = new ArrayBuffer(cdfHeaderSize);
    const view = new DataView(buffer);

    // Write Central Directory File Header fields
    view.setUint32(0, 0x02014b50, true);  // signature
    view.setUint16(4, 20, true);          // version made by
    view.setUint16(6, 10, true);          // version needed to extract
    view.setUint16(8, 0, true);           // flags
    view.setUint16(10, 0, true);          // compression
    view.setUint16(12, 0, true);          // time
    view.setUint16(14, 0, true);          // date
    view.setUint32(16, cdf.crc, true);    // crc
    view.setUint32(20, cdf.size, true);   // compressed size
    view.setUint32(24, cdf.size, true);   // uncompressed size
    view.setUint16(28, cdf.nameBytes.length, true);
    view.setUint16(30, 0, true);          // extra field len
    view.setUint16(32, 0, true);          // comment len
    view.setUint16(34, 0, true);          // disk start
    view.setUint16(36, 0, true);          // internal attrs
    view.setUint32(38, 0, true);          // external attrs
    view.setUint32(42, cdf.offset, true); // offset of local header

    const headerBytes = new Uint8Array(buffer);
    headerBytes.set(cdf.nameBytes, 46);

    centralDirParts.push(headerBytes);
    centralDirSize += cdfHeaderSize;
  }

  // Write End of Central Directory (EOCD)
  const eocdBuffer = new ArrayBuffer(22);
  const eocdView = new DataView(eocdBuffer);

  eocdView.setUint32(0, 0x06054b50, true);      // signature
  eocdView.setUint16(4, 0, true);               // disk index
  eocdView.setUint16(6, 0, true);               // central dir disk index
  eocdView.setUint16(8, files.length, true);    // entries on this disk
  eocdView.setUint16(10, files.length, true);   // total entries
  eocdView.setUint32(12, centralDirSize, true); // central dir size
  eocdView.setUint32(16, startOfCentralDir, true); // central dir offset
  eocdView.setUint16(20, 0, true);              // comment length

  const eocdBytes = new Uint8Array(eocdBuffer);

  // Concatenate parts into final Zip Blob
  const finalParts = [...localHeadersAndData, ...centralDirParts, eocdBytes];
  return new Blob(finalParts, { type: 'application/zip' });
}

// Delete Modal Action Event Handlers
cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  activeDeleteId = null;
});

// Close delete modal on background click
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    deleteModal.classList.add('hidden');
    activeDeleteId = null;
  }
});

// Confirm deletion handler
confirmDeleteBtn.addEventListener('click', () => {
  if (activeDeleteId) {
    const recToDelete = sessionRecordings.find(r => r.id === activeDeleteId);
    if (recToDelete) {
      URL.revokeObjectURL(recToDelete.url);
    }
    
    sessionRecordings = sessionRecordings.filter(r => r.id !== activeDeleteId);
    
    deleteModal.classList.add('hidden');
    activeDeleteId = null;
    
    renderLibrary();
    showToast('Recording deleted successfully');
  }
});

// Close delete modal on Escape key press
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
    deleteModal.classList.add('hidden');
    activeDeleteId = null;
  }
});
