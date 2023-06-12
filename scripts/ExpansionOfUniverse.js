// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan
// Copyright (c) 2020,2021, Brian W. Mulligan



function onResetRequest()
{
	//@@TODO: confirm request with a popup dialogue
	generateUniverse();
}

function generateUniverse()
{
	Universe.regenerateUniverse();
}


let btnReturnMilkyWay = document.getElementById("btnReturnMilkyWay");
let btnMoveHome = document.getElementById("btnMoveGalaxy");
let btnFindMilkyWay = document.getElementById("btnFindMilkyWay");

function moveToGalaxy(galaxyID)
{
	Universe.selectHomeGalaxy(galaxyID);
	if (!Universe.isHomeMilkyWay())
	{
		if (btnFindMilkyWay.hasAttribute("disabled"))
			btnFindMilkyWay.removeAttribute("disabled");
		if (btnReturnMilkyWay.hasAttribute("disabled"))
			btnReturnMilkyWay.removeAttribute("disabled");
	}
	else
	{
		btnFindMilkyWay.disabled = true;
		btnReturnMilkyWay.disabled = true;
	}
}

function moveHome()
{
	moveToGalaxy(Math.floor(Math.random() * universe.galaxies.length));
}
function findMilkyWay()
{
	if (!Universe.isHomeMilkyWay())
	{
		const relPos = Universe.getGalaxyViewCoordinates(0);
		g_currentTelescope.setSlewTarget(relPos.psi,relPos.theta);
	}
}


function downloadMeasurements()
{
	const data = Universe.getMeasurementsCSV();
	download(data,"ExpansionOfUniverseMeasurements.csv","csv");
}
function downloadAnalysis()
{
	const data = Universe.getAnalysisCSV();
	download(data,"ExpansionOfUniverseAnalysis.csv","csv");
}

function downloadHubbleAnalysis()
{
	const data = Universe.getHubbleAnalysisCSV();
	download(data,"ExpansionOfUniverseH0.csv","csv");
}


let theCanvasSkyMap = document.getElementById("canvasSkyMap");
theCanvasSkyMap.onselectstart = function () { return false; }


let canvasTelescopeView = document.getElementById("canvasTelescopeView");


let canvasHubbleGraph = document.getElementById("canvasHubbleGraph");

let divGalaxyList = document.getElementById("divGalaxyList");
divGalaxyList.style.height = (window.innerHeight - 150).toFixed(0) + "px";
let divSkyMap = document.getElementById("divSkyMap");
let divTelescopeView = document.getElementById("divTelescopeView");
let divHubbleGraph = document.getElementById("divHubbleGraph");
let divMeasurementInfo = document.getElementById("divMeasurementInfo");

let tabSkyMap = document.getElementById("tabSkyMap");
let tabTelescopeView = document.getElementById("tabTelescopeView");
let tabGalaxyList = document.getElementById("tabGalaxyList");
let tabHubbleGraph = document.getElementById("tabHubbleGraph");
let tabMeasurementStats = document.getElementById("tabMeasurementStats");

function selectTab(tab)
{
	divGalaxyList.style.display = (tab == "Galaxy List") ? "block" : "none";
	divSkyMap.style.display = (tab == "Sky Map") ? "block" : "none";
	divTelescopeView.style.display = (tab == "Telescope View") ? "block" : "none";
	divHubbleGraph.style.display = (tab == "Hubble Graph") ? "block" : "none";
	divMeasurementInfo.style.display = (tab == "Measurement Stats") ? "block" : "none";
	
	tabSkyMap.className = (tab != "Sky Map") ? "tablinks" : "tablinks active"
	tabGalaxyList.className = (tab != "Galaxy List") ? "tablinks" : "tablinks active"
	tabTelescopeView.className = (tab != "Telescope View") ? "tablinks" : "tablinks active"
	tabHubbleGraph.className = (tab != "Hubble Graph") ? "tablinks" : "tablinks active"
	tabMeasurementStats.className = (tab != "Measurement Stats") ? "tablinks" : "tablinks active"
	
}

