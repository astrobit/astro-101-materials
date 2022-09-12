

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

let theContext = theCanvas.getContext("2d");


const minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;
//theCanvas.width = theCanvas.height;

const modelButtonsY = theCanvas.height - 30;
const buttonsControlsY = modelButtonsY - 30;
//let buttonsZoomY = buttonsControlsY - 30;

const buttonsTimeY = buttonsControlsY - 50;
const dateDisplayTopY = buttonsTimeY - 25.0;
const dateDisplayY = dateDisplayTopY + 20.0;
const displayBottomY = dateDisplayTopY - 5.0;
const displayHeight = Math.min(Math.max(10,displayBottomY),theCanvas.width);
const displayCenterX = theCanvas.width / 2;
const displayCenterY = displayBottomY - displayHeight / 2;


let g_simpleSolarSystem = true;
let g_speed = 1.0;
let g_zoom = 1.0 / 20.0; // 1/30 arcsec

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


let g_basespeed = 1.0;
let g_pause = true;


const times = String.fromCharCode(0x00d7)
const pauseButtonText = '| |'
const playButtonText = String.fromCharCode(0x25b6);
const reverseButtonText = String.fromCharCode(0x25c0);

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

let playButton = new Button("Pause",theCanvas.width / 2 - 20,buttonsTimeY,40,40,requestPause);
if (g_pause)
	playButton.text = playButtonText;
else
	playButton.text = pauseButtonText;
playButton.textFont = "24px Arial";
commonUIRegister(playButton);


let g_PLXenable = true;
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

let g_PMenable = true;
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

let plxEnableButton = new Button("Parallax",theCanvas.width / 2 - 290,modelButtonsY,140,25,requestParallax);
plxEnableButton.insideStyle = "#007F00";
commonUIRegister(plxEnableButton);
let pmEnableButton = new Button("Proper Motion",theCanvas.width / 2 - 145,modelButtonsY,140,25,requestProperMotion);
pmEnableButton.insideStyle = "#007F00";
commonUIRegister(pmEnableButton);

function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
}
let modelButtons = new Array();
modelButtons.push(new RadioButton("Simple Model","Simple Model",theCanvas.width / 2 + 5,modelButtonsY,140,25));
modelButtons.push(new RadioButton("Real Model","Real Model",theCanvas.width / 2 + 150,modelButtonsY,140,25));
if (g_simpleSolarSystem)
	commonUIRegister(new Radio("Model","Simple Model",selectComplexity,modelButtons));
else
	commonUIRegister(new Radio("Model","Real Model",selectComplexity,modelButtons));

let slew = [0,0];
function requestviewNorthStart(event)
{
	slew[1] = 1;
}
function requestviewNorthEnd(event)
{
	slew[1] = 0;
}

let viewNorth = new SpringButton(String.fromCharCode(0x25b2),displayCenterX + displayHeight * 0.5 + 70,displayCenterY - 155,40,40,requestviewNorthStart,requestviewNorthEnd);
commonUIRegister(viewNorth);

function requestviewSouthStart(event)
{
	slew[1] = -1;
}
function requestviewSouthEnd(event)
{
	slew[1] = 0;
}

let viewSouth = new SpringButton(String.fromCharCode(0x25bc),displayCenterX + displayHeight * 0.5 + 70,displayCenterY - 65,40,40, requestviewSouthStart, requestviewSouthEnd);
commonUIRegister(viewSouth);
function requestviewEastStart(event)
{
	slew[0] = 1;
}
function requestviewEastEnd(event)
{
	slew[0] = 0;
}

let viewEast = new SpringButton(String.fromCharCode(0x25c4),displayCenterX + displayHeight * 0.5 + 25,displayCenterY - 110,40,40, requestviewEastStart, requestviewEastEnd);
commonUIRegister(viewEast);

function requestviewWestStart(event)
{
	slew[0] = -1;
}
function requestviewWestEnd(event)
{
	slew[0] = 0;
}
let viewWest = new SpringButton(String.fromCharCode(0x25ba),displayCenterX + displayHeight * 0.5 + 115,displayCenterY - 110,40,40, requestviewWestStart, requestviewWestEnd);
commonUIRegister(viewWest);

let zoomAdjust = 0;
function requestZoomInStart(event)
{
	zoomAdjust = 1;
}

