

const framerate = 1.0 / 30.0;


const H0 = (Math.random() - 0.5) * 2.0 + 72.0; // the value of the Hubble constant in this universe
let currentHome = 0; // set the default home galaxy to the Milky Way

class LuminosityFunction
{
	constructor (Lstar, alpha, Lmin, Lmax)
	{
		this._Lstar = Lstar;
		this._alpha = alpha;
		this._Lmin = Lmin;
		this._Lmax = Lmax;

		this._C = 1.0 / (Math.pow(Lmin,alpha) * Math.exp(-Lmin) - Math.pow(Lmax,alpha) * Math.exp(-Lmax));
		this._A = Math.pow(Lmin,alpha) * Math.exp(-Lmin);
	}

	LF(x)
	{
		return (this._A - Math.pow(x,this._alpha) * Math.exp(-x)) * this._C;
	}
	dLF(x)
	{
		return -(this._alpha  * Math.pow(x,this._alpha - 1) - Math.pow(x,this._alpha)) * Math.exp(-x) * this._C;
	}
}

let LF = new LuminosityFunction(2e10,-0.47,1,60);
function randL()
{
	let v = Math.random();
	let x = 1.0;
	let f = LF.LF(x);
	let n = 0;
	while (Math.abs(f - v) > 0.0001 && n < 100)
	{
		dx = (f - v) / LF.dLF(x);
		if (dx > x)
			x *= 0.9;
		else if (-dx > x)
			x *= 1.1;
		else
			x -= (f - v) / LF.dLF(x);
		f = LF.LF(x);
		n++;
	}
	return x * LF._Lstar;
}



let listHomesMeasurements = new Array();
function addHomeToList(idxToAdd)
{
	let found = false;
	for (idx = 0; idx < listHomesMeasurements.length && !found; idx++)
	{
		found = listHomesMeasurements[idx] == idxToAdd;
	}
	if (!found)
		listHomesMeasurements.push(idxToAdd);
}

let listMeasurements = new Array();
function addMeasurementSetToList(measurementSet)
{
	let found = false;
	for (idx = 0; idx < listMeasurements.length && !found; idx++)
	{
		found = listMeasurements[idx]._thisGalaxy == measurementSet._thisGalaxy && listMeasurements[idx]._fromGalaxy == measurementSet._fromGalaxy;
	}
	if (!found)
		listMeasurements.push(measurementSet);
}


class Measurement
{
	constructor(fromGalaxy,pFlux, pFlux_u,flux, flux_u, dist, dist_u, rv, rv_u,vrot,vrot_u)
	{
		this._fromGalaxy = fromGalaxy;
		this.pFlux = pFlux;
		this.pFlux_u = pFlux_u;
		this._flux = flux;
		this._flux_u = flux_u;
		this._dist = dist;
		this._dist_u = dist_u;
		this._rv = rv;
		this._rv_u = rv_u;
		this._vrot = vrot;
		this._vrot_u = vrot_u;
	}
}
class MeasurementSet
{
	clearMeasurements()
	{
		this._Mv = 0;
		this._Mv_u = -1;
		this._dist = 0;
		this._dist_u = -1;
		this._redshift = 0;
		this._redshift_u = -1;
	}
	constructor(thisGalaxy,fromGalaxy,dist_True)
	{
		this._measurements = new Array();
		this._thisGalaxy = thisGalaxy;
		this._fromGalaxy = fromGalaxy;
		this._dist_True = dist_True;
		this.clearMeasurements();
	}
	
