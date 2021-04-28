var theCanvas = document.getElementById("theCanvas");
var canvasElongation = document.getElementById("elongation");

var theContext = theCanvas.getContext("2d");
var contextElongation = canvasElongation.getContext("2d");

var timer = 0;
var speed = 0.25;
var pause = false;
var positions = [Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0];
var orbitalRadii = [0.387098, 0.723332, 1.0, 1.523679, 5.2044, 9.5826, 19.2184, 30.07];
var currPosition = [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0];
var pStyle = ["#7F7F7F", "#FFA500", "#0000FF", "#FF0000", "#D2B48C", "#FFA500", "#93B8BE", "#3E66F9"];
var zoom = 100.0;

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
var planetButtonY = theCanvas.height - 30;

radButtons.push(new RadioButton("Mercury","Mercury",theCanvas.width / 2 - 295,planetButtonY,80,25));
radButtons.push(new RadioButton("Venus","Venus",theCanvas.width / 2 - 210,planetButtonY,80,25));
radButtons.push(new RadioButton("Mars","Mars",theCanvas.width / 2 - 125,planetButtonY,80,25));
radButtons.push(new RadioButton("Jupiter","Jupiter",theCanvas.width / 2 - 40,planetButtonY,80,25));
radButtons.push(new RadioButton("Saturn","Saturn",theCanvas.width / 2 + 45,planetButtonY,80,25));
radButtons.push(new RadioButton("Uranus","Uranus",theCanvas.width / 2 + 130,planetButtonY,80,25));
radButtons.push(new RadioButton("Neptune","Neptune",theCanvas.width / 2 + 215,planetButtonY,80,25));


commonUIRegister(new Radio("Planet","Venus",selectPlanet,radButtons));
var button = new Button("ZoomIn",theCanvas.width - 45,5,40,40,zoomin);
button.text = "+";
button.textFont = "30px Arial";
button.insideStyle = "#000000"
commonUIRegister(button)
button = new Button("ZoomOut",theCanvas.width - 45,45,40,40,zoomout);
button.text = "-";
button.textFont = "30px Arial";
button.insideStyle = "#000000"
commonUIRegister(button);

var button = new Button("fast",theCanvas.width / 2 + 25,theCanvas.height - 75,40,40,speedup);
button.text = "x2";
button.textFont = "16px Arial";
button.insideStyle = "#000000"
commonUIRegister(button)
button = new Button("slow",theCanvas.width / 2 - 65,theCanvas.height - 75,40,40,slowdown);
button.text = "x1/2";
button.textFont = "16px Arial";
button.insideStyle = "#000000"
commonUIRegister(button);


function requestPause(event)
{
	pause = !pause;
	if (!pause)
	{
		playButton.text = '| |';
	}
	else
	{
		playButton.text = '>';
	}

}
var playButton = new Button("Pause",theCanvas.width / 2 - 20,theCanvas.height - 75,40,40,requestPause);
playButton.text = "| |";
playButton.textFont = "24px Arial";
commonUIRegister(playButton);

function work(){

	var mapWidth = canvasElongation.width - 150;
	var mapHeight = canvasElongation.height - 100;
	var mapCenterX = mapWidth / 2;
	var mapCenterY = canvasElongation.height / 2;

// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);


// as long as it isn't paussed, advance the timer
	if (!pause)
		timer = timer + 1.0 / 30.0 * speed;

// draw a black sqaure for the orbit area box
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);
// draw a black square for the map area box
	contextElongation.fillStyle = "#000000";
	contextElongation.fillRect(0,0,canvasElongation.width,canvasElongation.height);
// set the size of the Sun based on the Zoom level
	var sunSize = 0.03 * zoom;
	if (sunSize < 3.0)
		sunSize = 3.0;