tabSkyMap.click();

let confirmNewUniverse = document.getElementById("confirmNewUniverse");
function confirmUniverseGenerate()
{
	confirmNewUniverse.style.display = "block";
}
function closeModal()
{
	confirmNewUniverse.style.display = "none";
}
function confirmUniverseGenerateConfirmed()
{
	confirmNewUniverse.style.display = "none";
	generateUniverse();
	g_currentTelescope.setSlewTarget(0.0,0.0);
}
function onImageRequest()
{
	if (g_galaxiesInView !== null)
	{
		for (i in g_galaxiesInView)
		{
			Universe.takeGalaxyImage(g_galaxiesInView[i].idx,50.0,g_currentTelescope._diameter * 100.0);
		}
	}
}
function onSpectraRequest()
{
	if (g_galaxiesInView !== null)
	{
		for (i in g_galaxiesInView)
		{
			Universe.takeGalaxySpectrum(g_galaxiesInView[i].idx,10.0);
		}
	}
}

function insertTableData(data,width)
{
	let ret = "<td>";
	if (width !== undefined)
		ret += '<div style="min-width:' + width + 'px;">';
	ret += data
	if (width !== undefined)
		ret += "</div>"
	ret +=  "</td>";
	return ret;
}

function onSelectGalaxy(id,idx)
{
	if (idx < Universe.getGalaxyCount())
	{
		const selected = Universe.getGalaxy(idx)
		const relPos = Universe.getGalaxyViewCoordinates(idx);
		g_currentTelescope.setSlewTarget(relPos.phi,relPos.theta);
		tabTelescopeView.click();
	}
}

function populateGalaxyList()
{
	let bodyGalaxyList = document.getElementById("bodyGalaxyList");
	let tableBody = new String();
	const numGalaxies = Universe.getGalaxyCount();
	for (let i = 0; i < numGalaxies; i++)
	{
		if (i !== Universe.getHomeGalaxyIndex())
		{
			const galaxy = Universe.getGalaxy(i);
			tableBody += "<tr>";
			const onClickSlew = " onclick=\"onSelectGalaxy('"+galaxy._id + "'," + i + ");\"";
			const onClickMove = " onclick=\"moveToGalaxy("+ i + ");\"";
			
			tableBody += insertTableData(galaxy._id,120);
			tableBody += insertTableData('<input type="button" value="Slew Telescope"' + onClickSlew + '>' + '<input type="button" value="Move Here"' + onClickMove + '>',120);
			
			const relPos = Universe.getGalaxyViewCoordinates(i);
			const raHMS = degreestoHMSDisplayable((degrees(relPos.theta) + 360.0) % 360.0);
			const decDMS = degreestoDMSDisplayable(degrees(relPos.phi));
			tableBody += insertTableData(raHMS.hr + "h " + raHMS.min + "m " + raHMS.sec + "s",150);
			tableBody += insertTableData(decDMS.deg + "° " + decDMS.min + "' " + decDMS.sec + "\"",150);


			const measData = Universe.getGalaxyAnalysisResults(i);
			if (measData !== null)
			{
				if (measData._Mv_u > 0)
				{
					tableBody += insertTableData(sig_figs(measData._Mv,measData._Mv_u).standard_notation,150);
				}
				else
					tableBody += insertTableData("--------------",150)
				if (measData._redshift_u > 0)
				{
					tableBody += insertTableData(measData._redshift.toFixed(3),50);
				}
				else
					tableBody += insertTableData("-----",50)
				if (measData._dist_u > 0)
				{
					tableBody += insertTableData(sig_figs(measData._dist,measData._dist_u).standard_notation,150);
				}
				else
					tableBody += insertTableData("------------",150)
				tableBody += insertTableData(measData._imagesCount,40);
				tableBody += insertTableData(measData._spectraCount,40);
			}
			else
			{
				tableBody += insertTableData("--------------",150)
				tableBody += insertTableData("-----",50)
				tableBody += insertTableData("------------",150)
				tableBody += insertTableData("0",40)
				tableBody += insertTableData("0",40)
			}
			tableBody += "</tr>";
		}
	}
	bodyGalaxyList.innerHTML = tableBody;
}
populateGalaxyList();

