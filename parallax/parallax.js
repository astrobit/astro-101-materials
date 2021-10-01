

var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

var theContext = theCanvas.getContext("2d");


var minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
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
var g_zoom = 1.0 / 30.0; // 1/30 arcsec

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


function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
}
var modelButtons = new Array();
modelButtons.push(new RadioButton("Simple Model","Simple Model",theCanvas.width / 2 - 145,modelButtonsY,140,25));
modelButtons.push(new RadioButton("Real Model","Real Model",theCanvas.width / 2 + 5,modelButtonsY,140,25));
if (g_simpleSolarSystem)
	commonUIRegister(new Radio("Model","Simple Model",selectComplexity,modelButtons));
else
	commonUIRegister(new Radio("Model","Real Model",selectComplexity,modelButtons));

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


var g_PLXenable = false;
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

var g_PMenable = false;
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

var plxEnableButton = new Button("Parallax",theCanvas.width / 2 - 145,buttonsControlsY,140,25,requestParallax);
commonUIRegister(plxEnableButton);
var pmEnableButton = new Button("Proper Motion",theCanvas.width / 2 + 5,buttonsControlsY,140,25,requestProperMotion);
commonUIRegister(pmEnableButton);


var g_timer = 2451544.0;//2456083.27000; //2451545.0;


var StarsP0 = new Array();
var StarsV = new Array();


var zoom = 1.0;

var viewRA = 0.0;
var viewDec = 0.0;
var viewMatrix = new ThreeMatrix();
var idxLcl = 0;
	// stars with sirius
for (idxLcl = 0; idxLcl < stars.length; idxLcl++)
{
	var raRad = stars[idxLcl].ra * Math.PI / 180.0;
	var decRad = stars[idxLcl].dec * Math.PI / 180.0;
	var cosRA = Math.cos(raRad);
	var sinRA = Math.sin(raRad);
	var cosDec = Math.cos(decRad);
	var sinDec = Math.sin(decRad);
	var distpc = 1000.0 / stars[idxLcl].plx_value;
	var distcm = distpc * 180.0 * 3600.0 / Math.PI * 14959787070000.0;
	var oneplusz = stars[idxLcl].rvz_redshift + 1.0;
	var vrad = (oneplusz * oneplusz - 1.0) / (oneplusz * oneplusz + 1.0) * 29979245800.0;
	var pmrarad = stars[idxLcl].pmra * Math.PI / 180.0 / 3600000.0 / (365.0 * 86400.0);
	var pmdecrad = stars[idxLcl].pmdec * Math.PI / 180.0 / 3600000.0 / (365.0 * 86400.0);
	var vra = pmrarad * distcm;
	var vdec = pmdecrad * distcm;
	var vx = -sinRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * cosDec * vrad
	var vy = cosRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * sinDec * vrad
	var vz = cosDec * vdec + sinDec * vrad


	var pos = new ThreeVector(distcm * cosRA * cosDec,distcm * sinRA * cosDec,distcm * sinDec);
	var vel = new ThreeVector(vx,vy,vz);
	StarsP0.push(pos);
	StarsV.push(vel);
	if (stars[idxLcl].main_id == "* alf CMa")
	{
		viewRA = raRad;
		viewDec = decRad;
		var cosRA = Math.cos(viewRA);
		var sinRA = Math.sin(viewRA);
		var cosDec = Math.cos(viewDec);
		var sinDec = Math.sin(viewDec);

		var cosRAp90 = Math.cos(viewRA + Math.PI * 0.5);
		var sinRAp90 = Math.sin(viewRA + Math.PI * 0.5);

		var cosDecp90 = Math.cos(viewDec + Math.PI * 0.5);
		var sinDecp90 = Math.sin(viewDec + Math.PI * 0.5);


		var viewX = new ThreeVector(cosRA * cosDec, sinRA * cosDec, sinDec);
		var viewY = new ThreeVector(cosRAp90, sinRAp90, 0.0);
		var viewZ = new ThreeVector(cosRA * cosDecp90, sinRA * cosDecp90, sinDecp90);

		viewMatrix.setRowVector(0, viewX);
		viewMatrix.setRowVector(1, viewY);
		viewMatrix.setRowVector(2, viewZ);
//		viewMatrix.selfTranspose();
	}
	
}

function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	if (!g_pause)
		g_timer = g_timer + 1.0 / 30.0 * g_speed;
	var timeSeconds = (g_timer - 2451544.00000) * 86400.0;


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

	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(displayCenterX - displayHeight / 2,displayCenterY - displayHeight / 2,displayHeight,displayHeight);
	theContext.stroke();

	
	var scaling = 648000.0 / Math.PI * 0.5;
	var aperture = 1000.0;
	var resolution = 1.22 * 5.5e-7 / aperture;// / scaling  * 0.5;
	var seeing = 0.0625;
	var diff_patt_size = resolution;
	if (diff_patt_size < seeing)
		diff_patt_size = seeing;
	
	var halfSize = displayHeight * 0.5;
	for (idxLcl = 0; idxLcl < stars.length; idxLcl++)
	{
//		if (inview[idxLcl])
		{
			var StarID = stars[idxLcl].main_id;
//			StarPMRA = grp[idxLcl].pmra;
//			StarPMDec = grp[idxLcl].pmdec;
//			StarPlx = grp[idxLcl].plx_value;
//			StarV = Math.round(grp[idxLcl].V * 100) / 100.0;
//			StarB = Math.round(grp[idxLcl].B * 100) / 100.0;
//			StarR = Math.round(grp[idxLcl].R * 100) / 100.0;
			
//			StarVr = grp[idxLcl].rvz_radvel;
			if (StarID == "* alf CMa")
				console.log("here");

			var StarPDate = StarsP0[idxLcl].copy();
			var StarPDateUnit = StarPDate.unit;
			var StarMDate = StarsV[idxLcl].scale(timeSeconds);
			if (g_PMenable)
				StarPDate.selfAdd(StarMDate);
			if (g_PLXenable)
				StarPDate.selfSubtract(Earth);
			var viewPos = viewMatrix.dot(StarPDate.unit); // transform relative position into view coordinates
			if (Math.abs(viewPos.theta < Math.PI * 0.5)) // needs to be in front of telescope
			{
				var x = viewPos.theta * scaling * zoom * halfSize;
				var y = viewPos.psi * scaling * zoom * halfSize
				var size = diff_patt_size * halfSize * zoom;
				if ((x + size) >= -halfSize && (x - size) <= halfSize && (y + size) >= -halfSize && (y - size) < halfSize)
				{
					x += displayCenterX;
					y += displayCenterY;
					var starColor = UBVRItoRGB(null,stars[idxLcl].B,stars[idxLcl].V,stars[idxLcl].R,null,0.0,6.0);
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
					}
				}
			}
		}
	}
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

