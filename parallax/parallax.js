

var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

var theContext = theCanvas.getContext("2d");


var minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;
//theCanvas.width = theCanvas.height;

var modelButtonsY = theCanvas.height - 30;
var buttonsControlsY = modelButtonsY - 30;
//var buttonsZoomY = buttonsControlsY - 30;

var buttonsTimeY = buttonsControlsY - 50;
var dateDisplayTopY = buttonsTimeY - 25.0;
var dateDisplayY = dateDisplayTopY + 20.0;
var displayBottomY = dateDisplayTopY - 5.0;
var displayHeight = displayBottomY;
if (displayHeight < 0)
	displayHeight = 10;
if (theCanvas.width < displayHeight)
	displayHeight = theCanvas.width;
var displayCenterX = theCanvas.width / 2;
var displayCenterY = displayBottomY - displayHeight / 2;


var g_simpleSolarSystem = true;
var g_speed = 1.0;
var g_zoom = 1.0 / 20.0; // 1/30 arcsec

function speedup(event)
{
	g_peed *= 2.0;
}
function slowdown(event)
{
	g_speed *= 0.5;
}

function zoomin(event)
{
	g_zoom *= 2.0;
}
function zoomout(event)
{
	g_zoom *= 0.5;
}


var g_basespeed = 1.0;
var g_speed = 1.0;
var g_pause = true;


var times = String.fromCharCode(0x00d7)
var pauseButtonText = '| |'
var playButtonText = String.fromCharCode(0x25b6);
var reverseButtonText = String.fromCharCode(0x25c0);

var timesMTwoFiftySix = reverseButtonText + '256'
var timesMSixtyFour = reverseButtonText + '64'
var timesMSixteen = reverseButtonText + '16'
var timesMFour = reverseButtonText + '4'
var timesMOne = reverseButtonText + '1'
var timesOne = playButtonText + '1'
var timesFour = playButtonText + '4'
var timesSixteen = playButtonText + '16'
var timesSixtyFour = playButtonText + '64'
var timesTwoFiftySix = playButtonText + '256'
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

var speedButtons = new Array();
speedButtons.push(new RadioButton(timesMTwoFiftySix,timesMTwoFiftySix ,theCanvas.width / 2 - 230,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixtyFour,timesMSixtyFour     ,theCanvas.width / 2 - 190,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixteen,timesMSixteen         ,theCanvas.width / 2 - 150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMFour,timesMFour               ,theCanvas.width / 2 - 110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMOne,timesMOne                 ,theCanvas.width / 2 -  70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesOne,timesOne                   ,theCanvas.width / 2 +  30,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesFour,timesFour                 ,theCanvas.width / 2 +  70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixteen,timesSixteen           ,theCanvas.width / 2 + 110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixtyFour,timesSixtyFour       ,theCanvas.width / 2 + 150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesTwoFiftySix,timesTwoFiftySix   ,theCanvas.width / 2 + 190,buttonsTimeY,40,40));
commonUIRegister(new Radio("Speed",timesOne,selectSpeed,speedButtons));

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

var advanceDay = new Button("+1d",theCanvas.width / 2 + 250,buttonsTimeY,40,40,requestAdvanceDay);
commonUIRegister(advanceDay);
var advanceWeek = new Button("+7d",theCanvas.width / 2 + 290,buttonsTimeY,40,40,requestAdvanceWeek);
commonUIRegister(advanceWeek);
var advanceMonth = new Button("+30d",theCanvas.width / 2 + 330,buttonsTimeY,40,40,requestAdvanceMonth);
commonUIRegister(advanceMonth);
var advanceYear = new Button("+1y",theCanvas.width / 2 + 370,buttonsTimeY,40,40,requestAdvanceYear);
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

var backDay = new Button("-1d",theCanvas.width / 2 - 290,buttonsTimeY,40,40,requestBackDay);
commonUIRegister(backDay);
var backWeek = new Button("-7d",theCanvas.width / 2 - 330,buttonsTimeY,40,40,requestBackWeek);
commonUIRegister(backWeek);
var backMonth = new Button("-30d",theCanvas.width / 2 - 370,buttonsTimeY,40,40,requestBackMonth);
commonUIRegister(backMonth);
var backYear = new Button("-1y",theCanvas.width / 2 - 410,buttonsTimeY,40,40,requestBackYear);
commonUIRegister(backYear);