function populateTelescopeFieldList()
{
	let bodyGalaxyList = document.getElementById("bodyTelescopeViewTable");
	let tableBody = new String();
	if (g_galaxiesInView.length > 0)
	{
		for (let idxLcl in g_galaxiesInView)
		{
			const galaxy = Universe.getGalaxy(g_galaxiesInView[idxLcl].idx);
			tableBody += "<tr>";
			tableBody += insertTableData(galaxy._id,120);
			
//			const relPos = getRelPos(universe.galaxies[universe.currentHome]._position,curr._position);
//			const rpUnit = relPos.unit;
			
//			tableBody += insertTableData((degrees(rpUnit.theta) / 15 + 24.0) % 24.0);
//			tableBody += insertTableData(degrees(rpUnit.psi));
			const measData = Universe.getGalaxyAnalysisResults(g_galaxiesInView[idxLcl].idx);
			if (measData !== null)
			{
				if (measData._Mv_u > 0)
				{
					tableBody += insertTableData(sig_figs(measData._Mv,measData._Mv_u).standard_notation,150);
				}
				else
					tableBody += insertTableData("--------------",150)
				if (measData._redshift_u > 0)
				{
					tableBody += insertTableData(measData._redshift.toFixed(3),50);
				}
				else
					tableBody += insertTableData("-----",50)
				if (measData._dist_u > 0)
				{
					tableBody += insertTableData(sig_figs(measData._dist,measData._dist_u).standard_notation,150);
				}
				else
					tableBody += insertTableData("------------",150)
				tableBody += insertTableData(measData._imagesCount,40);
				tableBody += insertTableData(measData._spectraCount,40);
				
			}
			else
			{
				tableBody += insertTableData("--------------",150)
				tableBody += insertTableData("-----",50)
				tableBody += insertTableData("------------",150)
				tableBody += insertTableData("0",40)
				tableBody += insertTableData("0",40)
			}
			tableBody += "</tr>";
		}
	}
	else
	{
			tableBody += "<tr>";
			tableBody += insertTableData("------------",120);
			tableBody += insertTableData("--------------",150)
			tableBody += insertTableData("-----",50)
			tableBody += insertTableData("------------",150)
			tableBody += insertTableData("0",40)
			tableBody += insertTableData("0",40)
			tableBody += "</tr>";
	}
	bodyGalaxyList.innerHTML = tableBody;
}

let projection = new Mollweide(0,0);

