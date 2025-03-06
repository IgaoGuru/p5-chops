let soundFile;
let midiEvents = [];  // Array of note events, e.g. { note: "E4", start: 1.23, end: 2.34 }
let basicPitch;       // Instance of the Basic Pitch converter

function preload() {
  // Load your MP3 file containing the guitar solo.
  // Ensure the file is in your project’s directory (or provide a URL).
  soundFile = loadSound('./igreja_da_penha.mp3');
}

async function setup() {
  createCanvas(800, 400);
  background(0);
  textSize(32);
  fill(255);
  
  soundFile.play();
  
  // Get the AudioBuffer from the p5.SoundFile.
  // p5.SoundFile provides the raw AudioBuffer once loaded.
  let audioBuffer = soundFile.buffer;
  
  // Create an instance of Basic Pitch.
  basicPitch = new BasicPitch(bpModel);
  
  // Process the audio buffer with Basic Pitch.
  // The evaluateModel method here is expected to run inference on the entire file.
  // Its callback returns arrays (frames, onsets, contours) that we then convert to note events.
  await basicPitch.evaluateModel(
    audioBuffer,
    (frames, onsets, contours) => {
      // Convert the model output into note events.
      // (The implementation of convertToNoteEvents() will depend on the Basic Pitch output format.)
      midiEvents = convertToNoteEvents(frames, onsets, contours);
      console.log("MIDI events:", midiEvents);
    },
    (progress) => {
      // Optional: log the progress (0 to 1)
      console.log("Processing progress:", progress);
    }
  );
}

// This function converts the model’s raw outputs into a list of note events.
// For this example, we return a dummy array.
// In your actual implementation, use Basic Pitch’s utility functions (like addPitchBendsToNoteEvents, etc.)
function convertToNoteEvents(frames, onsets, contours) {
  // For demonstration, here is a hard-coded example.
  // In practice, you would convert the arrays (frames, onsets, contours) into note events.
  return [
    { note: "E4", start: 0,   end: 1 },
    { note: "G4", start: 1,   end: 2 },
    { note: "B4", start: 2,   end: 3 },
    { note: "E5", start: 3,   end: 4 }
  ];
}

// Helper function that returns an array of note names active at the given time.
function getActiveNotes(events, time) {
  return events.filter(e => time >= e.start && time <= e.end)
               .map(e => e.note);
}

function draw() {
  background(0);
  
  // Get the current playback time of the sound.
  let currentTime = soundFile.currentTime();
  
  // Determine the note(s) active at this moment.
  let activeNotes = getActiveNotes(midiEvents, currentTime);
  
  // Prepare display text. If no note is active, show "Silence".
  let displayText = activeNotes.length > 0 ? activeNotes.join(' + ') : "Silence";
  
  // Display the text at the center of the canvas.
  text(displayText, 50, height / 2);
}