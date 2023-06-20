// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan

const kWindowHeightOffset = 500;
const kCanvasHeight = 300;

let theCanvas = document.getElementById("theCanvas");
theCanvas.width = window.innerWidth;
theCanvas.height = kCanvasHeight == null ? window.innerHeight - kWindowHeightOffset : kCanvasHeight;
let theContext = theCanvas.getContext("2d");
let timer = 0;

class datapoint
{
	constructor(r,v)
	{
		this.r = r;
		this.v = v;
	}
}

function plot()
{
	const galaxy = Universe.getCurrentGalaxy();
	const model = Universe.getCurrentModel();
	
	let MconstDisk = model.masses.total * model.masses.diskFraction / Math.pow(100,2+model.shape.disk);
	let MconstBulge = model.masses.total * model.masses.bulgeFraction / Math.pow(100,3+model.shape.bulge);
	let MconstDM = model.masses.total * model.masses.DMhaloFraction / Math.pow(100,3+model.shape.DMhalo);

	theCanvas.width = window.innerWidth;
	theCanvas.height = kCanvasHeight == null ? window.innerHeight - kWindowHeightOffset : kCanvasHeight;
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.save();
	theContext.translate(theCanvas.width * 0.5 - 475, 20);

	theContext.lineWidth = 2;
	theContext.strokeStyle = "#000000";
	theContext.fillStyle = "#000000";
	theContext.beginPath();
	theContext.moveTo(0,0);
	theContext.lineTo(0,200);
	theContext.lineTo(400,200);
	theContext.stroke();
	let VelRound = 50;
	if (galaxy.maxVelocity < 0.5)
		VelRound = 0.1;
	else if (galaxy.maxVelocity < 1)
		VelRound = 0.2;
	else if (galaxy.maxVelocity < 2)
		VelRound = 0.5;
	else if (galaxy.maxVelocity < 5)
		VelRound = 1;
	else if (galaxy.maxVelocity < 10)
		VelRound = 2;
	else if (galaxy.maxVelocity < 20)
		VelRound = 5;
	else if (galaxy.maxVelocity < 50)
		VelRound = 10;
	else if (galaxy.maxVelocity < 100)
		VelRound = 20;
	else if (galaxy.maxVelocity > 250)
		VelRound = 100;
	else if (galaxy.maxVelocity > 1000)
		VelRound = 200;
	let VelScale = (Math.floor(galaxy.maxVelocity / VelRound) + 1.0) * VelRound;

	let LumMinPlot = Math.round(Math.ceil(galaxy.minLuminosity));
	let LumMaxPlot = Math.round(Math.floor(galaxy.maxLuminosity));


	theContext.textAlign = "center";
	theContext.font = "10px Arial";
	for (let i = 0; i < 6; i++)
	{
		let x = i * 400 / 5;
		let y = 200;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		theContext.fillText(i * 20, x,y+20);
	}
	theContext.textAlign = "right";
	for (let vel = 0; vel <= VelScale; vel += VelRound)
	{
		let x = 0;
		let y = 200 - vel / VelScale * 200;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(vel, x - 6,y + 3);
	}

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", 400 / 2, 240);
	theContext.save();
	theContext.translate(-30,100);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Velocity (km/s)", 0, 0);
	theContext.restore();

	theContext.strokeStyle = "#7F7F7F";
	theContext.save();
	theContext.rect(0,0,400,200);
	theContext.clip();
	theContext.beginPath();
	for (let r = 0.5; r <= 100; r++)
	{
		let Mdisk = MconstDisk * Math.pow(r,2 + model.shape.disk);
		let Mbulge = MconstBulge * Math.pow(r,3 + model.shape.bulge);
		let Mdm = MconstDM * Math.pow(r,3 + model.shape.DMhalo);
		let v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
	
		let x = r / 100.0 * 400;
		let y = v / VelScale * -200 + 200;
		if (r == 0)
			theContext.moveTo(x, y);
		else
			theContext.lineTo(x, y);
	}
	theContext.stroke();
	//
	// Draw simulated galaxy data and get quality of fit
	//

	theContext.fillStyle = "#FF0000";
	theContext.strokeStyle = "#FF0000";
	for (let i in galaxy.velocityData)
	{
		let r = galaxy.velocityData[i].r;
		let x = galaxy.velocityData[i].r / 100.0 * 400;
		let y = galaxy.velocityData[i].v / VelScale * -200 + 200;
		theContext.fillRect(x - 2, y - 2,4,4);
	}
	theContext.textAlign = "right";
	theContext.font = "12px Arial";
	theContext.fillStyle = "#000000";
	theContext.fillText("Q = " + toScientific(model.qVelocity,2),400,180);

	theContext.restore(); // clip 

	theContext.restore(); // graph translate

	theContext.save();
	theContext.translate(theCanvas.width * 0.5 + 50, 20);

	theContext.font = "10px Arial";
	theContext.beginPath();
	theContext.moveTo(0,0);
	theContext.lineTo(0,200);
	theContext.lineTo(400,200);
	theContext.stroke();

	theContext.textAlign = "center";
	for (let i = 0; i < 6; i++)
	{
		let x = i * 400 / 5;
		let y = 200;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x,y+10);
		theContext.stroke();
		theContext.fillText(i * 10, x,y+20);
	}
	theContext.textAlign = "right";
	for (let mv = LumMinPlot; mv >= LumMaxPlot; mv-=2)
	{
		let x = 0;
		let y = (mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 200;
		theContext.beginPath();
		theContext.moveTo(x,y);
		theContext.lineTo(x - 5,y);
		theContext.stroke();
		theContext.fillText(mv, x - 6,y + 3);
	}

	theContext.textAlign = "center";
	theContext.font = "18px Arial";
	theContext.fillText("Distance from center (kpc)", 200, 240);
	theContext.save();
	theContext.translate(-30,100);
	theContext.rotate(-0.5 * Math.PI);
	theContext.fillText("Surface Brightness", 0, 0);
	theContext.restore();

	theContext.save();
	theContext.rect(0,0,400,200);
	theContext.clip();
	theContext.beginPath();
	for (r = 0.5; r <= 50; r++)
	{
		let Ldisk = model.masses.total * model.masses.diskFraction * Math.pow(r / 100.0,model.shape.disk);
		let Lbulge = model.masses.total * model.masses.bulgeFraction * Math.pow(r / 100.0,model.shape.bulge);
		let Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
	
		let x = r / 50.0 * 400;
		let y = (Mv - LumMinPlot) / (LumMaxPlot - LumMinPlot) * -200 + 200;
		if (r == 0)
			theContext.moveTo(x, y);
		else if (y < 450)
			theContext.lineTo(x, y);
	}
	theContext.stroke();

	theContext.fillStyle = "#0000FF";
	for (let i in galaxy.luminosityData)
	{
		let r = galaxy.luminosityData[i].r;
		let x =  galaxy.luminosityData[i].r / 50.0 * 400;
		let y = (galaxy.luminosityData[i].v - galaxy.minLuminosity) / (galaxy.maxLuminosity - galaxy.minLuminosity) * -200 + 200;
		theContext.fillRect(x - 2, y - 2,4,4);
	}
	theContext.restore();
	theContext.textAlign = "right";
	theContext.font = "12px Arial";
	theContext.fillStyle = "#000000";
	theContext.fillText("Q = " + toScientific(model.qLuminosity,2),400,30);
	theContext.restore();

}
function setSliders()
{
	const model = Universe.getCurrentModel();

	let elemBulgeDisk = document.getElementById('bulgeDiskRatio');
	let elemMassToLight = document.getElementById('MassToLight');

	elemBulgeDisk.value = model.masses.bulgeDiskFraction * 100.0;
	elemMassToLight.value = model.masses.logMassToLight;
		

	let elemBulgeIndex = document.getElementById('bulgeIndex');
	let elemDiskIndex = document.getElementById('diskIndex');
	let elemDMIndex = document.getElementById('DMIndex');

	elemDiskIndex.value = ((model.shape.disk + 0.75) * 2.0 + 0.5) * 100.0;
	elemBulgeIndex.value = ((model.shape.bulge + 2.00) * 2.0 + 0.5) * 100.0;
	elemDMIndex.value = ((model.shape.DMhalo + 1.75) * 2.00 + 0.5) * 100.0;
	

	let elemMass = document.getElementById('totalMass');
	elemMass.value = (model.masses.totalLog - 10.0) / 5.0 * 100.0;
}