function drawMap()
{
	const desiredHeight = window.innerHeight - 250;
	const width = Math.min(desiredHeight * 2,window.innerWidth);
	theCanvasSkyMap.width = width;
	theCanvasSkyMap.height = width * 0.5;
	let theContextSkyMap = theCanvasSkyMap.getContext("2d");

	theContextSkyMap.clearRect(0, 0, theCanvasSkyMap.width, theCanvasSkyMap.height);
	theContextSkyMap.save();
	theContextSkyMap.translate(theCanvasSkyMap.width * 0.5,theCanvasSkyMap.height * 0.5);
//	theContextSkyMap.fillStyle = "#0F0F0F";
//	drawEllipseByCenterFill(theContextSkyMap,0,0,theCanvasSkyMap.width,theCanvasSkyMap.height)
	theContextSkyMap.strokeStyle = "#FFFFFF";
	drawEllipseByCenter(theContextSkyMap,0,0,theCanvasSkyMap.width,theCanvasSkyMap.height)
	
	theContextSkyMap.fillStyle = "#FFFFFF";
	let idxLcl;
	
	const numGalaxies = Universe.getGalaxyCount();
	for (let i = 0; i < numGalaxies; i++)
	{
		if (i !== Universe.getHomeGalaxyIndex())
		{
			const galaxy = Universe.getGalaxy(i);
		
			const relPos = Universe.getGalaxyViewCoordinates(i);
			const dist = relPos.radius;
			const long = relPos.theta * 180.0 / Math.PI;//Math.atan2(universe.galaxies[idxLcl]._position.y - universe.galaxies[universe.currentHome]._position.y,universe.galaxies[idxLcl]._position.x - universe.galaxies[universe.currentHome]._position.x);
			const lat = relPos.phi * 180.0 / Math.PI;//Math.asin(z / dist);
			const proj = projection.calculate(lat,long);
			
			theContextSkyMap.fillStyle = "#FFFFFF";


			theContextSkyMap.beginPath();
			theContextSkyMap.arc(proj.x * theCanvasSkyMap.width * 0.5,-proj.y * theCanvasSkyMap.height * 0.5,1.0,0,2.0 * Math.PI);
			theContextSkyMap.closePath();
			theContextSkyMap.fill();


		}
	}
	
	theContextSkyMap.strokeStyle = '#FFFF00';
	const proj = projection.calculate(g_currentTelescope.viewLat * 180.0 / Math.PI,g_currentTelescope.viewLong * 180.0 / Math.PI);
	const radius = 3;
	theContextSkyMap.beginPath();
	theContextSkyMap.arc(proj.x * theCanvasSkyMap.width  * 0.5,-proj.y * theCanvasSkyMap.height  * 0.5,radius,0,2.0 * Math.PI);
	theContextSkyMap.stroke();

	theContextSkyMap.restore();
}

function clickMap(event)
{
//	const rect = theCanvasSkyMap.getBoundingClientRect();
	const x = event.offsetX / theCanvasSkyMap.width;
	const y = event.offsetY / theCanvasSkyMap.height;
	const pos = projection.calculateReverse(x * 2.0 - 1.0,1.0 - y * 2.0);
	const nearest = Universe.findNearestGalaxy(radians(pos.lat),radians(pos.long));
	g_currentTelescope.setSlewTarget(nearest.lat,nearest.long);
	tabTelescopeView.click();
}
theCanvasSkyMap.onclick = clickMap;




function scaleColor(x,color)
{
	let ret = new RGB();
	ret.r = Math.floor((224.0 * (1.0 - color) + 32.0) * x);
	ret.g = ret.r;
	ret.b = Math.floor((128.0 * color + 128.0) * x);
	return ret;
}
function scaleColorElliptical(x,color)
{
	return new RGB(Math.floor(256.0 * x),
						Math.floor(color / 0.3 * 256.0 * x),
						Math.floor((color - 0.3) / 0.7 * 256.0 * x));
}
function scaleColorSpiral(x,color)
{
	let ret = new RGB();
	ret.b = Math.floor(256.0 * x);
	ret.r = Math.floor((color - 0.3) / 0.7 * 256.0 * x);//Math.floor(256.0 * (1.0 - color) * x);
	ret.g = ret.r;
	return ret;
}

function drawElliptical(context,size,color,x)
{
	const effSize = Math.floor(size);
	const midX = effSize * 0.5;
	const midY = effSize * 0.5;
	let imgData = context.createImageData(effSize, effSize);
	const colorLCl = scaleColorElliptical(x,color)
	let i;
	for (i = 0; i < imgData.data.length; i += 4) 
	{
		let x = ((i * 0.25) % effSize) - midX;
		let y = Math.floor((i * 0.25) / effSize) - midY;
		let r = Math.sqrt(x * x + y * y) / size * 2.0;

		imgData.data[i+0] = colorLCl.r;
		imgData.data[i+1] = colorLCl.g;
		imgData.data[i+2] = colorLCl.b;
		let alpha = Math.floor((1.0 - r) * 256.0);
		if (alpha > 255)
			alpha = 255;
		else if (alpha < 0)
			alpha = 0;
		imgData.data[i+3] = alpha;
	}
	context.drawImage(imgData, 0, 0);
}
let readoutTelescopeView = document.getElementById("readoutTelescopeView");

function getPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
{
	const xp = x *cosOrientation - y * sinOrientation;
	const yp = y * cosOrientation + x * sinOrientation;
	const xe = xp / a;
	const ye = yp / b;

	return {x: xp, xe: xe,y: yp, ye: ye};
}

function testPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
{
	const coord = getPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
	return ((coord.xe * coord.xe + coord.ye * coord.ye) <= 1.0) // point is in the ellipse
}


function drawTelescopeField()
{
	const raHMS = degreestoHMSDisplayable((degrees(g_currentTelescope.viewLong) + 360.0) % 360.0);
	const decDMS = degreestoDMSDisplayable(degrees(g_currentTelescope.viewLat));

	readoutTelescopeView.innerHTML = raHMS.hr + "h " + raHMS.min + "m " + raHMS.sec + "s  " + ((g_currentTelescope.viewLat >= 0) ? "+" : "") + decDMS.deg + "° " + decDMS.min + "' " + decDMS.sec + "\""; 
	
	canvasTelescopeView.height = Math.min(Math.min(384,window.innerHeight - 500),window.innerWidth);
	canvasTelescopeView.width = canvasTelescopeView.height;
	let contextTelescopeView = canvasTelescopeView.getContext("2d");
	
	
	contextTelescopeView.clearRect(0, 0, canvasTelescopeView.width, canvasTelescopeView.height);
	

	const state = contextTelescopeView.save();
	const cx = canvasTelescopeView.width * 0.5;
	const cy = canvasTelescopeView.height * 0.5;
	const radius = canvasTelescopeView.width * 0.5 - 2;
	const telescopePixelToViewPixel = radius / g_currentTelescope._CCDresolution;
	contextTelescopeView.translate(cx,cy);
	// draw black background for image
	contextTelescopeView.fillStyle = "#000000";
	contextTelescopeView.fillRect(-radius,-radius,2.0 * radius,2.0 * radius);
	// draw white frame around view
	contextTelescopeView.strokeStyle = "#FFFFFF";
	contextTelescopeView.beginPath();
	contextTelescopeView.rect(-radius - 1,-radius - 1,2.0 * radius + 2,2.0 * radius + 2);
	contextTelescopeView.closePath();
	contextTelescopeView.stroke();

	let imgData = contextTelescopeView.getImageData(cx - radius, cy - radius, 2 * radius, 2 * radius);
	let lclList = new Array();

	let idxLcl;
	for (idxLcl in g_galaxiesInView)
	{
		const curr = Universe.getGalaxy(g_galaxiesInView[idxLcl].idx);
		let currLcl = new Object();
		currLcl.eqDiskSize = null;
		currLcl.polDiskSize = null;
		currLcl.colorDisk = null;
		if (curr._galaxyType == 0) // elliptical
		{
			currLcl.eqSize = Math.max(curr._radiusEquatorial * g_galaxiesInView[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._radiusPolar * g_galaxiesInView[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(g_galaxiesInView[idxLcl].bright,curr._color)
		}
		else
		{
			currLcl.eqSize = Math.max(curr._bulgeSize * g_galaxiesInView[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._bulgeSize * g_galaxiesInView[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.eqDiskSize = Math.max(curr._diskSize * g_galaxiesInView[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polDiskSize = Math.max(curr._diskSize * g_galaxiesInView[idxLcl].pixelScale * curr._cosOrientationFace * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(g_galaxiesInView[idxLcl].bright,curr._color)
			currLcl.colorDisk = scaleColorSpiral(g_galaxiesInView[idxLcl].bright,curr._color)
		}
		currLcl.x = g_galaxiesInView[idxLcl].x * telescopePixelToViewPixel;
		currLcl.y = g_galaxiesInView[idxLcl].y * telescopePixelToViewPixel;
		currLcl.bright = g_galaxiesInView[idxLcl].bright;
		currLcl._cosOrientation = curr._cosOrientation;
		currLcl._sinOrientation = curr._sinOrientation;
		lclList.push(currLcl);
	}

	for (x = 0; x < 2 * radius; x++)
	{
		for (y = 0; y < 2 * radius; y++)
		{
			for (idxLcl = 0; idxLcl < lclList.length; idxLcl++)
			{
				const curr = lclList[idxLcl];

				let coordDisk = null;
				let reDisk = null;
				if (curr.eqDiskSize !== null)
				{
					coordDisk = getPointInEllipse((x - radius) - curr.x,(y - radius) - curr.y,curr.eqDiskSize,curr.polDiskSize,curr._cosOrientation,curr._sinOrientation);
					reDisk = Math.sqrt(coordDisk.xe * coordDisk.xe + coordDisk.ye * coordDisk.ye);
					if (reDisk <= 1.0)// && coordDisk.ye < 0) // point is in the ellipse
					{
						const alpha = Math.exp(-reDisk * reDisk * reDisk * reDisk * 4.5); // std. dev = 1/3
						const imgIdx = (y * 2 * radius + x) * 4;
						imgData.data[imgIdx + 0] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 0] + alpha * curr.colorDisk.r);
						imgData.data[imgIdx + 1] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 1] + alpha * curr.colorDisk.g);
						imgData.data[imgIdx + 2] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 2] + alpha * curr.colorDisk.b);
	//					imgData.data[imgIdx + 3] = imgData.data[imgIdx + 3]; // don't adjust alpha'
					}
				}

				const coord = getPointInEllipse((x - radius) - curr.x,(y - radius) - curr.y,curr.eqSize,curr.polSize,curr._cosOrientation,curr._sinOrientation);
				const re = Math.sqrt(coord.xe * coord.xe + coord.ye * coord.ye);
				if (re <= 1.0) // point is in the ellipse
				{
					const alpha = Math.exp(-re * re * 4.5); // std. dev = 1/3
					const imgIdx = (y * 2 * radius + x) * 4;
					imgData.data[imgIdx + 0] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 0] + alpha * curr.color.r);
					imgData.data[imgIdx + 1] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 1] + alpha * curr.color.g);
					imgData.data[imgIdx + 2] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 2] + alpha * curr.color.b);
//					imgData.data[imgIdx + 3] = imgData.data[imgIdx + 3]; // don't adjust alpha'
				}
			}
		}
	}
		
	contextTelescopeView.putImageData(imgData,cx - radius, cy - radius);
	contextTelescopeView.restore(state);
	
	populateTelescopeFieldList();
}

