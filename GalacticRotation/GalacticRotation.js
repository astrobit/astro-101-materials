// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan



var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it
theCanvas.width = window.innerWidth - 10;
var canvasCenterX = theCanvas.width / 2.0; 

var theContext = theCanvas.getContext("2d");

var listGalaxies = new Array();

for (const [key, value] of Object.entries(galaxyData)) {
	if (value.DAT.length > 0 && value.SFB.length > 0)
		listGalaxies.push(key);
}

var selectedGalaxy;

var VelMax = 0;
var LumMax = 0;
var LumMin = 1000;
var distanceMpc;
var radiusMax;



var index = new Array(3);
var massFrac = new Array(3);


var bulgeMassFrac = 0.3;
var diskMassFrac = 0.3;
var dmMassFrac = 1.0 - bulgeMassFrac - diskMassFrac;

var diskIndex = 1.0; // Disk
var bulgeIndex = 1.0; // Bulge
var dmIndex = 1.0; // DM
var mass = 3.16e12;

var massToLight = 4.0; // mass-to-light ratio

function JaffeMassFrac(r,a)
{
	var x = r/a;
	return (x / (1.0 + x));
}
function HerquistMassFrac(r,a)
{
	var x = r/a;
	return 0.5 * (x / (1.0 + x)) ** 2;
}
function NFWMassFrac(r,a)
{
	var x = r/a;
	return Math.log(1.0 + x) - (x / (1.0 + x));
}
var bulgeModel = "Jaffe";

function getBulgeMass(r)
{
	var a = bulgeIndex;
	var ret = 0;
	if (bulgeModel == "Jaffe")
	{
		ret = bulgeMassFrac * mass * JaffeMassFrac(r,a);
	}
	else // model = Hernquist
	{
		ret = bulgeMassFrac * mass * HerquistMassFrac(r,a);
	}
	return ret;
}

var diskModel = "exponential";

function ExponentialDiskMassFrac(r,a)
{
	var x = r/a;
	return 1.0 - Math.exp(-x) * (1 + x);
}

function MestelDiskMassFrac(r,a)
{
	return Math.min(r/a,1);
}


function getDiskMass(r)
{
	var a = diskIndex;
	var ret = 0;
	if (diskModel == "exponential")
	{
		ret = diskMassFrac * mass * ExponentialDiskMassFrac(r,a);
	}
	else // model = Mestel
	{
		ret = diskMassFrac * mass * MestelDiskMassFrac(r,a);
	}
	return ret;
}

function getHaloMass(r)
{
	var a = dmIndex;
	var ret = 0;
	ret = dmMassFrac * mass * NFWMassFrac(r,a);
	return ret;
}


function getMass(r)
{
	return getBulgeMass(r) + getDiskMass(r) + getHaloMass(r);
}




function getVelocity(r)
{
	var massGcgs = getMass(r) * 1.98847e33 * 6.67430e-8;
	var radiuscgs = r *  3.0856775814913673e21; // kpc to cm
	var velocity = Math.sqrt(massGcgs / radiuscgs);
	return velocity * 1e-5; // cm/s -> km/s
}


function JaffeSurfaceLuminosityFrac(r,a)
{
//@@TODO
	var x = r/a;
	return 0;//(x / (1.0 + x));
}
function HerquistSurfaceLuminosityFrac(r,a)
{
//@@TODO
	var x = r/a;
	return 0;//0.5 * (x / (1.0 + x)) ** 2;
}
function getBulgeLuminosity(r)
{
	var a = bulgeIndex;
	var ret = 0;
	if (bulgeModel == "Jaffe")
	{
		ret = bulgeMassFrac * mass / massToLight * JaffeSurfaceLuminosityFrac(r,a);
	}
	else // model = Hernquist
	{
		ret = bulgeMassFrac * mass  / massToLight* HerquistSurfaceLuminosityFrac(r,a);
	}
	return ret;
}


function ExponentialDiskSurfaceLuminosityFrac(r,a) // (kpc^-2)
{
	var x = r/a;
	if (x == 0)
		x = 0.0001;
	return 1.0 / (Math.PI * (a**2) * x) * Math.exp(-x);
}

