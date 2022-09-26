// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan



var theCanvas = document.getElementById("theCanvas");

var theContext = theCanvas.getContext("2d");
var timer = 0;

var index = new Array(3);
var massFrac = new Array(3);
// random Gaussian disribution
//Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
// modified to allow a mean and standard deviation
function randn_bm(mean, stdev) { 
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * stdev / Math.PI * 0.5 + mean;
}

class datapoint
{
	constructor(r,v)
	{
		this._r = r;
		this._v = v;
	}
	get r()
	{
		return this._r;
	}
	get v()
	{
		return this._v;
	}
	set r(i_r)
	{
		this._r = i_r;
		return this._r;
	}
	set v(i_v)
	{
		this._v = i_v;
		return this._v;
	}
}
var GalIndex = new Array(3);
var GalMassFrac = new Array(3);
var GalVels = new Array(200);
var GalLum = new Array(200);
var GalMass;
var GalID;

var VelMax = 0;
var LumMax = 0;
var LumMin = 0;

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
	theContext.strokeStyle = "#000000";
	theContext.fillStyle = "#000000";
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

	var LumMinPlot = Math.round(Math.ceil(LumMin));
	var LumMaxPlot = Math.round(Math.floor(LumMax));


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
		theContext.fillText(i * 20, x,y+20);
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
		theContext.fillText(i * 10, x,y+20);
	}
	var mv;
	theContext.textAlign = "right";
	for (mv = LumMinPlot; mv >= LumMaxPlot; mv-=2)
	{
		var x = 525;
		var y = (mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
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

	//
	// Draw user galaxy
	//

	var MconstDisk = mass * diskMassFrac / Math.pow(100,2+diskIndex);
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
	//
	// Draw simulated galaxy data and get quality of fit
	//

	theContext.fillStyle = "#FF0000";
	theContext.strokeStyle = "#FF0000";
	var vsum = 0;
	for (i = 0; i < 200; i++)
	{
		var r = GalVels[i].r;
		var x = GalVels[i].r / 100.0 * 400 + 50;
		var y = GalVels[i].v / VelScale * -200 + 220;
		theContext.fillRect(x - 2, y - 2,4,4);

		var Mdisk = MconstDisk * Math.pow(r,2 + diskIndex);
		var Mbulge = MconstBulge * Math.pow(r,3 + bulgeIndex);
		var Mdm = MconstDM * Math.pow(r,3 + dmIndex);
		var v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (GalVels[i].r * 3.086e21)  ) * 1.0e-5;
		var verr = (1 - v / GalVels[i].v);
		vsum += (verr * verr);

	}
	vsum /= 200;
	theContext.textAlign = "right";
	theContext.font = "12px Arial";
	theContext.fillStyle = "#000000";
	theContext.fillText("Q = " + vsum,450,200);

	theContext.fillStyle = "#0000FF";
	var Lsum = 0;
	for (i = 0; i < 200; i++)
	{
		var r = GalLum[i].r;
		var x = GalLum[i].r / 50.0 * 400 + 525;
		var y = (GalLum[i].v - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
		theContext.fillRect(x - 2, y - 2,4,4);

		var Ldisk = mass * diskMassFrac * Math.pow(r / 100.0,diskIndex);
		var Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0,bulgeIndex);
		var Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
		var verr = (1 - Mv / GalLum[i].v);
		Lsum += (verr * verr);
	}
	Lsum /= 200;
	theContext.textAlign = "right";
	theContext.font = "12px Arial";
	theContext.fillStyle = "#000000";
	theContext.fillText("Q = " + Lsum,950,200);

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
	elemOutput.innerHTML =  "SiGC " + GalID;

	plot();
	window.setTimeout(update, 30.0);

}


function chooseGalaxy(shouldPlot)
{
	GalIndex[0] = (Math.random() - 0.5) * 0.25 - 0.75; // Disk
	GalIndex[1] = (Math.random() - 0.5) * 0.25 - 2.00; // Bulge
	GalIndex[2] = (Math.random() - 0.5) * 0.25 - 1.75; // DM
	var bulgeMatter = Math.random() * 0.2 + 0.2;
	var matterMass = (Math.random() - 0.5) * 0.1 + 0.3;
	GalMassFrac[0] = (1.0 - bulgeMatter) * matterMass;
	GalMassFrac[1] = bulgeMatter * matterMass;
	GalMassFrac[2] = 1.0 - matterMass;
	var massLog = Math.random() * 3.0 + 10.0;
	GalMass = Math.pow(10,massLog);

	var diskIndexNum = ((GalIndex[0] + 0.75) * 2.0 + 0.5) * 100.0;
	var bulgeIndexNum = ((GalIndex[1] + 2.00) * 2.0 + 0.5) * 100.0;
	var dmIndexNum = ((GalIndex[2] + 1.75) * 2.0 + 0.5) * 100.0;

	GalID = Number.parseFloat(diskIndexNum).toFixed(0) + Number.parseFloat(bulgeIndexNum).toFixed(0) + Number.parseFloat(dmIndexNum).toFixed(0) + "-" + 
	Number.parseFloat(GalMassFrac[0] * 100).toFixed(0) + Number.parseFloat(GalMassFrac[1] * 100).toFixed(0) + Number.parseFloat(GalMassFrac[2] * 100).toFixed(0) + '-' + 
	Number.parseFloat(massLog * 1000.0).toFixed(0);

	var MconstDisk = GalMass * GalMassFrac[0] / Math.pow(100,2+GalIndex[0]);
	var MconstBulge = GalMass * GalMassFrac[1] / Math.pow(100,3+GalIndex[1]);
	var MconstDM = GalMass * GalMassFrac[2] / Math.pow(100,3+GalIndex[2]);

	VelMax = 0;
	LumMax = 1000;
	LumMin = -1000;
	for (i = 0; i < 200; i++)
	{
		var r = Math.random() * 100.0;
		var Mdisk = MconstDisk * Math.pow(r,2+GalIndex[0]);
		var Mbulge = MconstBulge * Math.pow(r,3+GalIndex[1]);
		var Mdm = MconstDM * Math.pow(r,3+GalIndex[2]);

		var v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
		var vscat = randn_bm(v,0.1*v);
		if (vscat > VelMax)
			VelMax = vscat;
		GalVels[i] = new datapoint(r,vscat);

		r = Math.random() * 30.0;
		var Ldisk = GalMass * GalMassFrac[0] * Math.pow(r / 100.0,GalIndex[0]);
		var Lbulge = GalMass * GalMassFrac[1] * Math.pow(r / 100.0,GalIndex[1]);
		var L = Ldisk + Lbulge;
		var Lscat = randn_bm(L,2.0 * L);
		Mv = Math.log10(Lscat) * -2.5 + 65;
		if (Mv < LumMax)
			LumMax = Mv;
		if (Mv > LumMin)
			LumMin = Mv;
		GalLum[i] = new datapoint(r,Mv);
	}
}

chooseGalaxy();
update();