	computeValues()
	{
		this.clearMeasurements();
//		let relPos = this._position.subtract(universe[currentHome]._position)
//		let dist_True = relPos.radius;

		let dist = 0;
		let rv = 0;
		let vrot = 0;
		let flux = 0;

		let distSum = 0;
		let rvSum = 0;
		let vrotSum = 0;
		let fluxSum = 0;

		let distSq = 0;
		let rvSq = 0;
		let vrotSq = 0;
		let fluxSq = 0;

		let dist_u = -1;
		let rv_u = -1;
		let vrot_u = -1;
		let flux_u = -1;

		let distvar = 0;
		let rvvar = 0;
		let vrotvar = 0;
		let fluxvar = 0;

		let Ndist =0;
		let Nrv = 0;
		let Nvrot = 0;
		let Nflux = 0;
		let idxLcl;

		for (idxLcl = 0; idxLcl < this._measurements.length; idxLcl++)
		{
			if (this._measurements[idxLcl]._dist_u != -1)
			{
				distSum += this._measurements[idxLcl]._dist;
				distSq += this._measurements[idxLcl]._dist * this._measurements[idxLcl]._dist;
				dist_u = this._measurements[idxLcl]._dist_u;
				Ndist++;
			}
			if (this._measurements[idxLcl]._rv_u != -1)
			{
				rvSum += this._measurements[idxLcl]._rv;
				rvSq += this._measurements[idxLcl]._rv * this._measurements[idxLcl]._rv;
				rv_u = this._measurements[idxLcl]._rv_u;
				Nrv++;
			}
			if (this._measurements[idxLcl]._vrot_u != -1)
			{
				vrotSum += this._measurements[idxLcl]._vrot;
				vrotSq += this._measurements[idxLcl]._vrot * this._measurements[idxLcl]._vrot;
				vrot_u = this._measurements[idxLcl]._vrot_u;
				Nvrot++;
			}
			if (this._measurements[idxLcl]._flux_u != -1)
			{
				fluxSum += this._measurements[idxLcl]._flux;
				fluxSq += this._measurements[idxLcl]._flux * this._measurements[idxLcl]._flux;
				flux_u = this._measurements[idxLcl]._flux_u;
				Nflux++;
			}
		}
		if (Ndist != 0)
			dist = distSum / Ndist;
		if (Nrv != 0)
			rv  = rvSum / Nrv;
		if (Nvrot != 0)
			vrot  = vrotSum / Nvrot;
		if (Nflux != 0)
			flux  = fluxSum / Nflux;
		distvar = distSq + Ndist * dist * dist - 2.0 * distSum * dist;
		rvvar = rvSq + Nrv * rv * rv - 2.0 * rvSum * rv;
		vrotvar = vrotSq + Nvrot * vrot * vrot - 2.0 * vrotSum * vrot;
		fluxvar = fluxSq + Nflux * flux * flux - 2.0 * fluxSum * flux;
		
		if (Ndist > 1)
			dist_u = Math.sqrt(distvar / ((Ndist - 1.0) * Ndist));
		if (Nrv > 1)
			rv_u = Math.sqrt(rvvar / ((Nrv - 1.0) * Nrv));
		if (Nvrot > 1)
			vrot_u = Math.sqrt(vrotvar / ((Nvrot - 1.0) * Nvrot));
		if (Nflux > 1)
			flux_u = Math.sqrt(fluxvar / ((Nflux - 1.0) * Nflux));

// Tully-Fisher Distance
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		let dist_tf = 0;
		let dist_tf_u = -1;
		if (Nflux != 0 && Nvrot != 0 && this._dist_True >= 35.0)
		{
			const lum_tf =  4.0e10 * Math.pow(vrot / 200.0,4.0);
			const lum_tf_u = 4.0 * lum_tf * vrot_u / vrot;
			dist = Math.sqrt(lum_tf / (flux / kLuminositySolar) * 0.25 / Math.PI) / (1.0e6 * kParsec_cm);
			const ul = 0.5 * lum_tf_u / lum_tf;
			const uf = 0.5 * flux_u / flux;
			dist_u = dist * Math.sqrt(ul * ul + uf * uf);
		}
		if (flux_u != -1)
		{
			// solar flux
			const fluxSun = kLuminositySolar / (1.49597870700e13 * 1.49597870700e13 * 4.0 * Math.PI);
			this._Mv = -2.5 * Math.log10(flux / fluxSun) - 26.75;
			this._Mv_u = 2.5 * flux_u / flux / Math.log(10.0);
		}
		if (dist_u != -1)
		{
			this._dist = dist;
			this._dist_u = dist_u;
		}
		if (rv_u != -1)
		{
			this._redshift = rv / kSpeedLight_kms;
			this._redshift_u = rv_u / kSpeedLight_kms;
		}
//		console.log(this._id + ' ' + this._dist + ' ' + this._redshift + ' ' + this._redshift_u + ' ' + this._Mv);

	}
	
	addMeasurement(measurement)
	{
		this._measurements.push(measurement);
		this.computeValues();
	}

}

