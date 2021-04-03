
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
	if (event.which == 1 && event.offsetX >= 50 && event.offsetX <= (canvasMap.width - 100) && event.offsetY >= 50 && event.offsetY <= (canvasMap.height - 100))
	{
		dragging = true;
	}
}
function onMouseMove(event)
{
	if (dragging && zoom > 1.0 && event.offsetX >= 50 && event.offsetX <= (canvasMap.width - 100) && event.offsetY >= 50 && event.offsetY <= (canvasMap.height - 100))
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


function selectFilterNone()
{
	filter = "none";
	buttonNoFilter.insideStyle = "#007F00"
	buttonFilterU.insideStyle = "#7F7F7F"
	buttonFilterB.insideStyle = "#7F7F7F"
	buttonFilterV.insideStyle = "#7F7F7F"
	buttonFilterR.insideStyle = "#7F7F7F"
	buttonFilterI.insideStyle = "#7F7F7F"
	draw();
}
function selectFilterU()
{
	filter = "U";
	buttonFilterU.insideStyle = "#007F00"
	buttonNoFilter.insideStyle = "#7F7F7F"
	buttonFilterB.insideStyle = "#7F7F7F"
	buttonFilterV.insideStyle = "#7F7F7F"
	buttonFilterR.insideStyle = "#7F7F7F"
	buttonFilterI.insideStyle = "#7F7F7F"
	draw();
}
function selectFilterB()
{
	filter = "B";
	buttonFilterB.insideStyle = "#007F00"
	buttonNoFilter.insideStyle = "#7F7F7F"
	buttonFilterU.insideStyle = "#7F7F7F"
	buttonFilterV.insideStyle = "#7F7F7F"
	buttonFilterR.insideStyle = "#7F7F7F"
	buttonFilterI.insideStyle = "#7F7F7F"
	draw();
}
function selectFilterV()
{
	filter = "V";
	buttonFilterV.insideStyle = "#007F00"
	buttonNoFilter.insideStyle = "#7F7F7F"
	buttonFilterU.insideStyle = "#7F7F7F"
	buttonFilterB.insideStyle = "#7F7F7F"
	buttonFilterR.insideStyle = "#7F7F7F"
	buttonFilterI.insideStyle = "#7F7F7F"
	draw();
}
function selectFilterR()
{
	filter = "R";
	buttonFilterR.insideStyle = "#007F00"
	buttonNoFilter.insideStyle = "#7F7F7F"
	buttonFilterU.insideStyle = "#7F7F7F"
	buttonFilterB.insideStyle = "#7F7F7F"
	buttonFilterV.insideStyle = "#7F7F7F"
	buttonFilterI.insideStyle = "#7F7F7F"
	draw();
}
function selectFilterI()
{
	filter = "I";
	buttonFilterI.insideStyle = "#007F00"
	buttonNoFilter.insideStyle = "#7F7F7F"
	buttonFilterU.insideStyle = "#7F7F7F"
	buttonFilterB.insideStyle = "#7F7F7F"
	buttonFilterV.insideStyle = "#7F7F7F"
	buttonFilterR.insideStyle = "#7F7F7F"
	draw();
}
var buttonNoFilter = new Button("No Filter",canvasMap.width / 2 - 145,canvasMap.height - 45,40,15,selectFilterNone);
buttonNoFilter.insideStyle = "#007F00"
buttonNoFilter.text = "No Filter";

var buttonFilterU = new Button("U Filter",canvasMap.width / 2 - 95,canvasMap.height - 45,40,15,selectFilterU);
buttonFilterU.insideStyle = "#7F7F7F"
buttonFilterU.text = "U";

var buttonFilterB = new Button("B Filter",canvasMap.width / 2 - 45,canvasMap.height - 45,40,15,selectFilterB);
buttonFilterB.insideStyle = "#7F7F7F"
buttonFilterB.text = "B";

var buttonFilterV = new Button("V Filter",canvasMap.width / 2 + 5,canvasMap.height - 45,40,15,selectFilterV);
buttonFilterV.insideStyle = "#7F7F7F"
buttonFilterV.text = "V";

var buttonFilterR = new Button("R Filter",canvasMap.width / 2 + 55,canvasMap.height - 45,40,15,selectFilterR);
buttonFilterR.insideStyle = "#7F7F7F"
buttonFilterR.text = "R";

var buttonFilterI = new Button("I Filter",canvasMap.width / 2 + 105,canvasMap.height - 45,40,15,selectFilterI);
buttonFilterI.insideStyle = "#7F7F7F"
buttonFilterI.text = "I";


function selectConstellationNone()
{
	displayConstellations = "none";
	buttonConstellationNone.insideStyle = "#007F00"
	buttonConstellationZodiac.insideStyle = "#7F7F7F"
	buttonConstellationMajor.insideStyle = "#7F7F7F"
	buttonConstellationMinor.insideStyle = "#7F7F7F"
	buttonConstellationObscure.insideStyle = "#7F7F7F"
	draw();
}
function selectConstellationZodiac()
{
	displayConstellations = "zodiac";
	buttonConstellationNone.insideStyle = "#7F7F7F"
	buttonConstellationZodiac.insideStyle = "#007F00"
	buttonConstellationMajor.insideStyle = "#7F7F7F"
	buttonConstellationMinor.insideStyle = "#7F7F7F"
	buttonConstellationObscure.insideStyle = "#7F7F7F"
	draw();
}
function selectConstellationMajor()
{
	displayConstellations = "major";
	buttonConstellationNone.insideStyle = "#7F7F7F"
	buttonConstellationZodiac.insideStyle = "#7F7F7F"
	buttonConstellationMajor.insideStyle = "#007F00"
	buttonConstellationMinor.insideStyle = "#7F7F7F"
	buttonConstellationObscure.insideStyle = "#7F7F7F"
	draw();
}
function selectConstellationMinor()
{
	displayConstellations = "minor";
	buttonConstellationNone.insideStyle = "#7F7F7F"
	buttonConstellationZodiac.insideStyle = "#7F7F7F"
	buttonConstellationMajor.insideStyle = "#7F7F7F"
	buttonConstellationMinor.insideStyle = "#007F00"
	buttonConstellationObscure.insideStyle = "#7F7F7F"
	draw();
}
function selectConstellationObscure()
{
	displayConstellations = "obscure";
	buttonConstellationNone.insideStyle = "#7F7F7F"
	buttonConstellationZodiac.insideStyle = "#7F7F7F"
	buttonConstellationMajor.insideStyle = "#7F7F7F"
	buttonConstellationMinor.insideStyle = "#7F7F7F"
	buttonConstellationObscure.insideStyle = "#007F00"
	draw();
}

var buttonConstellationNone = new Button("No Constellations",canvasMap.width / 2 - 120,canvasMap.height - 25,40,15,selectConstellationNone);
buttonConstellationNone.insideStyle = "#7F7F7F"
buttonConstellationNone.text = "None";

var buttonConstellationZodiac = new Button("Zodiac Constellations",canvasMap.width / 2 - 70,canvasMap.height - 25,40,15,selectConstellationZodiac);
buttonConstellationZodiac.insideStyle = "#007F00"
buttonConstellationZodiac.text = "Zodiac";

var buttonConstellationMajor = new Button("Major Constellations",canvasMap.width / 2 - 20,canvasMap.height - 25,40,15,selectConstellationMajor);
buttonConstellationMajor.insideStyle = "#7F7F7F"
buttonConstellationMajor.text = "Major";

var buttonConstellationMinor = new Button("Major Constellations",canvasMap.width / 2 + 30,canvasMap.height - 25,40,15,selectConstellationMinor);
buttonConstellationMinor.insideStyle = "#7F7F7F"
buttonConstellationMinor.text = "Major";

var buttonConstellationObscure = new Button("Obscure Constellations",canvasMap.width / 2 + 80,canvasMap.height - 25,40,15,selectConstellationObscure);
buttonConstellationObscure.insideStyle = "#7F7F7F"
buttonConstellationObscure.text = "Obscure";


commonUIRegister(buttonNoFilter);
commonUIRegister(buttonFilterU);
commonUIRegister(buttonFilterB);
commonUIRegister(buttonFilterV);
commonUIRegister(buttonFilterR);
commonUIRegister(buttonFilterI);

commonUIRegister(buttonConstellationNone);
commonUIRegister(buttonConstellationZodiac);
commonUIRegister(buttonConstellationMajor);
commonUIRegister(buttonConstellationMinor);
commonUIRegister(buttonConstellationObscure);


function draw(){
	var skyMap = new SkyMap(contextMap,canvasMap.width / 2 - zoomCenterX * zoom ,canvasMap.height / 2 - zoomCenterY* zoom,(canvasMap.width - 100)  * zoom,(canvasMap.height - 100) * zoom);
	skyMap.filter = filter;
	skyMap.displayConstellations = displayConstellations;

// draw a black square for the map area box
	contextMap.fillStyle = "#000000";
	contextMap.fillRect(0,0,canvasMap.width,canvasMap.height);

	contextMap.save()
	contextMap.rect(50,50,canvasMap.width - 100,canvasMap.height - 100);
	contextMap.clip();
	skyMap.draw();
	contextMap.restore();

	commonUIdraw(contextMap);
//	window.setTimeout(work, 1000.0/30.0);
}

draw();

