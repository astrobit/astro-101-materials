// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan



let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it
theCanvas.width = window.innerWidth - 10;
const canvasCenterX = theCanvas.width / 2.0; 

let theContext = theCanvas.getContext("2d");

let listGalaxies = new Array();

for (const [key, value] of Object.entries(galaxyData)) {
	if (value.DAT.length > 0 && value.SFB.length > 0)
		listGalaxies.push(key);
}

let selectedGalaxy;

let VelMax = 0;
let LumMax = 0;
let LumMin = 1000;
let distanceMpc;
let radiusMax;



let index = new Array(3);
let massFrac = new Array(3);


let bulgeMassFrac = 0.3;
let diskMassFrac = 0.3;
let dmMassFrac = 1.0 - bulgeMassFrac - diskMassFrac;

let diskIndex = 1.0; // Disk
let bulgeIndex = 1.0; // Bulge
let dmIndex = 1.0; // DM
let mass = 3.16e12;

let massToLight = 4.0; // mass-to-light ratio
let inclination = 0.0;
let sini = 1.0;

function JaffeMassFrac(r,a)
{
	const x = r/a;
	return (x / (1.0 + x));
}
function HerquistMassFrac(r,a)
{
	const x = r/a;
	return 0.5 * (x / (1.0 + x)) ** 2;
}
function NFWMassFrac(r,a)
{
	const x = r/a;
	return Math.log(1.0 + x) - (x / (1.0 + x));
}
const bulgeModel = "Jaffe";