const kUniverseSize = 1000.0; // Mpc
const kMaxPeculiarVelocity = 1400.0; // km/s
function randPos()
{
		let position;
		position = new ThreeVector((Math.random() - 0.5) * 2.0 * kUniverseSize, // Mpc
									(Math.random() - 0.5) * 2.0 * kUniverseSize, // Mpc
									(Math.random() - 0.5) * 2.0 * kUniverseSize); // Mpc
	   return position;
}
function getRelPos(myPos,otherPos)
{
		let relPos = otherPos.subtract(myPos);
		if (relPos.x > kUniverseSize)
			relPos.x -= (2.0 * kUniverseSize);
		if (relPos.x < -kUniverseSize)
			relPos.x += (2.0 * kUniverseSize);
		if (relPos.y > kUniverseSize)
			relPos.y -= (2.0 * kUniverseSize);
		if (relPos.y < -kUniverseSize)
			relPos.y += (2.0 * kUniverseSize);
		if (relPos.z > kUniverseSize)
			relPos.z -= (2.0 * kUniverseSize);
		if (relPos.z < -kUniverseSize)
			relPos.z += (2.0 * kUniverseSize);
		return relPos;
}
class Galaxy
{

	constructor(idx)
	{
		this._myIdx = idx;
		this._position = randPos();
		this._luminosity = randL();

		this._velocityPeculiarUnit = new ThreeVector(
										(Math.random() - 0.5),
										(Math.random() - 0.5),
										(Math.random() - 0.5));
		this._velocityPeculiarUnit.selfUnit();
		this._velocityPeculiar = this._velocityPeculiarUnit.scale(kMaxPeculiarVelocity);


		this._orientation = Math.random() * 2.0 * Math.PI;
		this._cosOrientation = Math.cos(this._orientation);
		this._sinOrientation = Math.sin(this._orientation);
		this._galaxyType = Math.floor(Math.random() + 0.5); // 0 or 1
		this._sizeBasis = this._luminosity / 2.0e10 * 0.03; // Mpc?

		if (this._galaxyType == 0) // elliptical
		{
			this._radiusEquatorial = this._sizeBasis;
			this._radiusPolar = this._sizeBasis * (Math.random() * 0.25 + 0.75);
		}
		else
		{
			this._bulgeSize = this._sizeBasis * (Math.random() * 0.25 + 0.05);
			this._diskSize = this._sizeBasis;
			this._orientationFace = Math.random() * Math.PI;
			this._cosOrientationFace = Math.cos(this._orientationFace);
			this._sinOrientationFace = Math.sin(this._orientationFace);
		}

		//this._faceon = Math.random() * 0.75 + 0.25;
		this._color = Math.random();

		this._id = 'NSiGC ' + Math.round(Math.random() * 1000000);
		this._measurements = new Object();

	}
	getMeasurementSet(homeIdx)
	{
		const homeStr = homeIdx.toString();
		let ret = undefined;
		if (homeStr in this._measurements)
			ret = this._measurements[homeStr];
		return ret;
	}
	addGetMeasurementSet(homeIdx)
	{
		const homeStr = homeIdx.toString();
		let ret = undefined;
		if (homeStr in this._measurements)
			ret = this._measurements[homeStr];
		else
		{
			const relPos = getRelPos(this._position,universe[homeIdx]._position);
			ret = new MeasurementSet(this._myIdx,homeIdx,relPos.radius);
			addMeasurementSetToList(ret);
			this._measurements[homeStr] = ret;
		}	
		return ret;
	}

