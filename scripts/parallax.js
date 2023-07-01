

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }

let theContext = theCanvas.getContext("2d");


const minimumControlsHeightTop = 130;



let g_simpleSolarSystem = true;
let g_speed = 1.0;//0.25;
let g_pause = true;
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
let divHighParallaxList = document.getElementById("divHighParallaxList");
let divHighProperMotionList = document.getElementById("divHighProperMotionList");
let divTelescopeView = document.getElementById("divTelescopeView");

let tabTelescopeView = document.getElementById("tabTelescopeView");
let tabHighParallax = document.getElementById("tabHighParallax");
let tabHighProperMotion = document.getElementById("tabHighProperMotion");

function selectTab(tab)
{
	divHighParallaxList.style.display = (tab == "Parallax") ? "block" : "none";
	divHighProperMotionList.style.display = (tab == "Proper Motion") ? "block" : "none";
	divTelescopeView.style.display = (tab == "Telescope") ? "block" : "none";
	
	tabHighParallax.className = (tab != "Parallax") ? "tablinks" : "tablinks active"
	tabHighProperMotion.className = (tab != "Proper Motion") ? "tablinks" : "tablinks active"
	tabTelescopeView.className = (tab != "Telescope") ? "tablinks" : "tablinks active"
	
}
selectTab("Telescope");


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
	g_preDateFocusPause = g_pause;
	g_DateFocus = true;
	g_pause = true;
}
function onDateFocusOut()
{
	g_pause = g_preDateFocusPause;
	g_DateFocus = false;
}


let g_basespeed = 1.0;
function requestSlower()
{
	if (g_pause)
		g_pause = false;
	else
		g_speed *= 0.5; 
}
function requestFaster()
{
	if (g_pause)
		g_pause = false;
	else
		g_speed *= 2; 
}
function requestTimeRewind()
{
	if (g_pause)
		g_pause = false;
	if (g_speed > 0)
		g_speed = -g_basespeed;
}
function requestTimeForward()
{
	if (g_pause)
		g_pause = false;
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
	g_pause = !g_pause;
	buttonPause.disable = !g_pause;
}


let g_PLXenable = true;
let buttonEffectParallax = document.getElementById("buttonEffectParallax");
buttonEffectParallax.style.backgroundColor = g_PLXenable ? "#00bf00" : "#efefef";
function requestParallax()
{
	g_PLXenable = !g_PLXenable;
	buttonEffectParallax.style.backgroundColor = g_PLXenable ? "#00bf00" : "#efefef";
}

let g_PMenable = true;
let buttonEffectProperMotion = document.getElementById("buttonEffectProperMotion");
buttonEffectProperMotion.style.backgroundColor = g_PMenable ? "#00bf00" : "#efefef";
function requestProperMotion(event)
{
	g_PMenable = !g_PMenable;
	buttonEffectProperMotion.style.backgroundColor = g_PMenable ? "#00bf00" : "#efefef";
}

let buttonModelSimple = document.getElementById("buttonModelSimple");
let buttonModelReal = document.getElementById("buttonModelReal");
function selectComplexity(value)
{
	g_simpleSolarSystem = (value == "Simple Model");
	buttonModelSimple.style.backgroundColor = g_simpleSolarSystem ? "#00bf00" : "#efefef";
	buttonModelReal.style.backgroundColor = (!g_simpleSolarSystem) ? "#00bf00" : "#efefef";
}
selectComplexity("Simple Model");

let slew = [0,0];
function requestviewNorthStart(event)
{
	slew[1] = 1;
}
function requestviewNorthEnd(event)
{
	slew[1] = 0;
}


function requestviewSouthStart(event)
{
	slew[1] = -1;
}
function requestviewSouthEnd(event)
{
	slew[1] = 0;
}

function requestviewEastStart(event)
{
	slew[0] = 1;
}
function requestviewEastEnd(event)
{
	slew[0] = 0;
}


function requestviewWestStart(event)
{
	slew[0] = -1;
}
function requestviewWestEnd(event)
{
	slew[0] = 0;
}

let zoomAdjust = 0;
function requestZoomInStart(event)
{
	zoomAdjust = 1;
}

function requestZoomInEnd(event)
{
	zoomAdjust = 0;
}


function requestZoomOutStart(event)
{
	zoomAdjust = -1;
}

function requestZoomOutEnd(event)
{
	zoomAdjust = 0;
}


let g_timer = 2451544.0;//2456083.27000; //2451545.0;