// draw the Sun
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.arc(theCanvas.width / 2,theCanvas.height / 2,sunSize,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();
// calculate the position of each planet
	for (pi = 0; pi < 8; pi++)
	{
		var period = Math.pow(orbitalRadii[pi],1.5);
		currPosition[pi] = (-timer / period * Math.PI + positions[pi]) % (2.0 * Math.PI);
	}
// draw the orbit and symbol for each planet
	for (pi = 0; pi < 8; pi++)
	{

		theContext.strokeStyle  = "#3F3F3F";
		theContext.beginPath();
		theContext.arc(theCanvas.width / 2,theCanvas.height / 2,zoom * orbitalRadii[pi] ,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.stroke();

		theContext.fillStyle  = pStyle[pi];
		theContext.beginPath();
		theContext.arc(theCanvas.width / 2 + zoom * orbitalRadii[pi] * Math.cos(currPosition[pi]),theCanvas.height / 2 + zoom * orbitalRadii[pi] * Math.sin(currPosition[pi]),2,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.fill();
	}
	var sunLongitude = currPosition[2] * 180.0 / Math.PI - 360.0;
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
			contextElongation.fillStyle  = RGBtoColor(UBVRItoRGB(stars[i].U,stars[i].B,stars[i].V,stars[i].R,stars[i].I));
			contextElongation.beginPath();
			contextElongation.arc(mapCenterX + starProj.x * mapWidth * 0.5,mapCenterY + starProj.y * mapHeight * 0.5,1,0,2.0*Math.PI,true);
			contextElongation.closePath();
			contextElongation.fill();
		}
	}
	else
	{
		contextElongation.fillStyle = "#7F7F7F"
		contextElongation.font = "15px Arial";
		drawTextCenter(contextElongation,"Loading stars. Standby.",mapCenterX,mapCenterY - 60);
	}

// draw the ellipse for the map
	contextElongation.strokeStyle  = "#FFFFFF";
	drawEllipseByCenter(contextElongation,mapCenterX,mapCenterY,mapWidth,mapHeight);
// draw the ecliptic on the map
	contextElongation.strokeStyle  = "#3F3F3F";
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY );
	contextElongation.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY);
	contextElongation.stroke();
// draw the Sun on the map
	contextElongation.fillStyle  = "#FFFF00";
	contextElongation.beginPath();
	contextElongation.arc(mapCenterX,mapCenterY,1,0,2.0*Math.PI,true);
	contextElongation.closePath();
	contextElongation.fill();
// draw the elongation reference on the map
	contextElongation.font = "10px Arial";

	contextElongation.strokeStyle = "#7F7F7F"
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY);
	contextElongation.lineTo(mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"-180",mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);

	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
	contextElongation.lineTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"-90",mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	drawTextCenter(contextElongation,"0",mapCenterX,mapCenterY + mapHeight * 0.5 + 10);
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
	contextElongation.lineTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"+90",mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX + mapWidth * 0.5,mapCenterY);
	contextElongation.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"+180",mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);
// determine which planet is currently selected

	var twoPi = Math.PI * 2.0;
	var degrees = 180.0 / Math.PI;

	var phiEarth = currPosition[2];
	var phiPlanet = currPosition[selectedElongation];
	var phiPlanetDisplay = (Math.round(phiPlanet * degrees * 10.0) / 10.0).toString()

// determine the relative orbital phase angles between the planet and Earth
	var deltaPhi = (currPosition[selectedElongation] - currPosition[2]) % (Math.PI * 2.0);
	var phiDisplay = (Math.round(deltaPhi * 10.0 * 180.0 / Math.PI) / 10.0).toString();
// determine the elongation of the selected planet
	var elongationRad = -Math.atan2(orbitalRadii[selectedElongation] * Math.sin(deltaPhi),1.0 - orbitalRadii[selectedElongation] * Math.cos(deltaPhi));
	var elongation = elongationRad * 180.0 / Math.PI;

	var delPhiTrue = Math.abs(deltaPhi);
	if (delPhiTrue > Math.PI)
		delPhiTrue = twoPi - delPhiTrue;

	var delPhiTrueDisplay = (Math.round(delPhiTrue * 10.0 * 180.0 / Math.PI) / 10.0).toString();

	var planetProj = projection.calculate(0.0,elongation + sunLongitude);
	var planetPhase = Math.PI - delPhiTrue - Math.abs(elongationRad);
	if (elongationRad < 0.0)
		planetPhase *= -1.0;
	var planetPhaseDeg = planetPhase * degrees;
	var planetPhaseDegNorm = planetPhaseDeg;
	if (planetPhaseDegNorm< 0.0)
		planetPhaseDegNorm += 360.0;

	var planetPhaseNum = (planetPhaseDegNorm / 45.0) - 4.0;
	if (planetPhaseNum < 0.0)
		planetPhaseNum = 8.0 + planetPhaseNum;	
	var planetPhaseDisplay = (Math.round(planetPhaseNum * 10.0) / 10.0).toString();
	if (planetPhaseDisplay.charAt(planetPhaseDisplay.length - 2) != '.')
		planetPhaseDisplay = planetPhaseDisplay + ".0"
	

// draw the selected planet on the map
	contextElongation.fillStyle  = pStyle[selectedElongation];
	contextElongation.beginPath();
	contextElongation.arc(planetProj.x * mapWidth * 0.5 + mapCenterX,planetProj.y * mapHeight * 0.5 + mapCenterY,2,0,2.0*Math.PI,true);
	contextElongation.closePath();
	contextElongation.fill();
