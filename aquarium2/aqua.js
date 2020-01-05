"use strict";
var canvas = null;
var ctx = null;
var bgIMG = null;
var bgINDEX = null;
// BG assets
var bgURLs = [
  "https://images.template.net/wp-content/uploads/2014/12/Colorful-Aquarium-Background.jpg",
  "http://www.seaviewinfo.com/Backgrounds/thumbs/RiverRock.jpg",
  "https://uk.hagen.com/File/Image/m/980/530/172b10ca-b7b5-4428-9a1e-94ceafca3e1b",
  "https://images.template.net/wp-content/uploads/2014/12/Free-Aquarium-Background.jpg",
  "http://picturesofaquariums.com/large/14/Aquarium-Backgrounds-Pictures-5.jpg",
  "http://www.petmountain.com/photos/product/giant/114420S573913/aquarium-backgrounds/aquatic-creations-coral-cling-background.jpg",
  "http://www.petmountain.com/photos/product/giant/114420S573911/aquarium-backgrounds/ocean-floor-cling-background.jpg"
];

var ANIMAL_AMOUNT = 10;
var ANIMAL_MAX_WIDTH = 100;
var ANIMAL_MAX_HEIGHT = 80;
var ANIMAL_MIN_WIDTH = 30;
var ANIMAL_MIN_HEIGHT = 10;

var foods = [];
var animals = [];
var drawInterval = null;
function init() {
  // fetch all HTML elements AFTER its been loaded
  var getEl = document.getElementById.bind(document);

  canvas = getEl("myCanvas");
  var nextBG = getEl("nextBG");
  var addFish = getEl("addFish");

  var widthRatio = 0.95;
  var heightRatio = 0.8;
  canvas.width = window.innerWidth * widthRatio;
  canvas.height = window.innerHeight * heightRatio;
  ctx = canvas.getContext("2d");

  bgIMG = new Image();
  bgINDEX = 0;
  bgIMG.src = bgURLs[bgINDEX];

  //const frameRate = 33;

  // click event handlers
  nextBG.onclick = switchBG;
  addFish.onclick = spawnFish;

  drawInterval = requestAnimationFrame(draw);
}

function randVal(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randColor() {
  // generates random color string
  var vec = "0123456789abcdef";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += vec[randVal(0, vec.length - 1)];
  }
  return color;
}

function spawnFish(e) {
  if (animals.length >= ANIMAL_AMOUNT && e === event) {
    return;
  }
  var animalWidth = randVal(ANIMAL_MIN_WIDTH, ANIMAL_MAX_WIDTH);
  var animalHeight = animalWidth * 0.5;
  var animal = {
    x: randVal(0, canvas.width),
    y: randVal(0, canvas.height),
    dx: randVal(1, 3),
    dy: randVal(1, 3),
    dirX: randVal(0, 1) ? -1 : 1,
    dirY: randVal(0, 1) ? -1 : 1,
    width: animalWidth,
    height: animalHeight,
    color: randColor(),
    target: undefined
  };
  animals.push(animal);
  document.getElementById("animalInfo").innerHTML +=
    "<br />@@@<br />X Speed:" +
    animal.dx +
    "<br />Y Speed:" +
    animal.dy +
    "<br />Color:" +
    "<span style='width:40px;height:40px;background-color:" +
    animal.color +
    "'>Color</span>";
}

function bezierCurve(centerX, centerY, width, height, fill) {
  // draws a single ellipse
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - height / 2);

  ctx.bezierCurveTo(
    centerX + width / 2,
    centerY - height / 2,
    centerX + width / 2,
    centerY + height / 2,
    centerX,
    centerY + height / 2
  );
  ctx.bezierCurveTo(
    centerX - width / 2,
    centerY + height / 2,
    centerX - width / 2,
    centerY - height / 2,
    centerX,
    centerY - height / 2
  );

  ctx.closePath();
  if (fill) ctx.fill();
  else ctx.stroke();
}

function switchBG() {
  bgIMG.src = bgURLs[++bgINDEX % bgURLs.length];
}

function drawBG() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    bgIMG,
    0,
    0,
    bgIMG.width,
    bgIMG.height, // source rectangle
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function drawAnimals() {
  for (var i = 0; i < animals.length; i++) {
    drawAnimal(animals[i]);
  }
}

function drawAnimal(animal) {
  ctx.fillStyle = animal.color;
  ctx.strokeStyle = "black";
  // draw tail
  ctx.fillStyle = animal.color;
  var tail1 = [animal.x + animal.width * 0.35 * animal.dirX * -1, animal.y];
  var tail2 = [
    animal.x + animal.width * 0.5 * animal.dirX * -1,
    animal.y - animal.height * 0.5
  ];
  var tail3 = [
    animal.x + animal.width * 0.5 * animal.dirX * -1,
    animal.y + animal.height * 0.5
  ];
  ctx.beginPath();
  ctx.moveTo(tail1[0], tail1[1]);
  ctx.lineTo(tail2[0], tail2[1]);
  ctx.lineTo(tail3[0], tail3[1]);
  ctx.lineTo(tail1[0], tail1[1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // draw body
  bezierCurve(animal.x, animal.y, animal.width, animal.height, true);
  bezierCurve(animal.x, animal.y, animal.width, animal.height, false);
  // draw eye
  var eyeX = animal.x + animal.width * 0.25 * animal.dirX;
  var eyeY = animal.y;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  // draw mouth
  ctx.lineWidth = 1;
  var mouthStart = [animal.x + animal.width * 0.3 * animal.dirX, animal.y + 10];
  var mouthEnd = [animal.x + animal.width * 0.2 * animal.dirX, animal.y + 7];

  ctx.beginPath();
  ctx.moveTo(mouthStart[0], mouthStart[1]);
  ctx.lineTo(mouthEnd[0], mouthEnd[1]);
  ctx.closePath();
  ctx.stroke();
}

function updateAnimals() {
  for (var i = 0; i < animals.length; i++) {
    updateAnimal(animals[i], false);
  }
}

function updateAnimal(animal, chase) {
  animal.x += animal.dx * animal.dirX;
  animal.y += animal.dy * animal.dirY;

  if (chase) {
    return;
  }

  if (Math.random() < 0.01) {
    animal.dirX *= -1;
  }
  if (Math.random() < 0.01) {
    animal.dirY *= -1;
  }
  if (animal.x >= canvas.width + animal.width * 0.5 && animal.dirX === 1) {
    animal.dirX = -1;
  }
  if (animal.x < -animal.width * 0.5 && animal.dirX === -1) {
    animal.dirX = 1;
  }
  if (animal.y < -animal.height * 0.5 && animal.dirY === -1) {
    animal.dirY = 1;
  }
  if (animal.y > canvas.height + animal.height * 0.5 && animal.dirY === 1) {
    animal.dirY = -1;
  }
}

function targetLines() {
  ctx.strokeStyle = "red";
  for (var i = 0; i < animals.length; i++) {
    if (animals[i].target === undefined) {
      continue;
    }
    var x0 = animals[i].target.x + animals[i].target.size * 0.5;
    var y0 = animals[i].target.y;
    var x1 = animals[i].x + animals[i].width * 0.3 * animals[i].dirX;
    var y1 = animals[i].y + 10;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  }
}

function draw() {
  drawBG();
  drawAnimals();
  if (!foods.length) {
    updateAnimals();
  } 
  if (document.getElementById("showLines").checked) {
    targetLines();
  }
  drawInterval = requestAnimationFrame(draw);
}

window.onload = init;