let outputCurrentHome = document.getElementById("outputCurrentHome");
let outputNumMeasGalaxies = document.getElementById("outputNumMeasGalaxies");
let outputHomeGalaxyVelocity = document.getElementById("outputHomeGalaxyVelocity");
let outputChiSquared = document.getElementById("outputChiSquared");

function drawMeasurementInfo()
{
	let galaxy = Universe.getGalaxy(Universe.getHomeGalaxyIndex());
	outputCurrentHome.innerHTML = galaxy._id;
	let hubbleLaw = Universe.getHubbleAnalysis(Universe.getHomeGalaxyIndex())
	
	outputNumMeasGalaxies.innerHTML = (hubbleLaw !== null && hubbleLaw.lls !== null) ? LLS.count(hubbleLaw.lls) : 0;
	outputHomeGalaxyVelocity.innerHTML = (hubbleLaw !== null && hubbleLaw.lls !== null) ? hubbleLaw.displayableV0 : "--- km/s";
	outputChiSquared.innerHTML = (hubbleLaw !== null && hubbleLaw.lls !== null) ? LLS.chi_squared(hubbleLaw.lls)  : "---";
}
/*
function drawcurrentHome(cx,ty,size)
{
	const state = theContext.save();
	theContext.fillStyle = "#7F7F7F";
	theContext.font = size + "px Arial";

	theContext.translate(cx,ty);
	const homeString = "Home Galaxy: " + universe.galaxies[universe.currentHome]._id;
	theContext.fillText(homeString,-0.5 * theContext.measureText(homeString).width,0);
	theContext.restore(state);
}*/