function fillParallaxList()
{
	let bodyParallax = document.getElementById("bodyParallax");
	let data = "";
	for (let i in highPlx)
	{
		const star = starsm6.at(highPlx[i]);
		data += "<tr><td>"
		data += star.main_id;
		data += "</td><td>";
		data += "<input type=\"button\" value=\"View\" onclick=\"selectStar(" + highPlx[i] + ");\">"; 
		data += "</td><td>";
		let ra = degreestoHMSDisplayable(star.ra,2); 
		data += ra.hr + "h  " + ra.min + "m  " + ra.sec + "s";
		data += "</td><td>";
		let dec = degreestoDMSDisplayable(star.dec,2); 
		data += dec.deg + "°  " + dec.min + "'  " + dec.sec + "\"";
		data += "</td><td>";
		data += (star.plx_value / 1000.0).toFixed(4);
		data += "</td><td>";
		data += (star.pmra / 1000.0).toFixed(4);
		data += "</td><td>";
		data += (star.pmdec / 1000.0).toFixed(4);
		data += "</td><tr>";
	}
	bodyParallax.innerHTML = data;
}
function fillPMList()
{
	let bodyParallax = document.getElementById("bodyProperMotion");
	let data = "";
	for (let i in highPlx)
	{
		const star = starsm6.at(highPlx[i]);
		data += "<tr><td>"
		data += star.main_id;
		data += "</td><td>";
		data += "<input type=\"button\" value=\"View\" onclick=\"selectStar(" + highPlx[i] + ");\">"; 
		data += "</td><td>";
		let ra = degreestoHMSDisplayable(star.ra,2); 
		data += ra.hr + "h  " + ra.min + "m  " + ra.sec + "s";
		data += "</td><td>";
		let dec = degreestoDMSDisplayable(star.dec,2); 
		data += dec.deg + "°  " + dec.min + "'  " + dec.sec + "\"";
		data += "</td><td>";
		data += (star.plx_value / 1000.0).toFixed(4);
		data += "</td><td>";
		data += (star.pmra / 1000.0).toFixed(4);
		data += "</td><td>";
		data += (star.pmdec / 1000.0).toFixed(4);
		data += "</td><tr>";
	}
	bodyParallax.innerHTML = data;
}

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
		selectTab("Telescope");
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
		
		fillParallaxList();
		fillPMList();
	}
}

preprocessStars();

let standbyTimer = 0;

function work(){
	const sizeControlsSide = 500;
	const sizeControlsBottom = 240
	theCanvas.height = Math.min(window.innerHeight - sizeControlsBottom,window.innerWidth - sizeControlsSide);
	theCanvas.width = theCanvas.height;

	const displayHeight = theCanvas.height - 2;
	const displayCenterX = theCanvas.width * 0.5;
	const displayCenterY = theCanvas.height * 0.5;

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
/*		theContext.fillStyle = "#FFFFFF";
		theContext.font = "14px Arial";
		drawTextCenter(theContext,"Hi Plx",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 25 + 17);
		drawTextCenter(theContext,"Hi PM",displayCenterX - displayHeight * 0.5 - 100, displayCenterY - displayHeight * 0.5 + 17);
*/

		let tdStarID = document.getElementById("tdStarID");
		tdStarID.innerHTML = starsm6.at(selectedStar).main_id;
		 
		let tdParallax = document.getElementById("tdParallax");
		tdParallax.innerHTML = "Parallax: " + (starsm6.at(selectedStar).plx_value / 1000.0).toFixed(4) + '"' 

		let tdPMra = document.getElementById("tdPMra");
		tdPMra.innerHTML = "PM (RA): " + (starsm6.at(selectedStar).pmra / 1000.0).toFixed(4) + '"/y' 

		let tdPMdec = document.getElementById("tdPMdec");
		tdPMdec.innerHTML = "PM (RA): " + (starsm6.at(selectedStar).pmdec / 1000.0).toFixed(4) + '"/y' 

		let raD = degreestoHMSDisplayable(starsm6.at(selectedStar).ra);
		let tdRAJ2000 = document.getElementById("tdRAJ2000");
		tdRAJ2000.innerHTML = raD.hr + "h " + raD.min + "m " + raD.sec + "s"

		let tdDecJ2000 = document.getElementById("tdDecJ2000");
		let decD = degreestoDMSDisplayable(starsm6.at(selectedStar).dec);
		tdDecJ2000.innerHTML = decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\""

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
		let tdRAdate = document.getElementById("tdRAdate");
		tdRAdate.innerHTML = raD.hr + "h " + raD.min + "m " + raD.sec + "s"

		decD = degreestoDMSDisplayable(degrees(StarPDate.psi));
		let tdDecdate = document.getElementById("tdDecdate");
		tdDecdate.innerHTML = decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\""


		raD = degreestoHMSDisplayable(viewRA);
		let tdViewRA = document.getElementById("tdViewRA");
		tdViewRA.innerHTML = raD.hr + "h " + raD.min + "m " + raD.sec + "s"
		
		decD = degreestoDMSDisplayable(viewDec);
		let tdViewDec = document.getElementById("tdViewDec");
		tdViewDec.innerHTML = decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\""
	}
/*		theContext.font = "20px Arial";
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

		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"RA (J2000)",displayCenterX - halfSize - 100,displayCenterY + 10);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,raD.hr + "h " + raD.min + "m " + raD.sec + "s",displayCenterX - halfSize - 100,displayCenterY + 35);

		theContext.fillStyle = "#00FF00";
		drawTextCenter(theContext,"Dec (J2000)",displayCenterX - halfSize - 100,displayCenterY + 60);
		theContext.fillStyle = "#FFFFFF";
		drawTextCenter(theContext,decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"",displayCenterX - halfSize - 100,displayCenterY + 85);


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
*/
/*	const timerReadableDays = Math.round(g_timer * 100.0) / 100.0;
	let timerDisplayDays = timerReadableDays.toString();
	if (timerDisplayDays.charAt(timerDisplayDays.length - 3) != '.')
	{
		if (timerDisplayDays.charAt(timerDisplayDays.length - 2) == '.')
			timerDisplayDays = timerDisplayDays + '0'
		else
			timerDisplayDays = timerDisplayDays + '.00'
	}

	commonUIdraw(theContext);
*/
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
	

	window.setTimeout(work, 1.0/30.0);
}

work();

