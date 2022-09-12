
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

const minimumButtonsHeight = 280;
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth - 20;

const offsetButtonsText = 10;
const offsetTextButtons = 50;
let mapHeight = theCanvas.height - minimumButtonsHeight;
let mapWidth = 2 * mapHeight;
if (mapWidth > theCanvas.width - 80)
{
	mapWidth = theCanvas.width - 80;
	mapHeight = 0.5 * mapWidth;
}


const mapCenterX = theCanvas.width / 2;
const mapCenterY = mapHeight / 2 + 5;
const filterTextY = mapHeight + offsetTextButtons;
const filterButtonY = filterTextY + offsetButtonsText;
const constellationTextY = filterButtonY + offsetTextButtons;
const constellationButtonsY = constellationTextY + offsetButtonsText;
const coordinatesTextY = constellationButtonsY + offsetTextButtons;
const coordinatesButtonsY = coordinatesTextY + offsetButtonsText;
const tutorialControlsY0 = coordinatesButtonsY + offsetTextButtons + 10;
const aboutTutorialButtonsY = tutorialControlsY0;
const tutorialTextOffset = -20;



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

function selectFilter(value)
{
	filter = value;
	draw();
}

let radButtons = new Array();

radButtons.push(new RadioButton("No Filter","none",theCanvas.width / 2 - 265,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "No Filter";

radButtons.push(new RadioButton("U Filter","U",theCanvas.width / 2 - 175,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "U";

radButtons.push(new RadioButton("B Filter","B",theCanvas.width / 2 - 85,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "B";

radButtons.push(new RadioButton("V Filter","V",theCanvas.width / 2 + 5,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "V";

radButtons.push(new RadioButton("R Filter","R",theCanvas.width / 2 + 95,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "R";

radButtons.push(new RadioButton("I Filter","I",theCanvas.width / 2 + 185,filterButtonY,80,25));
radButtons[radButtons.length - 1].text = "I";

let filterRadio = new Radio("Filter","none",selectFilter,radButtons);
commonUIRegister(filterRadio);


function selectConstellation(constellation)
{
	displayConstellations = constellation;
	draw();
}

let radButtonsConst = new Array();

radButtonsConst.push(new RadioButton("No Constellations","none",theCanvas.width / 2 - 210,constellationButtonsY,80,25));
radButtonsConst[radButtonsConst.length - 1].text = "None";

radButtonsConst.push(new RadioButton("Zodiac Constellations","zodiac",theCanvas.width / 2 - 125,constellationButtonsY,80,25));
radButtonsConst[radButtonsConst.length - 1].text = "Zodiac";

radButtonsConst.push(new RadioButton("Major Constellations","major",theCanvas.width / 2 - 40,constellationButtonsY,80,25));
radButtonsConst[radButtonsConst.length - 1].text = "Major";

radButtonsConst.push(new RadioButton("Major Constellations","minor",theCanvas.width / 2 + 45,constellationButtonsY,80,25));
radButtonsConst[radButtonsConst.length - 1].text = "Minor";

radButtonsConst.push(new RadioButton("Obscure Constellations","all",theCanvas.width / 2 + 130,constellationButtonsY,80,25));
radButtonsConst[radButtonsConst.length - 1].text = "Obscure";

commonUIRegister(new Radio("Contstellations","zodiac",selectConstellation,radButtonsConst));



function selectCoordinateSystem(coordinates)
{
	displayCoordinates = coordinates;
	draw();
}
let coordButtonsConst = new Array();

coordButtonsConst.push(new RadioButton("Equatorial","Equatorial",theCanvas.width / 2 - 140,coordinatesButtonsY,90,25));
coordButtonsConst[coordButtonsConst.length - 1].text = "Equatorial";

coordButtonsConst.push(new RadioButton("Ecliptic","Ecliptic",theCanvas.width / 2 - 45,coordinatesButtonsY,90,25));
coordButtonsConst[coordButtonsConst.length - 1].text = "Ecliptic";

coordButtonsConst.push(new RadioButton("Galactic","Galactic",theCanvas.width / 2 + 50,coordinatesButtonsY,90,25));
coordButtonsConst[coordButtonsConst.length - 1].text = "Galactic";

let radioCoord = new Radio("Coordinate System","Equatorial",selectCoordinateSystem,coordButtonsConst);
commonUIRegister(radioCoord);



function tutorialDraw(context,state)
{
	switch (state)
	{
	case 0:
	default:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,theCanvas.height);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "30px Arial";
		drawTextCenter(context,ColorSkyStrings.titleState0,theCanvas.width * 0.5,250);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State0,theCanvas.width * 0.5,350);
		drawTextCenter(context,ColorSkyStrings.line2State0,theCanvas.width * 0.5,400);
		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,450);
		break;
	case 1:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,filterTextY + tutorialTextOffset - 3,theCanvas.width,theCanvas.height - filterTextY + 3 - tutorialTextOffset);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State1,theCanvas.width * 0.5,filterButtonY + tutorialTextOffset + 20);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line2State1,theCanvas.width * 0.5,filterButtonY + tutorialTextOffset  + 70);
		drawTextCenter(context,ColorSkyStrings.line3State1,theCanvas.width * 0.5,filterButtonY + tutorialTextOffset  + 100);
		drawTextCenter(context,ColorSkyStrings.line4State1,theCanvas.width * 0.5,filterButtonY + tutorialTextOffset  + 130);

		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 2:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,filterButtonY - 3);
		context.fillRect(0,constellationTextY + tutorialTextOffset - 3,theCanvas.width,theCanvas.height - constellationTextY + 3 - tutorialTextOffset);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State2,theCanvas.width * 0.5,filterButtonY - 10);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line2State2,theCanvas.width * 0.5,constellationTextY + 20);
		drawTextCenter(context,ColorSkyStrings.line3State2,theCanvas.width * 0.5,constellationTextY + 50);

		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 3:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,constellationTextY + tutorialTextOffset - 3,theCanvas.width,theCanvas.height - constellationTextY + 3 - tutorialTextOffset);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State3,theCanvas.width * 0.5,constellationTextY + tutorialTextOffset + 20);
		drawTextCenter(context,ColorSkyStrings.line2State3,theCanvas.width * 0.5,constellationTextY + tutorialTextOffset + 50);

		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 4:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,constellationButtonsY - 3);
		context.fillRect(0,coordinatesTextY - 3 + tutorialTextOffset,theCanvas.width,theCanvas.height - coordinatesTextY + 3 - tutorialTextOffset);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State4,theCanvas.width * 0.5,constellationButtonsY - 10);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line2State4,theCanvas.width * 0.5,coordinatesTextY + 15 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line3State4,theCanvas.width * 0.5,coordinatesTextY + 35 + tutorialTextOffset);

		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 5:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,coordinatesTextY  + 3);
		context.fillRect(0,tutorialControlsY0 - 3,theCanvas.width,theCanvas.height - tutorialControlsY0 + 3);

		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State5,theCanvas.width * 0.5,coordinatesTextY + tutorialTextOffset - 150);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line2State5,theCanvas.width * 0.5,coordinatesTextY + tutorialTextOffset - 80);
		drawTextCenter(context,ColorSkyStrings.line3State5,theCanvas.width * 0.5,coordinatesTextY + tutorialTextOffset - 60);
		drawTextCenter(context,ColorSkyStrings.line4State5,theCanvas.width * 0.5,coordinatesTextY + tutorialTextOffset - 40);
		drawTextCenter(context,ColorSkyStrings.line5State5,theCanvas.width * 0.5,coordinatesTextY + tutorialTextOffset - 0);

		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 6:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,filterTextY - 3 + tutorialTextOffset,theCanvas.width,coordinatesTextY - filterTextY);
		context.fillRect(0,tutorialControlsY0 - 3,theCanvas.width,theCanvas.height - tutorialControlsY0 + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State6,theCanvas.width * 0.5,filterTextY + 50 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line2State6,theCanvas.width * 0.5,filterTextY + 70 + tutorialTextOffset);

		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 7:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,filterTextY - 3 + tutorialTextOffset,theCanvas.width,coordinatesTextY - filterTextY);
		context.fillRect(0,tutorialControlsY0 - 3,theCanvas.width,theCanvas.height - tutorialControlsY0 + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State7,theCanvas.width * 0.5,filterTextY + 50 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line2State7,theCanvas.width * 0.5,filterTextY + 70 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line3State7,theCanvas.width * 0.5,filterTextY + 90 + tutorialTextOffset);

		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 8:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,filterTextY - 3 + tutorialTextOffset,theCanvas.width,coordinatesTextY - filterTextY);
		context.fillRect(0,tutorialControlsY0 - 3,theCanvas.width,theCanvas.height - tutorialControlsY0 + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line1State8,theCanvas.width * 0.5,filterTextY + 50 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line2State8,theCanvas.width * 0.5,filterTextY + 70 + tutorialTextOffset);
		drawTextCenter(context,ColorSkyStrings.line3State8,theCanvas.width * 0.5,filterTextY + 90 + tutorialTextOffset);

		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.lineContinue,theCanvas.width * 0.5,tutorialControlsY0 - 15);
		break;
	case 9:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,theCanvas.height);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "40px Arial";
		drawTextCenter(context,ColorSkyStrings.line1StateFinal,theCanvas.width * 0.5,100);
		context.font = "20px Arial";
		drawTextCenter(context,ColorSkyStrings.line2StateFinal,theCanvas.width * 0.5,200);
		drawTextCenter(context,ColorSkyStrings.line3StateFinal,theCanvas.width * 0.5,280);
		drawTextCenter(context,ColorSkyStrings.line4StateFinal,theCanvas.width * 0.5,360);
		break;
	}
}