function requestPause(event)
{
	g_pause = !g_pause;
	if (!g_pause)
	{
		playButton.text = pauseButtonText;
	}
	else
	{
		playButton.text = playButtonText
	}
}

var playButton = new Button("Pause",theCanvas.width / 2 - 20,buttonsTimeY,40,40,requestPause);
if (g_pause)
	playButton.text = playButtonText;
else
	playButton.text = pauseButtonText;
playButton.textFont = "24px Arial";
commonUIRegister(playButton);


var g_PLXenable = true;
function requestParallax(event)
{
	g_PLXenable = !g_PLXenable;
	if (!g_PLXenable)
	{
		plxEnableButton.insideStyle = "#7F7F7F";
	}
	else
	{
		plxEnableButton.insideStyle = "#007F00";
	}
}

var g_PMenable = true;
function requestProperMotion(event)
{
	g_PMenable = !g_PMenable;
	if (!g_PMenable)
	{
		pmEnableButton.insideStyle = "#7F7F7F";
	}
	else
	{
		pmEnableButton.insideStyle = "#007F00";
	}
}

var plxEnableButton = new Button("Parallax",theCanvas.width / 2 - 290,modelButtonsY,140,25,requestParallax);
plxEnableButton.insideStyle = "#007F00";
commonUIRegister(plxEnableButton);
var pmEnableButton = new Button("Proper Motion",theCanvas.width / 2 - 145,modelButtonsY,140,25,requestProperMotion);
pmEnableButton.insideStyle = "#007F00";
commonUIRegister(pmEnableButton);

function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
}
var modelButtons = new Array();
modelButtons.push(new RadioButton("Simple Model","Simple Model",theCanvas.width / 2 + 5,modelButtonsY,140,25));
modelButtons.push(new RadioButton("Real Model","Real Model",theCanvas.width / 2 + 150,modelButtonsY,140,25));
if (g_simpleSolarSystem)
	commonUIRegister(new Radio("Model","Simple Model",selectComplexity,modelButtons));
else
	commonUIRegister(new Radio("Model","Real Model",selectComplexity,modelButtons));

var slew = [0,0];
function requestviewNorthStart(event)
{
	slew[1] = 1;
}
function requestviewNorthEnd(event)
{
	slew[1] = 0;
}

var viewNorth = new SpringButton(String.fromCharCode(0x25b2),displayCenterX + displayHeight * 0.5 + 70,displayCenterY - 155,40,40,requestviewNorthStart,requestviewNorthEnd);
commonUIRegister(viewNorth);

function requestviewSouthStart(event)
{
	slew[1] = -1;
}
function requestviewSouthEnd(event)
{
	slew[1] = 0;
}

var viewSouth = new SpringButton(String.fromCharCode(0x25bc),displayCenterX + displayHeight * 0.5 + 70,displayCenterY - 65,40,40, requestviewSouthStart, requestviewSouthEnd);
commonUIRegister(viewSouth);
function requestviewEastStart(event)
{
	slew[0] = 1;
}
function requestviewEastEnd(event)
{
	slew[0] = 0;
}

var viewEast = new SpringButton(String.fromCharCode(0x25c4),displayCenterX + displayHeight * 0.5 + 25,displayCenterY - 110,40,40, requestviewEastStart, requestviewEastEnd);
commonUIRegister(viewEast);

function requestviewWestStart(event)
{
	slew[0] = -1;
}
function requestviewWestEnd(event)
{
	slew[0] = 0;
}
var viewWest = new SpringButton(String.fromCharCode(0x25ba),displayCenterX + displayHeight * 0.5 + 115,displayCenterY - 110,40,40, requestviewWestStart, requestviewWestEnd);
commonUIRegister(viewWest);

var zoomAdjust = 0;
function requestZoomInStart(event)
{
	zoomAdjust = 1;
}

function requestZoomInEnd(event)
{
	zoomAdjust = 0;
}

var zoomIn = new SpringButton("+",displayCenterX + displayHeight * 0.5 + 115,displayCenterY - 200,40,40, requestZoomInStart, requestZoomInEnd);
commonUIRegister(zoomIn);

function requestZoomOutStart(event)
{
	zoomAdjust = -1;
}

function requestZoomOutEnd(event)
{
	zoomAdjust = 0;
}

