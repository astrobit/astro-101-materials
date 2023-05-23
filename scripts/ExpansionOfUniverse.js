// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan
// Copyright (c) 2020,2021, Brian W. Mulligan


let theCanvasSkyMap = document.getElementById("canvasSkyMap");
theCanvasSkyMap.onselectstart = function () { return false; }
theCanvasSkyMap.height = window.innerHeight - 250
theCanvasSkyMap.width = theCanvasSkyMap.height * 2.0;

let theContextSkyMap = theCanvasSkyMap.getContext("2d");

let canvasTelescopeView = document.getElementById("canvasTelescopeView");
canvasTelescopeView.width = 384;
canvasTelescopeView.height = 384;
let contextTelescopeView = canvasTelescopeView.getContext("2d");


let canvasHubbleGraph = document.getElementById("canvasHubbleGraph");
canvasHubbleGraph.width = window.innerHeight - 250;
canvasHubbleGraph.height = canvasHubbleGraph.width;
let contextHubbleGraph = canvasHubbleGraph.getContext("2d");

let divGalaxyList = document.getElementById("divGalaxyList");
let divSkyMap = document.getElementById("divSkyMap");
let divTelescopeView = document.getElementById("divTelescopeView");
let divHubbleGraph = document.getElementById("divHubbleGraph");

let tabSkyMap = document.getElementById("tabSkyMap");
let tabTelescopeView = document.getElementById("tabTelescopeView");
let tabGalaxyList = document.getElementById("tabGalaxyList");
let tabHubbleGraph = document.getElementById("tabHubbleGraph");

function selectTab(tab)
{
	divGalaxyList.style.display = (tab == "Galaxy List") ? "block" : "none";
	divSkyMap.style.display = (tab == "Sky Map") ? "block" : "none";
	divTelescopeView.style.display = (tab == "Telescope View") ? "block" : "none";
	divHubbleGraph.style.display = (tab == "Hubble Graph") ? "block" : "none";
	
	tabSkyMap.className = (tab != "Sky Map") ? "tablinks" : "tablinks active"
	tabGalaxyList.className = (tab != "Galaxy List") ? "tablinks" : "tablinks active"
	tabTelescopeView.className = (tab != "Telescope View") ? "tablinks" : "tablinks active"
	tabHubbleGraph.className = (tab != "Hubble Graph") ? "tablinks" : "tablinks active"
	
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
	setSlewTarget(0.0,0.0);
	updateHubbleLaw();
	draw();
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
	if (idx < universe.galaxies.length)
	{
		const selected = universe.galaxies[idx];
		const relPos = getRelPos(universe.galaxies[universe.currentHome]._position,universe.galaxies[idx]._position);
		const relPosUnit = relPos.unit;
		setSlewTarget(relPosUnit.psi,relPosUnit.theta);
		tabTelescopeView.click();
	}
}

