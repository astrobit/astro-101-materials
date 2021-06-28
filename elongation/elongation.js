var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

var theContext = theCanvas.getContext("2d");

var minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = theCanvas.height;

var elongationMapHeight = theCanvas.height / 2 - minimumControlsHeightTop;
var elongationMapWidth = elongationMapHeight * 2;
var SSmapWidth = elongationMapHeight
var SSmapHeight = elongationMapHeight
var phaseWidth = elongationMapHeight
var phaseHeight = elongationMapHeight

var elongationMapX = theCanvas.width / 2
var elongationMapY = elongationMapHeight / 2;

var buttonsTimeY = elongationMapY + elongationMapHeight / 2 + 45;
var buttonsPlanetsY = buttonsTimeY + 50;

var bottomSpace = theCanvas.width - SSmapWidth - phaseWidth

var modelButtonsY = buttonsPlanetsY + 50 + SSmapHeight + 10

var phaseX = theCanvas.width - bottomSpace / 3 - phaseWidth / 2;
var phaseY = buttonsPlanetsY + 50 + phaseHeight / 2;

var SSmapX = bottomSpace / 3.0 + SSmapWidth * 0.5;
var SSmapY = buttonsPlanetsY + 50 + SSmapHeight / 2;

var tutorialControlsY0 = theCanvas.height - 30;
var tutorialControlsY1 = theCanvas.height - 30;

var speed = 4.0;//0.25;
var pause = true;
var zoom = 100.0;

var g_simpleSolarSystem = true;
var g_planetView = new Object();

const kRadians = Math.PI / 180.0;
const kDegrees = 180.0 / Math.PI;

// fmod from https://gist.github.com/wteuber/6241786
//Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

// draw ellipse functions from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

function speedup(event)
{
	speed *= 2.0;
}
function slowdown(event)
{
	speed *= 0.5;
}

function zoomin(event)
{
	zoom *= 2.0;
}
function zoomout(event)
{
	zoom *= 0.5;
}

var selectedElongation = 1; // Venus
var selectedPlanet = "Venus"
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

var radButtons = new Array();

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
var modelButtons = new Array();
modelButtons.push(new RadioButton("Simple Model","Simple Model",SSmapX - 140 - 5,modelButtonsY,140,25));
modelButtons.push(new RadioButton("Real Model","Real Model",SSmapX + 5,modelButtonsY,140,25));
if (g_simpleSolarSystem)
	commonUIRegister(new Radio("Model","Simple Model",selectComplexity,modelButtons));
else
	commonUIRegister(new Radio("Model","Real Model",selectComplexity,modelButtons));



var button = new Button("ZoomIn",SSmapX + SSmapHeight / 2 - 45,SSmapY - SSmapHeight / 2 + 5,40,40,zoomin);
button.text = "+";
button.textFont = "30px Arial";
button.insideStyle = "#000000"
commonUIRegister(button)
button = new Button("ZoomOut",SSmapX + SSmapHeight / 2 - 45,SSmapY - SSmapHeight / 2 + 45,40,40,zoomout);
button.text = "-";
button.textFont = "30px Arial";
button.insideStyle = "#000000"
commonUIRegister(button);

var times = String.fromCharCode(0x00d7)
var timesOne = times + '1'
var timesFour = times + '4'
var timesSixteen = times + '16'
var timesSixtyFour = times + '64'
var timesTwoFiftySix = times + '256'
function selectSpeed(value)
{
	switch (value)
	{
	case timesOne:
	default:
		speed = 2.0;
		break;
	case timesFour:
		speed = 8.0;
		break;
	case timesSixteen:
		speed = 32.0;
		break;
	case timesSixtyFour:
		speed = 128.0;
		break;
	case timesSixtyFour:
		speed = 128.0;
		break;
	case timesTwoFiftySix:
		speed = 512.0;
		break;
	}
}

