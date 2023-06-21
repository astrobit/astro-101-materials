let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d");

const minimumControlsHeightTop = 50;

theCanvas.height = window.innerHeight - 220;
theCanvas.width = window.innerWidth;

const elongationMapHeight = theCanvas.height - minimumControlsHeightTop;
const elongationMapWidth = elongationMapHeight * 2;

const elongationMapX = theCanvas.width / 2
const elongationMapY = elongationMapHeight / 2;

const bottomSpace = theCanvas.width


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

let g_basespeed = 1.0;
function requestFasterBackward()
{
	if (pause)
		pause = false;
	else if (g_speed >= 0)
		g_speed = -g_basespeed;
	else
		g_speed *= 2; 
}
function requestFasterForward()
{
	if (pause)
		pause = false;
	else if (g_speed <= 0)
		g_speed = g_basespeed;
	else
		g_speed *= 2; 
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


function drawElongationMap()
{
	const halfHeight = elongationMapHeight * 0.5;
	const halfWidth = elongationMapWidth * 0.5;
	const qtrWidth = elongationMapWidth * 0.25;

	theContext.save();
	theContext.translate(elongationMapX,elongationMapY);
	
	const sunLongitude = (180.0 + g_planetView["Earth"].planetHelio.theta * kDegrees) % 360.0;
	let projectionLongitude = 0;
	if (g_viewCenter == "Sun")
		projectionLongitude = sunLongitude;
	else if (g_viewCenter == "Planet")
		projectionLongitude = g_planetView[selectedPlanet].elongLong * kDegrees + sunLongitude;
		
	const projection = new Mollweide(projectionLongitude,0.0);
// draw the stars on the map
	if (starsm6.ready)
	{
		const mapImage = new ImgData(theContext, elongationMapX - halfWidth, elongationMapY - halfHeight, elongationMapWidth, elongationMapHeight);
		const len = starsm6.length;
		let i;
		for (i = 0; i < len; i++)
		{
			//console.log("here " + starsm6.at(i).latitude + " " + starsm6.at(i).longitude + " " + projection.x + " " + projection.y);
			const starProj = projection.calculate(starsm6.at(i).eclat, starsm6.at(i).eclong);
			const color = UBVRItoRGB(starsm6.at(i).U, starsm6.at(i).B, starsm6.at(i).V, starsm6.at(i).R, starsm6.at(i).I);
			drawStar(mapImage, (1.0 - starProj.x) * halfWidth, (1.0 - starProj.y	) * halfHeight, 2.0, color);
/*			theContext.fillStyle  = UBVRItoRGB(starsm6.at(i).U,starsm6.at(i).B,starsm6.at(i).V,starsm6.at(i).R,starsm6.at(i).I).style;
			theContext.beginPath();
			theContext.arc(starProj.x * halfWidth,starProj.y * halfHeight,1,0,2.0*Math.PI,true);
			theContext.closePath();
			theContext.fill();*/
		}
		mapImage.draw();
	}
	else
	{
		theContext.fillStyle = "#7F7F7F"
		theContext.font = "15px Arial";
		drawTextCenter(theContext,"Loading stars. Standby.",0,-60);
	}

// draw the ellipse for the map
	theContext.strokeStyle  = "#FFFFFF";
	drawEllipseByCenter(theContext,0,0,elongationMapWidth,elongationMapHeight);
// draw the ecliptic on the map
	theContext.strokeStyle  = "#3F3F3F";
	theContext.beginPath();
	theContext.moveTo(-halfWidth,0 );
	theContext.lineTo(halfWidth,0);
	theContext.stroke();
// draw the Sun on the map
	const sunSize = Math.max(0.5 * halfWidth / 180.0,1) * 4;
	const sunProj = projection.calculate(0.0,sunLongitude);
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.arc(-sunProj.x * halfWidth,0,sunSize,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();
	
	let i;
	for (i = 0; i < planetsID.length; i++)
	{
	// draw the selected planet on the map
		const planetProj = projection.calculate(g_planetView[planetsID[i]].elongLat * kDegrees,g_planetView[planetsID[i]].elongLong * kDegrees + sunLongitude);
		const sizeEq = 0.5 * halfWidth * g_planetView[planetsID[i]].angSizeEq / Math.PI;// / g_planetView[selectedPlanet].angSizeAvg;
		const sizePol = 0.5 * halfWidth * g_planetView[planetsID[i]].angSizePolar / Math.PI;// / g_planetView[selectedPlanet].angSizeAvg;
		const size = Math.max(Math.max(sizeEq,sizePol),1) * 4;
		const brightness = Math.max(Math.pow(10.0,g_planetView[planetsID[i]].appBright*0.4),1);
		let color = new RGB();
		color.style = g_planetView[planetsID[i]].style;
		color.scale(brightness);
		theContext.fillStyle  = color.style;
		theContext.beginPath();
		theContext.arc(-planetProj.x * halfWidth,-planetProj.y * halfHeight,size,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.fill();
		if (planetsID[i] == selectedPlanet)
		{
			theContext.strokeStyle  = "#ffffff"
			theContext.beginPath();
			theContext.arc(-planetProj.x * halfWidth,-planetProj.y * halfHeight,12,0,2.0*Math.PI,true);
			theContext.closePath();
			theContext.stroke();
		}
	}

// move to below map
	theContext.translate(0,halfHeight);

// draw the elongation reference on the map
	theContext.font = "10px Arial";

	theContext.strokeStyle = "#7F7F7F"
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.moveTo(-halfWidth,-halfHeight);
	theContext.lineTo(-halfWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"+180",-halfWidth,10);

	theContext.beginPath();
	theContext.moveTo(-qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	theContext.lineTo(-qtrWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"+90",-qtrWidth,10);

	drawTextCenter(theContext,"0",0,10);

	theContext.beginPath();
	theContext.moveTo(qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	theContext.lineTo(qtrWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"-90",qtrWidth,10);

	theContext.beginPath();
	theContext.moveTo(halfWidth,-halfHeight);
	theContext.lineTo(halfWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"-180",halfWidth,10);
	
	let elongationDisplayValue = g_planetView[selectedPlanet].elongLong * kDegrees;
	if (elongationDisplayValue > 180.0)
		elongationDisplayValue = elongationDisplayValue - 360.0;
	let elongationDisplay = (Math.round(elongationDisplayValue * 10.0) / 10.0).toString();
	if (elongationDisplay.charAt(elongationDisplay.length - 2) != '.')
		elongationDisplay = elongationDisplay + ".0"
// draw planet information on the map
	theContext.fillStyle = "#FFFF00"
	theContext.font = "15px Arial";
	drawTextRight(theContext,"Planet: ",-410,35);
	drawTextLeft(theContext,selectedPlanet,-405,35);
	drawTextRight(theContext,"Elongation: " ,-255,35);
	drawTextLeft(theContext,elongationDisplay + String.fromCharCode(0x00b0),-255,35);

// draw planet information on the map
	theContext.fillStyle = "#FFFF00"
	theContext.font = "15px Arial";

	const timerReadable = Math.round(g_timer / 365.0 * 100.0 - 6716.0) / 100.0
	let timerDisplay = timerReadable.toString();
	if (timerDisplay.charAt(timerDisplay.length - 3) != '.')
	{
		if (timerDisplay.charAt(timerDisplay.length - 2) == '.')
			timerDisplay = timerDisplay + '0'
		else
			timerDisplay = timerDisplay + '.00'
	}
	const timerReadableDays = Math.round(g_timer * 100.0) / 100.0;
	let timerDisplayDays = timerReadableDays.toString();
	if (timerDisplayDays.charAt(timerDisplayDays.length - 3) != '.')
	{
		if (timerDisplayDays.charAt(timerDisplayDays.length - 2) == '.')
			timerDisplayDays = timerDisplayDays + '0'
		else
			timerDisplayDays = timerDisplayDays + '.00'
	}


//	theContext.fillText("Date: ",0,35);
	const calend = JDtoGregorian(g_timer);
	let monthDisplay = calend.month.toString();
	if (calend.month < 10)
		monthDisplay = "0" + monthDisplay;
	let dayDisplay = Math.floor(calend.day).toString()
	if (calend.day < 10)
		dayDisplay = "0" + dayDisplay;
	drawTextRight(theContext,calend.year + "/" + monthDisplay + '/' + dayDisplay,-5,35);
	drawTextLeft(theContext,"(JD "+ timerDisplayDays + ")",5,35);

	theContext.restore();
}


function work(){


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


	drawElongationMap();

	window.setTimeout(work, 1000.0/30.0);
}

work();