let g_tutorial = new Tutorial();

function tutorialSkip(event)
{
	g_tutorial.deactivate();
	draw();
}
function tutorialStart(event)
{
	g_tutorial.activate();
	draw();
}
function tutorialAdvance(event)
{
	g_tutorial.advanceState();
	switch (g_tutorial.state)
	{
	case 0:
	case 1:
	case 2:
		break;
	case 3:
		filterRadio.setState("V");
		break;
	case 4:
		filterRadio.setState("none");
		break;
	case 5:
		break;
	case 6:
		radioCoord.setState("Equatorial");
		break;
	case 7:
		radioCoord.setState("Ecliptic");
		break;
	case 8:
		radioCoord.setState("Galactic");
		break;
	case 9:
		radioCoord.setState("Equatorial");
		break;
	default:
	case 10:
		g_tutorial.complete();
		window.localStorage.setItem("tutorialCompleteColorSky",true);
		break;
	}
	draw();
}
function tutorialRewind(event)
{
	g_tutorial.rewindState();
	switch (g_tutorial.state)
	{
	case 0:
	case 1:
	case 2:
		filterRadio.setState("none");
		break;
	case 3:
		filterRadio.setState("V");
		break;
	case 4:
		filterRadio.setState("none");
		break;
	case 5:
		break;
	case 6:
		radioCoord.setState("Equatorial");
		break;
	case 7:
		radioCoord.setState("Ecliptic");
		break;
	case 8:
		radioCoord.setState("Galactic");
		break;
	case 9:
		radioCoord.setState("Equatorial");
		break;
	default:
	case 10:
		g_tutorial.complete();
		window.localStorage.setItem("tutorialCompleteColorSky",true);
		break;
	}
	draw();
}