var speedButtons = new Array();
speedButtons.push(new RadioButton(timesOne,timesOne,theCanvas.width / 2 + 30,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesFour,timesFour,theCanvas.width / 2 +70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixteen,timesSixteen,theCanvas.width / 2 +110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixtyFour,timesSixtyFour,theCanvas.width / 2 +150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesTwoFiftySix,timesTwoFiftySix,theCanvas.width / 2 +190,buttonsTimeY,40,40));
commonUIRegister(new Radio("Speed",timesOne,selectSpeed,speedButtons));

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
		drawTextCenter(context,ElongationStrings.titleState0,theCanvas.width * 0.5,250);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line1State0,theCanvas.width * 0.5,350);
		drawTextCenter(context,ElongationStrings.line2State0,theCanvas.width * 0.5,400);
		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,450);
		break;
	case 1:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,buttonsTimeY - 3,theCanvas.width,theCanvas.height - buttonsTimeY + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ElongationStrings.line1State1,theCanvas.width * 0.5,buttonsTimeY + 20);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line2State1,theCanvas.width * 0.5,buttonsTimeY + 70);
		drawTextCenter(context,ElongationStrings.line3State1,theCanvas.width * 0.5,buttonsTimeY + 100);
		drawTextCenter(context,ElongationStrings.line4State1,theCanvas.width * 0.5,buttonsTimeY + 130);
		drawTextCenter(context,ElongationStrings.line5State1,theCanvas.width * 0.5,buttonsTimeY + 160);
		drawTextCenter(context,ElongationStrings.line6State1,theCanvas.width * 0.5,buttonsTimeY + 190);
		drawTextCenter(context,ElongationStrings.line7State1,theCanvas.width * 0.5,buttonsTimeY + 220);
		drawTextCenter(context,ElongationStrings.line8State1,theCanvas.width * 0.5,buttonsTimeY + 250);
		drawTextCenter(context,ElongationStrings.line9State1pt1 + selectedPlanet + ElongationStrings.line9State1pt2,theCanvas.width * 0.5,buttonsTimeY + 280);
		drawTextCenter(context,ElongationStrings.line10State1,theCanvas.width * 0.5,buttonsTimeY + 310);

		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,buttonsTimeY + 400);
		break;
	case 2:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,buttonsTimeY - 3);
		context.fillRect(0,buttonsPlanetsY - 3,theCanvas.width,theCanvas.height - buttonsPlanetsY + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ElongationStrings.line1State2,theCanvas.width * 0.5,buttonsTimeY - 40);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line2State2,theCanvas.width * 0.5,buttonsPlanetsY + 20);
		drawTextCenter(context,ElongationStrings.line3State2,theCanvas.width * 0.5,buttonsPlanetsY + 50);

		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,buttonsTimeY + 400);
		break;
	case 3:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,buttonsPlanetsY - 3);
		context.fillRect(0,buttonsPlanetsY + 26,theCanvas.width,theCanvas.height - buttonsPlanetsY - 26);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line1State3,theCanvas.width * 0.5,buttonsPlanetsY - 40);

		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,buttonsPlanetsY + 80);
		break;
	case 4:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,buttonsPlanetsY + 47);
		context.fillRect(0,buttonsPlanetsY + 47,phaseX - phaseWidth / 2 - 50,theCanvas.height - buttonsPlanetsY - 47);
		context.fillRect(0,modelButtonsY - 3,theCanvas.width,theCanvas.height - modelButtonsY + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ElongationStrings.line1State4,theCanvas.width * 0.5,30);
		drawTextCenter(context,ElongationStrings.line2State4,theCanvas.width * 0.5,55);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line3State4,theCanvas.width * 0.5,110);
		drawTextCenter(context,ElongationStrings.line4State4,theCanvas.width * 0.5,160);
		drawTextCenter(context,ElongationStrings.line5State4,theCanvas.width * 0.5,180);
		context.font = "16px Arial";
		drawTextCenter(context,ElongationStrings.line6State4,theCanvas.width * 0.5 - 180,200);
		drawTextCenter(context,ElongationStrings.line7State4,theCanvas.width * 0.5 - 180,220);
		drawTextCenter(context,ElongationStrings.line8State4,theCanvas.width * 0.5 - 180,240);
		drawTextCenter(context,ElongationStrings.line9State4,theCanvas.width * 0.5 - 180,260);
		drawTextCenter(context,ElongationStrings.line10State4,theCanvas.width * 0.5 + 180,200);
		drawTextCenter(context,ElongationStrings.line11State4,theCanvas.width * 0.5 + 180,220);
		drawTextCenter(context,ElongationStrings.line12State4,theCanvas.width * 0.5 + 180,240);
		drawTextCenter(context,ElongationStrings.line13State4,theCanvas.width * 0.5 + 180,260);

		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,400);
		break;
	case 5:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,buttonsPlanetsY + 47);
		context.fillRect(SSmapX + SSmapWidth * 0.5 + 3,buttonsPlanetsY + 47,theCanvas.width - (SSmapX + SSmapWidth * 0.5 + 3),theCanvas.height - buttonsPlanetsY - 47);
		context.fillRect(0,modelButtonsY - 3,theCanvas.width,theCanvas.height - modelButtonsY + 3);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ElongationStrings.line1State5,theCanvas.width * 0.5,30);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line2State5,theCanvas.width * 0.5,80);
		drawTextCenter(context,ElongationStrings.line3State5,theCanvas.width * 0.5,110);
		drawTextCenter(context,ElongationStrings.line5State5,theCanvas.width * 0.5,140);
		drawTextCenter(context,ElongationStrings.line6State5,theCanvas.width * 0.5,170);
		drawTextCenter(context,ElongationStrings.line7State5,theCanvas.width * 0.5,230);

		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,400);
		break;
	case 6:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,modelButtonsY - 5);
		context.fillRect(theCanvas.width / 2,modelButtonsY - 5,theCanvas.width / 2,theCanvas.height - modelButtonsY + 5);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "24px Arial";
		drawTextCenter(context,ElongationStrings.line1State6,theCanvas.width * 0.5,400);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line2State6,theCanvas.width * 0.5,450);
		drawTextCenter(context,ElongationStrings.line3State6,theCanvas.width * 0.5,480);
		drawTextCenter(context,ElongationStrings.line4State6,theCanvas.width * 0.5,510);

		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.lineContinue,theCanvas.width * 0.5,600);
		break;
	case 7:
		context.globalAlpha = 0.9;
		context.fillStyle = "#000000";
		context.fillRect(0,0,theCanvas.width,theCanvas.height);
		context.globalAlpha = 1.0;
		context.fillStyle = "#FFFFFF";
		context.font = "40px Arial";
		drawTextCenter(context,ElongationStrings.line1StateFinal,theCanvas.width * 0.5,100);
		context.font = "20px Arial";
		drawTextCenter(context,ElongationStrings.line2StateFinal,theCanvas.width * 0.5,200);
		drawTextCenter(context,ElongationStrings.line3StateFinal,theCanvas.width * 0.5,280);
		drawTextCenter(context,ElongationStrings.line4StateFinal,theCanvas.width * 0.5,360);
		break;
	}
}

