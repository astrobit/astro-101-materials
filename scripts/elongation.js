let canvasClassicView = document.getElementById("canvasClassicView");
let canvasSkyView = document.getElementById("canvasSkyView");
let canvasSolaySystemView = document.getElementById("canvasSolaySystemView");
let canvasTelescopeView = document.getElementById("canvasTelescopeView");

let contextClassicView = canvasClassicView.getContext("2d");
let contextSkyView = canvasSkyView.getContext("2d");
let contextSolaySystemView = canvasSolaySystemView.getContext("2d");
let contextTelescopeView = canvasTelescopeView.getContext("2d");




let tabClassic = document.getElementById("tabClassic");
let tabSky = document.getElementById("tabSky");
let tabSolarSystem = document.getElementById("tabSolarSystem");
let tabTelescope = document.getElementById("tabTelescope");

let divClassicView = document.getElementById("divClassicView");
let divSkyView = document.getElementById("divSkyView");
let divSolaySystemView = document.getElementById("divSolaySystemView");
let divTelescopeView = document.getElementById("divTelescopeView");

function selectTab(tab)
{
	divClassicView.style.display = (tab == "Classic") ? "block" : "none";
	divSkyView.style.display = (tab == "Sky") ? "block" : "none";
	divSolaySystemView.style.display = (tab == "Solar System") ? "block" : "none";
	divTelescopeView.style.display = (tab == "Telescope") ? "block" : "none";
	divZoomControls.style.display = (tab == "Solar System" || tab == "Classic") ? "block" : "none";
	
	tabClassic.className = (tab != "Classic") ? "tablinks" : "tablinks active"
	tabSky.className = (tab != "Sky") ? "tablinks" : "tablinks active"
	tabSolarSystem.className = (tab != "Solar System") ? "tablinks" : "tablinks active"
	tabTelescope.className = (tab != "Telescope") ? "tablinks" : "tablinks active"
	
}
selectTab("Classic");


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
let g_zoomSS = 1.0;

let g_simpleSolarSystem = false;
let g_planetView = new Object();

const kRadians = Math.PI / 180.0;
const kDegrees = 180.0 / Math.PI;

// fmod from https://gist.github.com/wteuber/6241786
//Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

// draw ellipse functions from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