var zoomOut = new SpringButton("-",displayCenterX + displayHeight * 0.5 + 25,displayCenterY - 200,40,40, requestZoomOutStart, requestZoomOutEnd);
commonUIRegister(zoomOut);

var g_timer = 2451544.0;//2456083.27000; //2451545.0;

function selectNextPlxStar(event)
{
	currList = 0;
	currPlxidx++;

	if (currPlxidx >= highPlx.length)
		currPlxidx -= highPlx.length;
	selectStar(highPlx[currPlxidx]);
}

	
function selectPrevPlxStar(event)
{
	currList = 0;
	currPlxidx--;

	if (currPlxidx < 0)
		currPlxidx += highPlx.length;
	selectStar(highPlx[currPlxidx]);
}

var nextPlx = new Button(String.fromCharCode(0x25ba), displayCenterX - displayHeight * 0.5 - 45, displayCenterY - displayHeight * 0.5 + 25,40,20,selectNextPlxStar);
commonUIRegister(nextPlx);
var prevPlx = new Button(String.fromCharCode(0x25c4), displayCenterX - displayHeight * 0.5 - 195, displayCenterY - displayHeight * 0.5 + 25,40,20,selectPrevPlxStar);
commonUIRegister(prevPlx);

function selectNextPMStar(event)
{
	currList = 1;
	currPMidx++;

	if (currPMidx >= highPM.length)
		currPMidx -= highPM.length;
	selectStar(highPM[currPMidx]);
}
function selectPrevPMStar(event)
{
	currList = 0;
	currPMidx--;

	if (currPMidx < 0)
		currPMidx += highPM.length;
	selectStar(highPM[currPMidx]);
}

var nextPM = new Button(String.fromCharCode(0x25ba), displayCenterX - displayHeight * 0.5 - 45, displayCenterY - displayHeight * 0.5,40,20,selectNextPMStar);
commonUIRegister(nextPM);
var prevPM = new Button(String.fromCharCode(0x25c4), displayCenterX - displayHeight * 0.5 - 195, displayCenterY - displayHeight * 0.5,40,20,selectPrevPMStar);
commonUIRegister(prevPM);


var starData = new Array();
var starPositionsCalculated = false;
var selectedStar = null;

var viewRA = 0.0;
var viewDec = 0.0;
var viewMatrix = new ThreeMatrix();
var idxLcl = 0;

function updateViewMatrix()
{
	var raRad = radians(viewRA);
	var decRad = radians(viewDec);
	var cosRA = Math.cos(raRad);
	var sinRA = Math.sin(raRad);
	var cosDec = Math.cos(decRad);
	var sinDec = Math.sin(decRad);

	var cosRAp90 = Math.cos(raRad + Math.PI * 0.5);
	var sinRAp90 = Math.sin(raRad + Math.PI * 0.5);

	var cosDecp90 = Math.cos(decRad + Math.PI * 0.5);
	var sinDecp90 = Math.sin(decRad + Math.PI * 0.5);


	var viewX = new ThreeVector(cosRA * cosDec, sinRA * cosDec, sinDec);
	var viewY = new ThreeVector(cosRAp90, sinRAp90, 0.0);
	var viewZ = new ThreeVector(cosRA * cosDecp90, sinRA * cosDecp90, sinDecp90);

	viewMatrix.setRowVector(0, viewX);
	viewMatrix.setRowVector(1, viewY);
	viewMatrix.setRowVector(2, viewZ);
//		viewMatrix.selfTranspose();
}

function selectStar(index)
{
	if (index < stars.length)
	{
		selectedStar = index;
		viewRA = stars[index].ra;
		viewDec = stars[index].dec;
		updateViewMatrix();
	}
}

var highPM = new Array();
var highPlx = new Array();
	
var currList = 0;
var currPMidx = 0;
var currPlxidx = 0;

function preprocessStars()
{
	if (starsReady && !starPositionsCalculated)
	{
		for (idxLcl = 0; idxLcl < stars.length; idxLcl++)
		{
			var dataCurrent = new SpatialStarData();
			dataCurrent.calculate(stars[idxLcl].ra, stars[idxLcl].dec, stars[idxLcl].plx_value, stars[idxLcl].rvz_redshift, stars[idxLcl].pmra, stars[idxLcl].pmdec);
			starData.push(dataCurrent);

			if (Math.abs(stars[idxLcl].pmra) > 100 || Math.abs(stars[idxLcl].pmdec) > 100) // proper motion greater than 100 mas/yr
				highPM.push(idxLcl);
			if (Math.abs(stars[idxLcl].plx_value) > 100) // parallax > 100 mas
				highPlx.push(idxLcl);
		}
		starPositionsCalculated = true;	
		currList = 0;
		currPMidx = 0;
		currPlxidx = 0;
		selectStar(highPlx[currPlxidx]);
	}
}