var g_tutorial = new Tutorial();

function tutorialSkip(event)
{
	g_tutorial.deactivate();
}
function tutorialStart(event)
{
	g_tutorial.activate();
}
function tutorialAdvance(event)
{
	g_tutorial.advanceState();
	if (g_tutorial.state > 7)
	{
		g_tutorial.complete();
		window.localStorage.setItem("tutorialComplete",true);
	}
}
function tutorialRewind(event)
{
	g_tutorial.rewindState();
}

g_tutorial.drawer = tutorialDraw;
var tutorialSkipButton = new Button("Skip Tutorial",theCanvas.width / 2 - 60,tutorialControlsY0,120,25,tutorialSkip);
var tutorialAdvanceButton = new Button("Next",theCanvas.width / 2 + 70,tutorialControlsY0,40,25,tutorialAdvance);
var tutorialRewindButton = new Button("Prev",theCanvas.width / 2 - 110,tutorialControlsY0,40,25,tutorialRewind);

var tutorialSkipButtonModel = new Button("Skip Tutorial",theCanvas.width / 2 - 60,tutorialControlsY1,120,25,tutorialSkip);
var tutorialAdvanceButtonModel = new Button("Next",theCanvas.width / 2 + 70,tutorialControlsY1,40,25,tutorialAdvance);
var tutorialRewindButtonModel = new Button("Prev",theCanvas.width / 2 - 110,tutorialControlsY1,40,25,tutorialRewind);

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

