
var song;
var fft;

function preload() {
  song = loadSound('./igreja_da_penha.mp3')
}

function setup() {
  createCanvas(800, 800);
  background('black');
  
  fft = new p5.FFT(0.8, 1024);
}

function draw() {
  background(0)

  var wave = fft.waveform();

  for (var i = 0; i < wave.length; i++) {
    var x = map(i, 0, wave.length, 0, width);
    var y = map(wave[i], -1, 1, 0, height);
    stroke('white');
    point(x, y);
  }
}

function mouseClicked() {
  if (song.isPlaying()) {
    song.pause();
  }
  else {
    song.play();
  } 
}