
var canvasMap = document.getElementById("mapCanvas");
var contextMap = canvasMap.getContext("2d");

var timer = 0;


var projectionType = "Mollweide";
var displayConstellations = "zodiac";
var filter = "none"
var zoom = 1.0;
var zoomCenterX = 0;
var zoomCenterY = 0;



function onWheel(event)
{
	if (event.deltaY != 0)
	{
//		var Xeffective = ((event.offsetX - canvasMap.width / 2)) / zoom + zoomCenterX
//		var Yeffective = ((event.offsetY - canvasMap.height / 2)) / zoom + zoomCenterY
//		zoomCenterX = Xeffective;
//		zoomCenterY = Yeffective;
		zoom *= Math.pow(2.0,-event.deltaY / 200.0);
		if (zoom <= 1.0)
		{
		
			zoomCenterX = 0.0;
			zoomCenterY = 0.0;
		}

		draw();
	}
}
var dragging = false;

function onMouseDown(event)
{
	if (event.which == 1 && event.offsetX >= 50 && event.offsetX <= (canvasMap.width - 100) && event.offsetY >= 0 && event.offsetY <= (canvasMap.height - 100))
	{
		dragging = true;
	}
}
function onMouseMove(event)
{
	if (dragging && zoom > 1.0 && event.offsetX >= 50 && event.offsetX <= (canvasMap.width - 100) && event.offsetY >= 0 && event.offsetY <= (canvasMap.height - 100))
	{
		zoomCenterX -= event.movementX / zoom
		zoomCenterY -= event.movementY / zoom
		draw();
	}
}
function onMouseUp(event)
{
	if (event.which == 1)
	{
		dragging = false;
	}
}
var scrollW = false;
var scrollA = false;
var scrollS = false;
var scrollD = false;

var scrollArrowL = false;
var scrollArrowR = false;
var scrollArrowU = false;
var scrollArrowD = false;

document.addEventListener("keydown", event=> 
{
	var redraw = false;
	if (event.code == "KeyW")
	{
		scrollW = true;
	}
	if (event.code == "KeyA")
	{
		scrollA = true;
	}
	if (event.code == "KeyS")
	{
		scrollS = true;
	}
	if (event.code == "KeyD")
	{
		scrollD = true;
	}
	if (event.code == "ArrowLeft")
	{
		scrollArrowL = true;
	}
	if (event.code == "ArrowRight")
	{
		scrollArrowR= true;
	}
	if (event.code == "ArrowUp")
	{
		scrollArrowU = true;
	}
	if (event.code == "ArrowDown")
	{
		scrollArrowD = true;
	}
	if (event.code == "PageUp")
	{
		zoom *= Math.pow(2.0,0.5);
		redraw = true;
	}
	if (event.code == "PageDown")
	{
		zoom *= Math.pow(2.0,-0.5);
		redraw = true;
	}
//	console.log(event.code);
	if (redraw)
	{
		draw();
	}
});

document.addEventListener("keyup", event=> 
{
	if (event.code == "KeyW")
	{
		scrollW = false;
	}
	if (event.code == "KeyA")
	{
		scrollA = false;
	}
	if (event.code == "KeyS")
	{
		scrollS = false;
	}
	if (event.code == "KeyD")
	{
		scrollD = false;
	}
	if (event.code == "ArrowLeft")
	{
		scrollArrowL = false;
	}
	if (event.code == "ArrowRight")
	{
		scrollArrowR= false;
	}
	if (event.code == "ArrowUp")
	{
		scrollArrowU = false;
	}
	if (event.code == "ArrowDown")
	{
		scrollArrowD = false;
	}
}
)

function scrollCallback()
{
	var redraw = false;
	if (zoom > 1.0)
	{
		if (scrollD || scrollArrowR)
		{
			zoomCenterX += 1.0;
			redraw = true;
		}
		if (scrollA || scrollArrowL)
		{
			zoomCenterX -= 1.0;
			redraw = true;
		}
		if (scrollW || scrollArrowU)
		{
			zoomCenterY -= 1.0;
			redraw = true;
		}
		if (scrollS || scrollArrowD)
		{
			zoomCenterY += 1.0;
			redraw = true;
		}
	}
	if (redraw)
	{
		draw();
	}
	window.setTimeout(scrollCallback,1000.0/30.0);
}
scrollCallback();


function selectFilter(value)
{
	filter = value;
	draw();
}