function requestZoomInEnd(event)
{
	zoomAdjust = 0;
}

let zoomIn = new SpringButton("+",displayCenterX + displayHeight * 0.5 + 115,displayCenterY - 200,40,40, requestZoomInStart, requestZoomInEnd);
commonUIRegister(zoomIn);

function requestZoomOutStart(event)
{
	zoomAdjust = -1;
}

function requestZoomOutEnd(event)
{
	zoomAdjust = 0;
}

let zoomOut = new SpringButton("-",displayCenterX + displayHeight * 0.5 + 25,displayCenterY - 200,40,40, requestZoomOutStart, requestZoomOutEnd);
commonUIRegister(zoomOut);

let g_timer = 2451544.0;//2456083.27000; //2451545.0;

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

let nextPlx = new Button(String.fromCharCode(0x25ba), displayCenterX - displayHeight * 0.5 - 45, displayCenterY - displayHeight * 0.5 + 25,40,20,selectNextPlxStar);
commonUIRegister(nextPlx);
let prevPlx = new Button(String.fromCharCode(0x25c4), displayCenterX - displayHeight * 0.5 - 195, displayCenterY - displayHeight * 0.5 + 25,40,20,selectPrevPlxStar);
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

let nextPM = new Button(String.fromCharCode(0x25ba), displayCenterX - displayHeight * 0.5 - 45, displayCenterY - displayHeight * 0.5,40,20,selectNextPMStar);
commonUIRegister(nextPM);
let prevPM = new Button(String.fromCharCode(0x25c4), displayCenterX - displayHeight * 0.5 - 195, displayCenterY - displayHeight * 0.5,40,20,selectPrevPMStar);
commonUIRegister(prevPM);


let starData = new Array();
let starPositionsCalculated = false;
let selectedStar = null;

let viewRA = 0.0;
let viewDec = 0.0;
let viewMatrix = new ThreeMatrix();
let idxLcl = 0;

function updateViewMatrix()
{
	const raRad = radians(viewRA);
	const decRad = radians(viewDec);
	const cosRA = Math.cos(raRad);
	const sinRA = Math.sin(raRad);
	const cosDec = Math.cos(decRad);
	const sinDec = Math.sin(decRad);

	const cosRAp90 = Math.cos(raRad + Math.PI * 0.5);
	const sinRAp90 = Math.sin(raRad + Math.PI * 0.5);

	const cosDecp90 = Math.cos(decRad + Math.PI * 0.5);
	const sinDecp90 = Math.sin(decRad + Math.PI * 0.5);


	const viewX = new ThreeVector(cosRA * cosDec, sinRA * cosDec, sinDec);
	const viewY = new ThreeVector(cosRAp90, sinRAp90, 0.0);
	const viewZ = new ThreeVector(cosRA * cosDecp90, sinRA * cosDecp90, sinDecp90);

	viewMatrix.setRowVector(0, viewX);
	viewMatrix.setRowVector(1, viewY);
	viewMatrix.setRowVector(2, viewZ);
//		viewMatrix.selfTranspose();
}

function selectStar(index)
{
	if (index < starsm6.length)
	{
		selectedStar = index;
		viewRA = starsm6.at(index).ra;
		viewDec = starsm6.at(index).dec;
		updateViewMatrix();
	}
}

let highPM = new Array();
let highPlx = new Array();
	
let currList = 0;
let currPMidx = 0;
let currPlxidx = 0;

