let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d",{willReadFrequently: true});

const minimumControlsHeightTop = 50;



let buttonPlanetMercury = document.getElementById("buttonPlanetMercury");
let buttonPlanetVenus = document.getElementById("buttonPlanetVenus");
let buttonPlanetMars = document.getElementById("buttonPlanetMars");
let buttonPlanetJupiter = document.getElementById("buttonPlanetJupiter");
let buttonPlanetSaturn = document.getElementById("buttonPlanetSaturn");
let buttonPlanetUranus = document.getElementById("buttonPlanetUranus");
let buttonPlanetNeptune = document.getElementById("buttonPlanetNeptune");

let buttonModelSimple = document.getElementById("buttonModelSimple");
let buttonModelReal = document.getElementById("buttonModelReal");

let buttonFocusSun = document.getElementById("buttonFocusSun");
let buttonFocusPlanet = document.getElementById("buttonFocusPlanet");
let buttonFocusStars = document.getElementById("buttonFocusStars");


let g_speed = 1.0;//0.25;
let pause = true;
let zoom = 100.0;

let g_simpleSolarSystem = false;
let g_planetView = new Object();

const kRadians = Math.PI / 180.0;
const kDegrees = 180.0 / Math.PI;

// fmod from https://gist.github.com/wteuber/6241786
//Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

// draw ellipse functions from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

function speedup(event)
{
	g_speed *= 2.0;
}
function slowdown(event)
{
	g_speed *= 0.5;
}

function zoomin(event)
{
	zoom *= 2.0;
}
function zoomout(event)
{
	zoom *= 0.5;
}

let selectedElongation = 1; // Venus
let selectedPlanet = "Venus"
function selectPlanet(value)
{
	selectedPlanet = value;
	switch (value)
	{
	case "Mercury":
		selectedElongation  = 0;
		break;
	case "Venus":
	default:
		selectedElongation  = 1;
		break;
	case "Mars":
		selectedElongation  = 3;
		break;
	case "Jupiter":
		selectedElongation  = 4;
		break;
	case "Saturn":
		selectedElongation  = 5;
		break;
	case "Uranus":
		selectedElongation  = 6;
		break;
	case "Neptune":
		selectedElongation  = 7;
		break;
	}
	buttonPlanetMercury.style.backgroundColor = selectedElongation == 0 ? "#00bf00" : "#efefef";
	buttonPlanetVenus.style.backgroundColor = selectedElongation == 1 ? "#00bf00" : "#efefef";
	buttonPlanetMars.style.backgroundColor = selectedElongation == 3 ? "#00bf00" : "#efefef";
	buttonPlanetJupiter.style.backgroundColor = selectedElongation == 4 ? "#00bf00" : "#efefef";
	buttonPlanetSaturn.style.backgroundColor = selectedElongation == 5 ? "#00bf00" : "#efefef";
	buttonPlanetUranus.style.backgroundColor = selectedElongation == 6 ? "#00bf00" : "#efefef";
	buttonPlanetNeptune.style.backgroundColor = selectedElongation == 7 ? "#00bf00" : "#efefef";
}
selectPlanet("Venus");


function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
	buttonModelSimple.style.backgroundColor = g_simpleSolarSystem ? "#00bf00" : "#efefef";
	buttonModelReal.style.backgroundColor = !g_simpleSolarSystem ? "#00bf00" : "#efefef";
}
selectComplexity("Real Model");

let g_viewCenter = "Sun";
function selectCenter(value)
{
	g_viewCenter = value;

	buttonFocusSun.style.backgroundColor = (g_viewCenter == "Sun") ? "#00bf00" : "#efefef";
	buttonFocusPlanet.style.backgroundColor = (g_viewCenter == "Planet") ? "#00bf00" : "#efefef";
	buttonFocusStars.style.backgroundColor = (g_viewCenter == "Vernal Equinox") ? "#00bf00" : "#efefef";
}
selectCenter("Sun");

