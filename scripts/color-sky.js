
let theCanvas = document.getElementById("mapCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it
let theContext = theCanvas.getContext("2d");

let timer = 0;


let projectionType = "Mollweide";
let displayConstellations = "zodiac";
let filter = "none"
let displayCoordinates = "Equatorial"
let zoom = 1.0;
let zoomCenterX = 0;
let zoomCenterY = 0;


let maxHeight = window.innerHeight - 300;
let maxWidth = window.innerWidth - 20;

theCanvas.width = Math.min(maxHeight * 2.0, maxWidth);
theCanvas.height = Math.min(maxHeight, maxWidth * 0.5);


let mapWidth = theCanvas.width - 80.0;
let mapHeight = mapWidth * 0.5;


const mapCenterX = theCanvas.width / 2;
const mapCenterY = mapHeight / 2 + 5;

let g_update =

function onWheel(event)
{
	if (event.deltaY != 0)
	{
//		let Xeffective = ((event.offsetX - theCanvas.width / 2)) / zoom + zoomCenterX
//		let Yeffective = ((event.offsetY - theCanvas.height / 2)) / zoom + zoomCenterY
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
let buttonFilterNone = document.getElementById("buttonFilterNone");
let buttonFilterU = document.getElementById("buttonFilterU");
let buttonFilterB = document.getElementById("buttonFilterB");
let buttonFilterV = document.getElementById("buttonFilterV");
let buttonFilterR = document.getElementById("buttonFilterR");
let buttonFilterI = document.getElementById("buttonFilterI");

let skyMap = null;//new SkyMap(starsm6._data);

function selectFilter(value)
{
	filter = value;
	buttonFilterNone.style.backgroundColor = value == "none" ? "#00bf00" : "#efefef";
	buttonFilterU.style.backgroundColor = value == "U" ? "#00bf00" : "#efefef";
	buttonFilterB.style.backgroundColor = value == "B" ? "#00bf00" : "#efefef";
	buttonFilterV.style.backgroundColor = value == "V" ? "#00bf00" : "#efefef";
	buttonFilterR.style.backgroundColor = value == "R" ? "#00bf00" : "#efefef";
	buttonFilterI.style.backgroundColor = value == "I" ? "#00bf00" : "#efefef";
	draw();
}
selectFilter("none");

let buttonConstellationsNone = document.getElementById("buttonConstellationsNone");
let buttonConstellationsZodiac = document.getElementById("buttonConstellationsZodiac");
let buttonConstellationsMajor = document.getElementById("buttonConstellationsMajor");
let buttonConstellationsMinor = document.getElementById("buttonConstellationsMinor");
let buttonConstellationsAll = document.getElementById("buttonConstellationsAll");

function selectConstellation(value)
{
	displayConstellations = value;
	buttonConstellationsNone.style.backgroundColor = value == "none" ? "#00bf00" : "#efefef";
	buttonConstellationsZodiac.style.backgroundColor = value == "zodiac" ? "#00bf00" : "#efefef";
	buttonConstellationsMajor.style.backgroundColor = value == "major" ? "#00bf00" : "#efefef";
	buttonConstellationsMinor.style.backgroundColor = value == "minor" ? "#00bf00" : "#efefef";
	buttonConstellationsAll.style.backgroundColor = value == "all" ? "#00bf00" : "#efefef";
	draw();
}
selectConstellation("zodiac");


let buttonCoordinatesEquatorial = document.getElementById("buttonCoordinatesEquatorial");
let buttonCoordinatesEcliptic = document.getElementById("buttonCoordinatesEcliptic");
let buttonCoordinatesGalactic = document.getElementById("buttonCoordinatesGalactic");

function selectCoordinateSystem(value)
{
	displayCoordinates = value;
	buttonCoordinatesEquatorial.style.backgroundColor = value == "Equatorial" ? "#00bf00" : "#efefef";
	buttonCoordinatesEcliptic.style.backgroundColor = value == "Ecliptic" ? "#00bf00" : "#efefef";
	buttonCoordinatesGalactic.style.backgroundColor = value == "Galactic" ? "#00bf00" : "#efefef";
	draw();
}
selectCoordinateSystem("Equatorial");

function draw(){

	if (skyMap !== null)
	{
		const mapWidthDraw = mapWidth * zoom;
		const mapHeightDraw = mapHeight * zoom;
		const mapCenterXDraw = mapCenterX - zoomCenterX * zoom;
		const mapCenterYDraw = mapCenterY - zoomCenterY * zoom;

		skyMap.filter = filter;
		skyMap.displayConstellations = displayConstellations;
		skyMap.coordinates = displayCoordinates;
		skyMap.stars = starsm6._data;


	// draw a black square for the map area box
		theContext.fillStyle = "#000000";
		theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

		theContext.save()
		theContext.rect(mapCenterX - 0.5 * mapWidth,mapCenterY - 0.5 * mapHeight,mapWidth,mapHeight);
		theContext.clip();
		skyMap.draw(theContext,mapCenterXDraw,mapCenterYDraw,mapWidthDraw,mapHeightDraw);
		theContext.restore();


	// draw the elongation reference on the map
		theContext.font = "10px Ariel";

		theContext.strokeStyle = "#FFFF00"
		theContext.fillStyle = "#FFFF00"
		theContext.beginPath();
		if (projectionType== "Mollweide")
		{
			theContext.moveTo(mapCenterXDraw - mapWidthDraw * 0.5,mapCenterYDraw);
			theContext.lineTo(mapCenterXDraw - mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		else
		{
			theContext.moveTo(mapCenterXDraw - mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5 - 20.0);
			theContext.lineTo(mapCenterXDraw - mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5);
		}
			theContext.stroke();
		drawTextCenter(theContext,"-180",mapCenterXDraw - mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5 + 10);

		theContext.beginPath();
		if (projectionType == "Mollweide")
		{
			theContext.moveTo(mapCenterXDraw - mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5 * Math.sqrt(0.75));
			theContext.lineTo(mapCenterXDraw - mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		else
		{
			theContext.moveTo(mapCenterXDraw - mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5 - 20.0);
			theContext.lineTo(mapCenterXDraw - mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		theContext.stroke();
		drawTextCenter(theContext,"-90",mapCenterXDraw - mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5 + 10);

		drawTextCenter(theContext,"0",mapCenterXDraw,mapCenterYDraw + mapHeightDraw * 0.5 + 10);
		theContext.beginPath();
		if (projectionType == "Mollweide")
		{
			theContext.moveTo(mapCenterXDraw + mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5 * Math.sqrt(0.75));
			theContext.lineTo(mapCenterXDraw + mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		else
		{
			theContext.moveTo(mapCenterXDraw + mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5 - 20.0);
			theContext.lineTo(mapCenterXDraw + mapWidthDraw * 0.25,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		theContext.stroke();
		drawTextCenter(theContext,"+90",mapCenterXDraw + mapWidthDraw * 0.25,mapCenterY + mapHeightDraw * 0.5 + 10);

		theContext.beginPath();
		if (projectionType == "Mollweide")
		{
			theContext.moveTo(mapCenterXDraw + mapWidthDraw * 0.5,mapCenterYDraw);
			theContext.lineTo(mapCenterXDraw + mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5);
		}
		else
		{
			theContext.moveTo(mapCenterXDraw + mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5 - 20.0);
			theContext.lineTo(mapCenterXDraw + mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5);
		
		}
		theContext.stroke();
		drawTextCenter(theContext,"+180",mapCenterXDraw + mapWidthDraw * 0.5,mapCenterYDraw + mapHeightDraw * 0.5 + 10);

		theContext.font = "20px Arial"
		theContext.fillStyle = "#FFFFFF"
//		drawTextCenter(theContext,"Filter",theCanvas.width * 0.5,filterTextY);
//		drawTextCenter(theContext,"Constellations",theCanvas.width * 0.5,constellationTextY);
//		drawTextCenter(theContext,"Coordinate System",theCanvas.width * 0.5,coordinatesTextY);
	}
}


let waitForReadyTimer = 0.0;

function waitForReady()
{
	if (!constellationsReady || !starsm6.ready)
	{
		theContext.fillStyle = "#000000";
		theContext.fillRect(0,0,theCanvas.width,theCanvas.height);
		waitForReadyTimer += 0.25;
		theContext.fillStyle = "#FFFFFF";
		theContext.fillStyle = "#FFFFFF";
		theContext.font = "20px Ariel";
		drawTextCenter(theContext,"Please Wait",theCanvas.width * 0.5,theCanvas.height * 0.5 - 15);
		const timerDots = Math.floor(waitForReadyTimer * 4.0) % 4;
		let dots = "";
		if (timerDots == 0)
			dots = "."
		else if (timerDots == 1)
			dots = ".."
		else 
			dots = "..."
		theContext.fillText("Scanning the Sky " + dots,theCanvas.width * 0.5 - theContext.measureText("Scanning the Sky ").width * 0.5,theCanvas.height * 0.5 + 15);
		drawTextCenter(theContext,"This may take a minute or two.",theCanvas.width * 0.5,theCanvas.height * 0.5 + 45);
		window.setTimeout(waitForReady, 333.0);
	}
	else
	{
		skyMap = new SkyMap(starsm6._data);
		draw();
	}
}
waitForReady();