let g_graphAxisDistance = new GraphAxis("xaxis","Distance (100 Mpc)",0,16);
let g_graphAxisRedshift = new GraphAxis("yaxis","Velocity (1000 km/s)",0,130);
let g_graphdatasetMeasurements = new GraphDataSet("data","xaxis", "yaxis", null,1,4,"#ff0000",true);
let g_graphdatatrendMeasurements = new GraphTrend("Hubble Diagram trend","xaxis", "yaxis", "linear", 0,0,"#0000ff" );
g_graphdatatrendMeasurements.disabled = true;


function drawHubble()
{
	canvasHubbleGraph.width = Math.min(window.innerHeight - 250,window.innerWidth);
	canvasHubbleGraph.height = canvasHubbleGraph.width;
	let contextHubbleGraph = canvasHubbleGraph.getContext("2d");
	let hubbleLaw = Universe.getHubbleAnalysis(Universe.getHomeGalaxyIndex())

	let g_graphHubble = new Graph("Hubble Diagram",canvasHubbleGraph.height - 25,canvasHubbleGraph.width,"#ffffff");
	g_graphHubble.addHorizontalAxis(g_graphAxisDistance);
	g_graphHubble.addVerticalAxis(g_graphAxisRedshift);
	g_graphHubble.addDataSet(g_graphdatasetMeasurements);
	g_graphHubble.addTrend(g_graphdatatrendMeasurements);

	contextHubbleGraph.clearRect(0, 0, canvasHubbleGraph.width, canvasHubbleGraph.height);
//	const x = cx - width * 0.5;
//	const y = ty;
	
	
	
	g_graphdatatrendMeasurements.disable = (hubbleLaw === null || hubbleLaw.lls === null || LLS.count(hubbleLaw.lls) < 2);
	g_graphdatatrendMeasurements._m = !g_graphdatatrendMeasurements.disable ? hubbleLaw.H0 / 10.0 : 0.0;// / 1000.0 * 100.0;;
	g_graphdatatrendMeasurements._b = !g_graphdatatrendMeasurements.disable ? hubbleLaw.v0 / 1000.0 : 0.0;

	g_graphdatasetMeasurements.clear();
	if (hubbleLaw !== null && hubbleLaw.data !== null)
	{
		const iMax = LLSdatasetContainer.count(hubbleLaw.data)
		for (let i = 0; i < iMax; i++)
		{
			const set = LLSdatasetContainer.get(hubbleLaw.data,i);
			let datum = new GraphDatum(set.x / 100.0,set.y / 1000.0);
			g_graphdatasetMeasurements.add(datum);
		}
	}

	g_graphHubble.draw(contextHubbleGraph,0,25);
	
	displayHubbleConstant.innerHTML = "H<sub>0</sub> = " + hubbleLaw.displayable;
}

let displayHubbleConstant = document.getElementById("HubbleConstant");

function draw()
{
	populateGalaxyList();
	drawMap();
	drawTelescopeField();
	drawMeasurementInfo();
	drawHubble()
//	const decD = degreestoDMSDisplayable(degrees(viewLat));
//	const raD = degreestoDMSDisplayable(degrees(viewLong));
}