let g_Update = false;
function waiter()
{
	if (g_Update)
	{
		plot();
		g_Update = false;
	}
	setTimeout(waiter,33.0);
}
function chooseGalaxy()
{
	Universe.selectNextGalaxy();
	setSliders();
	update();
}
addEventListener("resize",(event)=>{g_Update = true;});

function update()
{
	let elemBulgeDisk = document.getElementById('bulgeDiskRatio');
	let elemMassToLight = document.getElementById('MassToLight');
	
	const baryonMassFrac = 1.0 / Math.pow(10.0,Number(elemMassToLight.value));
	bulgeMassFrac = (1.0 - Number(elemBulgeDisk.value * 0.01)) * baryonMassFrac;
	diskMassFrac = Number(elemBulgeDisk.value * 0.01) * baryonMassFrac;
	dmMassFrac = 1.0 - baryonMassFrac;

	let elemBulgeIndex = document.getElementById('bulgeIndex');
	let elemDiskIndex = document.getElementById('diskIndex');
	let elemDMIndex = document.getElementById('DMIndex');

	diskIndex = (Number(elemDiskIndex.value) / 100.0 - 0.5) * 0.50 - 0.75; // Disk
	bulgeIndex = (Number(elemBulgeIndex.value) / 100.0 - 0.5) * 0.50 - 2.00; // Bulge
	dmIndex = (Number(elemDMIndex.value) / 100.0 - 0.5) * 0.50 - 1.75; // DM

	let elemMass = document.getElementById('totalMass');
	mass = Math.pow(10,Number(elemMass.value) / 100.0 * 5.0 + 10.0);


	Universe.setMeasurements(Number(elemMass.value) / 100.0 * 5.0 + 10.0,diskIndex, bulgeIndex, dmIndex, Number(elemBulgeDisk.value * 0.01), Number(elemMassToLight.value));

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


	const currGalaxy = Universe.getCurrentGalaxy();
	elemOutput = document.getElementById('tdGalID');
	elemOutput.innerHTML =  "SiGC " + currGalaxy.id;
	g_Update = true;
}