function getBulgeMass(r)
{
	const a = bulgeIndex;
	let ret = 0;
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

const diskModel = "exponential";

function ExponentialDiskMassFrac(r,a)
{
	const x = r/a;
	return 1.0 - Math.exp(-x) * (1 + x);
}

function MestelDiskMassFrac(r,a)
{
	return Math.min(r/a,1);
}


function getDiskMass(r)
{
	const a = diskIndex;
	let ret = 0;
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
	const a = dmIndex;
	const ret = dmMassFrac * mass * NFWMassFrac(r,a);
	return ret;
}


function getMass(r)
{
	return getBulgeMass(r) + getDiskMass(r) + getHaloMass(r);
}




function getVelocity(r)
{
	const massGcgs = getMass(r) * 1.98847e33 * 6.67430e-8;
	const radiuscgs = r *  3.0856775814913673e21; // kpc to cm
	const velocity = Math.sqrt(massGcgs / radiuscgs);
	return velocity * 1e-5 * sini; // cm/s -> km/s
}


function JaffeSurfaceLuminosityFrac(r,a)
{
//@@TODO
	const x = r/a;
	return 0;//(x / (1.0 + x));
}
function HerquistSurfaceLuminosityFrac(r,a)
{
//@@TODO
	const x = r/a;
	return 0;//0.5 * (x / (1.0 + x)) ** 2;
}
function getBulgeLuminosity(r)
{
	const a = bulgeIndex;
	let ret = 0;
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
	const x = r == 0 ? 0.0001 : r/a;
	return 1.0 / (Math.PI * (a**2) * x) * Math.exp(-x);
}

function MestelDiskSurfaceLuminosityFrac(r,a) // (kpc^-2)
{
	const x = r == 0 ? 0.0001 : r/a;
	return 1.0 / (2.0 * Math.PI * (a**2) * x);
}


function getDiskLuminosity(r)
{
	const a = diskIndex;
	let ret = 0;
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

function getLuminosity(r)
{
	return getBulgeLuminosity(r) + getDiskLuminosity(r); // halo is dark, so only bulge and disk matter
}

function getSurfaceBrightness(r)
{
	const fluxSolar = getLuminosity(r); // Solar luminosities / kpc^2
	const d = galaxyData[selectedGalaxy].DAT[0].distance; // Mpc
	const arcsec = 1.0 / 3600.0 * Math.PI / 180.0; // 1"
	const x = d * arcsec * 1000.0; // kpc
	const L = fluxSolar * (x**2); // Solar luminosities
	const Mv = Math.log10(L) * -2.5 + 4.83 ;
	const DM = 5 * Math.log10(d) + 25
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

	let r;
	
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
		const x = i * graphWidth / 5;
		const y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		const radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x,y+20);
	}
	theContext.textAlign = "right";
	let massRel;
	for (massRel = 0; massRel <= 1.25; massRel += 0.25)
	{
		const x = 0;
		const y = -massRel / 1.25 * graphHeight;
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
	let first = true;
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
		const Mdisk = getDiskMass(r) / mass;

		const x = r / radiusMax * graphWidth;
		const y = -Mdisk * graphHeight / 1.25;
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
		const Mbulge = getBulgeMass(r) / mass;

		const x = r / radiusMax * graphWidth;
		const y = -Mbulge * graphHeight / 1.25;
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
		const Mdm = getHaloMass(r) / mass;

		const x = r / radiusMax * graphWidth;
		const y = -Mdm * graphHeight / 1.25;
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
		const mtot = getMass(r) / mass;

		const x = r / radiusMax * graphWidth;
		const y = -mtot * graphHeight / 1.25;
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
	let VelRound = 50;
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
	const VelScale = (Math.floor(VelMax / VelRound) + 1.0) * VelRound;



	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (i = 0; i < 6; i++)
	{
		const x = i * graphWidth / 5;
		const y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		const radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x,y+20);
	}
	theContext.textAlign = "right";
	let vel;
	for (vel = 0; vel <= VelScale; vel += VelRound)
	{
		const x = 0;
		const y = -vel / VelScale * graphHeight;
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
	first = true;
	for (r = 0.01 * radiusMax; r <= radiusMax; r += (radiusMax * 0.02))
	{
	
		const x = r / radiusMax * graphWidth;
		const y = -getVelocity(r) / VelScale * graphHeight;
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
	const vsum = 0;
	const len = galaxyData[selectedGalaxy].DAT.length;
	for (i = 0; i < len; i++) {
		const jLen = galaxyData[selectedGalaxy].DAT[i].data.length;
		for (j = 0; j < jLen; j++) {
			const r = galaxyData[selectedGalaxy].DAT[i].data[j].radius;
			const x = r / radiusMax * graphWidth;
			const y = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs / VelScale * -200;
			theContext.fillRect(x - 2, y - 2, 4, 4);

				// draw error bars
			const vmin = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs - galaxyData[selectedGalaxy].DAT[i].data[j].err;
			const vmax = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs + galaxyData[selectedGalaxy].DAT[i].data[j].err;
			const ymin = vmin / VelScale * -graphHeight;
			const ymax = vmax / VelScale * -graphHeight;

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
	
	let LumMinPlot = Math.floor(LumMin);
	let LumMaxPlot = Math.ceil(LumMax);

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
		const x = i * graphWidth / 5;
		const y = 0;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		const radLabel = Math.round(radiusMax / 4 * i * 10.0) / 10.0;
		theContext.fillText(radLabel, x, y + 20);
	}
	let mv;
	let mvstep = 1;
	theContext.textAlign = "right";
	let deltamv = LumMaxPlot - LumMinPlot;
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
		const x = 0;
		const y = (mv - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
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
		const s = getSurfaceBrightness(r);
	
		const x = r / radiusMax * graphWidth;
		const y = (s - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
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
//	const Lsum = 0;
	const lenGal = galaxyData[selectedGalaxy].SFB.length;
	for (i = 0; i < lenGal; i++) {
		const jLen = galaxyData[selectedGalaxy].SFB[i].length;
		for (j = 0; j < jLen; j++) {
			const r = galaxyData[selectedGalaxy].SFB[i][j].radius / 3600.0 / 180.0 * Math.PI * distanceMpc * 1000.0;
			const x = r / radiusMax * graphWidth;
			const y = (galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
			theContext.fillRect(x - 2, y - 2, 4, 4);

			// draw error bars
			const mumin = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - galaxyData[selectedGalaxy].SFB[i][j].err;
			const mumax = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness + galaxyData[selectedGalaxy].SFB[i][j].err;
			const ymin = (mumin - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;
			const ymax = (mumax - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * graphHeight;

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
	const elemBulge = document.getElementById('bulgeDiskRatio');
	const elemMassLightRatio = document.getElementById('MassLightRatio');
	massToLight = Number(elemMassLightRatio.value);
	const InvLightMassRatio = 1.0 / massToLight;
	dmMassFrac = 1.0 - InvLightMassRatio;
	const diskMassFracLcl = Number(elemBulge.value) / Number(elemBulge.max);
	bulgeMassFrac = (1.0 - diskMassFracLcl) * InvLightMassRatio;
	diskMassFrac = diskMassFracLcl * InvLightMassRatio;

	const elemBulgeIndex = document.getElementById('bulgeIndex');
	const elemDiskIndex = document.getElementById('diskIndex');
	const elemDMIndex = document.getElementById('DMIndex');

	diskIndex = Number(elemDiskIndex.value);// / 100.0 * 3.0 + 1.0;
	bulgeIndex = Number(elemBulgeIndex.value);// / 100.0 * 3.0 + 1.0;
	dmIndex = Number(elemDMIndex.value);// / 100.0 * 3.0 + 1.0;

	const elemMass = document.getElementById('totalMass');
	mass = Math.pow(10,Number(elemMass.value));

	const inclElem = document.getElementById("inclination");
	inclination = inclElem.value;
	sini = Math.sin(radians(90.0 - inclination));


	let elemOutput = document.getElementById('tdTotalMass');
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

	elemOutput = document.getElementById('tdInclinationAngle');
	elemOutput.innerHTML = inclination.toString() + "°";

//	getUserFitParameters();
	plot();
	window.setTimeout(update, 30.0);

}


function chooseGalaxy(shouldPlot)
{
	let idx = 0
	do
	{
		idx = Math.floor(Math.random() * listGalaxies.length);
	} while (listGalaxies[idx] === selectedGalaxy)

	selectedGalaxy = listGalaxies[idx];


	VelMax = 0;
	LumMaxPlot = 0;
	LumMinPlot = 1000;
	radiusMax = 0;

	let distSum = 0;
	let distCount = 0;
	const len = galaxyData[selectedGalaxy].DAT.length;
	for (i = 0; i < len; i++) {
		const jLen = galaxyData[selectedGalaxy].DAT[i].data.length;
		for (j = 0; j < jLen; j++) {
			const vmax = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs + galaxyData[selectedGalaxy].DAT[i].data[j].err;
			if (vmax > VelMax)
				VelMax = vmax;
			if (galaxyData[selectedGalaxy].DAT[i].data[j].radius > radiusMax)
				radiusMax = galaxyData[selectedGalaxy].DAT[i].data[j].radius;
		}
		distSum += galaxyData[selectedGalaxy].DAT[i].distance;
		distCount++;
	}
	distanceMpc = (distSum / distCount);

	const lenSFB = galaxyData[selectedGalaxy].SFB.length;
	for (i = 0; i < lenSFB; i++) {
		jLen = galaxyData[selectedGalaxy].SFB[i].length;
		for (j = 0; j < jLen; j++) {
			const lmax = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness + galaxyData[selectedGalaxy].SFB[i][j].err;
			const lmin = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - galaxyData[selectedGalaxy].SFB[i][j].err;
			if (lmax > LumMax)
				LumMax = lmax;
			if (lmin < LumMin)
				LumMin = lmin;
			const radiuskpc = galaxyData[selectedGalaxy].SFB[i][j].radius / 3600.0 / 180.0 * Math.PI * distanceMpc * 1000.0;
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



