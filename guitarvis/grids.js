// Global variables for shared objects
let cam;
let glassShader;
let song;
let fft;
const gridSize = 15;
const cubeSize = 50;
const BPM = 86; // Default BPM (adjust as needed)

let gridder;    // Visualization module instance
let stepper;    // BPM-based stepping module instance
let chordStepper; // Chord-based stepping module instance

//-----------------------------------------------------
// Gridder Module: Handles visualization and grid creation
//-----------------------------------------------------
class Gridder {
  constructor(shader, gridSize, cubeSize, cam) {
    this.glassShader = shader;
    this.gridSize = gridSize;
    this.cubeSize = cubeSize;
    this.cam = cam;
    this.grids = [];
  }

  // Generate a new grid with random colors and add it to the list
  generateNextGrid() {
    let grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        grid[i][j] = [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255)
        ];
      }
    }
    this.grids.push(grid);
  }

  // Animate the camera moving forward by one cube size along the Z-axis
  stepCamera() {
    let camX = this.cam.eyeX; 
    let camY = this.cam.eyeY; 
    let camZ = this.cam.eyeZ; 
    const stepSize = this.cubeSize;
    const targetZ = camZ + stepSize;
    const duration = 500; // Duration in milliseconds
    const startTime = millis();

    const animate = () => {
      let elapsed = millis() - startTime;
      let progress = constrain(elapsed / duration, 0, 1);
      let newZ = lerp(camZ, targetZ, progress);
      this.cam.setPosition(camX, camY, newZ);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  // This method is called each time a new step is triggered
  step() {
    this.generateNextGrid();
    this.stepCamera();
    // Optionally, you can use FFT data here if needed.
  }

  // Draw a glowing box with the provided fill color using the custom shader
  drawGlowingBox(fillColor) {
    shader(this.glassShader);
    // Normalize the color components from [0,255] to [0,1]
    this.glassShader.setUniform('uFillColor', [
      fillColor[0] / 255,
      fillColor[1] / 255,
      fillColor[2] / 255
    ]);
    box(this.cubeSize);
    resetShader();
  }

  // Draw a single grid of boxes
  drawGrid(grid) {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        push();
        translate(i * this.cubeSize, j * this.cubeSize, 0);
        this.drawGlowingBox(grid[i][j]);
        pop();
      }
    }
  }

  // Draw coordinate axes for reference
  drawAxis() {
    stroke(255, 0, 0); line(-3000, 0, 0, 3000, 0, 0); // X-axis
    stroke(0, 255, 0); line(0, -3000, 0, 0, 3000, 0); // Y-axis
    stroke(0, 0, 255); line(0, 0, -3000, 0, 0, 3000); // Z-axis
    noStroke();
  }

  // Render all the grids on the screen
  draw() {
    // Loop through each generated grid
    for (let g = 0; g < this.grids.length; g++) {
      push();
      this.drawGrid(this.grids[g]);
      pop();
      // Move to the next layer along the Z-axis
      translate(0, 0, this.cubeSize);
    }
  }
}

//-----------------------------------------------------
// Stepper Module: Manages BPM-based timing and triggers new steps
//-----------------------------------------------------
class Stepper {
  constructor(BPM, stepCallback, song) {
    this.BPM = BPM;
    this.stepCallback = stepCallback; // Function to call on each step
    this.song = song;
    this.stepInterval = null;
  }

  // Start the BPM-based stepping: play/pause the song and schedule steps
  start() {
    if (this.song.isPlaying()) {
      this.song.pause();
    } else {
      this.song.play();
    }
    if (this.stepInterval) clearInterval(this.stepInterval);
    const intervalTime = (60 / this.BPM) * 1000;
    this.stepInterval = setInterval(() => {
      this.stepCallback();
    }, intervalTime);
  }

  // Optionally, trigger a manual step
  triggerStep() {
    this.stepCallback();
  }

  // Stop the automatic stepping
  stop() {
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }
}

//-----------------------------------------------------
// ChordStepper Module: Triggers a step whenever a new chord (pluck/strum) is detected
//-----------------------------------------------------
class ChordStepper {
  /**
   * @param {function} stepCallback - Function to call on a chord event.
   * @param {p5.FFT} fft - FFT analyzer to use for peak detection.
   * @param {number} sensitivity - Peak detection sensitivity (default 0.3).
   * @param {number} cooldown - Minimum time (in ms) between triggers to avoid rapid repeats.
   * @song {p5.SoundFile} song - The sound file to analyze for peaks.
   */
  constructor(stepCallback, fft, sensitivity = 0.3, cooldown = 300, song) {
    this.stepCallback = stepCallback;
    this.fft = fft;
    this.sensitivity = sensitivity;
    this.cooldown = cooldown;
    this.lastStepTime = 0;
    // Create a p5.PeakDetect object across the full audible range.
    this.song = song;
    this.peakDetect = new p5.PeakDetect();
  }
  
  toggle() {
    getAudioContext().resume().then(() => {
      if (this.song.isPlaying()) {
        this.song.pause();
      } else {
        this.song.play();
      }
    }).catch(err => {
      console.error(err);
    })
  }

  // Call this method every frame from draw()
  update() {
    let spectrum = this.fft.analyze(); // Ensure FFT data is updated before using it

    this.peakDetect.update(this.fft);

    // Ensure that `getEnergy` is called on `fft`, not `peakDetect`
    let energy = this.fft.getEnergy(1, 240); // Example frequency range

    if (this.peakDetect.isDetected) console.log('peak detected!');

    if (this.peakDetect.isDetected || energy > 150) { // Adjust threshold as needed
      console.log('chord')
      let currentTime = millis();
      if (currentTime - this.lastStepTime > this.cooldown) {
        this.stepCallback();
        this.lastStepTime = currentTime;
      }
    }
  }
}

//-----------------------------------------------------
// p5.js Preload, Setup, and Draw Functions
//-----------------------------------------------------

function preload() {
  // Load the custom shader files and the sound file
  glassShader = loadShader('shaders/glass.vert', 'shaders/glass.frag');
  song = loadSound('./igreja_da_penha.mp3');
}

function setup() {
  createCanvas(800, 800, WEBGL);
  // Set up the camera
  cam = createCamera();
  cam.camera(1728, 800, 1412,
             375, 25, 375,
             1, 0, 0.7);

  lights();
  noStroke();
  blendMode(BLEND); // Enable blending for transparency

  fft = new p5.FFT(0.8, 1024);

  // Initialize modules
  gridder = new Gridder(glassShader, gridSize, cubeSize, cam);

  // Option 1: Use BPM-based stepping
  // stepper = new Stepper(BPM, () => gridder.step(), song);
  // stepper.start();

  // Option 2: Use chord-based stepping (triggered by audio peaks)
  chordStepper = new ChordStepper(() => gridder.step(), fft, 0.3, 300, song);
}

function draw() {
  background(0);
  orbitControl();
  gridder.drawAxis();
  gridder.draw();

  // If using chord stepping, update it each frame.
  if (chordStepper) {
    chordStepper.update();
  }
}

// Allow manual stepping via mouse click (works regardless of stepping mode)
function mouseClicked() {
  chordStepper.toggle();
  // gridder.step();
}