g_tutorial.addUI(6,tutorialSkipButtonModel);
g_tutorial.addUI(6,tutorialAdvanceButtonModel);
g_tutorial.addUI(6,tutorialRewindButtonModel);

g_tutorial.addUI(7,tutorialAdvanceButton);
g_tutorial.addUI(7,tutorialRewindButton);


var tutorialCompleted = window.localStorage.getItem("tutorialComplete");
if (!tutorialCompleted)
	g_tutorial.activate();

commonUIRegister(g_tutorial);

var pauseButtonText = '| |'
var playButtonText = String.fromCharCode(0x25b6);

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

var playButton = new Button("Pause",theCanvas.width / 2 - 20,buttonsTimeY,40,40,requestPause);
if (pause)
	playButton.text = playButtonText;
else
	playButton.text = pauseButtonText;
playButton.textFont = "24px Arial";
commonUIRegister(playButton);

var replayTutorialButton = new Button("Tutorial",theCanvas.width - 210,modelButtonsY,100,25,tutorialStart);
replayTutorialButton.textFont = "24px Arial";
commonUIRegister(replayTutorialButton);

var g_about = new Tutorial();

function aboutShow(event)
{
	g_about.activate();
}
function aboutDone(event)
{
	g_about.complete();
}
function aboutDraw(context,state)
{
	context.globalAlpha = 0.9;
	context.fillStyle = "#000000";
	context.fillRect(0,0,theCanvas.width,theCanvas.height);
	context.globalAlpha = 1.0;
	context.fillStyle = "#FFFFFF";
	context.font = "30px Arial";
	drawTextCenter(context,ElongationStrings.aboutLine1,theCanvas.width * 0.5,250);
	context.font = "20px Arial";
	drawTextCenter(context,ElongationStrings.aboutLine2,theCanvas.width * 0.5,290);
	drawTextCenter(context,ElongationStrings.aboutLine3,theCanvas.width * 0.5,400);
	drawTextCenter(context,ElongationStrings.aboutLine4,theCanvas.width * 0.5,430);
	drawTextCenter(context,ElongationStrings.aboutLine5,theCanvas.width * 0.5,460);
	drawTextCenter(context,ElongationStrings.aboutLine6,theCanvas.width * 0.5,490);
//	drawTextCenter(context,ElongationStrings.aboutLine7,theCanvas.width * 0.5,520);
}

g_about.drawer = aboutDraw;

var aboutOKButton= new Button("OK",theCanvas.width / 2,modelButtonsY,40,25,aboutDone);
aboutOKButton.textFont = "24px Arial";

g_about.disableStandardUI();
g_about.addUI(0,aboutOKButton);
commonUIRegister(g_about);

var aboutButton= new Button("About",theCanvas.width - 100,modelButtonsY,80,25,aboutShow);
aboutButton.textFont = "24px Arial";
commonUIRegister(aboutButton);


var g_SelectedPlanetData = {};
var twoPi = Math.PI * 2.0;
var degrees = 180.0 / Math.PI;
var g_SunLongitude = 0;
var g_timer = 2456084.50000; //2451545.0;