function MestelDiskSurfaceLuminosityFrac(r,a) // (kpc^-2)
{
	var x = r/a;
	if (x == 0)
		x = 0.0001;
	return 1.0 / (2.0 * Math.PI * (a**2) * x);
}


function getDiskLuminosity(r)
{
	var a = diskIndex;
	var ret = 0;
	if (diskModel == "exponential")
	{
		ret = diskMassFrac * mass / massToLight * ExponentialDiskSurfaceLuminosityFrac(r,a);
	}
	else // model = Mestel
	{
		ret = diskMassFrac * mass / massToLight * MestelDiskSurfaceLuminosityFrac(r,a);
	}
	return ret;
}

function getHaloMass(r)
{
	var a = dmIndex;
	var ret = 0;
	ret = dmMassFrac * mass * NFWMassFrac(r,a);
	return ret;
}

function getLuminosity(r)
{
	return getBulgeLuminosity(r) + getDiskLuminosity(r); // halo is dark, so only bulge and disk matter
}

function getSurfaceBrightness(r)
{
	var fluxSolar = getLuminosity(r); // Solar luminosities / kpc^2
	var d = galaxyData[selectedGalaxy].DAT[0].distance; // Mpc
	var arcsec = 1.0 / 3600.0 * Math.PI / 180.0; // 1"
	var x = d * arcsec * 1000.0; // kpc
	var L = fluxSolar * (x**2); // Solar luminosities
	var Mv = Math.log10(L) * -2.5 + 4.83 ;
	var DM = 5 * Math.log10(d) + 25
	return Mv + DM;
}