function zoomIn()
{
	g_zoomSS *= 2.0;
}
function zoomOut()
{
	g_zoomSS *= 0.5;
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
		g_speed *= -g_basespeed;
}
function requestTimeForward()
{
	if (pause)
		pause = false;
	if (g_speed < 0)
		g_speed *= g_basespeed;
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



function drawSSmap(context, size)
{
	const kAU2pixels = 100.0 * g_zoomSS;
	context.save();
	context.strokeStyle = "#FFFFFF";
	context.rect(-size * 0.5, -size * 0.5, size, size);
	context.stroke();
	context.clip();

// set the size of the Sun based on the Zoom level
	const sunSize = Math.max(3.0,0.03 * g_zoomSS);
// draw the Sun
	context.fillStyle  = "#FFFF00";
	context.beginPath();
	context.arc(0,0,sunSize,0,2.0*Math.PI,true);
	context.closePath();
	context.fill();
// draw the orbit and symbol for each planet
	for (const [key, value] of Object.entries(Planets)) {
		if (!g_simpleSolarSystem)
		{
			context.save();
			const e =value.orbitalParameters.orbitalEccentricity
			const d = value.orbitalParameters.semiMajorAxis * e * g_zoomSS;
			const longPerRad = value.orbitalParameters.longitudePerihelion;
			const longPerSin = Math.sin(longPerRad);
			const longPerCos = Math.cos(longPerRad);
			const semiMajorAxis = kAU2pixels * value.orbitalParameters.semiMajorAxis * Math.cos(value.orbitalParameters.orbitalInclination);
			const semiMinorAxis = kAU2pixels * value.orbitalParameters.semiMajorAxis * Math.sqrt(1.0 - e * e);
//			context.scale(zoom * value.semiMajorAxis,zoom * value.semiMajorAxis);
//			context.translate(-e * semiMajorAxis,0);
			context.strokeStyle  = "#3F3F3F";
			let j;
			context.beginPath();
			for (j = 0; j <= 360.0; j++)
			{
				const x = semiMajorAxis * Math.cos(-j * kRadians) - e * semiMajorAxis;
				const y = semiMinorAxis * Math.sin(-j * kRadians);

				if (j == 0)
				{
					context.moveTo(x * longPerCos + y * longPerSin,-x * longPerSin + y * longPerCos);
				}
				else
				{
					context.lineTo(x * longPerCos + y * longPerSin,-x * longPerSin + y * longPerCos);
				}
			}
			context.closePath();
			context.stroke();
			context.restore();
		
		}
		else
		{
			// orbit
			context.strokeStyle  = "#3F3F3F";
			context.beginPath();
			context.arc(0,0,kAU2pixels * value.orbitalParameters.semiMajorAxis ,0,2.0*Math.PI,true);
			context.closePath();
			context.stroke();
		}
	}
	//@@NOTE: the projection may be slightly off due to inclination.
	for (const [key, value] of Object.entries(g_planetView)) 
	{
		// symbol
		context.fillStyle  = value.style;
		context.beginPath();
		context.arc(kAU2pixels * value.planetHelio.radius * Math.cos(-value.planetHelio.theta),kAU2pixels * value.planetHelio.radius * Math.sin(-value.planetHelio.theta),2,0,2.0*Math.PI,true);
		context.closePath();
		context.fill();
	}


// draw the lines onto the overhead view to demonstrate the elongation
	context.strokeStyle = "#FFFF00"
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(kAU2pixels*g_planetView["Earth"].planetHelio.radius * Math.cos(-g_planetView["Earth"].planetHelio.theta),kAU2pixels*g_planetView["Earth"].planetHelio.radius * Math.sin(-g_planetView["Earth"].planetHelio.theta));
	context.lineTo(kAU2pixels*g_planetView[selectedPlanet].planetHelio.radius * Math.cos(-g_planetView[selectedPlanet].planetHelio.theta),kAU2pixels*g_planetView[selectedPlanet].planetHelio.radius * Math.sin(-g_planetView[selectedPlanet].planetHelio.theta));
	context.stroke();

	context.restore();

}

function drawElongationMap(context, height)
{
	const halfHeight = height * 0.5;
	const halfWidth = height;
	const qtrWidth = height * 0.50;

	context.save();
	const sunLongitude = (180.0 + g_planetView["Earth"].planetHelio.theta * kDegrees) % 360.0;//-g_planetView["Earth"].planetHelio.theta * kDegrees;
	const projection = new Mollweide(sunLongitude,0.0);
// draw the stars on the map
	if (starsm6.ready)
	{
		const mapImage = new ImgData(context, - halfWidth, -halfHeight, height * 2.0, height);
		const len = starsm6.length;
		let i;
		for (i = 0; i < len; i++)
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
	const planetProj = projection.calculate(g_planetView[selectedPlanet].elongLat * kDegrees,g_planetView[selectedPlanet].elongLong * kDegrees + sunLongitude);
	context.fillStyle  = g_planetView[selectedPlanet].style;
	context.beginPath();
	context.arc(-planetProj.x * halfWidth,-planetProj.y * halfHeight,2,0,2.0*Math.PI,true);
	context.closePath();
	context.fill();


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

	let tdPhase = document.getElementById("tdPhase");
	tdPhase.innerHTML = "Phase: " + g_planetView[selectedPlanet].phase.toFixed(1);

	let tdSize = document.getElementById("tdSize");
	tdSize.innerHTML = "Size: " + (g_planetView[selectedPlanet].angSizeEq * 2.0 * 180.0 * 3600.0 / Math.PI).toFixed(1) + "\"";
	
	let tdMagnitude = document.getElementById("tdMagnitude");
	tdMagnitude.innerHTML = "V:" + g_planetView[selectedPlanet].appBright.toFixed(1);

}
function drawPhase(context, size)
{
	const halfHeight = size * 0.5;
//	let halfWidth = phaseWidth * 0.5;

	context.save();
	context.strokeStyle = "#FFFFFF";
	context.rect(-size * 0.5, -size * 0.5, size, size);
	context.stroke();
	context.clip();

	context.fillStyle = "#FFFF00"
	context.font = "18px Arial";
//	context.textBaseline = "top";
//	drawTextCenter(context,"View of Planet",0.0,-halfHeight);
	context.textBaseline = "bottom";


	const sizeEq = (halfHeight - 60) * g_planetView[selectedPlanet].angSizeEq / 1.5029224114395615801287337173096e-4;// / g_planetView[selectedPlanet].angSizeAvg;
	const sizePol = (halfHeight - 60) * g_planetView[selectedPlanet].angSizePolar / 1.5029224114395615801287337173096e-4;// / g_planetView[selectedPlanet].angSizeAvg;

	if (g_planetView[selectedPlanet].phase != 0.0)
	{

		context.fillStyle = g_planetView[selectedPlanet].style;
		context.beginPath();
		context.moveTo(0.0,-sizePol);
		if (g_planetView[selectedPlanet].phase <= 4.0)
		{
			for (i = 1; i <= 180; i++)
			{
				const thetaRad = i * Math.PI / 180.0;
				context.lineTo(sizeEq * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
			let radX = (g_planetView[selectedPlanet].phase - 2.0) * 0.5;
			for (i = 180; i > 0; i--)
			{
				const thetaRad = i * Math.PI / 180.0;
				context.lineTo(-sizeEq * radX * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
		}
		else
		{
			for (i = 1; i <= 180; i++)
			{
				const thetaRad = i * Math.PI / 180.0;
				context.lineTo(-sizeEq * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
			let radX = (g_planetView[selectedPlanet].phase - 6.0) * 0.5;
			for (i = 180; i > 0; i--)
			{
				const thetaRad = i * Math.PI / 180.0;
				context.lineTo(-sizeEq * radX * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
		}
		//context.closePath();
		context.fill();
	}
	context.restore();
}

let datechange;
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

	canvasClassicView.width = window.innerWidth;
	canvasClassicView.height = window.innerHeight - 410;
	// set canvas sizes the same as the classic view size
	canvasSkyView.width = canvasClassicView.width;
	canvasSkyView.height = canvasClassicView.height;

	canvasSolaySystemView.width = canvasClassicView.width
	canvasSolaySystemView.height = canvasClassicView.height;

	canvasTelescopeView.width = canvasClassicView.width
	canvasTelescopeView.height = canvasClassicView.height;
	//theCanvas.width = theCanvas.height;

	// clear the canvas
	const minimumControlsHeightTop = 40;
	let elongationMapHeight = canvasClassicView.height / 2 - minimumControlsHeightTop;
	let elongationMapWidth = elongationMapHeight * 2;
	let SSmapWidth = elongationMapHeight
	let SSmapHeight = elongationMapHeight
	let phaseWidth = elongationMapHeight
	let phaseHeight = elongationMapHeight

	let elongationMapX = canvasClassicView.width / 2
	let elongationMapY = elongationMapHeight / 2;

	let phaseX = elongationMapX + 0.5 * SSmapWidth + 20
	let phaseY = elongationMapY + phaseHeight + 60;

	let SSmapX = elongationMapX - 0.5 * SSmapWidth - 20
	let SSmapY = phaseY;

//	contextClassicView.clearRect(0, 0, canvasClassicView.width, canvasClassicView.height);
	contextClassicView.fillStyle = "#000000";
	contextClassicView.fillRect(0,0,canvasClassicView.width * 0.5,canvasClassicView.height * 0.5);

	contextClassicView.save();
	contextClassicView.translate(elongationMapX,elongationMapY);
	drawElongationMap(contextClassicView,elongationMapHeight);
	contextClassicView.restore();

	contextClassicView.save();
	contextClassicView.translate(SSmapX,SSmapY);
	drawSSmap(contextClassicView,SSmapHeight);
	contextClassicView.restore();
	
	contextClassicView.save();
	contextClassicView.translate(phaseX,phaseY);
	drawPhase(contextClassicView,phaseHeight);
	contextClassicView.restore();

	contextSkyView.fillStyle = "#000000";
	contextSkyView.fillRect(0,0,canvasClassicView.width,canvasClassicView.height);

	contextSkyView.save();
	contextSkyView.translate(canvasSkyView.width * 0.5,canvasSkyView.height * 0.5);
	drawElongationMap(contextSkyView, canvasSkyView.height - 20);
	contextSkyView.restore();


	contextSolaySystemView.fillStyle = "#000000";
	contextSolaySystemView.fillRect(0,0,canvasClassicView.width,canvasClassicView.height);

	contextSolaySystemView.save();
	contextSolaySystemView.translate(canvasSolaySystemView.width * 0.5,canvasSolaySystemView.height * 0.5);
	drawSSmap(contextSolaySystemView, canvasSolaySystemView.height);
	contextSolaySystemView.restore();
	

	contextTelescopeView.fillStyle = "#000000";
	contextTelescopeView.fillRect(0,0,canvasClassicView.width,canvasClassicView.height);

	contextTelescopeView.save();
	contextTelescopeView.translate(canvasTelescopeView.width * 0.5,canvasTelescopeView.height * 0.5);
	drawPhase(contextTelescopeView, canvasTelescopeView.height);
	contextTelescopeView.restore();

	updateStatusReadout();
	
	window.setTimeout(work, 1000.0/30.0);
}

work();