	takeImage(SN,aperture)
	{
		const relPos = getRelPos(this._position,universe[currentHome]._position);
		const dist = relPos.magnitude;
		const collectingArea = Math.PI * aperture * aperture * 0.25;
		const greenPhotonEnergy = kPlanck * kSpeedLight / (550.0e-7);
		const flux = this._luminosity * kLuminositySolar * Math.pow(dist * 1.0e6 * kParsec_cm,-2.0) * 0.25 / Math.PI; // erg/s/cm^2
		const intFlux = flux * collectingArea; // erg/s
		const photonFlux = intFlux / greenPhotonEnergy; // photons / s
		const exposure = SN * SN / photonFlux; // s
		const photoxFluxExpsoure = exposure * photonFlux; // photons
		const measPhotonFlux = random_gaussian(photoxFluxExpsoure,Math.sqrt(photoxFluxExpsoure)); // photons
		const measPhotonFlux_err = Math.sqrt(measPhotonFlux); // photons
		const measFlux = measPhotonFlux * greenPhotonEnergy / exposure / collectingArea; // erg/s/cm^2
		const measFlux_err = measPhotonFlux_err * greenPhotonEnergy / exposure / collectingArea; // erg / s / cm^2
		
		let measDist = 0;
		let measDist_err = -1;
		if (dist < 35.0)
		{
			measDist = dist * (1.0 + random_gaussian(0,1.0 / SN)); // Mpc
			measDist_err = measDist / SN; // Mpc
		}
		let measurementSet = this.addGetMeasurementSet(currentHome);
		measurementSet.addMeasurement(new Measurement(currentHome,measPhotonFlux, measPhotonFlux_err, measFlux,measFlux_err,measDist,measDist_err,0,-1,0,-1));
		addHomeToList(currentHome);
	}

	takeSpectrum(resolution)
	{
		const relPos = getRelPos(this._position,universe[currentHome]._position);
		const dist = relPos.radius;
		relPos.selfUnit();

		const ux = relPos.x;
		const uy = relPos.y;
		const uz = relPos.z;

		const vPec = this._velocityPeculiar.r;

		const vx = this._velocityPeculiarUnit.x;
		const vy = this._velocityPeculiarUnit.y;
		const vz = this._velocityPeculiarUnit.z;

		const rv_Hubble = H0 * dist;
		const rv_pec = (vx * ux + vy * uy + vz * uz) * vPec;
		const rv = rv_Hubble + rv_pec;
		const measRv = random_gaussian(rv,resolution);

		const beta = measRv / kSpeedLight_kms; 
		const redshift = Math.sqrt((1 + beta) / (1 - beta)) - 1;
		
// Tully-Fisher
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		const vrot = Math.pow(this._luminosity / 4.0e10,0.25) * 200.0;
		const measVrot = random_gaussian(vrot,resolution);

		let measurementSet = this.addGetMeasurementSet(currentHome);
		measurementSet.addMeasurement(new Measurement(currentHome,0,-1,0,-1,0,-1,measRv,resolution,measVrot,resolution));
		addHomeToList(currentHome);
	}
}


class Telescope
{
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
	}
}
let telescopes = new Array();
let currentTelescope = 0;
telescopes.push(new Telescope("the Telescope", 0.0, 0.0, 15.0, 3000.0, 2048, 2048 * 0.024, 45000));


function takeImage()
{
	let idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		universe[inViewList[idxLcl].idx].takeImage(50.0,telescopes[currentTelescope]._diameter * 100.0);
	}
	updateHubbleLaw();
}


function takeSpectrum()
{
	let idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		universe[inViewList[idxLcl].idx].takeSpectrum(10.0);
	}
	updateHubbleLaw();
}




let universe = new Array();

const kNumGalaxies = 1000;

function createUniverse()
{
	let debug = false;
	let home = new Galaxy(0);
	home._position.x = 0;
	home._position.y = 0;
	home._position.z = 0;
	home._luminosity = 1.2e10;
	home._sizeBasis = home._luminosity / 2.0e10 * 0.03;
	home._galaxyType = 1;
	home._bulgeSize = home._sizeBasis * (Math.random() * 0.25 + 0.05);
	home._diskSize = home._sizeBasis;
	home._orientationFace = Math.random() * Math.PI;
	home._cosOrientationFace = Math.cos(home._orientationFace);
	home._sinOrientationFace = Math.sin(home._orientationFace);
	home._id = 'Milky Way';
	universe.push(home);
	
	if (debug) {
		let tempX = new Galaxy(1);
		tempX._position.x = 100;
		tempX._position.y = 0;
		tempX._position.z = 0;
		tempX._id = 'Test x';
		universe.push(tempX);

		let tempMX = new Galaxy(2);
		tempMX._position.x = -100;
		tempMX._position.y = 0;
		tempMX._position.z = 0;
		tempMX._id = 'Test -x';
		universe.push(tempMX);

		let tempZ = new Galaxy(3);
		tempZ._position.x = 0;
		tempZ._position.y = 0;
		tempZ._position.z = 100;
		tempZ._id = 'Test Z';
		universe.push(tempZ);

		let tempMZ = new Galaxy(4);
		tempMZ._position.x = 0;
		tempMZ._position.y = 0;
		tempMZ._position.z = -100;
		tempMZ._id = 'Test -Z';
		universe.push(tempMZ);

		let tempY = new Galaxy(5);
		tempY._position.x = 0;
		tempY._position.y = 100;
		tempY._position.z = 0;
		tempY._id = 'Test Y';
		universe.push(tempY);

		let tempMY = new Galaxy(6);
		tempMY._position.x = 0;
		tempMY._position.y = -100;
		tempMY._position.z = 0;
		tempMY._id = 'Test -Y';
		universe.push(tempMY);
	}
	else
	{
		let idxLcl;
		// start at 1 since the Milky way is the first in the list.
		for (idxLcl = 1; idxLcl < kNumGalaxies; idxLcl++)
		{
			universe.push(new Galaxy(idxLcl));
		}
	}
}