function onSetDate()
{
	let inputDate = document.getElementById("inputDate");
	const requestDate = new Date(inputDate.value + "Z");
	g_timer = requestDate.valueOf() / 86400000.0 + 2440587.50000;
//	inputDate.blur();
}

let g_preDateFocusPause = false;
let g_DateFocus = false;
function onDateFocusIn()
{
	g_preDateFocusPause = pause;
	g_DateFocus = true;
	pause = true;
}
function onDateFocusOut()
{
	pause = g_preDateFocusPause;
	g_DateFocus = false;
}


let g_basespeed = 1.0;
function requestSlower()
{
	if (pause)
		pause = false;
	else
		g_speed *= 0.5; 
}
function requestFaster()
{
	if (pause)
		pause = false;
	else
		g_speed *= 2; 
}
function requestTimeRewind()
{
	if (pause)
		pause = false;
	if (g_speed > 0)
		g_speed = -g_basespeed;
}
function requestTimeForward()
{
	if (pause)
		pause = false;
	if (g_speed < 0)
		g_speed = g_basespeed;
}


function requestAdvanceDay()
{
	g_timer += 1.0;
}
function requestAdvanceWeek()
{
	g_timer += 7.0;
}
function requestAdvanceMonth()
{
	g_timer += 30.0;
}
function requestAdvanceYear()
{
	g_timer += 365.0;
}


function requestBackDay()
{
	g_timer -= 1.0;
}
function requestBackWeek()
{
	g_timer -= 7.0;
}
function requestBackMonth()
{
	g_timer -= 30.0;
}
function requestBackYear()
{
	g_timer -= 365.0;
}

let buttonPause = document.getElementById("buttonPause");
function requestPause()
{
	pause = !pause;
	buttonPause.disable = !pause;
}


let g_SelectedPlanetData = {};
const twoPi = Math.PI * 2.0;
//const degrees = 180.0 / Math.PI;
let g_SunLongitude = 0;
let g_timer = 2456083.27000; //2451545.0;

const planetsID = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune'];


