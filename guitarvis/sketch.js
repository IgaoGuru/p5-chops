let cam;
var gridSize = 15;
var cubeSize = 50;
var grids = [];

function preload() {
}

function setup() {
  createCanvas(800, 800, WEBGL);
  cam = createCamera();
  cam.camera(2307, 1379, 2168,
            0, 0, 0,
            1, 0, 1
            )

}

function draw() {
  background(220);
  orbitControl();
  // print camera position and rotation
  // console.log(`cam pos: ${cam.eyeX}, ${cam.eyeY}, ${cam.eyeZ}, cam rot: ${cam.centerX}, ${cam.centerY}, ${cam.centerZ}`);

  drawAxis();

  // Draw 3d cube grid where grid[i][j] is the color of the cube
  console.log(grids)
  for (var g = 0; g < grids.length; g++) {
    drawGrid(grids[g]);
    translate(0, 0, cubeSize);
  }

}

function drawAxis() {

  //draw x axis in red
  stroke(255, 0, 0);
  line(-3000, 0, 0, 3000, 0, 0);

  // draw y axis in green
  stroke(0, 255, 0);
  line(0, -3000, 0, 0, 3000, 0);

  // draw z axis in blue
  stroke(0, 0, 255);
  line(0, 0, -3000, 0, 0, 3000);
  stroke(0)
}

function drawGrid(grid) {
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      push();
      translate(i * cubeSize, j * cubeSize, 0);
      fill(grid[i][j]);
      box(cubeSize);
      pop();
    }
  }
}

function nextGrid() {
  // Generate next grid
  var grid = [];
  for (var i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (var j = 0; j < gridSize; j++) {
      grid[i][j] = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random()) * 255];
    }
  }

  grids.push(grid);
}

function mouseClicked() {
  nextGrid();
}