let latDir = 0.0;
let longDir = 0.0;
let slew = radians(20.0);

function slewSelect(value)
{
	if (value == "Fast")
		slew = radians(20.0);
	else
		slew = telescopes[currentTelescope]._FOV;
	draw();
}


let btnReturnMilkyWay;
let btnMoveHome;
let btnFindMilkyWay;

function moveHome(toMW)
{
	let idxLcl;
	if (toMW)
	{
		currentHome = 0;
		btnReturnMilkyWay.disabled = true;
		btnMoveHome.disabled = false;
		btnFindMilkyWay.disabled = true;
	}
	else
	{
		currentHome = Math.floor(Math.random() * kNumGalaxies);
//		class GalData
//		{
//			constructor (i,d)
//			{
//				this._i = i;
//				this._d = d;
//			}
//		};
//		let nearestList = new Array();

//		let u = Math.random();
//		while (u == 0) Math.random();

//		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
//		{
//		const relPos = getRelPos(universe[idxLcl]._position,universe[homeIdx]._position);
//			if (idxLcl != currentHome)
//				nearestList.push(new GalData(idxLcl,relPos.radius));
//
//		}
//		nearestList.sort(function(a, b){return a._d - b._d});

//		const nearIdx = Math.round(u * 15);
//		currentHome = nearestList[nearIdx]._i;
	}
	setView(0.0,0.0);

	btnFindMilkyWay.disabled = false;
	btnReturnMilkyWay.disabled = false;
	btnMoveHome.disabled = false;

	updateHubbleLaw();
	draw();
}
function findHome()
{
	if (currentHome != 0)
	{
		const relPos = getRelPos(universe[currentHome]._position,universe[0]._position);
//		let relPos = universe[0]._position.subtract(universe[currentHome]._position);
		setSlewTarget(relPos.psi,relPos.theta);
//		setView(relPos.psi,relPos.theta);
//		update = true;
	}
//	draw();
}

let targetLat = null;
let targetLong = null;

function setSlewTarget(lat,long)
{
	if (targetLat === null && targetLong === null)
	{
		targetLat = lat;
		targetLong = long;
		slewToTarget();
	}
}

let autoSlewSpeed = 0.0;
let autoSlewTimer = 0.0;

function slewToTarget()
{
	if(targetLat !== null && targetLong !== null)
	{
	
		const delLat = targetLat - viewLat;

		let delLong = targetLong - viewLong;
		if (delLong > Math.PI)
			delLong = -2.0 * Math.PI + delLong;
		else if (delLong < -Math.PI)
			delLong = 2.0 * Math.PI + delLong;
			
		const modLong = delLong;// * Math.cos(delLat);
		const distRemaining = Math.sqrt(modLong * modLong + delLat * delLat);
		if (distRemaining > 0.00007) // ~15 arc-sec
		{
			const timerEffect = Math.min(autoSlewTimer / 2.0,1.0);
			const timestep = 1.0 / 30.0;
			autoSlewSpeed = Math.min(Math.max(15.0 * distRemaining / 0.10 * timerEffect,0.01),15.0);
			
			const currDel = Math.min(autoSlewSpeed * timestep / distRemaining,0.9);
			slewView(delLat * currDel,delLong * currDel);

			let vL = viewLong % (2.0 * Math.PI);
			if (vL >= Math.PI)
				vL -= 2.0 * Math.PI;
			else if (vL < -Math.PI)
				vL += 2.0 * Math.PI;
			viewLong = vL;


			window.setTimeout(slewToTarget, 1000.0 * framerate);
			autoSlewTimer += timestep;

		}
		else
		{
			setView(targetLat,targetLong);
			targetLat = null;
			targetLong = null;
			autoSlewSpeed = 0.0;
			autoSlewTimer = 0.0;
		}
		update = true;
		draw();
	}
}