function preprocessStars()
{
	if (starsm6.ready && !starPositionsCalculated)
	{
		for (idxLcl = 0; idxLcl < starsm6.length; idxLcl++)
		{
			let dataCurrent = new SpatialStarData();
			dataCurrent.calculate(starsm6.at(idxLcl).ra, starsm6.at(idxLcl).dec, starsm6.at(idxLcl).plx_value, starsm6.at(idxLcl).rvz_redshift, starsm6.at(idxLcl).pmra, starsm6.at(idxLcl).pmdec);
			starData.push(dataCurrent);

			if (Math.abs(starsm6.at(idxLcl).pmra) > 100 || Math.abs(starsm6.at(idxLcl).pmdec) > 100) // proper motion greater than 100 mas/yr
				highPM.push(idxLcl);
			if (Math.abs(starsm6.at(idxLcl).plx_value) > 100) // parallax > 100 mas
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

let standbyTimer = 0;

function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	if (!g_pause && starsm6.ready)
		g_timer = g_timer + 1.0 / 30.0 * g_speed;
	if (!starsm6.ready)
		standbyTimer += 1.0 / 30.0;
		
	const timeSeconds = (g_timer - 2451544.00000) * 86400.0;
	
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

	let posEarth = new Object();
	if (g_simpleSolarSystem)
	{
		posEarth = Planets.Earth.getSimplePosition(g_timer);
	}
	else
	{
		posEarth = Planets.Earth.getTruePosition(g_timer);
	}
	
	let Earth = posEarth.planetHelio.copy();
	Earth.selfScale(14959787070000.0); // convert from AU to cm

	theContext.save();
	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(displayCenterX - displayHeight / 2,displayCenterY - displayHeight / 2,displayHeight,displayHeight);
	theContext.stroke();
	theContext.clip();

	const arcSecRadians = Math.PI / 648000.0; // 1" in radians
	const radiansArcSec = 648000.0 / Math.PI; // 1 radian in arc-sec
	const scaling = 648000.0 / Math.PI * 0.5;
	const scalingDeg = 1.0 * 0.5;
	const aperture = 1000.0;
	const resolution = 1.22 * 5.5e-7 / aperture;// / scaling  * 0.5;
	const seeing = 1.1;
	const diff_patt_size = Math.max(seeing,resolution);
	
	const halfSize = displayHeight * 0.5;
	if (starsm6.ready)
	{
		if (!starPositionsCalculated)
		{
			preprocessStars();
		}
		//let arcsecPixels = arcSecRadians * scaling * g_zoom * halfSize;
		
				
		
		const arcsecPixels = scalingDeg * g_zoom * halfSize;
		const arcsecDegrees = 1.0 / 3600.0;
		const viewRAarcsec = viewRA * 3600.0
		const viewDecarcsec = viewDec * 3600.0

		const angWidth = displayHeight / arcsecPixels;
		const xstart = Math.floor(angWidth * 0.5);
		const xend = Math.ceil(angWidth * 0.5);
		let lineSpacing = 1.0;
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
			
		let offsetX = (viewRAarcsec - Math.floor(viewRAarcsec));

		theContext.strokeStyle = "#1F1F1F";
		let x;
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
		let map = new ImgData(theContext, displayCenterX - displayHeight / 2, displayCenterY - displayHeight / 2, displayHeight, displayHeight);
		for (idxLcl = 0; idxLcl < starsm6.length; idxLcl++)
		{
	//		if (inview[idxLcl])
			{
//				let StarID = starsm6.at(i).main_id;
	//			StarPMRA = grp[idxLcl].pmra;
	//			StarPMDec = grp[idxLcl].pmdec;
	//			StarPlx = grp[idxLcl].plx_value;
	//			StarV = Math.round(grp[idxLcl].V * 100) / 100.0;
	//			StarB = Math.round(grp[idxLcl].B * 100) / 100.0;
	//			StarR = Math.round(grp[idxLcl].R * 100) / 100.0;
				
	//			StarVr = grp[idxLcl].rvz_radvel;
	//			if (StarID == "* alf CMa")
	//				console.log("here");

				let StarPDate = starData[idxLcl].positionApparent.copy();
				const StarPDateUnit = StarPDate.unit;
				const StarMDate = starData[idxLcl].velocity.scale(timeSeconds);
				if (g_PMenable)
					StarPDate.selfAdd(StarMDate);
				if (g_PLXenable)
					StarPDate.selfSubtract(Earth);
				const viewPos = viewMatrix.dot(StarPDate.unit); // transform relative position into view coordinates
				if (Math.abs(viewPos.theta) < Math.PI * 0.5 || Math.abs(viewPos.theta) > 1.5 * Math.PI) // needs to be in front of telescope
				{
					const x = viewPos.theta * scaling * g_zoom * halfSize;
					const y = viewPos.psi * scaling * g_zoom * halfSize
					let size = diff_patt_size * halfSize * g_zoom * 0.5;
					if ((x + size) >= -halfSize && (x - size) <= halfSize && (y + size) >= -halfSize && (y - size) < halfSize)
					{
						const starColor = UBVRItoRGB(null, starsm6.at(idxLcl).B, starsm6.at(idxLcl).V, starsm6.at(idxLcl).R, null, 0.0, 18.0);
						drawStar(map, x + halfSize, y + halfSize, size, starColor);
/*
						if (size < 1)
							size = 1;
						let layer = 0;
						for (layer = 0; layer < size; layer += 0.5)
						{
							let clrLcl = starColor.copy();
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
		map.draw();
	}
	else
	{
		const dots = standbyTimer % 2.0;
		let dotsText = "";
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
	
	if (starsm6.ready && selectedStar !== null)
	{
		theContext.fillStyle = "#FFFFFF";
		theContext.font = "14px Arial";
		drawTextCenter(theContext,"Hi Plx",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 25 + 17);
		drawTextCenter(theContext,"Hi PM",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 17);


		theContext.font = "20px Arial";
		drawTextCenter(theContext,starsm6.at(selectedStar).main_id,displayCenterX - halfSize - 100,displayCenterY - 145);
		const plxDisplayValue = Math.round(starsm6.at(selectedStar).plx_value * 10.0) / 10000.0;
		const plxDisplay = plxDisplayValue.toString();
		drawTextCenter(theContext,"Parallax: " + plxDisplay + "\"",displayCenterX - halfSize - 100,displayCenterY - 115);
		const pmRADisplayValue = Math.round(starsm6.at(selectedStar).pmra * 10.0) / 10000.0;
		const pmRADisplay = pmRADisplayValue.toString();
		drawTextCenter(theContext,"PM (ra): " + pmRADisplay + "\"/yr",displayCenterX - halfSize - 100,displayCenterY - 65);
		const pmDecDisplayValue = Math.round(starsm6.at(selectedStar).pmdec * 10.0) / 10000.0;
		const pmDecDisplay = pmDecDisplayValue.toString();
		drawTextCenter(theContext,"PM (dec): " + pmDecDisplay + "\"/yr",displayCenterX - halfSize - 100,displayCenterY - 40);

		let raD = degreestoHMSDisplayable(starsm6.at(selectedStar).ra);
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"RA (J2000)",displayCenterX - halfSize - 100,displayCenterY + 10);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX - halfSize - 100,displayCenterY + 35);

		let decD = degreestoDMSDisplayable(starsm6.at(selectedStar).dec);
		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"Dec (J2000)",displayCenterX - halfSize - 100,displayCenterY + 60);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX - halfSize - 100,displayCenterY + 85);

		let StarPDate = starData[selectedStar].positionApparent.copy();
		const StarMDate = starData[selectedStar].velocity.scale(timeSeconds);
		if (g_PMenable)
			StarPDate.selfAdd(StarMDate);
		if (g_PLXenable)
			StarPDate.selfSubtract(Earth);
		let raDate = degrees(StarPDate.theta);
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

	const raD = degreestoHMSDisplayable(viewRA);
	theContext.fillStyle = "#00FF00";
	drawTextCenter(theContext,"RA (J2000)",displayCenterX + halfSize + 90,displayCenterY + 0);
	theContext.fillStyle = "#FFFFFF";
	drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX + halfSize + 90,displayCenterY + 25);

	const decD = degreestoDMSDisplayable(viewDec);
	theContext.fillStyle = "#00FF00";
	drawTextCenter(theContext,"Dec (J2000)",displayCenterX + halfSize + 90,displayCenterY + 50);
	theContext.fillStyle = "#FFFFFF";
	drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX + halfSize + 90,displayCenterY + 75);

	const timerReadableDays = Math.round(g_timer * 100.0) / 100.0;
	let timerDisplayDays = timerReadableDays.toString();
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
	const calend = JDtoGregorian(g_timer);
	let monthDisplay = calend.month.toString();
	if (calend.month < 10)
		monthDisplay = "0" + monthDisplay;
	let dayDisplay = Math.floor(calend.day).toString()
	if (calend.day < 10)
		dayDisplay = "0" + dayDisplay;
	drawTextRight(theContext,"Date: " + calend.year + "/" + monthDisplay + '/' + dayDisplay,displayCenterX - 5,dateDisplayY);
	theContext.fillText("JD "+ timerDisplayDays,displayCenterX + 5,dateDisplayY);
	

	window.setTimeout(work, 1.0/30.0);
}

work();