class Galaxy
{
	constructor()
	{
		this.shape = {};
		 
		this.shape.disk = (Math.random() - 0.5) * 0.25 - 0.75; // Disk
		this.shape.bulge = (Math.random() - 0.5) * 0.25 - 2.00; // Bulge
		this.shape.DMhalo = (Math.random() - 0.5) * 0.25 - 1.75; // DM
		const bulgeMatter = Math.random() * 0.2 + 0.2;
		const matterMass = (Math.random() - 0.5) * 0.1 + 0.3;
		this.masses = {};
		
		this.masses.diskFraction = (1.0 - bulgeMatter) * matterMass; // formerly GalMassFrac[0]
		this.masses.bulgeFraction = bulgeMatter * matterMass; // formerly GalMassFrac[1]
		this.masses.DMhaloFraction = 1.0 - matterMass; // formerly GalMassFrac[2]
		this.masses.logMassToLight = Math.log10(1.0 / matterMass);
		const massLog = Math.random() * 3.0 + 10.0;
		this.masses.totalLog = massLog;
		this.masses.total = Math.pow(10,massLog);

		const diskIndexNum = ((this.shape.disk + 0.75) * 2.0 + 0.5) * 100.0;
		const bulgeIndexNum = ((this.shape.bulge + 2.00) * 2.0 + 0.5) * 100.0;
		const dmIndexNum = ((this.shape.DMhalo + 1.75) * 2.0 + 0.5) * 100.0;

		this.id = Number.parseFloat(diskIndexNum).toFixed(0) + Number.parseFloat(bulgeIndexNum).toFixed(0) + Number.parseFloat(dmIndexNum).toFixed(0) + "-" + 
		Number.parseFloat(this.masses.diskFraction * 100).toFixed(0) + Number.parseFloat(this.masses.bulgeFraction * 100).toFixed(0) + Number.parseFloat(this.masses.DMhaloFraction * 100).toFixed(0) + '-' + 
		Number.parseFloat(massLog * 1000.0).toFixed(0);

		let MconstDisk = this.masses.total * this.masses.diskFraction / Math.pow(100,2+this.shape.disk);
		let MconstBulge = this.masses.total * this.masses.bulgeFraction / Math.pow(100,3+this.shape.bulge);
		let MconstDM = this.masses.total * this.masses.DMhaloFraction / Math.pow(100,3+this.shape.DMhalo);

		this.maxVelocity = 0;
		this.maxLuminosity = 1000;
		this.minLuminosity = -1000;
		
		const Ldisk0 = this.masses.total * this.masses.diskFraction * Math.pow(0.01 / 100.0,this.shape.disk);
		const Lbulge0 = this.masses.total * this.masses.bulgeFraction * Math.pow(0.01 / 100.0,this.shape.bulge);
		const Mv0 = Math.log10(Ldisk0 + Lbulge0) * -2.5 + 65;
		const MvC = Mv0 + 10;
		this.velocityData = new Array();
		this.luminosityData = new Array();
		for (let i = 0; i < 200; i++)
		{
			let r = Math.random() * 100.0;
			let Mdisk = MconstDisk * Math.pow(r,2+this.shape.disk);
			let Mbulge = MconstBulge * Math.pow(r,3+this.shape.bulge);
			let Mdm = MconstDM * Math.pow(r,3+this.shape.DMhalo);

			let v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
			let vscat = random_gaussian(v,0.0125*v);
			if (vscat > this.maxVelocity)
				this.maxVelocity = vscat;
			this.velocityData.push(new datapoint(r,vscat));
		}
		for (let i = 0; i < 200; i++)
		{
			const r = Math.random() * 50.0;
			let Ldisk = this.masses.total * this.masses.diskFraction * Math.pow(r / 100.0,this.shape.disk);
			let Lbulge = this.masses.total * this.masses.bulgeFraction * Math.pow(r / 100.0,this.shape.bulge);
			let L = Ldisk + Lbulge;
			let Lscat = -1;
			while (Lscat <= 0)
				Lscat = random_gaussian(L,L * 0.125);
			
			const Mv = Math.log10(Lscat) * -2.5 + 65;
			if (Mv > MvC)
			{
				if (Mv < this.maxLuminosity)
					this.maxLuminosity = Mv;
				if (Mv > this.minLuminosity)
					this.minLuminosity = Mv;
				this.luminosityData.push(new datapoint(r,Mv));
			}
		}
	}
}