function populateGalaxyList()
{
	let bodyGalaxyList = document.getElementById("bodyGalaxyList");
	let tableBody = new String();
	for (let i = 0; i < universe.galaxies.length; i++)
	{
		if (i !== universe.currentHome)
		{
			tableBody += "<tr>";
			const onClick = " onclick=\"onSelectGalaxy('"+universe.galaxies[i]._id + "'," + i + ");\"";
			
			tableBody += insertTableData('<input type="button" value="' + universe.galaxies[i]._id + '" ' + onClick + '>',120);
			
			const relPos = getRelPos(universe.galaxies[universe.currentHome]._position,universe.galaxies[i]._position);
			const rpUnit = relPos.unit;
			const raHMS = degreestoHMSDisplayable((degrees(rpUnit.theta) + 360.0) % 360.0);
			const decDMS = degreestoDMSDisplayable(degrees(rpUnit.psi));
			tableBody += insertTableData(raHMS.hr + "h " + raHMS.min + "m " + raHMS.sec + "s",150);
			tableBody += insertTableData(decDMS.deg + "° " + decDMS.min + "' " + decDMS.sec + "\"",150);

			const measData = universe.galaxies[i].getMeasurementSet(universe.currentHome);
			if (typeof measData !== 'undefined')
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
			}
			else
			{
				tableBody += insertTableData("--------------",150)
				tableBody += insertTableData("-----",50)
				tableBody += insertTableData("------------",150)
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
	if (inViewList.length > 0)
	{
		for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
		{
			const curr = universe.galaxies[inViewList[idxLcl].idx];
			tableBody += "<tr>";
			tableBody += insertTableData(curr._id,120);
			
//			const relPos = getRelPos(universe.galaxies[universe.currentHome]._position,curr._position);
//			const rpUnit = relPos.unit;
			
//			tableBody += insertTableData((degrees(rpUnit.theta) / 15 + 24.0) % 24.0);
//			tableBody += insertTableData(degrees(rpUnit.psi));

			const measData = curr.getMeasurementSet(universe.currentHome);
			if (typeof measData !== 'undefined')
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
			}
			else
			{
				tableBody += insertTableData("--------------",150)
				tableBody += insertTableData("----",50)
				tableBody += insertTableData("------------",150)
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
			tableBody += "</tr>";
	}
	bodyGalaxyList.innerHTML = tableBody;
}

let projection = new Mollweide(0,0);

function drawMap()
{
	theContextSkyMap.clearRect(0, 0, theCanvasSkyMap.width, theCanvasSkyMap.height);
	theContextSkyMap.save();
	theContextSkyMap.translate(theCanvasSkyMap.width * 0.5,theCanvasSkyMap.height * 0.5);
	theContextSkyMap.fillStyle = "#0F0F0F";
	drawEllipseByCenterFill(theContextSkyMap,0,0,theCanvasSkyMap.width,theCanvasSkyMap.height)
	theContextSkyMap.strokeStyle = "#FFFFFF";
	drawEllipseByCenter(theContextSkyMap,0,0,theCanvasSkyMap.width,theCanvasSkyMap.height)
	
	theContextSkyMap.fillStyle = "#FFFFFF";
	let idxLcl;
	
	for (idxLcl = 0; idxLcl < universe.galaxies.length; idxLcl++)
	{
		if (idxLcl != universe.currentHome)
		{
			
			const relPos = getRelPos(universe.galaxies[universe.currentHome]._position,universe.galaxies[idxLcl]._position);
			const dist = relPos.radius;
			const long = relPos.theta * 180.0 / Math.PI;//Math.atan2(universe.galaxies[idxLcl]._position.y - universe.galaxies[universe.currentHome]._position.y,universe.galaxies[idxLcl]._position.x - universe.galaxies[universe.currentHome]._position.x);
			const lat = relPos.psi * 180.0 / Math.PI;//Math.asin(z / dist);
			const proj = projection.calculate(lat,long);
			
			theContextSkyMap.fillStyle = "#FFFFFF";


			theContextSkyMap.beginPath();
			theContextSkyMap.arc(proj.x * theCanvasSkyMap.width * 0.5,-proj.y * theCanvasSkyMap.height * 0.5,1.0,0,2.0 * Math.PI);
			theContextSkyMap.closePath();
			theContextSkyMap.fill();


		}
	}
	
	theContextSkyMap.strokeStyle = '#FFFF00';
	const proj = projection.calculate(viewLat * 180.0 / Math.PI,viewLong * 180.0 / Math.PI);
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
	const nearest = findNearestGalaxy(radians(pos.lat),radians(pos.long));
	setSlewTarget(nearest.lat,nearest.long);
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

function drawTelescopeField()
{
	const raHMS = degreestoHMSDisplayable((degrees(viewLong) + 360.0) % 360.0);
	const decDMS = degreestoDMSDisplayable(degrees(viewLat));

	readoutTelescopeView.innerHTML = raHMS.hr + "h " + raHMS.min + "m " + raHMS.sec + "s  " + ((viewLat >= 0) ? "+" : "") + decDMS.deg + "° " + decDMS.min + "' " + decDMS.sec + "\""; 
	
	
	
	inView = new Array();
	inViewDist = new Array();
	contextTelescopeView.clearRect(0, 0, canvasTelescopeView.width, canvasTelescopeView.height);
	

	const state = contextTelescopeView.save();
	const cx = canvasTelescopeView.width * 0.5;
	const cy = canvasTelescopeView.height * 0.5;
	const radius = canvasTelescopeView.width * 0.5 - 2;
	const telescopePixelToViewPixel = radius / telescopes[currentTelescope]._CCDresolution;
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
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		const curr = universe.galaxies[inViewList[idxLcl].idx];
		let currLcl = new Object();
		currLcl.eqDiskSize = null;
		currLcl.polDiskSize = null;
		currLcl.colorDisk = null;
		if (curr._galaxyType == 0) // elliptical
		{
			currLcl.eqSize = Math.max(curr._radiusEquatorial * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._radiusPolar * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
		}
		else
		{
			currLcl.eqSize = Math.max(curr._bulgeSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._bulgeSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.eqDiskSize = Math.max(curr._diskSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polDiskSize = Math.max(curr._diskSize * inViewList[idxLcl].pixelScale * curr._cosOrientationFace * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
			currLcl.colorDisk = scaleColorSpiral(inViewList[idxLcl].bright,curr._color)
		}
		currLcl.x = inViewList[idxLcl].x * telescopePixelToViewPixel;
		currLcl.y = inViewList[idxLcl].y * telescopePixelToViewPixel;
		currLcl.bright = inViewList[idxLcl].bright;
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
function drawcurrentHome()
{
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

let g_graphHubble = new Graph("Hubble Diagram",canvasHubbleGraph.height - 25,canvasHubbleGraph.width,"#ffffff");
let g_graphAxisDistance = new GraphAxis("xaxis","Distance (100 Mpc)",0,15);
let g_graphAxisRedshift = new GraphAxis("yaxis","Velocity (1000 km/s)",0,125);
let g_graphdatasetMeasurements = new GraphDataSet("data","xaxis", "yaxis", null,1,4,"#ff0000",true);
let g_graphdatatrendMeasurements = new GraphTrend("Hubble Diagram trend","xaxis", "yaxis", "linear", 0,0,"#0000ff" );
g_graphdatatrendMeasurements.disabled = true;

g_graphHubble.addHorizontalAxis(g_graphAxisDistance);
g_graphHubble.addVerticalAxis(g_graphAxisRedshift);
g_graphHubble.addDataSet(g_graphdatasetMeasurements);
g_graphHubble.addTrend(g_graphdatatrendMeasurements);

function drawHubble()
{
	contextHubbleGraph.clearRect(0, 0, canvasHubbleGraph.width, canvasHubbleGraph.height);
//	const x = cx - width * 0.5;
//	const y = ty;
	
	
	
	g_graphdatatrendMeasurements.disable = !(hubbleLaw.measH0u > 0);
	g_graphdatatrendMeasurements._m = hubbleLaw.measH0 / 10.0;// / 1000.0 * 100.0;;
	g_graphdatatrendMeasurements._b = hubbleLaw.measIntercept / 1000.0;

	g_graphdatasetMeasurements.clear();
	for (idxLcl = 0; idxLcl < universe.listMeasurements.length; idxLcl++)
	{
		if (universe.listMeasurements[idxLcl]._fromGalaxy == universe.currentHome && universe.listMeasurements[idxLcl]._dist_u > 0 && universe.listMeasurements[idxLcl]._redshift_u > 0)
		{
			let datum = new GraphDatum(universe.listMeasurements[idxLcl]._dist / 100.0,universe.listMeasurements[idxLcl]._redshift * 299.792458);
			g_graphdatasetMeasurements.add(datum);
		}
	}
	g_graphHubble.draw(contextHubbleGraph,0,25);
	
	const readout = sig_figs(hubbleLaw.measH0,hubbleLaw.measH0u);
	if (hubbleLaw.measH0 <= 0)
		displayHubbleConstant.innerHTML = "H<sub>0</sub> = ---"
	else if (hubbleLaw.measH0u <= 0)
		displayHubbleConstant.innerHTML = "H<sub>0</sub> = (" + hubbleLaw.measH0.toFixed(0) + " ± ∞) km/s/Mpc";
	else
		displayHubbleConstant.innerHTML = "H<sub>0</sub> = " + readout.standard_notation + " km/s/Mpc";
}

let displayHubbleConstant = document.getElementById("HubbleConstant");

function draw()
{
	populateGalaxyList();
	drawMap();
	drawTelescopeField();
	drawcurrentHome();
	drawHubble()
//	const decD = degreestoDMSDisplayable(degrees(viewLat));
//	const raD = degreestoDMSDisplayable(degrees(viewLong));
}




function onResetRequest()
{
	//@@TODO: confirm request with a popup dialogue
	generateUniverse();
}

draw();