g_tutorial.drawer = tutorialDraw;
let tutorialSkipButton = new Button("Skip Tutorial",theCanvas.width / 2 - 60,tutorialControlsY0,120,25,tutorialSkip);
let tutorialAdvanceButton = new Button("Next",theCanvas.width / 2 + 70,tutorialControlsY0,40,25,tutorialAdvance);
let tutorialRewindButton = new Button("Prev",theCanvas.width / 2 - 110,tutorialControlsY0,40,25,tutorialRewind);

g_tutorial.disableStandardUI();
g_tutorial.addUI(0,tutorialSkipButton);
g_tutorial.addUI(0,tutorialAdvanceButton);

g_tutorial.addUI(1,tutorialSkipButton);
g_tutorial.addUI(1,tutorialAdvanceButton);
g_tutorial.addUI(1,tutorialRewindButton);

g_tutorial.addUI(2,tutorialSkipButton);
g_tutorial.addUI(2,tutorialAdvanceButton);
g_tutorial.addUI(2,tutorialRewindButton);

g_tutorial.addUI(3,tutorialSkipButton);
g_tutorial.addUI(3,tutorialAdvanceButton);
g_tutorial.addUI(3,tutorialRewindButton);

g_tutorial.addUI(4,tutorialSkipButton);
g_tutorial.addUI(4,tutorialAdvanceButton);
g_tutorial.addUI(4,tutorialRewindButton);

