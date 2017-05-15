// All the paths
var paths = [];
// Are we painting?
var painting = false;
// How long until the next circle
var next = 0;
// Where are we now and where were we?
var current;
var previous;

var ellipsePrincipal = false;
var cor1, cor2, cor3;
var qualSample;
var somTocado, somEscolhido, arraySom, som0, som1, som2, speed, fundo;
var amplitude, decresce;
var toca = false;

var socket;

var XXX, YYY;

function preload ()
{
  fundo = loadSound('data/fundo.mp3');
}

function setup() {
  var xx = windowWidth;
  var yy = windowHeight;
  createCanvas(xx, yy);
  frameRate(30);
  background(100, 180, 186);

  current = createVector(0, 0);
  previous = createVector(0, 0);

  //chooses a random sample to be played
  qualSample = floor(random(3));
  arraySom = ["som", qualSample];
  somEscolhido = join(arraySom, "");
  somTocado = p5.SoundFile();
  somTocado = loadSound("data/" + somEscolhido + ".mp3");
  somTocado.setLoop(false);
  somTocado.setVolume(1.0);
  speed = 1;
  fundo.setVolume(0.6);
  fundo.setLoop(true);
  fundo.play();
  amplitude = new p5.Amplitude();

  //chooses a random color for the ellipse
  if (qualSample === 0) {
    cor1 = 10;
    cor2 = 130;
    cor3 = 0;
  }
  if (qualSample == 1) {
    cor1 = 100;
    cor2 = 10;
    cor3 = 100;
  }
  if (qualSample == 2) {
    cor1 = 110;
    cor2 = 110;
    cor3 = 0;
  }

  //ip address of server (its know IP from heroku)
  socket = io.connect(window.location.hostname);
  socket.on('mouse', newDrawing);
}

function draw() {
  pauta();

  // If it's time for a new point
  if (millis() > next && painting) {

    // Grab mouse position      
    current.x = touchX;
    current.y = touchY;

    // New particle's force is based on mouse movement
    var force = p5.Vector.sub(current, previous);
    force.mult(0.05);

    // Add new particle
    paths[paths.length - 1].add(current, force);

    // Schedule next circle
    next = millis() + random(20, 100);

    // Store mouse values
    previous.x = current.x;
    previous.y = current.y;
  }

  // Draw all paths
  for (var i = 0; i < paths.length; i++) {
    paths[i].update();
    paths[i].display();
  }
  
  sendStuff(touchX, touchY);
}

// //executes this function when receives things from other users
function newDrawing(data) {
  if (data.e) {
    XXX = data.x;
    YYY = data.y;
  }

  if (qualSample === 0) {
    fill(10, 10, 150, data.d);
    stroke(10, 10, 180, data.d);
    var tamanhoElipse = map(data.d, 255, 0, 40, 2);
    ellipse(XXX, YYY, tamanhoElipse, tamanhoElipse);
    strokeWeight(1);
    if(data.d>5)
    {
    stroke(10, 10, 150);
    line(XXX, YYY,XXX, -10);
    }
  }

  if (qualSample === 1) {
    fill(244,244,66, data.d);
    stroke(244,244,86, data.d);
    var tamanhoTriangle = map(data.d, 255, 0, 40, 2);
    triangle(XXX, YYY, XXX+tamanhoTriangle, YYY,XXX+(tamanhoTriangle*0.5),YYY+tamanhoTriangle );
  }

  if (qualSample === 2) {
    fill(244, 164, 66, data.d);
    stroke(244, 164, 86, data.d);
    var tamanhoQuadrado = map(data.d, 255, 0, 35, 1);
    rect (XXX, YYY, tamanhoQuadrado, tamanhoQuadrado);
    strokeWeight(1);
    if(data.d>5)
    {
      stroke(244, 164, 86);
      line(XXX, YYY,XXX, height+10);
    }
  }
}


function keyTyped() {
  if (key === 'q') {
    var fs = fullscreen();
    fullscreen(!fs);
  }
}