function downloadMeasurements()
{
	let idxLcl;
	let data = 'Galaxy, From Galaxy, Flux (erg/s/au^2), Flux Uncertainty (erg/s/au^2), Cepheid Distance (Mpc), Cepheid Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), Rotational Velocity (km/s), Rotational Velocity Uncertainty (km/s)\n';
	for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
	{
		let jLcl;
		const gIdx  = listMeasurements[idxLcl]._thisGalaxy;
		const hIdx  = listMeasurements[idxLcl]._fromGalaxy;

		for (jLcl = 0; jLcl < listMeasurements[idxLcl]._measurements.length; jLcl++)
		{
			const flux = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._flux,listMeasurements[idxLcl]._measurements[jLcl]._flux_u);
			const dist = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._dist,listMeasurements[idxLcl]._measurements[jLcl]._dist_u);
			const radVel = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._rv,listMeasurements[idxLcl]._measurements[jLcl]._rv_u);
			const rotVel = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._vrot,listMeasurements[idxLcl]._measurements[jLcl]._vrot_u);

			data += universe[gIdx]._id + ', ' + universe[hIdx]._id
			+ ', ' + flux.value_string
			+ ', ' + flux.uncertainty_string
			+ ', ' + dist.value_string
			+ ', ' + dist.uncertainty_string
			+ ', ' + radVel.value_string
			+ ', ' + radVel.uncertainty_string
			+ ', ' + rotVel.value_string
			+ ', ' + rotVel.uncertainty_string
			+ '\n';
		}
	}
	download(data,"ExpansionOfUniverseMeasurements.csv","csv");
}
function downloadAnalysis()
{
	let idxLcl;
	let data = 'Galaxy, From Galaxy, Distance (Mpc), Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), V Magnitude, V Magnitude Uncertainty, Redshift, Redshift Uncertainty\n';
	for (kLcl = 0; kLcl < listHomesMeasurements.length; kLcl++)
	{
		for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
		{
			const gIdx  = listMeasurements[idxLcl]._thisGalaxy;
			const hIdx  = listMeasurements[idxLcl]._fromGalaxy;
			if (hIdx == listHomesMeasurements[kLcl])
			{
				if (listMeasurements[idxLcl]._measurements.length > 0)
				{
					const dist = sig_figs(listMeasurements[idxLcl]._dist,listMeasurements[idxLcl]._dist_u);
					const radVel = sig_figs(listMeasurements[idxLcl]._redshift * 299792.458,listMeasurements[idxLcl]._redshift_u * 299792.458);
					const Mv = sig_figs(listMeasurements[idxLcl]._Mv,listMeasurements[idxLcl]._Mv_u);
					const redshift = sig_figs(listMeasurements[idxLcl]._redshift,listMeasurements[idxLcl]._redshift_u);

					data += universe[gIdx]._id
					+ ', ' + universe[hIdx]._id
					+ ', ' + dist.value_string
					+ ', ' + dist.uncertainty_string
					+ ', ' + radVel.value_string
					+ ', ' + radVel.uncertainty_string
					+ ', ' + Mv.value_string
					+ ', ' + Mv.uncertainty_string
					+ ', ' + redshift.value_string
					+ ', ' + redshift.uncertainty_string
					+ '\n';
				}
			}
		}
	}
	download(data,"ExpansionOfUniverseAnalysis.csv","csv");
}

class HubbleData
{
	constructor(fromGalaxy, H0, H0_u, H0int, H0int_u)
	{
		this._fromGalaxy = fromGalaxy;

		
	}
}


