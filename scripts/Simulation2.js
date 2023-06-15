
class Telescope
{
	#slewSpeed;
	#latTarget;
	#longTarget;
	#autoSlewSpeed;
	#autoSlewTimer;
	#latView;
	#longView;
	#viewMatrix;
	
	constructor(name, lat, long, diameter_m, focalLength_m, CCDresolution_pixels, CCDsize_mm, SpectrographResolution)
	{
		this._name = name;
		this._lat = lat;
		this._long = long;
		this._diameter = diameter_m; // in m
		this._focalLength = focalLength_m; // in m
		this._CCDresolution = CCDresolution_pixels; // pixels per row and column
		this._CCDsize = CCDsize_mm; // in mm - total width of chip
		this._SpectrographResolution = SpectrographResolution;
		this._FOV = this._CCDsize / (this._focalLength * 1000.0); // in radians 
		this._FOVdegrees = this._FOV * 180.0 / Math.PI;
		this._FOVarcSec = this._FOVdegrees * 3600.0;

		this._magnification = this._focalLength * 1000.0 / this._CCDsize * this._CCDresolution;
		this._pixelSizeSky = this._FOV / this._CCDresolution; // radiansPerpixel
		this._pixelSizeSkyDegrees = degrees(this._pixelSizeSky);
		this._pixelSizeSkyarcSec = this._pixelSizeSkyDegrees * 3600.0;
		
		this.#latView = 0.0;
		this.#longView = 0.0;
		this.#slewSpeed = radians(20.0);
		
		this.#latTarget = 0.0;
		this.#longTarget = 0.0;

		this.#autoSlewSpeed = 0.0;
		this.#autoSlewTimer = 0.0;
		
		this.#viewMatrix = LinAlg.generateMatrix();

		this.setView(0.0,0.0);
	}
	#updateViewMatrix()
	{
		const raRad = this.#longView;
		const decRad = this.#latView;
		const cosRA = Math.cos(raRad);
		const sinRA = Math.sin(raRad);
		const cosDec = Math.cos(decRad);
		const sinDec = Math.sin(decRad);

		const cosRAp90 = Math.cos(raRad + Math.PI * 0.5);
		const sinRAp90 = Math.sin(raRad + Math.PI * 0.5);

		const cosDecp90 = Math.cos(decRad + Math.PI * 0.5);
		const sinDecp90 = Math.sin(decRad + Math.PI * 0.5);


		const viewX = LinAlg.generateVector(cosRA * cosDec, sinRA * cosDec, sinDec);
		const viewY = LinAlg.generateVector(cosRAp90, sinRAp90, 0.0);
		const viewZ = LinAlg.generateVector(cosRA * cosDecp90, sinRA * cosDecp90, sinDecp90);

		LinAlg.setRow(this.#viewMatrix,0,viewX);
		LinAlg.setRow(this.#viewMatrix,1,viewY);
		LinAlg.setRow(this.#viewMatrix,2,viewZ);
	}
	slewSelect(value)
	{
		if (value == "Fast")
			this.#slewSpeed = radians(20.0);
		else
			this.#slewSpeed = this._FOV;
	}
	setSlewTarget(lat,long)
	{
		this.#latTarget = lat;
		this.#longTarget = long;
	}
	slewView(latDelta,longDelta)
	{
		this.setView(this.#latView + latDelta,this.#longView + longDelta);
	}
	isSlewRequired()
	{
		return this.#latTarget != null && this.#longTarget !== null;
	}
	slew(timestep)
	{
		if (this.isSlewRequired())
		{
			const delLat = this.#latTarget - this.#latView;
			let delLong = this.#longTarget - this.#longView;
			if (delLong > Math.PI)
				delLong = -2.0 * Math.PI + delLong;
			else if (delLong < -Math.PI)
				delLong = 2.0 * Math.PI + delLong;
				
			const modLong = delLong;// * Math.cos(delLat);
			const distRemaining = Math.sqrt(modLong * modLong + delLat * delLat);
			if (distRemaining > 0.00007) // ~15 arc-sec
			{
				const timerEffect = Math.min(this.#autoSlewTimer / 2.0,1.0);
				this.#autoSlewSpeed = Math.min(Math.max(15.0 * distRemaining / 0.10 * timerEffect,0.01),15.0);
				
				const currDel = Math.min(this.#autoSlewSpeed * timestep / distRemaining / 1000.0,0.9);
				this.slewView(delLat * currDel,delLong * currDel);
				this.#autoSlewTimer += timestep;

			}
			else
			{
				this.setView(this.#latTarget,this.#longTarget);
				this.#latTarget = null;
				this.#longTarget = null;
				this.#autoSlewSpeed = 0.0;
				this.#autoSlewTimer = 0.0;
			}
		}
		else
		{
			this.#autoSlewSpeed = 0.0;
			this.#autoSlewTimer = 0.0;
		}		
	}
	setView(lat,long)
	{
		this.#latView = lat;
		if (this.#latView > (Math.PI * 0.5))
			this.#latView = (Math.PI * 0.5);
		if (this.#latView < (-Math.PI * 0.5))
			this.#latView = (-Math.PI * 0.5);
		
		let vL = long % (2.0 * Math.PI);
		if (vL >= Math.PI)
			vL -= 2.0 * Math.PI;
		else if (vL < -Math.PI)
			vL += 2.0 * Math.PI;
		this.#longView = vL;
		this.#updateViewMatrix();
	}
	get viewLat()
	{
		return this.#latView;
	}
	get viewLong()
	{
		return this.#longView;
	}
	get viewMatrix()
	{
		return LinAlg.generateMatrix(this.#viewMatrix);
	}
}
const telescopes = [new Telescope("the Telescope", 0.0, 0.0, 15.0, 3000.0, 2048, 2048 * 0.024, 45000)];
let g_currentTelescope = telescopes[0];


let g_time = null;
const kFramerate = 1.0 / 30.0;
let g_galaxiesInView = new Array();
let g_universeUpdating = false;
let g_windowResized = false;
addEventListener("resize",(event)=>{g_windowResized = true;});

function updateMonitor()
{
	let telescopeMoved = false;
	let universeUpdated = Universe.hasUpdate();
	if (g_currentTelescope.isSlewRequired())
	{
		const currTime = Date.now();
		const timestep = (g_time == null) ? (1000.0 * kFramerate) : currTime - g_time;
		g_time = currTime;
		g_currentTelescope.slew(timestep);
		telescopeMoved = true;
	}
	
	if (telescopeMoved || universeUpdated)
		g_galaxiesInView = Universe.getGalaxiesInView(g_currentTelescope.viewMatrix,g_currentTelescope._FOV,1.0 / g_currentTelescope._pixelSizeSky);

	if (g_windowResized || telescopeMoved || universeUpdated)
	{
		draw();
		g_windowResized = false;
	}
	window.setTimeout(updateMonitor, 1000.0 * kFramerate);
}


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
				updateMonitor();
			},
			function(loadError)
			{
				console.log("failure to load universe, creating new universe")
				__g_universeReady = true;
				updateMonitor();
			}
		)
	},
	function(errorEvent)
	{
		console.log("universe storage initialize failure");
	}
);
