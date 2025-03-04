let cam;
var gridSize = 15;
var cubeSize = 50;
var grids = [];
let glassShader;
let BPM = 86; // Default BPM (adjust as needed)
let stepInterval; // Store interval ID

let fft = new p5.FFT(); 
let song;

function preload() {
  // Load the custom shader files (make sure they are in your project folder)
  glassShader = loadShader('shaders/glass.vert', 'shaders/glass.frag');
  song = loadSound('./igreja_da_penha.mp3');
}

function setup() {
  createCanvas(800, 800, WEBGL);
  cam = createCamera();
  cam.camera(1728, 800, 1412,
             375, 25, 375,
             1, 0, 0.7);

  lights();
  noStroke();
  blendMode(BLEND); // Enable blending for transparency

  fft = new p5.FFT(0.8, 1024);

  startBPM(); // Start automatic stepping
}

function stepCamera() {
  let camX = cam.eyeX; 
  let camY = cam.eyeY; 
  let camZ = cam.eyeZ; 

  let stepSize = cubeSize; // Move one grid layer distance
  let targetZ = camZ + stepSize; // Move the camera along the Z-axis

  let duration = 500; // Duration of animation in milliseconds
  let startTime = millis(); 

  function animate() {
    let elapsed = millis() - startTime;
    let progress = constrain(elapsed / duration, 0, 1); // Normalize progress

    let newZ = lerp(camZ, targetZ, progress);
    cam.setPosition(camX, camY, newZ); // Update camera position

    if (progress < 1) {
      requestAnimationFrame(animate); // Continue animation
    }
  }

  animate();
}

function draw() {
  background(0);
  orbitControl();
  drawAxis();

  for (var g = 0; g < grids.length; g++) {
    push();
    drawGrid(grids[g]);
    pop();
    translate(0, 0, cubeSize);
  }
}

function drawAxis() {
  stroke(255, 0, 0); line(-3000, 0, 0, 3000, 0, 0); // X-axis
  stroke(0, 255, 0); line(0, -3000, 0, 0, 3000, 0); // Y-axis
  stroke(0, 0, 255); line(0, 0, -3000, 0, 0, 3000); // Z-axis
  noStroke();
}

function drawGlowingBox(fillColor) {
  shader(glassShader);
  glassShader.setUniform('uFillColor', [fillColor[0] / 255, fillColor[1] / 255, fillColor[2] / 255]);
  box(cubeSize);
  resetShader();
}

function drawGrid(grid) {
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      push();
      translate(i * cubeSize, j * cubeSize, 0);
      drawGlowingBox(grid[i][j]);
      pop();
    }
  }
}

function nextGrid() {
  var grid = [];
  for (var i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (var j = 0; j < gridSize; j++) {
      grid[i][j] = [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      ];
    }
  }
  grids.push(grid);
}

function step() {
  nextGrid();
  stepCamera();
}

function mouseClicked() {
  step();
}

//**
// 
// FFT AND MUSIC STUFF 
//
//  */

// 🕒 Function to start automatic stepping based on BPM
function startBPM() {
  if (stepInterval) clearInterval(stepInterval); // Clear any existing interval
  let intervalTime = (60 / BPM) * 1000; // Convert BPM to milliseconds per step
  stepInterval = setInterval(step, intervalTime);
}