// Start it up
function touchStarted() {
  next = 0;
  painting = true;
  previous.x = touchX;
  previous.y = touchY;
  paths.push(new Path());
  ellipsePrincipal = true;
  //sendStuff(touchX, touchY);
  //play sound
  somTocado.play();
  
  // fill(0, 100);
  // stroke(0, 100);
  // ellipse(touchX, touchY, 15, 15);
  // speed = map(touchY, 0.1, height, 1.5, 0.5);
  // somTocado.rate(speed);
}

function sendStuff (xpos, ypos)
{
   var data = {
    x: touchX,
    y: touchY,
    e: ellipsePrincipal,
    d: decresce
  }
  socket.emit('mouse', data); 
}

// Stop
function touchEnded() {
  painting = false;
  ellipsePrincipal = false;
}

// A Path is a list of particles
function Path() {
  this.particles = [];
  this.hue = random(100);
}

Path.prototype.add = function(position, force) {
  // Add a new particle with a position, force, and hue
  this.particles.push(new Particle(position, force, this.hue));
}

// Display plath
Path.prototype.update = function() {
  for (var i = 0; i < this.particles.length; i++) {
    this.particles[i].update();
  }
}

// Display plath
Path.prototype.display = function() {

  // Loop through backwards
  for (var i = this.particles.length - 1; i >= 0; i--) {
    // If we shold remove it
    if (this.particles[i].lifespan <= 0) {
      this.particles.splice(i, 1);
      // Otherwise, display it
    } else {
      this.particles[i].display(this.particles[i + 1]);
    }
  }
}

// Particles along the path
function Particle(position, force, hue) {
  this.position = createVector(position.x, position.y);
  this.velocity = createVector(force.x, force.y);
  this.drag = 0.95;
  this.lifespan = 255;
}

Particle.prototype.update = function() {
  // Move it
  this.position.add(this.velocity);
  // Slow it down
  this.velocity.mult(this.drag);
  // Fade it out
  this.lifespan--;
}

// Draw particle and connect it with a line
// Draw a line to another
Particle.prototype.display = function(other) {
  decresce = this.lifespan;
  var level = amplitude.getLevel();
  var size = map(level, 0, 1, 0, 255);
  stroke(cor1, cor2, cor3, size * 2);
  fill(cor1, cor2, cor3, size * 4);
  ellipse(this.position.x, this.position.y, 30, 30);
  // If we need to draw a line
  if (other) {
    strokeWeight(5);
    line(this.position.x, this.position.y, other.position.x, other.position.y);
  }
}

function windowResized() {
  //corre quando se mexe no tamanho da janela
  resizeCanvas(windowWidth, windowHeight);
}

function pauta()
{
  background(100, 180, 186);
  stroke(0);
  strokeWeight(2);
  line(width * 0.11, height * 0.3, width * 0.9, height * 0.31);
  line(width * 0.1, height * 0.36, width * 0.9, height * 0.37);
  line(width * 0.1, height * 0.42, width * 0.9, height * 0.43);

  line(width * 0.15, height * 0.71, width * 0.9, height * 0.70);
  line(width * 0.15, height * 0.77, width * 0.9, height * 0.76);
  line(width * 0.14, height * 0.83, width * 0.9, height * 0.82);

  fill(0);
  rect(width * 0.49, height * 0.5, 50, 50);
  stroke(0);
  strokeWeight(1);
  line(width * 0.49, height * 0.5, width * 0.49, height + 10);

  ellipse(width * 0.29, height * 0.34, 17, 17);
  line(width * 0.29, 0, width * 0.29, height * 0.34);
  ellipse(width * 0.32, height * 0.74, 21, 21);
  line(width * 0.32, 0, width * 0.32, height * 0.74);

  fill(100, 180, 186);
  ellipse(width * 0.79, height * 0.55, 41, 41);
  ellipse(width * 0.19, height * 0.9, 32, 32);
  
  if(ellipsePrincipal)
  {
  speed = map(touchY, 0.1, height, 1.5, 0.5);
  somTocado.rate(speed);
  }
}