preprocessStars();

var standbyTimer = 0;

function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	if (!g_pause && starsReady)
		g_timer = g_timer + 1.0 / 30.0 * g_speed;
	if (!starsReady)
		standbyTimer += 1.0 / 30.0;
		
	var timeSeconds = (g_timer - 2451544.00000) * 86400.0;
	
	if (slew[0] != 0 || slew[1] != 0)
	{
		viewRA += slew[0] / 30.0 / 3600.0;
		viewDec += slew[1] / 30.0 / 3600.0;
		if (viewRA < 0.0)
			viewRA += 360.0;
		if (viewRA >= 360.0)
			viewRA -= 360.0;
		if (viewDec > 90.0)
			viewDec = 90.0;
		if (viewDec < -90.0)
			viewDec = -90.0;
		updateViewMatrix();
	}
	if (zoomAdjust != 0)
	{
		if (zoomAdjust > 0)
			g_zoom *= 1.05;
		else
			g_zoom *= 0.95;
	}


	const kRadians = Math.PI / 180.0;
	const kDegrees = 180.0 / Math.PI;

	var posEarth = new Object();
	if (g_simpleSolarSystem)
	{
		posEarth = Planets.Earth.getSimplePosition(g_timer);
	}
	else
	{
		posEarth = Planets.Earth.getTruePosition(g_timer);
	}
	
	var Earth = posEarth.planetHelio.copy();
	Earth.selfScale(14959787070000.0); // convert from AU to cm

	theContext.save();
	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(displayCenterX - displayHeight / 2,displayCenterY - displayHeight / 2,displayHeight,displayHeight);
	theContext.stroke();
	theContext.clip();

	var arcSecRadians = Math.PI / 648000.0; // 1" in radians
	var radiansArcSec = 648000.0 / Math.PI; // 1 radian in arc-sec
	var scaling = 648000.0 / Math.PI * 0.5;
	var scalingDeg = 1.0 * 0.5;
	var aperture = 1000.0;
	var resolution = 1.22 * 5.5e-7 / aperture;// / scaling  * 0.5;
	var seeing = 1.1;
	var diff_patt_size = resolution;
	if (diff_patt_size < seeing)
		diff_patt_size = seeing;
	
	var halfSize = displayHeight * 0.5;
	if (starsReady)
	{
		if (!starPositionsCalculated)
		{
			preprocessStars();
		}
		var arcsecPixels = arcSecRadians * scaling * g_zoom * halfSize;
		
				
		
		var arcsecPixels = scalingDeg * g_zoom * halfSize;
		var arcsecDegrees = 1.0 / 3600.0;
		var viewRAarcsec = viewRA * 3600.0
		var viewDecarcsec = viewDec * 3600.0

		var angWidth = displayHeight / arcsecPixels;
		var xstart = Math.floor(angWidth * 0.5);
		var xend = Math.ceil(angWidth * 0.5);
		var lineSpacing = 1.0;
		if (angWidth > 7200.0)
			lineSpacing = 3600.0;
		else if (angWidth > 3600)
			lineSpacing = 120.0;
		else if (angWidth > 1800)
			lineSpacing = 60.0;
		else if (angWidth > 900)
			lineSpacing = 30.0;
		else if (angWidth > 480)
			lineSpacing = 15.0;
		else if (angWidth > 240)
			lineSpacing = 10.0;
		else if (angWidth > 120)
			lineSpacing = 5.0;
		else if (angWidth > 60)
			lineSpacing = 3.0;
		else if (angWidth > 30)
			lineSpacing = 2.0;
			
		var offsetX = (viewRAarcsec - Math.floor(viewRAarcsec));

		theContext.strokeStyle = "#1F1F1F";
		var x;
		for (x = -xstart; x < xend; x += lineSpacing)
		{
			theContext.beginPath();
			theContext.moveTo(displayCenterX + (x - offsetX) * arcsecPixels,displayCenterY - halfSize);
			theContext.lineTo(displayCenterX + (x - offsetX) * arcsecPixels,displayCenterY + halfSize);
			theContext.stroke();
		}
		offsetX = (viewDecarcsec - Math.floor(viewDecarcsec));
		for (x = -xstart; x < xend; x += lineSpacing)
		{
			theContext.beginPath();
			theContext.moveTo(displayCenterX - halfSize, displayCenterY + (x - offsetX) * arcsecPixels);
			theContext.lineTo(displayCenterX + halfSize, displayCenterY + (x - offsetX) * arcsecPixels);
			theContext.stroke();
		}
	

		theContext.fillStyle = "#FF0000";
		theContext.strokeStyle = "#FF0000";
		drawTextCenter(theContext,"1\"",displayCenterX,displayCenterY + 0.85 * halfSize);
		theContext.beginPath();
		theContext.moveTo(displayCenterX - 0.5 * arcSecRadians * scaling * g_zoom * halfSize,displayCenterY + 0.9 * halfSize);
		theContext.lineTo(displayCenterX + 0.5 * arcSecRadians * scaling * g_zoom * halfSize,displayCenterY + 0.9 * halfSize);
		theContext.stroke();
		
		for (idxLcl = 0; idxLcl < stars.length; idxLcl++)
		{
	//		if (inview[idxLcl])
			{
//				var StarID = stars[idxLcl].main_id;
	//			StarPMRA = grp[idxLcl].pmra;
	//			StarPMDec = grp[idxLcl].pmdec;
	//			StarPlx = grp[idxLcl].plx_value;
	//			StarV = Math.round(grp[idxLcl].V * 100) / 100.0;
	//			StarB = Math.round(grp[idxLcl].B * 100) / 100.0;
	//			StarR = Math.round(grp[idxLcl].R * 100) / 100.0;
				
	//			StarVr = grp[idxLcl].rvz_radvel;
	//			if (StarID == "* alf CMa")
	//				console.log("here");

				var StarPDate = starData[idxLcl].positionApparent.copy();
				var StarPDateUnit = StarPDate.unit;
				var StarMDate = starData[idxLcl].velocity.scale(timeSeconds);
				if (g_PMenable)
					StarPDate.selfAdd(StarMDate);
				if (g_PLXenable)
					StarPDate.selfSubtract(Earth);
				var viewPos = viewMatrix.dot(StarPDate.unit); // transform relative position into view coordinates
				if (Math.abs(viewPos.theta) < Math.PI * 0.5 || Math.abs(viewPos.theta) > 1.5 * Math.PI) // needs to be in front of telescope
				{
					var x = viewPos.theta * scaling * g_zoom * halfSize;
					var y = viewPos.psi * scaling * g_zoom * halfSize
					var size = diff_patt_size * halfSize * g_zoom * 0.5;
					if ((x + size) >= -halfSize && (x - size) <= halfSize && (y + size) >= -halfSize && (y - size) < halfSize)
					{
						x += displayCenterX;
						y += displayCenterY;
						var starColor = UBVRItoRGB(null, stars[idxLcl].B, stars[idxLcl].V, stars[idxLcl].R, null, 0.0, 18.0);
						drawStar(theContext, x, y, size, starColor);
/*
						if (size < 1)
							size = 1;
						var layer = 0;
						for (layer = 0; layer < size; layer += 0.5)
						{
							var clrLcl = starColor.copy();
							clrLcl.scale(layer / size);
							theContext.fillStyle = clrLcl.style;
							theContext.beginPath();
							theContext.arc(x,y,size - layer,0,2.0*Math.PI);
							theContext.fill(); // Draw it
						}*/
					}
				}
			}
		}
	}
	else
	{
		var dots = standbyTimer % 2.0;
		var dotsText = "";
		if (dots > 0.50)
			dotsText += ".";
		if (dots > 1.00)
			dotsText += ".";
		if (dots > 1.50)
			dotsText += ".";
			
		drawTextCenter(theContext,"Standby" + dotsText, displayCenterX,displayCenterY - 10);
		drawTextCenter(theContext,"Scanning the Sky", displayCenterX,displayCenterY + 10);
	}
	theContext.restore();
	
	if (starsReady && selectedStar !== null)
	{
		theContext.fillStyle = "#FFFFFF";
		theContext.font = "14px Arial";
		drawTextCenter(theContext,"Hi Plx",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 25 + 17);
		drawTextCenter(theContext,"Hi PM",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 17);


		theContext.font = "20px Arial";
		drawTextCenter(theContext,stars[selectedStar].main_id,displayCenterX - halfSize - 100,displayCenterY - 145);
		var plxDisplayValue = Math.round(stars[selectedStar].plx_value * 10.0) / 10000.0;
		var plxDisplay = plxDisplayValue.toString();
		drawTextCenter(theContext,"Parallax: " + plxDisplay + "\"",displayCenterX - halfSize - 100,displayCenterY - 115);
		var pmRADisplayValue = Math.round(stars[selectedStar].pmra * 10.0) / 10000.0;
		var pmRADisplay = pmRADisplayValue.toString();
		drawTextCenter(theContext,"PM (ra): " + pmRADisplay + "\"/yr",displayCenterX - halfSize - 100,displayCenterY - 65);
		var pmDecDisplayValue = Math.round(stars[selectedStar].pmdec * 10.0) / 10000.0;
		var pmDecDisplay = pmDecDisplayValue.toString();
		drawTextCenter(theContext,"PM (dec): " + pmDecDisplay + "\"/yr",displayCenterX - halfSize - 100,displayCenterY - 40);

		var raD = degreestoHMSDisplayable(stars[selectedStar].ra);
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"RA (J2000)",displayCenterX - halfSize - 100,displayCenterY + 10);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX - halfSize - 100,displayCenterY + 35);

		var decD = degreestoDMSDisplayable(stars[selectedStar].dec);
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"Dec (J2000)",displayCenterX - halfSize - 100,displayCenterY + 60);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX - halfSize - 100,displayCenterY + 85);

		var StarPDate = starData[selectedStar].positionApparent.copy();
		var StarMDate = starData[selectedStar].velocity.scale(timeSeconds);
		if (g_PMenable)
			StarPDate.selfAdd(StarMDate);
		if (g_PLXenable)
			StarPDate.selfSubtract(Earth);
		var raDate = degrees(StarPDate.theta);
		if (raDate < 0)
			raDate += 360.0;
			
		raD = degreestoHMSDisplayable(raDate);
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"RA (date)",displayCenterX - halfSize - 100,displayCenterY + 135);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX - halfSize - 100,displayCenterY + 160);

		decD = degreestoDMSDisplayable(degrees(StarPDate.psi));
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"Dec (date)",displayCenterX - halfSize - 100,displayCenterY + 185);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX - halfSize - 100,displayCenterY + 210);

	}

	var raD = degreestoHMSDisplayable(viewRA);
	theContext.fillStyle = "#00FF00";
	drawTextCenter(theContext,"RA (J2000)",displayCenterX + halfSize + 90,displayCenterY + 0);
	theContext.fillStyle = "#FFFFFF";
	drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX + halfSize + 90,displayCenterY + 25);

	var decD = degreestoDMSDisplayable(viewDec);
	theContext.fillStyle = "#00FF00";
	drawTextCenter(theContext,"Dec (J2000)",displayCenterX + halfSize + 90,displayCenterY + 50);
	theContext.fillStyle = "#FFFFFF";
	drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX + halfSize + 90,displayCenterY + 75);

	var timerReadableDays = Math.round(g_timer * 100.0) / 100.0;
	var timerDisplayDays = timerReadableDays.toString();
	if (timerDisplayDays.charAt(timerDisplayDays.length - 3) != '.')
	{
		if (timerDisplayDays.charAt(timerDisplayDays.length - 2) == '.')
			timerDisplayDays = timerDisplayDays + '0'
		else
			timerDisplayDays = timerDisplayDays + '.00'
	}

	commonUIdraw(theContext);

	theContext.fillStyle = "#FFFFFF";
	theContext.font = "20px Arial";
	var calend = JDtoGregorian(g_timer);
	var monthDisplay = calend.month.toString();
	if (calend.month < 10)
		monthDisplay = "0" + monthDisplay;
	var dayDisplay = Math.floor(calend.day).toString()
	if (calend.day < 10)
		dayDisplay = "0" + dayDisplay;
	drawTextRight(theContext,"Date: " + calend.year + "/" + monthDisplay + '/' + dayDisplay,displayCenterX - 5,dateDisplayY);
	theContext.fillText("JD "+ timerDisplayDays,displayCenterX + 5,dateDisplayY);
	

	window.setTimeout(work, 1.0/30.0);
}

work();

