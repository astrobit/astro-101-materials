// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan



var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");

var listGalaxies = new Array();

for (const [key, value] of Object.entries(galaxyData)) {
	if (value.DAT.length > 0)
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

var diskIndex = -0.75; // Disk
var bulgeIndex = -2.00; // Bulge
var dmIndex = -1.75; // DM
var mass = 3.16e12;



function plot()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);



	theContext.lineWidth = 2;
	theContext.strokeStyle = "#FFFFFF";
	theContext.fillStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.moveTo(50,20);
	theContext.lineTo(50,220);
	theContext.lineTo(450,220);
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

	var LumMinPlot = Math.floor(LumMin);
	var LumMaxPlot = Math.ceil(LumMax);


	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (i = 0; i < 6; i++)
	{
		var x = 50 + i * 400 / 5;
		var y = 220;
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
		var x = 50;
		var y = 220 - vel / VelScale * 200;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(vel, x - 6,y + 3);
	}

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", 100 + 400 / 2, 260);
	theContext.save();
	theContext.translate(15,100);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Velocity (km/s)", 0, 0);
	theContext.restore();

	theContext.font = "10px Arial";
	theContext.beginPath();
	theContext.moveTo(525,20);
	theContext.lineTo(525,220);
	theContext.lineTo(975,220);
	theContext.stroke();

	theContext.textAlign = "center";
	for (i = 0; i < 6; i++)
	{
		var x = 525 + i * 400 / 5;
		var y = 220;
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
		var x = 525;
		var y = (mv - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * 200 + 220;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(mv, x - 6,y + 3);
	}

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", 750, 260);
	theContext.save();
	theContext.translate(500,100);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Surface Brightness", 0, 0);
	theContext.restore();

	theContext.save();
	//
	// Draw user model galaxy
	//

/*	var MconstDisk = mass * diskMassFrac / Math.pow(100,2+diskIndex);
	var MconstBulge = mass * bulgeMassFrac / Math.pow(100,3+bulgeIndex);
	var MconstDM = mass * dmMassFrac / Math.pow(100,3+dmIndex);

	var r;
	theContext.strokeStyle = "#7F7F7F";
	theContext.save();
	theContext.rect(50,20,400,200);
	theContext.clip();
	theContext.beginPath();
	for (r = 0.5; r <= 100; r++)
	{
		var Mdisk = MconstDisk * Math.pow(r,2 + diskIndex);
		var Mbulge = MconstBulge * Math.pow(r,3 + bulgeIndex);
		var Mdm = MconstDM * Math.pow(r,3 + dmIndex);
		var v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
	
		var x = r / 100.0 * 400 + 50;
		var y = v / VelScale * -200 + 220;
		if (r == 0)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
	}
	theContext.stroke();
	theContext.restore();
	
	theContext.save();
	theContext.rect(525,20,400,200);
	theContext.clip();
	theContext.beginPath();
	for (r = 0.5; r <= 50; r++)
	{
		var Ldisk = mass * diskMassFrac * Math.pow(r / 100.0,diskIndex);
		var Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0,bulgeIndex);
		var Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
	
		var x = r / 50.0 * 400 + 525;
		var y = (Mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
		if (r == 0)
			theContext.moveTo(x, y);
		else if (y < 450)
			theContext.lineTo(x, y);
	}
	theContext.stroke();
	theContext.restore();
	*/
	//
	// Draw simulated galaxy data and get quality of fit
	//

	theContext.fillStyle = "#FF0000";
	theContext.strokeStyle = "#FF0000";
	var vsum = 0;
	var len = galaxyData[selectedGalaxy].DAT.length;
	for (i = 0; i < len; i++) {
		var jLen = galaxyData[selectedGalaxy].DAT[i].data.length;
		for (j = 0; j < jLen; j++) {
			var r = galaxyData[selectedGalaxy].DAT[i].data[j].radius;
			var x = r / radiusMax * 400 + 50;
			var y = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs / VelScale * -200 + 220;
			theContext.fillRect(x - 2, y - 2, 4, 4);

				// draw error bars
			var vmin = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs - galaxyData[selectedGalaxy].DAT[i].data[j].err;
			var vmax = galaxyData[selectedGalaxy].DAT[i].data[j].Vobs + galaxyData[selectedGalaxy].DAT[i].data[j].err;
			var ymin = vmin / VelScale * -200 + 220;
			var ymax = vmax / VelScale * -200 + 220;

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

//			var Mdisk = MconstDisk * Math.pow(r, 2 + diskIndex);
//			var Mbulge = MconstBulge * Math.pow(r, 3 + bulgeIndex);
//			var Mdm = MconstDM * Math.pow(r, 3 + dmIndex);
//			var v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (GalVels[i].r * 3.086e21)) * 1.0e-5;
//			var verr = (1 - v / GalVels[i].v);
//			vsum += (verr * verr);
		}
	}
//	theContext.textAlign = "right";
//	theContext.font = "12px Arial";
//	theContext.fillStyle = "#000000";
//	theContext.fillText("Q = " + vsum,450,200);

	theContext.fillStyle = "#0000FF";
//	var Lsum = 0;
	var len = galaxyData[selectedGalaxy].SFB.length;
	for (i = 0; i < len; i++) {
		var jLen = galaxyData[selectedGalaxy].SFB[i].length;
		for (j = 0; j < jLen; j++) {
			var r = galaxyData[selectedGalaxy].SFB[i][j].radius / 3600.0 / 180.0 * Math.PI * distanceMpc * 1000.0;
			var x = r / radiusMax * 400 + 525;
			var y = (galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * 200 + 220;
			theContext.fillRect(x - 2, y - 2, 4, 4);

/*			var Ldisk = mass * diskMassFrac * Math.pow(r / 100.0, diskIndex);
			var Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0, bulgeIndex);
			var Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
			var verr = (1 - Mv / GalLum[i].v);
			Lsum += (verr * verr);
*/
			// draw error bars
			var mumin = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness - galaxyData[selectedGalaxy].SFB[i][j].err;
			var mumax = galaxyData[selectedGalaxy].SFB[i][j].surfaceBrightness + galaxyData[selectedGalaxy].SFB[i][j].err;
			var ymin = (mumin - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * 200 + 220;
			var ymax = (mumax - LumMaxPlot) / (LumMaxPlot - LumMinPlot) * 200 + 220;

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
//	Lsum /= 200;
//	theContext.textAlign = "right";
//	theContext.font = "12px Arial";
//	theContext.fillStyle = "#000000";
	//	theContext.fillText("Q = " + Lsum,950,200);
	theContext.restore();
}

function update()
{
	var elemBulge = document.getElementById('bulgeMass');
	var elemDisk = document.getElementById('diskMass');
	var elemDM = document.getElementById('DMMass');
	var invTotal = 1.0 / (Number(elemBulge.value) + Number(elemDisk.value) + Number(elemDM.value));
	bulgeMassFrac = Number(elemBulge.value) * invTotal;
	diskMassFrac = Number(elemDisk.value) * invTotal;
	dmMassFrac = Number(elemDM.value) * invTotal;

	var elemBulgeIndex = document.getElementById('bulgeIndex');
	var elemDiskIndex = document.getElementById('diskIndex');
	var elemDMIndex = document.getElementById('DMIndex');

	diskIndex = (Number(elemDiskIndex.value) / 100.0 - 0.5) * 0.50 - 0.75; // Disk
	bulgeIndex = (Number(elemBulgeIndex.value) / 100.0 - 0.5) * 0.50 - 2.00; // Bulge
	dmIndex = (Number(elemDMIndex.value) / 100.0 - 0.5) * 0.50 - 1.75; // DM

	var elemMass = document.getElementById('totalMass');
	mass = Math.pow(10,Number(elemMass.value) / 100.0 * 5.0 + 10.0);


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

	plot();
	window.setTimeout(update, 30.0);

}


function chooseGalaxy(shouldPlot)
{
	var idx = Math.floor(Math.random() * listGalaxies.length);
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