function plot()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);


	const graphWidth = 400;
	const graphHeight = 200;
	//
	// Draw Velocity information
	//

	var r;
	
	theContext.save();
	theContext.translate(canvasCenterX - 3* graphWidth / 2 - 100,20 + graphHeight);
	
	theContext.fillStyle = "#7F7F7F";

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", graphWidth * 0.5, 40);
	theContext.save();
	theContext.translate(-35,-graphHeight*0.5);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Interior Mass (Solar Masses)", 0, 0);
	theContext.restore();

	
	theContext.lineWidth = 2;
	theContext.strokeStyle = "#FFFFFF";
	theContext.fillStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.moveTo(0,-graphHeight);
	theContext.lineTo(0,0);
	theContext.lineTo(graphWidth,0);
	theContext.stroke();

	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (i = 0; i < 6; i++)
	{
		var x = i * graphWidth / 5;
		var y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		var radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x,y+20);
	}
	theContext.textAlign = "right";
	var massRel;
	for (massRel = 0; massRel <= 1.25; massRel += 0.25)
	{
		var x = 0;
		var y = -massRel / 1.25 * graphHeight;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(massRel, x - 6,y + 3);
	}

	
	theContext.rect(0,-graphHeight,graphWidth,graphHeight);
	theContext.clip();
	
	//
	// Model
	//
	

	theContext.strokeStyle = "#FF0000";
	theContext.beginPath();
	var first = true;
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
		var Mdisk = getDiskMass(r) / mass;

		var x = r / radiusMax * graphWidth;
		var y = -Mdisk * graphHeight / 1.25;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();
	theContext.strokeStyle = "#00FF00";
	first = true;
	theContext.beginPath();
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
		var Mbulge = getBulgeMass(r) / mass;

		var x = r / radiusMax * graphWidth;
		var y = -Mbulge * graphHeight / 1.25;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();
	theContext.strokeStyle = "#0000FF";
	first = true;
	theContext.beginPath();
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
		var Mdm = getHaloMass(r) / mass;

		var x = r / radiusMax * graphWidth;
		var y = -Mdm * graphHeight / 1.25;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();
	theContext.strokeStyle = "#7F7F7F";
	first = true;
	theContext.beginPath();
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
		var mtot = getMass(r) / mass;

		var x = r / radiusMax * graphWidth;
		var y = -mtot * graphHeight / 1.25;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();


	theContext.restore();
	
		
	theContext.save();
	theContext.translate(canvasCenterX + -graphWidth / 2,20 + graphHeight);
	
	theContext.fillStyle = "#7F7F7F";

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", graphWidth * 0.5, 40);
	theContext.save();
	theContext.translate(-35,-graphHeight*0.5);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Velocity (km/s)", 0, 0);
	theContext.restore();

	
	theContext.lineWidth = 2;
	theContext.strokeStyle = "#FFFFFF";
	theContext.fillStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.moveTo(0,-graphHeight);
	theContext.lineTo(0,0);
	theContext.lineTo(graphWidth,0);
	theContext.stroke();
	var VelRound = 50;
	if (VelMax < 0.5)
		VelRound = 0.1;
	else if (VelMax < 1)
		VelRound = 0.2;
	else if (VelMax < 2)
		VelRound = 0.5;
	else if (VelMax < 5)
		VelRound = 1;
	else if (VelMax < 10)
		VelRound = 2;
	else if (VelMax < 20)
		VelRound = 5;
	else if (VelMax < 50)
		VelRound = 10;
	else if (VelMax < 100)
		VelRound = 20;
	else if (VelMax > 250)
		VelRound = 100;
	else if (VelMax > 1000)
		VelRound = 200;
	var VelScale = (Math.floor(VelMax / VelRound) + 1.0) * VelRound;



	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (i = 0; i < 6; i++)
	{
		var x = i * graphWidth / 5;
		var y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		var radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x,y+20);
	}
	theContext.textAlign = "right";
	var vel;
	for (vel = 0; vel <= VelScale; vel += VelRound)
	{
		var x = 0;
		var y = -vel / VelScale * graphHeight;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(vel, x - 6,y + 3);
	}

	
	theContext.rect(0,-graphHeight,graphWidth,graphHeight);
	theContext.clip();
	
	//
	// Model
	//
	
	theContext.beginPath();
	var first = true;
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
	
		var x = r / radiusMax * graphWidth;
		var y = -getVelocity(r) / VelScale * graphHeight;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();

	//
	// Draw galaxy data
	//

	theContext.fillStyle = "#FF0000";
	theContext.strokeStyle = "#FF0000";
	var vsum = 0;
	var len = galaxyData[selectedGalaxy].DAT.length;
	for (i = 0; i < len; i++) {
		var jLen = galaxyData[selectedGalaxy].DAT[i].data.length;
		for (j = 0; j < jLen; j++) {
			var r = galaxyData[selectedGalaxy].DAT[i].data[j].radius;
			var x = r / radiusMax * graphWidth;
			var y = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs / VelScale * -200;
			theContext.fillRect(x - 2, y - 2, 4, 4);

				// draw error bars
			var vmin = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs - galaxyData[selectedGalaxy].DAT[i].data[j].err;
			var vmax = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs + galaxyData[selectedGalaxy].DAT[i].data[j].err;
			var ymin = vmin / VelScale * -graphHeight;
			var ymax = vmax / VelScale * -graphHeight;

			theContext.lineWidth = 1.0;
			theContext.strokeStyle = "#FF0000"
			theContext.beginPath();
			theContext.moveTo(x - 4, ymin);
			theContext.lineTo(x + 4, ymin);
			theContext.stroke();

			theContext.beginPath();
			theContext.moveTo(x - 4, ymax);
			theContext.lineTo(x + 4, ymax);
			theContext.stroke();

			theContext.beginPath();
			theContext.moveTo(x, ymin);
			theContext.lineTo(x, ymax);
			theContext.stroke();
		}
	}
	theContext.restore();
	
	//
	// Surface brightness
	//
	
	theContext.save();
	theContext.translate(canvasCenterX + graphWidth / 2 + 100,20 + graphHeight);
	
	var LumMinPlot = Math.floor(LumMin);
	var LumMaxPlot = Math.ceil(LumMax);

	theContext.fillStyle = "#7F7F7F";
	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", graphWidth * 0.5, 40);
	theContext.save();
	theContext.translate(-35,-100);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Surface Brightness", 0, 0);
	theContext.restore();



	theContext.fillStyle = "#FFFFFF";
	theContext.strokeStyle = "#FFFFFF";
	theContext.font = "10px Arial";
	theContext.beginPath();
	theContext.moveTo(0,-graphHeight);
	theContext.lineTo(0,0);
	theContext.lineTo(graphWidth,0);
	theContext.stroke();

	theContext.textAlign = "center";
	for (i = 0; i < 6; i++)
	{
		var x = i * graphWidth / 5;
		var y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		var radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x, y + 20);
	}
	var mv;
	var mvstep = 1;
	theContext.textAlign = "right";
	var deltamv = LumMaxPlot - LumMinPlot;
	if (deltamv < 2.0)
		mvstep = 0.25;
	else if (deltamv < 4.0)
		mvstep = 0.5;
	else if (deltamv < 10.0)
		mvstep = 1.0;
	else if (deltamv < 20.0)
		mvstep = 2.0;
	else if (deltamv < 50.0)
		mvstep = 5.0;
	else if (deltamv < 100.0)
		mvstep = 10.0;


	for (mv = LumMinPlot; mv <= LumMaxPlot; mv += mvstep)
	{
		var x = 0;
		var y = (mv - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(mv, x - 6,y + 3);
	}



	
	theContext.rect(0,-graphHeight,graphWidth,graphHeight);
	theContext.clip();

	//
	// User model
	//
	theContext.strokeStyle = "#7F7F7F";
	theContext.beginPath();
	first = true;
	for (r = 0; r <= radiusMax; r += (radiusMax * 0.02))
	{
		var s = getSurfaceBrightness(r);
	
		var x = r / radiusMax * graphWidth;
		var y = (s - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
		if (first)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
		first = false;
	}
	theContext.stroke();
	
	//
	// Galaxy Data
	//

	theContext.fillStyle = "#0000FF";
//	var Lsum = 0;
	var len = galaxyData[selectedGalaxy].SFB.length;
	for (i = 0; i < len; i++) {
		var jLen = galaxyData[selectedGalaxy].SFB[i].length;
		for (j = 0; j < jLen; j++) {
			var r = galaxyData[selectedGalaxy].SFB[i][j].radius / 3600.0 / 180.0 * Math.PI * distanceMpc * 1000.0;
			var x = r / radiusMax * graphWidth;
			var y = (galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
			theContext.fillRect(x - 2, y - 2, 4, 4);

			// draw error bars
			var mumin = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - galaxyData[selectedGalaxy].SFB[i][j].err;
			var mumax = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness + galaxyData[selectedGalaxy].SFB[i][j].err;
			var ymin = (mumin - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
			var ymax = (mumax - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;

			theContext.strokeStyle = "#0000FF"
			theContext.beginPath();
			theContext.moveTo(x - 4, ymin);
			theContext.lineTo(x + 4, ymin);
			theContext.stroke();

			theContext.beginPath();
			theContext.moveTo(x - 4, ymax);
			theContext.lineTo(x + 4, ymax);
			theContext.stroke();

			theContext.beginPath();
			theContext.moveTo(x, ymin);
			theContext.lineTo(x, ymax);
			theContext.stroke();
		}
	}
	theContext.restore();
}

function update()
{
	var elemBulge = document.getElementById('bulgeDiskRatio');
	var elemMassLightRatio = document.getElementById('MassLightRatio');
	massToLight = Number(elemMassLightRatio.value);
	var InvLightMassRatio = 1.0 / massToLight;
	dmMassFrac = 1.0 - InvLightMassRatio;
	var diskMassFracLcl = Number(elemBulge.value) / Number(elemBulge.max);
	bulgeMassFrac = (1.0 - diskMassFracLcl) * InvLightMassRatio;
	diskMassFrac = diskMassFracLcl * InvLightMassRatio;

	var elemBulgeIndex = document.getElementById('bulgeIndex');
	var elemDiskIndex = document.getElementById('diskIndex');
	var elemDMIndex = document.getElementById('DMIndex');

	diskIndex = Number(elemDiskIndex.value);// / 100.0 * 3.0 + 1.0;
	bulgeIndex = Number(elemBulgeIndex.value);// / 100.0 * 3.0 + 1.0;
	dmIndex = Number(elemDMIndex.value);// / 100.0 * 3.0 + 1.0;

	var elemMass = document.getElementById('totalMass');
	mass = Math.pow(10,Number(elemMass.value));


	var elemOutput = document.getElementById('tdTotalMass');
	elemOutput.innerHTML = Number.parseFloat(mass).toExponential(2) + "&nbsp;M<sub>⊙</sub>";


	elemOutput = document.getElementById('tdBulgeIndex');
	elemOutput.innerHTML =  Number.parseFloat(bulgeIndex).toFixed(2);

	elemOutput = document.getElementById('tdDiskIndex');
	elemOutput.innerHTML =  Number.parseFloat(diskIndex).toFixed(2);

	elemOutput = document.getElementById('tdDMIndex');
	elemOutput.innerHTML =  Number.parseFloat(dmIndex).toFixed(2);

	elemOutput = document.getElementById('tdBulgeMass');
	elemOutput.innerHTML =  Number.parseFloat(bulgeMassFrac).toFixed(2);

	elemOutput = document.getElementById('tdDiskMass');
	elemOutput.innerHTML =  Number.parseFloat(diskMassFrac).toFixed(2);

	elemOutput = document.getElementById('tdDMMass');
	elemOutput.innerHTML =  Number.parseFloat(dmMassFrac).toFixed(2);

	elemOutput = document.getElementById('tdGalID');
	elemOutput.innerHTML = selectedGalaxy;

//	getUserFitParameters();
	plot();
	window.setTimeout(update, 30.0);

}


function chooseGalaxy(shouldPlot)
{
	var idx = 0
	do
	{
		idx = Math.floor(Math.random() * listGalaxies.length);
	} while (listGalaxies[idx] === selectedGalaxy)

	selectedGalaxy = listGalaxies[idx];


	VelMax = 0;
	LumMaxPlot = 0;
	LumMinPlot = 1000;
	radiusMax = 0;

	var distSum = 0;
	var distCount = 0;
	var len = galaxyData[selectedGalaxy].DAT.length;
	for (i = 0; i < len; i++) {
		var jLen = galaxyData[selectedGalaxy].DAT[i].data.length;
		for (j = 0; j < jLen; j++) {
			var vmax = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs + galaxyData[selectedGalaxy].DAT[i].data[j].err;
			if (vmax > VelMax)
				VelMax = vmax;
			if (galaxyData[selectedGalaxy].DAT[i].data[j].radius > radiusMax)
				radiusMax = galaxyData[selectedGalaxy].DAT[i].data[j].radius;
		}
		distSum += galaxyData[selectedGalaxy].DAT[i].distance;
		distCount++;
	}
	distanceMpc = (distSum / distCount);

	var len = galaxyData[selectedGalaxy].SFB.length;
	for (i = 0; i < len; i++) {
		jLen = galaxyData[selectedGalaxy].SFB[i].length;
		for (j = 0; j < jLen; j++) {
			var lmax = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness + galaxyData[selectedGalaxy].SFB[i][j].err;
			var lmin = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - galaxyData[selectedGalaxy].SFB[i][j].err;
			if (lmax > LumMax)
				LumMax = lmax;
			if (lmin < LumMin)
				LumMin = lmin;
			var radiuskpc = galaxyData[selectedGalaxy].SFB[i][j].radius / 3600.0 / 180.0 * Math.PI * distanceMpc * 1000.0;
			if (radiuskpc > radiusMax)
				radiusMax = radiuskpc;
		}
	}
	// round max radius to nearest 10 kpc
	radiusMax = (Math.floor(radiusMax / 10.0) + 1) * 10.0;
	// round max radius to nearest 10 km/s
	VelMax = (Math.floor(VelMax / 10.0) + 1) * 10.0;
}

chooseGalaxy();
update();