function drawSSmap()
{
	theContext.save();
	theContext.strokeStyle = "#FFFFFF";
	theContext.rect(SSmapX-SSmapWidth/2, SSmapY-SSmapHeight/2, SSmapWidth, SSmapHeight);
	theContext.stroke();
	theContext.clip();

	theContext.translate(SSmapX,SSmapY);
// set the size of the Sun based on the Zoom level
	var sunSize = 0.03 * zoom;
	if (sunSize < 3.0)
		sunSize = 3.0;
// draw the Sun
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.arc(0,0,sunSize,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();
// draw the orbit and symbol for each planet
	for (const [key, value] of Object.entries(Planets)) {
		if (!g_simpleSolarSystem)
		{
			theContext.save();
			var e =value.orbitalParameters.orbitalEccentricity
			var d = value.orbitalParameters.semiMajorAxis * e * zoom;
			var longPerRad = value.orbitalParameters.longitudePerihelion;
			var longPerSin = Math.sin(longPerRad);
			var longPerCos = Math.cos(longPerRad);
			var semiMajorAxis = zoom * value.orbitalParameters.semiMajorAxis * Math.cos(value.orbitalParameters.orbitalInclination);
			var semiMinorAxis = zoom * value.orbitalParameters.semiMajorAxis * Math.sqrt(1.0 - e * e);
//			theContext.scale(zoom * value.semiMajorAxis,zoom * value.semiMajorAxis);
//			theContext.translate(-e * semiMajorAxis,0);
			theContext.strokeStyle  = "#3F3F3F";
			var j;
			theContext.beginPath();
			for (j = 0; j <= 360.0; j++)
			{
				var x = semiMajorAxis * Math.cos(-j * kRadians) - e * semiMajorAxis;
				var y = semiMinorAxis * Math.sin(-j * kRadians);

				if (j == 0)
				{
					theContext.moveTo(x * longPerCos + y * longPerSin,-x * longPerSin + y * longPerCos);
				}
				else
				{
					theContext.lineTo(x * longPerCos + y * longPerSin,-x * longPerSin + y * longPerCos);
				}
			}
			theContext.closePath();
			theContext.stroke();
			theContext.restore();
		
		}
		else
		{
			// orbit
			theContext.strokeStyle  = "#3F3F3F";
			theContext.beginPath();
			theContext.arc(0,0,zoom * value.orbitalParameters.semiMajorAxis ,0,2.0*Math.PI,true);
			theContext.closePath();
			theContext.stroke();
		}
	}
	//@@NOTE: the projection may be slightly off due to inclination.
	for (const [key, value] of Object.entries(g_planetView)) {
		// symbol
		theContext.fillStyle  = value.style;
		theContext.beginPath();
		theContext.arc(zoom * value.planetHelio.radius * Math.cos(-value.planetHelio.theta),zoom * value.planetHelio.radius * Math.sin(-value.planetHelio.theta),2,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.fill();
}


// draw the lines onto the overhead view to demonstrate the elongation
	theContext.strokeStyle = "#FFFF00"
	theContext.beginPath();
	theContext.moveTo(0,0);
	theContext.lineTo(zoom*g_planetView["Earth"].planetHelio.radius * Math.cos(-g_planetView["Earth"].planetHelio.theta),zoom*g_planetView["Earth"].planetHelio.radius * Math.sin(-g_planetView["Earth"].planetHelio.theta));
	theContext.lineTo(zoom*g_planetView[selectedPlanet].planetHelio.radius * Math.cos(-g_planetView[selectedPlanet].planetHelio.theta),zoom*g_planetView[selectedPlanet].planetHelio.radius * Math.sin(-g_planetView[selectedPlanet].planetHelio.theta));
	theContext.stroke();

	theContext.restore();

}

function drawElongationMap()
{
	var halfHeight = elongationMapHeight * 0.5;
	var halfWidth = elongationMapWidth * 0.5;
	var qtrWidth = elongationMapWidth * 0.25;

	theContext.save();
	theContext.translate(elongationMapX,elongationMapY);
	var sunLongitude = -g_planetView["Earth"].planetHelio.theta * degrees;
	var projection = new Mollweide(sunLongitude,0.0);
// draw the stars on the map
	if (starsReady)
	{
		var len = stars.length;
		var i;
		for (i = 0; i < len; i++)
		{
			//console.log("here " + stars[i].latitude + " " + stars[i].longitude + " " + projection.x + " " + projection.y);
			var starProj = projection.calculate(stars[i].eclat,stars[i].eclong)
			theContext.fillStyle  = UBVRItoRGB(stars[i].U,stars[i].B,stars[i].V,stars[i].R,stars[i].I).style;
			theContext.beginPath();
			theContext.arc(starProj.x * halfWidth,starProj.y * halfHeight,1,0,2.0*Math.PI,true);
			theContext.closePath();
			theContext.fill();
		}
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
	var sunSize = 0.5 * halfWidth / 180.0;
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.arc(0,0,sunSize,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();

// draw the selected planet on the map
	var planetProj = projection.calculate(g_planetView[selectedPlanet].elongLat * degrees,g_planetView[selectedPlanet].elongLong * degrees + sunLongitude);
	theContext.fillStyle  = g_planetView[selectedPlanet].style;
	theContext.beginPath();
	theContext.arc(planetProj.x * halfWidth,planetProj.y * halfHeight,2,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();


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
	drawTextCenter(theContext,"-180",-halfWidth,10);

	theContext.beginPath();
	theContext.moveTo(-qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	theContext.lineTo(-qtrWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"-90",-qtrWidth,10);

	drawTextCenter(theContext,"0",0,10);

	theContext.beginPath();
	theContext.moveTo(qtrWidth,-halfHeight * (1.0 - Math.sqrt(0.75)));
	theContext.lineTo(qtrWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"+90",qtrWidth,10);

	theContext.beginPath();
	theContext.moveTo(halfWidth,-halfHeight);
	theContext.lineTo(halfWidth,0);
	theContext.stroke();
	drawTextCenter(theContext,"+180",halfWidth,10);
	
	var elongationDisplayValue = g_planetView[selectedPlanet].elongLong * degrees;
	if (elongationDisplayValue > 180.0)
		elongationDisplayValue = elongationDisplayValue - 360.0;
	var elongationDisplay = (Math.round(elongationDisplayValue * 10.0) / 10.0).toString();
	if (elongationDisplay.charAt(elongationDisplay.length - 2) != '.')
		elongationDisplay = elongationDisplay + ".0"
// draw planet information on the map
	theContext.fillStyle = "#FFFF00"
	theContext.font = "15px Arial";
	drawTextRight(theContext,"Planet: ",-210,35);
	theContext.fillText(selectedPlanet,-205,35);
	drawTextRight(theContext,"Elongation: " ,-55,35);
	drawTextRight(theContext,elongationDisplay + String.fromCharCode(0x00b0),-5,35);

	var timerReadable = Math.round(g_timer / 365.0 * 100.0 - 6716.0) / 100.0
	var timerDisplay = timerReadable.toString();
	if (timerDisplay.charAt(timerDisplay.length - 3) != '.')
	{
		if (timerDisplay.charAt(timerDisplay.length - 2) == '.')
			timerDisplay = timerDisplay + '0'
		else
			timerDisplay = timerDisplay + '.00'
	}
	var timerReadableDays = Math.round(g_timer)
	var timerDisplayDays = timerReadableDays.toString();


	theContext.fillText("Date: ",50,35);
	var calend = JDtoGregorian(g_timer);
	var monthDisplay = calend.month.toString();
	if (calend.month < 10)
		monthDisplay = "0" + monthDisplay;
	var dayDisplay = Math.floor(calend.day).toString()
	if (calend.day < 10)
		dayDisplay = "0" + dayDisplay;
	drawTextRight(theContext,calend.year + "/" + monthDisplay + '/' + dayDisplay,180,35);
	drawTextRight(theContext,"(JD "+ timerDisplayDays + ")",280,35);

	theContext.restore();
}

function drawPhase()
{
	var halfHeight = phaseHeight * 0.5;
//	var halfWidth = phaseWidth * 0.5;

	theContext.save();
	theContext.translate(phaseX,phaseY);
	theContext.fillStyle = "#FFFF00"
	theContext.font = "18px Arial";
	theContext.textBaseline = "top";
	drawTextCenter(theContext,"View of Planet",0.0,-halfHeight);
	theContext.textBaseline = "bottom";
	var phaseDisplay = (Math.round(g_planetView[selectedPlanet].phase*10.0)/10.0).toString();
	if (phaseDisplay.charAt(phaseDisplay.length - 2) != '.')
		phaseDisplay = phaseDisplay + ".0"
	drawTextRight(theContext,"Phase: " + phaseDisplay,-70,halfHeight);

	var appBrightDisplay = (Math.round(g_planetView[selectedPlanet].appBright*10.0)/10.0).toString();
	if (appBrightDisplay.charAt(appBrightDisplay.length - 2) != '.')
		appBrightDisplay = appBrightDisplay + ".0"
	theContext.fillText("V: " + appBrightDisplay,70,halfHeight);

	var angSizeDisplay = (Math.round(g_planetView[selectedPlanet].angSizeEq * 2.0 * 180.0 * 3600.0 / Math.PI * 10.0) / 10.0).toString();
	if (angSizeDisplay.charAt(angSizeDisplay.length - 2) != '.')
		angSizeDisplay = angSizeDisplay + ".0"
	angSizeDisplay += '"';
	drawTextRight(theContext,"Size: ",-2,halfHeight);
	theContext.fillText(angSizeDisplay,2,halfHeight);


	var sizeEq = (halfHeight - 60) * g_planetView[selectedPlanet].angSizeEq / 1.5029224114395615801287337173096e-4;// / g_planetView[selectedPlanet].angSizeAvg;
	var sizePol = (halfHeight - 60) * g_planetView[selectedPlanet].angSizePolar / 1.5029224114395615801287337173096e-4;// / g_planetView[selectedPlanet].angSizeAvg;

	if (g_planetView[selectedPlanet].phase != 0.0)
	{

		theContext.fillStyle = g_planetView[selectedPlanet].style;
		theContext.beginPath();
		theContext.moveTo(0.0,-sizePol);
		if (g_planetView[selectedPlanet].phase <= 4.0)
		{
			for (i = 1; i <= 180; i++)
			{
				var thetaRad = i * Math.PI / 180.0;
				theContext.lineTo(sizeEq * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
			var radX = (g_planetView[selectedPlanet].phase - 2.0) * 0.5;
			for (i = 180; i > 0; i--)
			{
				var thetaRad = i * Math.PI / 180.0;
				theContext.lineTo(-sizeEq * radX * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
		}
		else
		{
			for (i = 1; i <= 180; i++)
			{
				var thetaRad = i * Math.PI / 180.0;
				theContext.lineTo(-sizeEq * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
			var radX = (g_planetView[selectedPlanet].phase - 6.0) * 0.5;
			for (i = 180; i > 0; i--)
			{
				var thetaRad = i * Math.PI / 180.0;
				theContext.lineTo(-sizeEq * radX * Math.sin(thetaRad),-sizePol * Math.cos(thetaRad));
			}
		}
		//theContext.closePath();
		theContext.fill();
	}
	theContext.restore();
}

var datechange;
function work(){


// as long as it isn't paussed, advance the timer
	if (!pause)
		g_timer = g_timer + 1.0 / 30.0 * speed;

// determine which planet is currently selected

	var dateJD = g_timer;
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
	drawSSmap();
	drawPhase();

	commonUIdraw(theContext);
	
	window.setTimeout(work, 1000.0/30.0);
}

work();