function determineHubbleLaw(idx)
{
	let v = new Array();
	let vu = new Array();
	let d = new Array();
	let du = new Array();
	let ret = new Object;
	let idxLcl;
	for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
	{
		if (listMeasurements[idxLcl]._fromGalaxy == idx && listMeasurements[idxLcl]._dist_u != -1 && listMeasurements[idxLcl]._redshift_u != -1)
		{
			v.push(listMeasurements[idxLcl]._redshift * 299792.458);
			vu.push(listMeasurements[idxLcl]._redshift_u * 299792.458);
			d.push(listMeasurements[idxLcl]._dist);
			du.push(listMeasurements[idxLcl]._dist_u);
		}
	}
	if (v.length > 2)
	{
		const lls = new LLS(d,v);
		ret.measH0 = lls.slope;
		ret.measH0u = lls.slope_uncertainty;
		ret.measIntercept = lls.intercept;
		ret.measInterceptu = lls.intercept_uncertainty;
	}
	else if (v.length == 2)
	{
		const recip = 1.0 / (d[1] - d[0]);
		ret.measH0 = (v[1] - v[0]) * recip;
				
		ret.measH0u = recip * Math.sqrt((vu[1] * vu[1] + vu[0] * vu[0]) + (du[1] * du[1] + du[0] * du[0]) * ret.measH0 * ret.measH0);
		ret.measIntercept = v[1] - ret.measH0 * d[1];
		ret.measInterceptu = Math.sqrt(vu[1] * vu[1] + d[1] * d[1] * ret.measH0u * ret.measH0u + ret.measH0 * ret.measH0 * du[1] * du[1]);
	}
	else
	{
		ret.measH0 = 0;
		ret.measH0u = -1;
		ret.measIntercept = 0;
		ret.measInterceptu = -1;
	}
	return ret;
}
let hubbleLaw = {measH0:0,measH0u:-2,measIntercept:0,measInterceptu:-2};
function updateHubbleLaw()
{
	hubbleLaw = determineHubbleLaw(currentHome);
	draw();
}
	
function downloadHubbleAnalysis()
{
	let idxLcl;
	let data = 'From Galaxy, H0 (km/s/Mpc), H0 Uncertainty (km/s/Mpc)\n';



	for (kLcl = 0; kLcl < listHomesMeasurements.length; kLcl++)
	{
		const law = determineHubbleLaw(listHomesMeasurements[kLcl]);
		const H0sf = sig_figs(law.measH0,law.measH0u);
		const H0intsf = sig_figs(law.measIntercept,law.measInterceptu);

		data +=
			universe[listHomesMeasurements[kLcl]]._id
			+ ', ' + H0sf.value_string
			+ ', ' + H0sf.uncertainty_string
			+ '\n';
	}
	download(data,"ExpansionOfUniverseH0.csv","csv");
}

let inViewList = new Array();

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

let viewMatrix = new ThreeMatrix();
let viewLong = 0.0;
let viewLat = 0.0;
setView(0.0,0.0);

