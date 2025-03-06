// Global variables for shared objects
let cam;
let glassShader;
let song;
let fft;
const gridSize = 15;
const cubeSize = 50;
const BPM = 86; // Default BPM (adjust as needed)

let gridder; // Visualization module instance
let stepper; // Timing module instance

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
    // Optionally, you could use fft.analyze() here if needed.
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
// Stepper Module: Manages timing and triggers new steps
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
    // Toggle song playback (if already playing, pause it; otherwise, play)
    if (this.song.isPlaying()) {
      this.song.pause();
    } else {
      this.song.play();
    }

    // Clear any existing interval and set a new one based on BPM
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
  getAudioContext().resume();

  gridder = new Gridder(glassShader, gridSize, cubeSize, cam);
  stepper = new Stepper(BPM, () => gridder.step(), song);

  // Start the stepping process
  stepper.start();
}

function draw() {
  background(0);
  orbitControl();
  gridder.drawAxis();
  gridder.draw();
}

// Allow manual stepping via mouse click
function mouseClicked() {
  gridder.step();
}
