let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d");

const minimumControlsHeightTop = 190;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

const elongationMapHeight = theCanvas.height - minimumControlsHeightTop;
const elongationMapWidth = elongationMapHeight * 2;

const elongationMapX = theCanvas.width / 2
const elongationMapY = elongationMapHeight / 2;

const buttonsTimeY = elongationMapY + elongationMapHeight / 2 + 45;
const buttonsPlanetsY = buttonsTimeY + 50;

const bottomSpace = theCanvas.width

const modelButtonsY = buttonsPlanetsY + 35
const viewButtonsY = modelButtonsY + 35;


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
}

let radButtons = new Array();

radButtons.push(new RadioButton("Mercury","Mercury",theCanvas.width / 2 - 295,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Venus","Venus",theCanvas.width / 2 - 210,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Mars","Mars",theCanvas.width / 2 - 125,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Jupiter","Jupiter",theCanvas.width / 2 - 40,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Saturn","Saturn",theCanvas.width / 2 + 45,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Uranus","Uranus",theCanvas.width / 2 + 130,buttonsPlanetsY,80,25));
radButtons.push(new RadioButton("Neptune","Neptune",theCanvas.width / 2 + 215,buttonsPlanetsY,80,25));


commonUIRegister(new Radio("Planet",selectedPlanet,selectPlanet,radButtons));

function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
}
let modelButtons = new Array();
modelButtons.push(new RadioButton("Simple Model","Simple Model",theCanvas.width / 2 - 150,modelButtonsY,140,25));
modelButtons.push(new RadioButton("Real Model","Real Model",theCanvas.width / 2 + 10,modelButtonsY,140,25));
commonUIRegister(new Radio("Model",g_simpleSolarSystem ? "Simple Model" : "Real Model" ,selectComplexity,modelButtons));

let g_viewCenter = "Sun";
function selectCenter(value)
{
	g_viewCenter = value;
}
let viewButtons = new Array();
viewButtons.push(new RadioButton("Center on Sun","Sun",theCanvas.width / 2 - 220,viewButtonsY,140,25));
viewButtons.push(new RadioButton("Center on Planet","Planet",theCanvas.width / 2 - 70,viewButtonsY,140,25));
viewButtons.push(new RadioButton("Center on Stars","Vernal Equinox",theCanvas.width / 2 + 80,viewButtonsY,140,25));
commonUIRegister(new Radio("View Center","Sun" ,selectCenter,viewButtons));

let g_basespeed = 1.0;


let times = String.fromCharCode(0x00d7)
let pauseButtonText = '| |'
let playButtonText = String.fromCharCode(0x25b6);
let reverseButtonText = String.fromCharCode(0x25c0);

const timesMTwoFiftySix = reverseButtonText + '256'
const timesMSixtyFour = reverseButtonText + '64'
const timesMSixteen = reverseButtonText + '16'
const timesMFour = reverseButtonText + '4'
const timesMOne = reverseButtonText + '1'
const timesOne = playButtonText + '1'
const timesFour = playButtonText + '4'
const timesSixteen = playButtonText + '16'
const timesSixtyFour = playButtonText + '64'
const timesTwoFiftySix = playButtonText + '256'
function selectSpeed(value)
{
	switch (value)
	{
	case timesMTwoFiftySix:
		g_speed = -256.0 * g_basespeed;
		break;
	case timesMSixtyFour:
		g_speed = -64.0 * g_basespeed;
		break;
	case timesMSixteen:
		g_speed = -16.0 * g_basespeed;
		break;
	case timesMFour:
		g_speed = -2.0 * g_basespeed;
		break;
	case timesMOne:
		g_speed = -1.0 * g_basespeed;
		break;
	case timesOne:
	default:
		g_speed = 1.0 * g_basespeed;
		break;
	case timesFour:
		g_speed = 4.0 * g_basespeed;
		break;
	case timesSixteen:
		g_speed = 16.0 * g_basespeed;
		break;
	case timesSixtyFour:
		g_speed = 64.0 * g_basespeed;
		break;
	case timesTwoFiftySix:
		g_speed = 256.0 * g_basespeed;
		break;
	}
}


let speedButtons = new Array();
speedButtons.push(new RadioButton(timesMTwoFiftySix,timesMTwoFiftySix,theCanvas.width / 2 - 230,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixtyFour,timesMSixtyFour,theCanvas.width / 2 - 190,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixteen,timesMSixteen,theCanvas.width / 2 - 150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMFour,timesMFour,theCanvas.width / 2 - 110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMOne,timesMOne,theCanvas.width / 2 - 70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesOne,timesOne,theCanvas.width / 2 + 30,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesFour,timesFour,theCanvas.width / 2 +70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixteen,timesSixteen,theCanvas.width / 2 +110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixtyFour,timesSixtyFour,theCanvas.width / 2 +150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesTwoFiftySix,timesTwoFiftySix,theCanvas.width / 2 + 190,buttonsTimeY,40,40));
commonUIRegister(new Radio("speed",timesOne,selectSpeed,speedButtons));

function requestAdvanceDay(event)
{
	g_timer += 1.0;
}
function requestAdvanceWeek(event)
{
	g_timer += 7.0;
}
function requestAdvanceMonth(event)
{
	g_timer += 30.0;
}
function requestAdvanceYear(event)
{
	g_timer += 365.0;
}

let advanceDay = new Button("+1d",theCanvas.width / 2 + 250,buttonsTimeY,40,40,requestAdvanceDay);
commonUIRegister(advanceDay);
let advanceWeek = new Button("+7d",theCanvas.width / 2 + 290,buttonsTimeY,40,40,requestAdvanceWeek);
commonUIRegister(advanceWeek);
let advanceMonth = new Button("+30d",theCanvas.width / 2 + 330,buttonsTimeY,40,40,requestAdvanceMonth);
commonUIRegister(advanceMonth);
let advanceYear = new Button("+1y",theCanvas.width / 2 + 370,buttonsTimeY,40,40,requestAdvanceYear);
commonUIRegister(advanceYear);

function requestBackDay(event)
{
	g_timer -= 1.0;
}
function requestBackWeek(event)
{
	g_timer -= 7.0;
}
function requestBackMonth(event)
{
	g_timer -= 30.0;
}
function requestBackYear(event)
{
	g_timer -= 365.0;
}

let backDay = new Button("-1d",theCanvas.width / 2 - 290,buttonsTimeY,40,40,requestBackDay);
commonUIRegister(backDay);
let backWeek = new Button("-7d",theCanvas.width / 2 - 330,buttonsTimeY,40,40,requestBackWeek);
commonUIRegister(backWeek);
let backMonth = new Button("-30d",theCanvas.width / 2 - 370,buttonsTimeY,40,40,requestBackMonth);
commonUIRegister(backMonth);
let backYear = new Button("-1y",theCanvas.width / 2 - 410,buttonsTimeY,40,40,requestBackYear);
commonUIRegister(backYear);

function requestPause(event)
{
	pause = !pause;
	if (!pause)
	{
		playButton.text = pauseButtonText;
	}
	else
	{
		playButton.text = playButtonText
	}
}

let playButton = new Button("Pause",theCanvas.width / 2 - 20,buttonsTimeY,40,40,requestPause);
if (pause)
	playButton.text = playButtonText;
else
	playButton.text = pauseButtonText;
playButton.textFont = "24px Arial";
commonUIRegister(playButton);


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

	// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);


	drawElongationMap();

	commonUIdraw(theContext);
	
	window.setTimeout(work, 1000.0/30.0);
}

work();

