// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan



let theCanvas = document.getElementById("theCanvas");

let theContext = theCanvas.getContext("2d");
let timer = 0;

let index = new Array(3);
let massFrac = new Array(3);


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
let GalIndex = new Array(3);
let GalMassFrac = new Array(3);
let GalVels = new Array(200);
let GalLum = new Array(200);
let GalMass;
let GalID;

let VelMax = 0;
let LumMax = 0;
let LumMin = 0;

let bulgeMassFrac = 0.3;
let diskMassFrac = 0.3;
let dmMassFrac = 1.0 - bulgeMassFrac - diskMassFrac;

let diskIndex = -0.75; // Disk
let bulgeIndex = -2.00; // Bulge
let dmIndex = -1.75; // DM
let mass = 3.16e12;

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
	let VelScale = (Math.floor(VelMax / VelRound) + 1.0) * VelRound;

	let LumMinPlot = Math.round(Math.ceil(LumMin));
	let LumMaxPlot = Math.round(Math.floor(LumMax));


	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (i = 0; i < 6; i++)
	{
		let x = 50 + i * 400 / 5;
		let y = 220;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		theContext.fillText(i * 20, x,y+20);
	}
	theContext.textAlign = "right";
	let vel;
	for (vel = 0; vel <= VelScale; vel += VelRound)
	{
		let x = 50;
		let y = 220 - vel / VelScale * 200;
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
		let x = 525 + i * 400 / 5;
		let y = 220;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		theContext.fillText(i * 10, x,y+20);
	}
	let mv;
	theContext.textAlign = "right";
	for (mv = LumMinPlot; mv >= LumMaxPlot; mv-=2)
	{
		let x = 525;
		let y = (mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
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

	let MconstDisk = mass * diskMassFrac / Math.pow(100,2+diskIndex);
	let MconstBulge = mass * bulgeMassFrac / Math.pow(100,3+bulgeIndex);
	let MconstDM = mass * dmMassFrac / Math.pow(100,3+dmIndex);

	let r;
	theContext.strokeStyle = "#7F7F7F";
	theContext.save();
	theContext.rect(50,20,400,200);
	theContext.clip();
	theContext.beginPath();
	for (r = 0.5; r <= 100; r++)
	{
		let Mdisk = MconstDisk * Math.pow(r,2 + diskIndex);
		let Mbulge = MconstBulge * Math.pow(r,3 + bulgeIndex);
		let Mdm = MconstDM * Math.pow(r,3 + dmIndex);
		let v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
	
		let x = r / 100.0 * 400 + 50;
		let y = v / VelScale * -200 + 220;
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
		let Ldisk = mass * diskMassFrac * Math.pow(r / 100.0,diskIndex);
		let Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0,bulgeIndex);
		let Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
	
		let x = r / 50.0 * 400 + 525;
		let y = (Mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
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
	let vsum = 0;
	for (i = 0; i < 200; i++)
	{
		let r = GalVels[i].r;
		let x = GalVels[i].r / 100.0 * 400 + 50;
		let y = GalVels[i].v / VelScale * -200 + 220;
		theContext.fillRect(x - 2, y - 2,4,4);

		let Mdisk = MconstDisk * Math.pow(r,2 + diskIndex);
		let Mbulge = MconstBulge * Math.pow(r,3 + bulgeIndex);
		let Mdm = MconstDM * Math.pow(r,3 + dmIndex);
		let v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (GalVels[i].r * 3.086e21)  ) * 1.0e-5;
		let verr = (1 - v / GalVels[i].v);
		vsum += (verr * verr);

	}
	vsum /= 200;
	theContext.textAlign = "right";
	theContext.font = "12px Arial";
	theContext.fillStyle = "#000000";
	theContext.fillText("Q = " + vsum,450,200);

	theContext.fillStyle = "#0000FF";
	let Lsum = 0;
	for (i = 0; i < 200; i++)
	{
		let r = GalLum[i].r;
		let x = GalLum[i].r / 50.0 * 400 + 525;
		let y = (GalLum[i].v - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 220;
		theContext.fillRect(x - 2, y - 2,4,4);

		let Ldisk = mass * diskMassFrac * Math.pow(r / 100.0,diskIndex);
		let Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0,bulgeIndex);
		let Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
		let verr = (1 - Mv / GalLum[i].v);
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
	let elemBulgeDisk = document.getElementById('bulgeDiskRatio');
	let elemMassToLight = document.getElementById('MassToLight');
	
	const baryonMassFrac = 1.0 / Number(elemMassToLight.value);
	bulgeMassFrac = (1.0 - Number(elemBulgeDisk.value * 0.01)) * baryonMassFrac;
	diskMassFrac = Number(elemBulgeDisk.value * 0.01) * baryonMassFrac;
	dmMassFrac = 1 - baryonMassFrac;

	let elemBulgeIndex = document.getElementById('bulgeIndex');
	let elemDiskIndex = document.getElementById('diskIndex');
	let elemDMIndex = document.getElementById('DMIndex');

	diskIndex = (Number(elemDiskIndex.value) / 100.0 - 0.5) * 0.50 - 0.75; // Disk
	bulgeIndex = (Number(elemBulgeIndex.value) / 100.0 - 0.5) * 0.50 - 2.00; // Bulge
	dmIndex = (Number(elemDMIndex.value) / 100.0 - 0.5) * 0.50 - 1.75; // DM

	let elemMass = document.getElementById('totalMass');
	mass = Math.pow(10,Number(elemMass.value) / 100.0 * 5.0 + 10.0);


	let elemOutput = document.getElementById('tdTotalMass');
	elemOutput.innerHTML = Number.parseFloat(mass).toExponential(2) + "&nbsp;M<sub>⊙</sub>";


	elemOutput = document.getElementById('tdBulgeIndex');
	elemOutput.innerHTML =  Number.parseFloat(bulgeIndex).toFixed(2);

	elemOutput = document.getElementById('tdDiskIndex');
	elemOutput.innerHTML =  Number.parseFloat(diskIndex).toFixed(2);

	elemOutput = document.getElementById('tdDMIndex');
	elemOutput.innerHTML =  Number.parseFloat(dmIndex).toFixed(2);

	elemOutput = document.getElementById('tdBulgeMass');
	elemOutput.innerHTML =  (bulgeMassFrac * 100).toFixed(0) + "%";

	elemOutput = document.getElementById('tdDiskMass');
	elemOutput.innerHTML =  (diskMassFrac * 100).toFixed(0) + "%";

	elemOutput = document.getElementById('tdDMMass');
	elemOutput.innerHTML =  (dmMassFrac * 100).toFixed(0) + "%";

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
	let bulgeMatter = Math.random() * 0.2 + 0.2;
	let matterMass = (Math.random() - 0.5) * 0.1 + 0.3;
	GalMassFrac[0] = (1.0 - bulgeMatter) * matterMass;
	GalMassFrac[1] = bulgeMatter * matterMass;
	GalMassFrac[2] = 1.0 - matterMass;
	let massLog = Math.random() * 3.0 + 10.0;
	GalMass = Math.pow(10,massLog);

	let diskIndexNum = ((GalIndex[0] + 0.75) * 2.0 + 0.5) * 100.0;
	let bulgeIndexNum = ((GalIndex[1] + 2.00) * 2.0 + 0.5) * 100.0;
	let dmIndexNum = ((GalIndex[2] + 1.75) * 2.0 + 0.5) * 100.0;

	GalID = Number.parseFloat(diskIndexNum).toFixed(0) + Number.parseFloat(bulgeIndexNum).toFixed(0) + Number.parseFloat(dmIndexNum).toFixed(0) + "-" + 
	Number.parseFloat(GalMassFrac[0] * 100).toFixed(0) + Number.parseFloat(GalMassFrac[1] * 100).toFixed(0) + Number.parseFloat(GalMassFrac[2] * 100).toFixed(0) + '-' + 
	Number.parseFloat(massLog * 1000.0).toFixed(0);

	let MconstDisk = GalMass * GalMassFrac[0] / Math.pow(100,2+GalIndex[0]);
	let MconstBulge = GalMass * GalMassFrac[1] / Math.pow(100,3+GalIndex[1]);
	let MconstDM = GalMass * GalMassFrac[2] / Math.pow(100,3+GalIndex[2]);

	VelMax = 0;
	LumMax = 1000;
	LumMin = -1000;
	
	const Ldisk0 = GalMass * GalMassFrac[0] * Math.pow(0.01 / 100.0,GalIndex[0]);
	const Lbulge0 = GalMass * GalMassFrac[1] * Math.pow(0.01 / 100.0,GalIndex[1]);
	const Mv0 = Math.log10(Ldisk0 + Lbulge0) * -2.5 + 65;
	const MvC = Mv0 + 10;
	for (i = 0; i < 200; i++)
	{
		let r = Math.random() * 100.0;
		let Mdisk = MconstDisk * Math.pow(r,2+GalIndex[0]);
		let Mbulge = MconstBulge * Math.pow(r,3+GalIndex[1]);
		let Mdm = MconstDM * Math.pow(r,3+GalIndex[2]);

		let v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
		let vscat = random_gaussian(v,0.0125*v);
		if (vscat > VelMax)
			VelMax = vscat;
		GalVels[i] = new datapoint(r,vscat);
	}
	i = 0;
	do
	{
		r = Math.random() * 100.0;
		let Ldisk = GalMass * GalMassFrac[0] * Math.pow(r / 100.0,GalIndex[0]);
		let Lbulge = GalMass * GalMassFrac[1] * Math.pow(r / 100.0,GalIndex[1]);
		let L = Ldisk + Lbulge;
		let Lscat = -1;
		while (Lscat <= 0)
			Lscat = random_gaussian(L,L * 0.125);
		
		Mv = Math.log10(Lscat) * -2.5 + 65;
		if (Mv > MvC)
		{
			if (Mv < LumMax)
				LumMax = Mv;
			if (Mv > LumMin)
				LumMin = Mv;
			GalLum[i] = new datapoint(r,Mv);
			i++;
		}
	} while (i < 200);
}

chooseGalaxy();
update();