function drawElongationMap(context, height, xOffset, yOffset)
{
	const halfHeight = height * 0.5;
	const halfWidth = height;
	const qtrWidth = height * 0.50;

	context.save();
	const sunLongitude = (180.0 + g_planetView["Earth"].planetHelio.theta * kDegrees) % 360.0;//-g_planetView["Earth"].planetHelio.theta * kDegrees;
	let projectionLongitude = 0;
	if (g_viewCenter == "Sun")
		projectionLongitude = sunLongitude;
	else if (g_viewCenter == "Planet")
		projectionLongitude = g_planetView[selectedPlanet].elongLong * kDegrees + sunLongitude;
	const projection = new Mollweide(projectionLongitude,0.0);
// draw the stars on the map
	if (starsm6.ready)
	{
		const mapImage = new ImgData(context, xOffset - halfWidth, yOffset - halfHeight, height * 2.0, height);
		for (let i in starsm6._data)
		{
			//console.log("here " + starsm6.at(i).latitude + " " + starsm6.at(i).longitude + " " + projection.x + " " + projection.y);
			const starProj = projection.calculate(starsm6.at(i).eclat, starsm6.at(i).eclong);
			const color = UBVRItoRGB(starsm6.at(i).U, starsm6.at(i).B, starsm6.at(i).V, starsm6.at(i).R, starsm6.at(i).I);
			drawStar(mapImage, (1.0 - starProj.x) * halfWidth, (1.0 - starProj.y) * halfHeight, 2.0, color);
/*			context.fillStyle  = UBVRItoRGB(starsm6.at(i).U,starsm6.at(i).B,starsm6.at(i).V,starsm6.at(i).R,starsm6.at(i).I).style;
			context.beginPath();
			context.arc(starProj.x * halfWidth,starProj.y * halfHeight,1,0,2.0*Math.PI,true);
			context.closePath();
			context.fill();*/
		}
		mapImage.draw();
	}
	else
	{
		context.fillStyle = "#7F7F7F"
		context.font = "15px Arial";
		drawTextCenter(context,"Loading stars. Standby.",0,-60);
	}

// draw the ellipse for the map
	context.strokeStyle  = "#FFFFFF";
	drawEllipseByCenter(context,0,0,height * 2.0,height);
// draw the ecliptic on the map
	context.strokeStyle  = "#3F3F3F";
	context.beginPath();
	context.moveTo(-halfWidth,0 );
	context.lineTo(halfWidth,0);
	context.stroke();
// draw the Sun on the map
	const sunSize = Math.max(0.5 * halfWidth / 180.0,2);
	context.fillStyle  = "#FFFF00";
	context.beginPath();
	context.arc(0,0,sunSize,0,2.0*Math.PI,true);
	context.closePath();
	context.fill();

// draw the selected planet on the map
	for (let i in g_planetView)
	{
		const planetProj = projection.calculate(g_planetView[i].elongLat * kDegrees,g_planetView[i].elongLong * kDegrees + sunLongitude);
		context.fillStyle  = g_planetView[i].style;
		context.beginPath();
		context.arc(-planetProj.x * halfWidth,-planetProj.y * halfHeight,2,0,2.0*Math.PI,true);
		context.closePath();
		context.fill();
		if (i == selectedPlanet)
		{
			context.strokeStyle  = "#ffffff"
			context.beginPath();
			context.arc(-planetProj.x * halfWidth,-planetProj.y * halfHeight,8,0,2.0*Math.PI,true);
			context.closePath();
			context.stroke();
		}
	}

// move to below map
	context.translate(0,halfHeight);

// draw the elongation reference on the map
	context.font = "10px Arial";

	context.strokeStyle = "#7F7F7F"
	context.fillStyle  = "#FFFF00";
	context.beginPath();
	context.moveTo(-halfWidth,-halfHeight);
	context.lineTo(-halfWidth,0);
	context.stroke();
	drawTextCenter(context,"+180",-halfWidth,10);

	context.beginPath();
	context.moveTo(-qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	context.lineTo(-qtrWidth,0);
	context.stroke();
	drawTextCenter(context,"+90",-qtrWidth,10);

	drawTextCenter(context,"0",0,10);

	context.beginPath();
	context.moveTo(qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	context.lineTo(qtrWidth,0);
	context.stroke();
	drawTextCenter(context,"-90",qtrWidth,10);

	context.beginPath();
	context.moveTo(halfWidth,-halfHeight);
	context.lineTo(halfWidth,0);
	context.stroke();
	drawTextCenter(context,"-180",halfWidth,10);
	
	context.restore();
}
function updateStatusReadout()
{
	let elongationDisplayValue = g_planetView[selectedPlanet].elongLong * kDegrees;
	if (elongationDisplayValue > 180.0)
		elongationDisplayValue = elongationDisplayValue - 360.0;
	let tdElongation = document.getElementById	("tdElongation");
	tdElongation.innerHTML = "Elongation: " + elongationDisplayValue.toFixed(1) + String.fromCharCode(0x00b0);


	if (!g_DateFocus)
	{
		let tdDate = document.getElementById("tdDate");
		const dateFmt = new Date((g_timer - 2440587.50000) * 86400000.0);
		const month = dateFmt.toLocaleString('default', { month: 'long' });	
	/*	const calend = JDtoGregorian(g_timer);
		let monthDisplay = calend.month.toString();
		if (calend.month < 10)
			monthDisplay = "0" + monthDisplay;
		let dayDisplay = Math.floor(calend.day).toString()
		if (calend.day < 10)
			dayDisplay = "0" + dayDisplay;*/
			
		const isoString = dateFmt.toISOString();
		const localeString = isoString.substring(0,isoString.length - 1);
		tdDate.innerHTML = '<input id="inputDate" type="datetime-local" style="background-color:black;color:yellow;" value="' + localeString + '" oninput="onSetDate();" onfocusin="onDateFocusIn();" onfocusout="onDateFocusOut();">' // padZero(dateFmt.getUTCHours(),2) + ":" + padZero(dateFmt.getUTCMinutes(),2) + ", " + dateFmt.getUTCDate() + " " + month + "  " + dateFmt.getUTCFullYear();
	}

	let tdJD = document.getElementById("tdJD");
/*
	const timerReadable = Math.round(g_timer / 365.0 * 100.0 - 6716.0) / 100.0
	let timerDisplay = g_timer.toFixed(2);

	const timerReadableDays = Math.round(g_timer * 100.0) / 100.0;
	let timerDisplayDays = timerReadableDays.toString();
	if (timerDisplayDays.charAt(timerDisplayDays.length - 3) != '.')
	{
		if (timerDisplayDays.charAt(timerDisplayDays.length - 2) == '.')
			timerDisplayDays = timerDisplayDays + '0'
		else
			timerDisplayDays = timerDisplayDays + '.00'
	}
	*/
	tdJD.innerHTML = "JD " + g_timer.toFixed(2);

	let tdMagnitude = document.getElementById("tdMagnitude");
	tdMagnitude.innerHTML = "V:" + g_planetView[selectedPlanet].appBright.toFixed(1);

}


function work(){
	theCanvas.height = window.innerHeight - 260;
	theCanvas.width = window.innerWidth;

	const elongationMapHeight = theCanvas.height - minimumControlsHeightTop;
	const elongationMapWidth = elongationMapHeight * 2;

	const elongationMapX = theCanvas.width / 2
	const elongationMapY = elongationMapHeight / 2;

	const bottomSpace = theCanvas.width


// as long as it isn't paussed, advance the timer
	if (!pause)
		g_timer = g_timer + 1.0 / 30.0 * g_speed;

// determine which planet is currently selected

	const dateJD = g_timer;
	if (g_simpleSolarSystem)
	{
		g_planetView['Mercury'] = Planets.Mercury.getSimplePosition(dateJD);
		g_planetView['Venus'] = Planets.Venus.getSimplePosition(dateJD);
		g_planetView['Earth'] = Planets.Earth.getSimplePosition(dateJD);
		g_planetView['Mars'] = Planets.Mars.getSimplePosition(dateJD);
		g_planetView['Jupiter'] = Planets.Jupiter.getSimplePosition(dateJD);
		g_planetView['Saturn'] = Planets.Saturn.getSimplePosition(dateJD);
		g_planetView['Uranus'] = Planets.Uranus.getSimplePosition(dateJD);
		g_planetView['Neptune'] = Planets.Neptune.getSimplePosition(dateJD);
	}
	else
	{
		g_planetView['Mercury'] = Planets.Mercury.getTruePosition(dateJD);
		g_planetView['Venus'] = Planets.Venus.getTruePosition(dateJD);
		g_planetView['Earth'] = Planets.Earth.getTruePosition(dateJD);
		g_planetView['Mars'] = Planets.Mars.getTruePosition(dateJD);
		g_planetView['Jupiter'] = Planets.Jupiter.getTruePosition(dateJD);
		g_planetView['Saturn'] = Planets.Saturn.getTruePosition(dateJD);
		g_planetView['Uranus'] = Planets.Uranus.getTruePosition(dateJD);
		g_planetView['Neptune'] = Planets.Neptune.getTruePosition(dateJD);
	}
//	if (typeof datechange == 'undefined' || Math.floor(g_timer) > datechange)
//	{
//		console.log(dateJD);
//		console.log(g_planetView[selectedPlanet].elongLong + ' ' + g_planetView[selectedPlanet].elongLat + ' ' + g_planetView[selectedPlanet].phase + ' ' + g_planetView[selectedPlanet].appBright + ' ' + g_planetView[selectedPlanet].dist )
//		datechange = Math.floor(g_timer);
//	}

	// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

	theContext.save();
	theContext.translate(theCanvas.width * 0.5,theCanvas.height * 0.5);
	drawElongationMap(theContext, theCanvas.height - 20,theCanvas.width * 0.5,theCanvas.height * 0.5);
	theContext.restore();

	updateStatusReadout();

	window.setTimeout(work, 1000.0/30.0);
}

work();

