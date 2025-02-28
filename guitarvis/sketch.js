let cam;
var gridSize = 15;
var cubeSize = 50;
var grids = [];
let glassShader;

function preload() {
  // Load the custom shader files (make sure they are in your project folder)
  glassShader = loadShader('shaders/glass.vert', 'shaders/glass.frag');
}

function setup() {
  createCanvas(800, 800, WEBGL);
  cam = createCamera();
  cam.camera(1728, 800, 1412,
             375, 25, 375,
             1, 0, 0.7);

  lights();
  noStroke();
  // Enable blending so that our cubes appear semi-transparent
  blendMode(BLEND);
}

function draw() {
  background(0);
  console.log(cam.eyeX, cam.eyeY, cam.eyeZ);
  orbitControl();
  drawAxis();

  // Draw each grid (stacking grids along the z-axis)
  for (var g = 0; g < grids.length; g++) {
    push();
    drawGrid(grids[g]);
    pop();
    translate(0, 0, cubeSize);
  }
}

function drawAxis() {
  // Draw x axis in red
  stroke(255, 0, 0);
  line(-3000, 0, 0, 3000, 0, 0);
  // Draw y axis in green
  stroke(0, 255, 0);
  line(0, -3000, 0, 0, 3000, 0);
  // Draw z axis in blue
  stroke(0, 0, 255);
  line(0, 0, -3000, 0, 0, 3000);
  noStroke();
}

function drawGlowingBox(fillColor) {
  // Activate our custom glass shader
  shader(glassShader);
  // Pass the cube’s color to the shader (normalize to 0-1)
  glassShader.setUniform('uFillColor', [fillColor[0] / 255, fillColor[1] / 255, fillColor[2] / 255]);
  // Draw the box
  box(cubeSize);
  // Reset to the default shader for anything else
  resetShader();
}

function drawGrid(grid) {
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      push();
      translate(i * cubeSize, j * cubeSize, 0);
      let fillColor = grid[i][j];
      drawGlowingBox(fillColor);
      pop();
    }
  }
}

function nextGrid() {
  // Generate a new grid with random colors
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

    // Linear interpolation from current Z to target Z
    let newZ = lerp(camZ, targetZ, progress);
    cam.setPosition(camX, camY, newZ); // Update camera position

    if (progress < 1) {
      requestAnimationFrame(animate); // Continue animation
    }
  }

  animate(); // Start the animation
}

function mouseClicked() {
  nextGrid();
  stepCamera();
}