var radButtons = new Array();
radButtons.push(new RadioButton("No Filter","none",canvasMap.width / 2 - 145,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "No Filter";

radButtons.push(new RadioButton("U Filter","U",canvasMap.width / 2 - 95,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "U";

radButtons.push(new RadioButton("B Filter","B",canvasMap.width / 2 - 45,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "B";

radButtons.push(new RadioButton("V Filter","V",canvasMap.width / 2 + 5,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "V";

radButtons.push(new RadioButton("R Filter","R",canvasMap.width / 2 + 55,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "R";

radButtons.push(new RadioButton("I Filter","I",canvasMap.width / 2 + 105,canvasMap.height - 65,40,15));
radButtons[radButtons.length - 1].text = "I";


commonUIRegister(new Radio("Filter","none",selectFilter,radButtons));


function selectConstellation(constellation)
{
	displayConstellations = constellation;
	draw();
}

var radButtonsConst = new Array();

radButtonsConst.push(new RadioButton("No Constellations","none",canvasMap.width / 2 - 120,canvasMap.height - 25,40,15));
radButtonsConst[radButtonsConst.length - 1].text = "None";

radButtonsConst.push(new RadioButton("Zodiac Constellations","zodiac",canvasMap.width / 2 - 70,canvasMap.height - 25,40,15));
radButtonsConst[radButtonsConst.length - 1].text = "Zodiac";

radButtonsConst.push(new RadioButton("Major Constellations","major",canvasMap.width / 2 - 20,canvasMap.height - 25,40,15));
radButtonsConst[radButtonsConst.length - 1].text = "Major";

radButtonsConst.push(new RadioButton("Major Constellations","minor",canvasMap.width / 2 + 30,canvasMap.height - 25,40,15));
radButtonsConst[radButtonsConst.length - 1].text = "Minor";

radButtonsConst.push(new RadioButton("Obscure Constellations","obscure",canvasMap.width / 2 + 80,canvasMap.height - 25,40,15));
radButtonsConst[radButtonsConst.length - 1].text = "Obscure";

commonUIRegister(new Radio("Contstellations","zodiac",selectConstellation,radButtonsConst));

function draw(){
	var mapWidth = (canvasMap.width - 100) * zoom;
	var mapHeight = (canvasMap.height - 100) * zoom;
	var mapCenterX = canvasMap.width / 2 - zoomCenterX * zoom;
	var mapCenterY = (canvasMap.height - 100) / 2 - zoomCenterY * zoom;

	var skyMap = new SkyMap(contextMap,mapCenterX,mapCenterY,mapWidth,mapHeight);
	skyMap.filter = filter;
	skyMap.displayConstellations = displayConstellations;

// draw a black square for the map area box
	contextMap.fillStyle = "#000000";
	contextMap.fillRect(0,0,canvasMap.width,canvasMap.height);

	contextMap.save()
	contextMap.rect(50,0,canvasMap.width - 100,canvasMap.height - 100);
	contextMap.clip();
	skyMap.draw();
	contextMap.restore();


// draw the elongation reference on the map
	contextMap.save()
	contextMap.rect(25,0,canvasMap.width - 75,canvasMap.height - 50);
	contextMap.clip();
	contextMap.font = "10px Ariel";

	contextMap.strokeStyle = "#FFFF00"
	contextMap.fillStyle = "#FFFF00"
	contextMap.beginPath();
	if (projectionType== "Mollweide")
	{
		contextMap.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY);
		contextMap.lineTo(mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	}
	else
	{
		contextMap.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5 - 20.0);
		contextMap.lineTo(mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	}
		contextMap.stroke();
	drawTextCenter(contextMap,"-180",mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);

	contextMap.beginPath();
	if (projectionType == "Mollweide")
	{
		contextMap.moveTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
		contextMap.lineTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	}
	else
	{
		contextMap.moveTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 - 20.0);
		contextMap.lineTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	}
	contextMap.stroke();
	drawTextCenter(contextMap,"-90",mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	drawTextCenter(contextMap,"0",mapCenterX,mapCenterY + mapHeight * 0.5 + 10);
	contextMap.beginPath();
	if (projectionType == "Mollweide")
	{
		contextMap.moveTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
		contextMap.lineTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	}
	else
	{
		contextMap.moveTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 - 20.0);
		contextMap.lineTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	}
	contextMap.stroke();
	drawTextCenter(contextMap,"+90",mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	contextMap.beginPath();
	if (projectionType == "Mollweide")
	{
		contextMap.moveTo(mapCenterX + mapWidth * 0.5,mapCenterY);
		contextMap.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	}
	else
	{
		contextMap.moveTo(mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5 - 20.0);
		contextMap.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	
	}
	contextMap.stroke();
	drawTextCenter(contextMap,"+180",mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);
	contextMap.restore();
	contextMap.font = "15px Arial"
	contextMap.fillStyle = "#FFFFFF"
	drawTextCenter(contextMap,"Select Filter:",canvasMap.width * 0.5,canvasMap.height - 70);
	drawTextCenter(contextMap,"Show Constellations:",canvasMap.width * 0.5,canvasMap.height - 30);

	commonUIdraw(contextMap);
}

var waitForReadyTimer = 0.0;

function waitForReady()
{
	if (!constellationsReady || !starsReady)
	{
		contextMap.fillStyle = "#000000";
		contextMap.fillRect(0,0,canvasMap.width,canvasMap.height);
		waitForReadyTimer += 0.25;
		contextMap.fillStyle = "#FFFFFF";
		contextMap.fillStyle = "#FFFFFF";
		contextMap.font = "20px Ariel";
		drawTextCenter(contextMap,"Please Wait",canvasMap.width * 0.5,canvasMap.height * 0.5 - 15);
		var timerDots = Math.floor(waitForReadyTimer * 4.0) % 4;
		var dots = "";
		if (timerDots == 0)
			dots = "."
		else if (timerDots == 1)
			dots = ".."
		else 
			dots = "..."
		contextMap.fillText("Scanning the Sky " + dots,canvasMap.width * 0.5 - contextMap.measureText("Scanning the Sky ").width * 0.5,canvasMap.height * 0.5 + 15);
		drawTextCenter(contextMap,"This may take a minute or two.",canvasMap.width * 0.5,canvasMap.height * 0.5 + 45);
		window.setTimeout(waitForReady, 333.0);
	}
	else
	{
		draw();
	}
}
waitForReady();