g_tutorial.addUI(5,tutorialSkipButton);
g_tutorial.addUI(5,tutorialAdvanceButton);
g_tutorial.addUI(5,tutorialRewindButton);

g_tutorial.addUI(6,tutorialSkipButton);
g_tutorial.addUI(6,tutorialAdvanceButton);
g_tutorial.addUI(6,tutorialRewindButton);

g_tutorial.addUI(7,tutorialSkipButton);
g_tutorial.addUI(7,tutorialAdvanceButton);
g_tutorial.addUI(7,tutorialRewindButton);

g_tutorial.addUI(8,tutorialSkipButton);
g_tutorial.addUI(8,tutorialAdvanceButton);
g_tutorial.addUI(8,tutorialRewindButton);

g_tutorial.addUI(9,tutorialAdvanceButton);
g_tutorial.addUI(9,tutorialRewindButton);



let tutorialCompleted = window.localStorage.getItem("tutorialCompleteColorSky");
if (!tutorialCompleted)
	g_tutorial.activate();

commonUIRegister(g_tutorial);

let replayTutorialButton = new Button("Tutorial",theCanvas.width - 210,aboutTutorialButtonsY,100,25,tutorialStart);
replayTutorialButton.textFont = "24px Arial";
commonUIRegister(replayTutorialButton);

let g_about = new Tutorial();

function aboutShow(event)
{
	g_about.activate();
	draw();
}
function aboutDone(event)
{
	g_about.complete();
	draw();
}
function aboutDraw(context,state)
{
	context.globalAlpha = 0.9;
	context.fillStyle = "#000000";
	context.fillRect(0,0,theCanvas.width,theCanvas.height);
	context.globalAlpha = 1.0;
	context.fillStyle = "#FFFFFF";
	context.font = "30px Arial";
	drawTextCenter(context,ColorSkyStrings.aboutLine1,theCanvas.width * 0.5,250);
	context.font = "20px Arial";
	drawTextCenter(context,ColorSkyStrings.aboutLine2,theCanvas.width * 0.5,290);
	drawTextCenter(context,ColorSkyStrings.aboutLine3,theCanvas.width * 0.5,400);
	drawTextCenter(context,ColorSkyStrings.aboutLine4,theCanvas.width * 0.5,430);
	drawTextCenter(context,ColorSkyStrings.aboutLine5,theCanvas.width * 0.5,490);
//	drawTextCenter(context,ColorSkyStrings.aboutLine6,theCanvas.width * 0.5,490);
//	drawTextCenter(context,ColorSkyStrings.aboutLine7,theCanvas.width * 0.5,520);
}

g_about.drawer = aboutDraw;

let aboutOKButton= new Button("OK",theCanvas.width / 2,tutorialControlsY0,40,25,aboutDone);
aboutOKButton.textFont = "24px Arial";

g_about.disableStandardUI();
g_about.addUI(0,aboutOKButton);
commonUIRegister(g_about);

let aboutButton= new Button("About",theCanvas.width - 100,aboutTutorialButtonsY,80,25,aboutShow);
aboutButton.textFont = "24px Arial";
commonUIRegister(aboutButton);

let skyMap = new SkyMap(starsm6._data);
function draw(){

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
	drawTextCenter(theContext,"Filter",theCanvas.width * 0.5,filterTextY);
	drawTextCenter(theContext,"Constellations",theCanvas.width * 0.5,constellationTextY);
	drawTextCenter(theContext,"Coordinate System",theCanvas.width * 0.5,coordinatesTextY);

	commonUIdraw(theContext);
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
		draw();
	}
}
waitForReady();