class Model
{
	constructor()
	{
		this.shape = {};
		this.masses = {};
		this.qLuminosity = 9.9e15; // some large number
		this.qVelocity = 9.9e15;


		this.shape.disk = -0.75;
		this.shape.bulge = -2.00;
		this.shape.DMhalo = -1.75;
		this.masses.diskFraction = 0.25;
		this.masses.bulgeFraction = 0.25;
		this.masses.bulgeDiskFraction = 0.50;
		this.masses.DMhaloFraction = 0.5;
		this.masses.logMassToLight = 0.0;
		this.masses.totalLog = 10.0;
		this.masses.total = 1.0e10;
	}
}
let __g_universe = null;
let __g_universe_db = null;
let __g_universeStorageReady = false;
let __g_universeReady = false;
let __g_universeReadyCallback = null;
let __g_universe_Last_Change = null;
let __g_universe_Last_Save = null;
let __g_universe_Last_Displayable_Change = null;
let __g_universe_Last_Displayable_Request = null;

const Universe = {
	_NUM_GALAXIES: 5,
	__type: "GalRotLeg-Universe-Namespace",
	__DB_NAME: "GalRotLeg-universe-indexeddb",
	__DB_VERSION: 1,
	__DB_STORE_NAME: "universe",	
	__DB_UNIVERSE_ID: "The Universe",
	_markChange: function()
	{
		__g_universe_Last_Change = Date.now();
		__g_universe_Last_Displayable_Change = Date.now();
	},
	_markDisplayableChange: function()
	{
		__g_universe_Last_Displayable_Change = Date.now();
	},
	hasUpdate: function()
	{
		let ret = __g_universe_Last_Displayable_Request == null || __g_universe_Last_Displayable_Change == null || __g_universe_Last_Displayable_Request < __g_universe_Last_Displayable_Change;
		__g_universe_Last_Displayable_Request = Date.now();
		return ret;
	},
	_saveMonitor: function()
	{
		let now = Date.now();
		if (__g_universe_Last_Change !== null && __g_universe_Last_Save !== null &&
			(((__g_universe_Last_Change - __g_universe_Last_Save) > 5000) ||
			(((now - __g_universe_Last_Change) > 1000) && (__g_universe_Last_Change > __g_universe_Last_Save))))
		{
			console.log("saving");
			Universe.save();
		}		
		window.setTimeout(Universe._saveMonitor, 1000.0);
	},
	save: function()
	{
		return new Promise(function (onsuccess, onerror)
		{
			if (__g_universe_db !== null)
			{
				let names = __g_universe_db.objectStoreNames;
				
				let tx = __g_universe_db.transaction(Universe.__DB_STORE_NAME, "readwrite");
				let store = tx.objectStore(Universe.__DB_STORE_NAME);
				let ptx = store.put(__g_universe);
				ptx.onsuccess = function() {onsuccess();}
				ptx.onerror = function() {onerror();}
				__g_universe_Last_Save = Date.now();
				
			}
		})
	},
	load: function()
	{
		return new Promise(function(onsuccess,onerror)
		{
			if (__g_universe_db !== null)
			{
				let tx = __g_universe_db.transaction(Universe.__DB_STORE_NAME, "readonly");
				let store = tx.objectStore(Universe.__DB_STORE_NAME);
				let ptx = store.get(Universe.__DB_UNIVERSE_ID);
				ptx.onsuccess = function(event)
				{
					if (typeof event.target.result  == "object" && "galaxies" in event.target.result)
					{
						Object.assign(__g_universe,event.target.result);
						onsuccess();
					}
					else
						onerror();
				__g_universe_Last_Save = Date.now();
				__g_universe_Last_Change = Date.now();
				__g_universe_Last_Displayable_Change = __g_universe_Last_Change;
				}
				ptx.onerror = function() {onerror();}
			}
		})
	},
	isUniverseReady: function() {return __g_universeReady;},
	regenerateUniverse: function()
	{
		__g_universe = new Object();
		__g_universe.galaxies = new Array();
		__g_universe.models = new Array();
		for (let i = 0; i < Universe._NUM_GALAXIES; i++)
		{
			__g_universe.galaxies.push(new Galaxy());
			__g_universe.models.push(new Model());
		}
		__g_universe.selectedGalaxy = 0;
		__g_universe.id = Universe.__DB_UNIVERSE_ID;
		Universe._markChange();
	},
	initialize: function()
	{
		Universe.regenerateUniverse();
		
		let promise = new Promise(function (onsuccess,onerror)
		{
			let request = indexedDB.open(Universe.__DB_NAME,Universe.__DB_VERSION);
			request.onsuccess = function(event)
			{
				__g_universe_db = this.result;
				onsuccess();
			}
			request.onerror = function(event)
			{
				console.error("openDb:", event.target.errorCode);
				onerror();
			}
			request.onupgradeneeded = function(event)
			{
				const db = event.target.result;
				db.onerror = (event) => {
					console.error(event.target.errorCode);
				};
				let store = db.createObjectStore(Universe.__DB_STORE_NAME, { keyPath: 'id'});
				console.log("openDb updated");
			}
		})
		Universe._saveMonitor();
		return promise;
	},
	selectGalaxy(index)
	{
		if(index >= 0 && index <= Universe._NUM_GALAXIES)
		{
			__g_universe.selectedGalaxy = index;
			Universe._markChange();
		}
	},
	selectNextGalaxy()
	{
		__g_universe.selectedGalaxy++;
		if (__g_universe.selectedGalaxy >= Universe._NUM_GALAXIES)
			__g_universe.selectedGalaxy -= Universe._NUM_GALAXIES;
		Universe._markChange();
	},
	selectPreviousGalaxy()
	{
		__g_universe.selectedGalaxy--;
		if (__g_universe.selectedGalaxy < 0)
			__g_universe.selectedGalaxy += Universe._NUM_GALAXIES;
		Universe._markChange();
	},
	getGalaxy(index)
	{
		return clone(__g_universe.galaxies[index]);
	},
	getCurrentGalaxy()
	{
		return clone(__g_universe.galaxies[__g_universe.selectedGalaxy]);
	},
	getModel(index)
	{
		return clone(__g_universe.models[index]);
	},
	getCurrentModel()
	{
		return clone(__g_universe.models[__g_universe.selectedGalaxy]);
	},
	getMeasurementsCSV: function()
	{
		let string = "Galaxy ID, Mass, log(Mass), Bulge shape, Disk Shape, DM Halo Shape, Bulge Fraction, Disk Fraction, Mass-To-Light, q (Velocity), q (Brightness)\n"
		for (let i = 0; i < Universe._NUM_GALAXIES; i++)
		{
			string += __g_universe.galaxies[i].id;
			string += ", ";
			string += __g_universe.models[i].masses.total;
			string += ", ";
			string += __g_universe.models[i].masses.totalLog;
			string += ", ";
			string += __g_universe.models[i].shape.bulge;
			string += ", ";
			string += __g_universe.models[i].shape.disk;
			string += ", ";
			string += __g_universe.models[i].shape.DMhalo;
			string += ", ";
			string += __g_universe.models[i].masses.bulgeFraction;
			string += ", ";
			string += __g_universe.models[i].masses.diskFraction;
			string += ", ";
			string += Math.pow(10.0,__g_universe.models[i].masses.logMassToLight);
			string += ", ";
			string += __g_universe.models[i].qVelocity;
			string += "\n";
			string += __g_universe.models[i].qLuminosity;
			string += "\n";
		}
	},
	setMeasurements: function (logMass, diskShape, bulgeShape, DMhaloShape, diskFraction, massToLight)
	{
		const thisGalaxy = __g_universe.galaxies[__g_universe.selectedGalaxy]
		let thisModel = __g_universe.models[__g_universe.selectedGalaxy]

		const baryonMassFrac = 1.0 / Math.pow(10.0,massToLight);
		const bulgeMassFrac = (1.0 - diskFraction) * baryonMassFrac;
		const diskMassFrac = diskFraction * baryonMassFrac;
		const dmMassFrac = 1 - baryonMassFrac;


		thisModel.shape.disk = diskShape;
		thisModel.shape.bulge = bulgeShape;
		thisModel.shape.DMhalo = DMhaloShape;
		thisModel.masses.diskFraction = diskMassFrac;
		thisModel.masses.bulgeFraction = bulgeMassFrac;
		thisModel.masses.bulgeDiskFraction = diskFraction;
		thisModel.masses.DMhaloFraction = dmMassFrac;
		thisModel.masses.logMassToLight = massToLight;
		thisModel.masses.totalLog = logMass;
		
		const mass = Math.pow(10.0,logMass);
		thisModel.masses.total = mass;
		const MconstDisk = mass * diskMassFrac / Math.pow(100,2+diskShape);
		const MconstBulge = mass * bulgeMassFrac / Math.pow(100,3+bulgeShape);
		const MconstDM = mass * dmMassFrac / Math.pow(100,3+DMhaloShape);

		let vsum = 0.0;
		for (let i in thisGalaxy.velocityData)
		{
			const r = thisGalaxy.velocityData[i].r;
			const vExp = thisGalaxy.velocityData[i].v;

			const Mdisk = MconstDisk * Math.pow(r,2 + diskShape);
			const Mbulge = MconstBulge * Math.pow(r,3 + bulgeShape);
			const Mdm = MconstDM * Math.pow(r,3 + DMhaloShape);
			const v = Math.sqrt(6.67e-8 * 2e33 * (Mdisk + Mbulge + Mdm) / (r * 3.086e21)  ) * 1.0e-5;
			const verr = (1 - v / vExp);
			vsum += (verr * verr);

		}
		vsum /= thisGalaxy.velocityData.length;
		thisModel.qVelocity = vsum;


		let Lsum = 0;
		for (let i in thisGalaxy.luminosityData)
		{
			const r = thisGalaxy.luminosityData[i].r;
			const vExp = thisGalaxy.luminosityData[i].v;

			const Ldisk = mass * diskMassFrac * Math.pow(r / 100.0,diskShape);
			const Lbulge = mass * bulgeMassFrac * Math.pow(r / 100.0,bulgeShape);
			const Mv = Math.log10(Ldisk + Lbulge) * -2.5 + 65;
			const verr = (1 - Mv / vExp);
			Lsum += (verr * verr);
		}
		Lsum /= thisGalaxy.luminosityData.length;
		thisModel.qLuminosity = Lsum;
		Universe._markChange();
	},
};
Object.freeze(Universe);


let __g_universeStorageInitialLoadPromise = null;
let __g_universeStorageInitializePromise = Universe.initialize();
__g_universeStorageInitializePromise.then(
	function(successEvent)
	{
		__g_universeStorageReady = true;
		__g_universeStorageInitialLoadPromise = Universe.load();
		__g_universeStorageInitialLoadPromise.then(
			function(loadSuccess)
			{
				__g_universeReady = true;
				setSliders();
				update();
				waiter();
			},
			function(loadError)
			{
				console.log("failure to load universe, creating new universe")
				__g_universeReady = true;
				setSliders();
				update();
				waiter();
			}
		)
	},
	function(errorEvent)
	{
		console.log("universe storage initialize failure");
	}
);