function updateViewMatrix()
{
	const raRad = viewLong;
	const decRad = viewLat;
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

function setView(lat,long)
{
	if (lat < Math.PI && lat > -Math.PI)
		viewLat = lat;
	
	let vL = long % (2.0 * Math.PI);
	if (vL >= Math.PI)
		vL -= 2.0 * Math.PI;
	else if (vL < -Math.PI)
		vL += 2.0 * Math.PI;
	viewLong = vL;
	
	updateViewMatrix();
}
function slewView(latDelta,longDelta)
{
	viewLat += latDelta;
	viewLong += longDelta;
	if (viewLat > (Math.PI * 0.5))
		viewLat = (Math.PI * 0.5);
	if (viewLat < (-Math.PI * 0.5))
		viewLat = (-Math.PI * 0.5);
	let vL = viewLong % (2.0 * Math.PI);
	if (vL >= Math.PI)
		vL -= 2.0 * Math.PI;
	else if (vL < -Math.PI)
		vL += 2.0 * Math.PI;
	viewLong = vL;
	updateViewMatrix();
}

function checkUpdate()
{
	if (latDir != 0 || longDir != 0)
	{
		slewView(latDir * slew * framerate,longDir * slew * framerate);
		update = true;
	}
	if (update)
	{
		update = false;
		inViewList = new Array();

		const kRadians = Math.PI / 180.0;
		const kDegrees = 180.0 / Math.PI;
		const kArcSecRadians = kDegrees * 3600.0;
		const scaling = 1.0 / telescopes[currentTelescope]._pixelSizeSky;

		const halfTelRes = 0.5 * telescopes[currentTelescope]._CCDresolution;

		let idxLcl;
		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			if (idxLcl != currentHome)
			{
				const relPos = getRelPos(universe[currentHome]._position,universe[idxLcl]._position);

				const viewPos = viewMatrix.dot(relPos.unit); // transform relative position into view coordinates
				const angSize = universe[idxLcl]._sizeBasis / relPos.r; // radians
				const maxAngle = telescopes[currentTelescope]._FOV + angSize;
				if ((Math.abs(viewPos.theta) < maxAngle || Math.abs(viewPos.theta) > (2.0 * Math.PI - maxAngle)) &&
				Math.abs(viewPos.psi) < maxAngle) // needs to be in front of telescope
				{
					const angSizePx = angSize * scaling; // pixels
					const x = viewPos.theta * scaling; // pixels
					const y = viewPos.psi * scaling; // pixels

					let viewGalaxy = {}
					let inView = true;
					// center of the galaxy is within the field of view of the telescope
/*					if (x >= -halfTelRes && x <= halfTelRes &&
						y >= -halfTelRes && y <= halfTelRes)

					{
						inView = true;
					}
					else
					{
						let eqSize;
						let polSize;
						// calculate if the corners of the CCD are within the ellipse of the galaxy, disk, or bulge
						if (universe[idxLcl]._galaxyType == 0) // elliptical
						{
							eqSize = universe[idxLcl]._radiusEquatorial * angSizePx;
							polSize = universe[idxLcl]._radiusPolar * angSizePx;
						}
						else
						{
							eqSize = universe[idxLcl]._diskSize * angSizePx;
							polSize = universe[idxLcl]._diskSize * angSizePx * universe[idxLcl]._cosOrientationFace;
							let bulgeSize = universe[idxLcl]._bulgeSize * angSizePx;
							if (polSize < bulgeSize)
								polSize = bulgeSize;
						}
						let CosOr = universe[idxLcl]._cosOrientation;
						let SinOr = universe[idxLcl]._sinOrientation;
						inView = testPointInEllipse(-telescopes[currentTelescope]._CCDresolution * 0.5 - x,-telescopes[currentTelescope]._CCDresolution * 0.5 - y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(telescopes[currentTelescope]._CCDresolution * 0.5 - x,-telescopes[currentTelescope]._CCDresolution * 0.5 - y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(telescopes[currentTelescope]._CCDresolution * 0.5 + x,-telescopes[currentTelescope]._CCDresolution * 0.5 - y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(-telescopes[currentTelescope]._CCDresolution * 0.5 + x,-telescopes[currentTelescope]._CCDresolution * 0.5 - y,eqSize,polSize,CosOr,SinOr);
					}*/

//					if (inView)
//					{
						viewGalaxy.idx = idxLcl;
						viewGalaxy.x = x;
						viewGalaxy.y = y;
						const flux = universe[idxLcl]._luminosity * Math.pow(relPos.radius * 2.06265e11,-2);
						const Mv = -2.5 * Math.log10(flux) - 26.75;


						viewGalaxy.pixelScale = angSizePx;
						viewGalaxy.bright = (20.0 - Mv) / 3.0;
						inViewList.push(viewGalaxy);
//					}
				}
			}
		}
		draw();
	}
	window.setTimeout(checkUpdate, 1000.0 * framerate);

}

function findNearestGalaxy(lat,long)
{
	let bestIdx = -1;
	let bestDist = 0;
	let relPosBest;
	let idxLcl;
	const lookPos = new ThreeVector(Math.cos(long) * Math.cos(lat),Math.sin(long) * Math.cos(lat),Math.sin(lat));
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (idxLcl != currentHome)
		{
			const relPos = getRelPos(universe[currentHome]._position,universe[idxLcl]._position);
			const relPosUnit = relPos.unit;
			const dot = relPosUnit.dot(lookPos);
			if (dot > 0 && dot > bestDist)
			{
				bestDist = dot;
				bestIdx = idxLcl;
				relPosBest = relPosUnit.copy();
			}
		}
	}
	return {long: relPosBest.theta, lat: relPosBest.psi};
}

window.setTimeout(checkUpdate, 1000.0 * framerate);
createUniverse();
update = true;