// draw planet information on the map
	contextElongation.fillStyle = "#FFFF00"
	contextElongation.font = "15px Arial";
	drawTextRight(contextElongation,"Planet: ",mapCenterX - 310,mapCenterY + mapHeight * 0.5 + 35);
	contextElongation.fillText(selectedPlanet,mapCenterX - 305,mapCenterY + mapHeight * 0.5 + 35);
	var elongationRounded = Math.round(elongation * 10.0) / 10.0
	var elongationDisplay = elongationRounded.toString();
	if (elongationDisplay.charAt(elongationDisplay.length - 2) != '.')
		elongationDisplay = elongationDisplay + ".0"
	drawTextRight(contextElongation,"Elongation: " ,mapCenterX - 145,mapCenterY + mapHeight * 0.5 + 35);
	drawTextRight(contextElongation,elongationDisplay,mapCenterX - 105,mapCenterY + mapHeight * 0.5 + 35);

	var timerReadable = Math.round(timer * 100.0) / 100.0
	var timerDisplay = timerReadable.toString();
	if (timerDisplay.charAt(timerDisplay.length - 3) != '.')
	{
		if (timerDisplay.charAt(timerDisplay.length - 2) == '.')
			timerDisplay = timerDisplay + '0'
		else
			timerDisplay = timerDisplay + '.00'
	}
	var timerReadableDays = Math.round(timer * 365.0)
	var timerDisplayDays = timerReadableDays.toString();

	contextElongation.fillText("Time: ",mapCenterX + 150,mapCenterY + mapHeight * 0.5 + 35);
	drawTextRight(contextElongation,timerDisplay + " years",mapCenterX + 280,mapCenterY + mapHeight * 0.5 + 35);
	drawTextRight(contextElongation,"("+ timerDisplayDays + " days)",mapCenterX + 380,mapCenterY + mapHeight * 0.5 + 35);

	if (planetPhase != 0.0)
	{
		contextElongation.save();
		contextElongation.translate(mapCenterX + mapWidth * 0.5 + 75.0,mapCenterY);
		contextElongation.fillStyle = "#FFFF00"
		drawTextCenter(contextElongation,"View of Planet",0.0,-mapHeight * 0.5 + 20);
		drawTextRight(contextElongation,"Phase: ",-2,mapHeight * 0.5 + 35);
		contextElongation.fillText(planetPhaseDisplay,2,mapHeight * 0.5 + 35);

		contextElongation.fillStyle = pStyle[selectedElongation];
		contextElongation.beginPath();
		contextElongation.moveTo(0.0,-50.0);
		if (planetPhase <= 0.0)
		{
			for (i = 1; i <= 180; i++)
			{
				var thetaRad = i * Math.PI / 180.0;
				contextElongation.lineTo(50.0 * Math.sin(thetaRad),-50.0 * Math.cos(thetaRad));
			}
			var radX = (1.0 - planetPhaseDeg / -90.0) * -50.0;
			for (i = 180; i > 0; i--)
			{
				var thetaRad = i * Math.PI / 180.0;
				contextElongation.lineTo(radX * Math.sin(thetaRad),-50.0 * Math.cos(thetaRad));
			}
		}
		else
		{
			for (i = 1; i <= 180; i++)
			{
				var thetaRad = i * Math.PI / 180.0;
				contextElongation.lineTo(-50.0 * Math.sin(thetaRad),-50.0 * Math.cos(thetaRad));
			}
			var radX = (1.0 - planetPhaseDeg / 90.0) * 50.0;
			for (i = 180; i > 0; i--)
			{
				var thetaRad = i * Math.PI / 180.0;
				contextElongation.lineTo(radX * Math.sin(thetaRad),-50.0 * Math.cos(thetaRad));
			}
		}
		contextElongation.closePath();
		contextElongation.fill();
		contextElongation.restore();
	}



// draw the lines onto the overhead view to demonstrate the elongation
	theContext.strokeStyle = "#FFFF00"
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2,theCanvas.height / 2);
	theContext.lineTo(theCanvas.width / 2 + zoom * orbitalRadii[2] * Math.cos(currPosition[2]),theCanvas.height / 2 + zoom * orbitalRadii[2] * Math.sin(currPosition[2]));
	theContext.lineTo(theCanvas.width / 2 + zoom * orbitalRadii[selectedElongation] * Math.cos(currPosition[selectedElongation]),theCanvas.height / 2 + zoom * orbitalRadii[selectedElongation] * Math.sin(currPosition[selectedElongation]));
	theContext.stroke();


	commonUIdraw(theContext);
	
	window.setTimeout(work, 1000.0/30.0);
}

work();

