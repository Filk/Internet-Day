// All the paths
var paths = [];
// Are we painting?
var painting = false;
// How long until the next circle
var next = 0;
// Where are we now and where were we?
var current;
var previous;

var ellipsePrincipal=false;
var cor1,cor2,cor3;
var qualSample;
var somTocado, somEscolhido, arraySom, som0, som1, som2, speed;
var amplitude, decresce;

var socket;


function setup() 
{
  var xx = windowWidth;
  var yy = windowHeight;
  createCanvas(xx, yy);
  background(100,180,186);
  
  current = createVector(0,0);
  previous = createVector(0,0);
  
  //chooses a random sample to be played
  qualSample= floor(random(3));
  arraySom=["som",qualSample];
  somEscolhido= join (arraySom,"");
  somTocado= p5.SoundFile();
  somTocado=loadSound("data/"+somEscolhido+".mp3");
  somTocado.setLoop(false);
  somTocado.setVolume(1.0);
  speed=1;
  amplitude = new p5.Amplitude();
  
  //chooses a random color for the ellipse
  if(qualSample===0)
  {
    cor1=10;
    cor2=130;
    cor3=0;
  }
  if(qualSample==1)
  {
    cor1=15;
    cor2=10;
    cor3=100;
  }
  if(qualSample==2)
  {
    cor1=110;
    cor2=110;
    cor3=0;
  }

  //ip address of server (its know IP from heroku)
  socket= io.connect(window.location.hostname);
  socket.on('mouse', newDrawing);
}

function draw() 
{
  fill(100,180,186,40);
  rect(-10,-10,width+10,height+10);
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
    next = millis() + random(20,100);

    // Store mouse values
    previous.x = current.x;
    previous.y = current.y;
  }

  // Draw all paths
  for( var i = 0; i < paths.length; i++) {
    paths[i].update();
    paths[i].display();
  }
  
  if(ellipsePrincipal)
  {
  fill(0,100);
  stroke(0,100);
  ellipse(touchX,touchY,15,15);
  speed = map(mouseY, 0.1, height, 1.5, 0.5);
  somTocado.rate(speed);
  }
  
  var data = 
  {
    x: touchX,
    y: touchY,
    e: ellipsePrincipal,
    d: decresce,
    q: pmouseX,
    w: pmouseY
  }
  socket.emit('mouse',data);
}

//receives things from other users
function newDrawing(data)
{
  if (data.e)
  {
    var teuRatoX=data.x;
    var teuRatoY=data.y;
  }
  
  if (data.d>5)
  {
    fill(0,data.d);
    stroke(0,data.d);
    ellipse(teuRatoX,teuRatoY,20,20);
  }
  
  stroke(0);
  strokeWeight(10);
  line(data.x, data.y, data.q, data.w);
}

// Start it up
function touchStarted() {
  next = 0;
  painting = true;
  previous.x = touchX;
  previous.y = touchY;
  paths.push(new Path());
  
  ellipsePrincipal=true;
  //play sound
  somTocado.play();
}

// Stop
function touchEnded() 
{
  painting = false;
  ellipsePrincipal=false;
  //stop sound
  //somTocado.stop();
}

// A Path is a list of particles
function Path() 
{
  this.particles = [];
  this.hue = random(100);
}

Path.prototype.add = function(position, force) 
{
  // Add a new particle with a position, force, and hue
  this.particles.push(new Particle(position, force, this.hue));
}

// Display plath
Path.prototype.update = function() 
{  
  for (var i = 0; i < this.particles.length; i++) 
  {
    this.particles[i].update();
  }
}  

// Display plath
Path.prototype.display = function() 
{
  
  // Loop through backwards
  for (var i = this.particles.length - 1; i >= 0; i--) 
  {
    // If we shold remove it
    if (this.particles[i].lifespan <= 0) 
    {
      this.particles.splice(i, 1);
    // Otherwise, display it
    } else 
    {
      this.particles[i].display(this.particles[i+1]);
    }
  }
}  

// Particles along the path
function Particle(position, force, hue) 
{
  this.position = createVector(position.x, position.y);
  this.velocity = createVector(force.x, force.y);
  this.drag = 0.95;
  this.lifespan = 255;
}

Particle.prototype.update = function() 
{
  // Move it
  this.position.add(this.velocity);
  // Slow it down
  this.velocity.mult(this.drag);
  // Fade it out
  this.lifespan--;
}

// Draw particle and connect it with a line
// Draw a line to another
Particle.prototype.display = function(other) 
{
  decresce=this.lifespan;
  var level = amplitude.getLevel();
  var size = map(level, 0, 1, 0, 255);
  stroke(cor1,cor2, cor3, size*2);
  fill(cor1,cor2,cor3, size*4);
  ellipse(this.position.x,this.position.y, 35, 35);    
  // If we need to draw a line
  if (other) 
  {
    line(this.position.x, this.position.y, other.position.x, other.position.y);
  }
}

function windowResized() 
{
  //corre quando se mexe no tamanho da janela
  resizeCanvas(windowWidth, windowHeight);
  print("ccc");
}