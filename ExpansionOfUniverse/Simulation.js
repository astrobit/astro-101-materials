

var framerate = 1.0 / 30.0;


var H0 = (Math.random() - 0.5) * 2.0 + 72.0; // the value of the Hubble constant in this universe
var currentHome = 0; // set the default home galaxy to the Milky Way

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

var LF = new LuminosityFunction(2e10,-0.47,1,60);
function randL()
{
	var v = Math.random();
	var x = 1.0;
	var f = LF.LF(x);
	var n = 0;
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



var listHomesMeasurements = new Array();
function addHomeToList(idxToAdd)
{
	var found = false;
	for (idx = 0; idx < listHomesMeasurements.length && !found; idx++)
	{
		found = listHomesMeasurements[idx] == idxToAdd;
	}
	if (!found)
		listHomesMeasurements.push(idxToAdd);
}

var listMeasurements = new Array();
function addMeasurementSetToList(measurementSet)
{
	var found = false;
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
//		var relPos = this._position.subtract(universe[currentHome]._position)
//		var dist_True = relPos.radius;

		var dist = 0;
		var rv = 0;
		var vrot = 0;
		var flux = 0;

		var distSum = 0;
		var rvSum = 0;
		var vrotSum = 0;
		var fluxSum = 0;

		var distSq = 0;
		var rvSq = 0;
		var vrotSq = 0;
		var fluxSq = 0;

		var dist_u = -1;
		var rv_u = -1;
		var vrot_u = -1;
		var flux_u = -1;

		var distVar = 0;
		var rvVar = 0;
		var vrotVar = 0;
		var fluxVar = 0;

		var Ndist =0;
		var Nrv = 0;
		var Nvrot = 0;
		var Nflux = 0;
		var idxLcl;

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
		distVar = distSq + Ndist * dist * dist - 2.0 * distSum * dist;
		rvVar = rvSq + Nrv * rv * rv - 2.0 * rvSum * rv;
		vrotVar = vrotSq + Nvrot * vrot * vrot - 2.0 * vrotSum * vrot;
		fluxVar = fluxSq + Nflux * flux * flux - 2.0 * fluxSum * flux;
		
		if (Ndist > 1)
			dist_u = Math.sqrt(distVar / ((Ndist - 1.0) * Ndist));
		if (Nrv > 1)
			rv_u = Math.sqrt(rvVar / ((Nrv - 1.0) * Nrv));
		if (Nvrot > 1)
			vrot_u = Math.sqrt(vrotVar / ((Nvrot - 1.0) * Nvrot));
		if (Nflux > 1)
			flux_u = Math.sqrt(fluxVar / ((Nflux - 1.0) * Nflux));

// Tully-Fisher Distance
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		var dist_tf = 0;
		var dist_tf_u = -1;
		if (Nflux != 0 && Nvrot != 0 && this._dist_True >= 35.0)
		{
			var lum_tf =  4.0e10 * Math.pow(vrot / 200.0,4.0);
			var lum_tf_u = 4.0 * lum_tf * vrot_u / vrot;
			dist = Math.sqrt(lum_tf / (flux / kLuminositySolar) * 0.25 / Math.PI) / (1.0e6 * kParsec_cm);
			var ul = 0.5 * lum_tf_u / lum_tf;
			var uf = 0.5 * flux_u / flux;
			dist_u = dist * Math.sqrt(ul * ul + uf * uf);
		}
		if (flux_u != -1)
		{
			// solar flux
			var fluxSun = kLuminositySolar / (1.49597870700e13 * 1.49597870700e13 * 4.0 * Math.PI);
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
		var position;
		position = new ThreeVector((Math.random() - 0.5) * 2.0 * kUniverseSize, // Mpc
									(Math.random() - 0.5) * 2.0 * kUniverseSize, // Mpc
									(Math.random() - 0.5) * 2.0 * kUniverseSize); // Mpc
	   return position;
}
function getRelPos(myPos,otherPos)
{
		var relPos = otherPos.subtract(myPos);
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
		var homeStr = homeIdx.toString();
		var ret = undefined;
		if (homeStr in this._measurements)
			ret = this._measurements[homeStr];
		return ret;
	}
	addGetMeasurementSet(homeIdx)
	{
		var homeStr = homeIdx.toString();
		var ret = undefined;
		if (homeStr in this._measurements)
			ret = this._measurements[homeStr];
		else
		{
			var relPos = getRelPos(this._position,universe[homeIdx]._position);
			ret = new MeasurementSet(this._myIdx,homeIdx,relPos.radius);
			addMeasurementSetToList(ret);
			this._measurements[homeStr] = ret;
		}	
		return ret;
	}

	takeImage(SN,aperture)
	{
		var relPos = getRelPos(this._position,universe[currentHome]._position);
		var dist = relPos.magnitude;
		var collectingArea = Math.PI * aperture * aperture * 0.25;
		const greenPhotonEnergy = kPlanck * kSpeedLight / (550.0e-7);
		var flux = this._luminosity * kLuminositySolar * Math.pow(dist * 1.0e6 * kParsec_cm,-2.0) * 0.25 / Math.PI; // erg/s/cm^2
		var intFlux = flux * collectingArea; // erg/s
		var photonFlux = intFlux / greenPhotonEnergy; // photons / s
		var exposure = SN * SN / photonFlux; // s
		var photoxFluxExpsoure = exposure * photonFlux; // photons
		var measPhotonFlux = random_gaussian(photoxFluxExpsoure,Math.sqrt(photoxFluxExpsoure)); // photons
		var measPhotonFlux_err = Math.sqrt(measPhotonFlux); // photons
		var measFlux = measPhotonFlux * greenPhotonEnergy / exposure / collectingArea; // erg/s/cm^2
		var measFlux_err = measPhotonFlux_err * greenPhotonEnergy / exposure / collectingArea; // erg / s / cm^2
		
		var measDist = 0;
		var measDist_err = -1;
		if (dist < 35.0)
		{
			measDist = dist * (1.0 + random_gaussian(0,1.0 / SN)); // Mpc
			measDist_err = measDist / SN; // Mpc
		}
		var measurementSet = this.addGetMeasurementSet(currentHome);
		measurementSet.addMeasurement(new Measurement(currentHome,measPhotonFlux, measPhotonFlux_err, measFlux,measFlux_err,measDist,measDist_err,0,-1,0,-1));
		addHomeToList(currentHome);
	}

	takeSpectrum(resolution)
	{
		var relPos = getRelPos(this._position,universe[currentHome]._position);
		var dist = relPos.radius;
		relPos.selfUnit();

		var ux = relPos.x;
		var uy = relPos.y;
		var uz = relPos.z;

		var vPec = this._velocityPeculiar.r;

		var vx = this._velocityPeculiarUnit.x;
		var vy = this._velocityPeculiarUnit.y;
		var vz = this._velocityPeculiarUnit.z;

		var rv_Hubble = H0 * dist;
		var rv_pec = (vx * ux + vy * uy + vz * uz) * vPec;
		var rv = rv_Hubble + rv_pec;
		var measRv = random_gaussian(rv,resolution);

		var beta = measRv / kSpeedLight_kms; 
		var redshift = Math.sqrt((1 + beta) / (1 - beta)) - 1;
		
// Tully-Fisher
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		var vrot = Math.pow(this._luminosity / 4.0e10,0.25) * 200.0;
		var measVrot = random_gaussian(vrot,resolution);

		var measurementSet = this.addGetMeasurementSet(currentHome);
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
var telescopes = new Array();
var currentTelescope = 0;
telescopes.push(new Telescope("the Telescope", 0.0, 0.0, 15.0, 3000.0, 2048, 2048 * 0.024, 45000));


function takeImage()
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		universe[inViewList[idxLcl].idx].takeImage(50.0,telescopes[currentTelescope]._diameter * 100.0);
	}
	updateHubbleLaw();
}


function takeSpectrum()
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		universe[inViewList[idxLcl].idx].takeSpectrum(10.0);
	}
	updateHubbleLaw();
}




var universe = new Array();

const kNumGalaxies = 1000;

function createUniverse()
{
	var debug = false;
	var home = new Galaxy(0);
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
		var tempX = new Galaxy(1);
		tempX._position.x = 100;
		tempX._position.y = 0;
		tempX._position.z = 0;
		tempX._id = 'Test x';
		universe.push(tempX);

		var tempMX = new Galaxy(2);
		tempMX._position.x = -100;
		tempMX._position.y = 0;
		tempMX._position.z = 0;
		tempMX._id = 'Test -x';
		universe.push(tempMX);

		var tempZ = new Galaxy(3);
		tempZ._position.x = 0;
		tempZ._position.y = 0;
		tempZ._position.z = 100;
		tempZ._id = 'Test Z';
		universe.push(tempZ);

		var tempMZ = new Galaxy(4);
		tempMZ._position.x = 0;
		tempMZ._position.y = 0;
		tempMZ._position.z = -100;
		tempMZ._id = 'Test -Z';
		universe.push(tempMZ);

		var tempY = new Galaxy(5);
		tempY._position.x = 0;
		tempY._position.y = 100;
		tempY._position.z = 0;
		tempY._id = 'Test Y';
		universe.push(tempY);

		var tempMY = new Galaxy(6);
		tempMY._position.x = 0;
		tempMY._position.y = -100;
		tempMY._position.z = 0;
		tempMY._id = 'Test -Y';
		universe.push(tempMY);
	}
	else
	{
		var idxLcl;
		// start at 1 since the Milky way is the first in the list.
		for (idxLcl = 1; idxLcl < kNumGalaxies; idxLcl++)
		{
			universe.push(new Galaxy(idxLcl));
		}
	}
}


var latDir = 0.0;
var longDir = 0.0;
var slew = radians(20.0);

function slewSelect(value)
{
	if (value == "Fast")
		slew = radians(20.0);
	else
		slew = telescopes[currentTelescope]._FOV;
	draw();
}


var btnReturnMilkyWay;
var btnMoveHome;
var btnFindMilkyWay;

function moveHome(toMW)
{
	var idxLcl;
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
//		var nearestList = new Array();

//		var u = Math.random();
//		while (u == 0) Math.random();

//		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
//		{
//		var relPos = getRelPos(universe[idxLcl]._position,universe[homeIdx]._position);
//			if (idxLcl != currentHome)
//				nearestList.push(new GalData(idxLcl,relPos.radius));
//
//		}
//		nearestList.sort(function(a, b){return a._d - b._d});

//		var nearIdx = Math.round(u * 15);
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
		var relPos = getRelPos(universe[currentHome]._position,universe[0]._position);
//		var relPos = universe[0]._position.subtract(universe[currentHome]._position);
		setSlewTarget(relPos.psi,relPos.theta);
//		setView(relPos.psi,relPos.theta);
//		update = true;
	}
//	draw();
}

var targetLat = null;
var targetLong = null;

function setSlewTarget(lat,long)
{
	if (targetLat === null && targetLong === null)
	{
		targetLat = lat;
		targetLong = long;
		slewToTarget();
	}
}

var autoSlewSpeed = 0.0;
var autoSlewTimer = 0.0;

function slewToTarget()
{
	if(targetLat !== null && targetLong !== null)
	{
	
		var delLat = targetLat - viewLat;

		var delLong = targetLong - viewLong;
		if (delLong > Math.PI)
			delLong = -2.0 * Math.PI + delLong;
		else if (delLong < -Math.PI)
			delLong = 2.0 * Math.PI + delLong;
			
		var modLong = delLong;// * Math.cos(delLat);
		var distRemaining = Math.sqrt(modLong * modLong + delLat * delLat);
		if (distRemaining > 0.00007) // ~15 arc-sec
		{
			var timerEffect = Math.min(autoSlewTimer / 2.0,1.0);
			var timestep = 1.0 / 30.0;
			autoSlewSpeed = Math.min(Math.max(15.0 * distRemaining / 0.10 * timerEffect,0.01),15.0);
			
			var currDel = autoSlewSpeed * timestep / distRemaining;
			if (currDel > 0.9)
				currDel = 0.9;
			slewView(delLat * currDel,delLong * currDel);

			var vL = viewLong % (2.0 * Math.PI);
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
	var idxLcl;
	var data = 'Galaxy, From Galaxy, Flux (erg/s/au^2), Flux Uncertainty (erg/s/au^2), Cepheid Distance (Mpc), Cepheid Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), Rotational Velocity (km/s), Rotational Velocity Uncertainty (km/s)\n';
	for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
	{
		var jLcl;
		var gIdx  = listMeasurements[idxLcl]._thisGalaxy;
		var hIdx  = listMeasurements[idxLcl]._fromGalaxy;

		for (jLcl = 0; jLcl < listMeasurements[idxLcl]._measurements.length; jLcl++)
		{
			var flux = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._flux,listMeasurements[idxLcl]._measurements[jLcl]._flux_u);
			var dist = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._dist,listMeasurements[idxLcl]._measurements[jLcl]._dist_u);
			var radVel = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._rv,listMeasurements[idxLcl]._measurements[jLcl]._rv_u);
			var rotVel = sig_figs(listMeasurements[idxLcl]._measurements[jLcl]._vrot,listMeasurements[idxLcl]._measurements[jLcl]._vrot_u);

			data += universe[gIdx]._id + ', ' + universe[hIdx]._id
			+ ', ' + flux.value.toFixed(flux.rounding)
			+ ', ' + flux.uncertainty.toFixed(flux.rounding)
			+ ', ' + dist.value.toFixed(dist.rounding)
			+ ', ' + dist.uncertainty.toFixed(dist.rounding)
			+ ', ' + radVel.value.toFixed(radVel.rounding)
			+ ', ' + radVel.uncertainty.toFixed(radVel.rounding)
			+ ', ' + rotVel.value.toFixed(rotVel.rounding)
			+ ', ' + rotVel.uncertainty.toFixed(rotVel.rounding)
			+ '\n';
		}
	}
	download(data,"ExpansionOfUniverseMeasurements.csv","csv");
}
function downloadAnalysis()
{
	var idxLcl;
	var data = 'Galaxy, From Galaxy, Distance (Mpc), Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), V Magnitude, V Magnitude Uncertainty, Redshift, Redshift Uncertainty\n';
	for (kLcl = 0; kLcl < listHomesMeasurements.length; kLcl++)
	{
		for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
		{
			var gIdx  = listMeasurements[idxLcl]._thisGalaxy;
			var hIdx  = listMeasurements[idxLcl]._fromGalaxy;
			if (hIdx == listHomesMeasurements[kLcl])
			{
				if (listMeasurements[idxLcl]._measurements.length > 0)
				{
					var dist = sig_figs(listMeasurements[idxLcl]._dist,listMeasurements[idxLcl]._dist_u);
					var radVel = sig_figs(listMeasurements[idxLcl]._redshift * 299792.458,listMeasurements[idxLcl]._redshift_u * 299792.458);
					var Mv = sig_figs(listMeasurements[idxLcl]._Mv,listMeasurements[idxLcl]._Mv_u);
					var redshift = sig_figs(listMeasurements[idxLcl]._redshift,listMeasurements[idxLcl]._redshift_u);

					data += universe[gIdx]._id
					+ ', ' + universe[hIdx]._id
					+ ', ' + dist.value.toFixed(dist.rounding)
					+ ', ' + dist.uncertainty.toFixed(dist.rounding)
					+ ', ' + radVel.value.toFixed(radVel.rounding)
					+ ', ' + radVel.uncertainty.toFixed(radVel.rounding)
					+ ', ' + Mv.value.toFixed(Mv.rounding)
					+ ', ' + Mv.uncertainty.toFixed(Mv.rounding)
					+ ', ' + redshift.value.toFixed(redshift.rounding)
					+ ', ' + redshift.uncertainty.toFixed(redshift.rounding)
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
	var v = new Array();
	var vu = new Array();
	var d = new Array();
	var du = new Array();
	var ret = new Object;
	var idxLcl;
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
		var lls = new LLS(d,v);
		ret.measH0 = lls.slope;
		ret.measH0u = lls.slope_uncertainty;
		ret.measIntercept = lls.intercept;
		ret.measInterceptu = lls.intercept_uncertainty;
	}
	else if (v.length == 2)
	{
		var recip = 1.0 / (d[1] - d[0]);
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
var hubbleLaw = {measH0:0,measH0u:-2,measIntercept:0,measInterceptu:-2};
function updateHubbleLaw()
{
	hubbleLaw = determineHubbleLaw(currentHome);
	draw();
}
	
function downloadHubbleAnalysis()
{
	var idxLcl;
	var data = 'From Galaxy, H0 (km/s/Mpc), H0 Uncertainty (km/s/Mpc)\n';



	for (kLcl = 0; kLcl < listHomesMeasurements.length; kLcl++)
	{
		var law = determineHubbleLaw(listHomesMeasurements[kLcl]);
		var H0sf = sig_figs(law.measH0,law.measH0u);
		var H0intsf = sig_figs(law.measIntercept,law.measInterceptu);

		data +=
			universe[listHomesMeasurements[kLcl]]._id
			+ ', ' + H0sf.value.toFixed(H0sf.rounding)
			+ ', ' + H0sf.uncertainty.toFixed(H0sf.rounding)
			+ '\n';
	}
	download(data,"ExpansionOfUniverseH0.csv","csv");
}

var inViewList = new Array();

function getPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
{
	var xp = x *cosOrientation - y * sinOrientation;
	var yp = y * cosOrientation + x * sinOrientation;
	var xe = xp / a;
	var ye = yp / b;

	return {x: xp, xe: xe,y: yp, ye: ye};
}

function testPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
{
	var coord = getPointInEllipse(x,y,a,b,cosOrientation,sinOrientation)
	return ((coord.xe * coord.xe + coord.ye * coord.ye) <= 1.0) // point is in the ellipse
}

var viewMatrix = new ThreeMatrix();
var viewLong = 0.0;
var viewLat = 0.0;
setView(0.0,0.0);

function updateViewMatrix()
{
	var raRad = viewLong;
	var decRad = viewLat;
	var cosRA = Math.cos(raRad);
	var sinRA = Math.sin(raRad);
	var cosDec = Math.cos(decRad);
	var sinDec = Math.sin(decRad);

	var cosRAp90 = Math.cos(raRad + Math.PI * 0.5);
	var sinRAp90 = Math.sin(raRad + Math.PI * 0.5);

	var cosDecp90 = Math.cos(decRad + Math.PI * 0.5);
	var sinDecp90 = Math.sin(decRad + Math.PI * 0.5);


	var viewX = new ThreeVector(cosRA * cosDec, sinRA * cosDec, sinDec);
	var viewY = new ThreeVector(cosRAp90, sinRAp90, 0.0);
	var viewZ = new ThreeVector(cosRA * cosDecp90, sinRA * cosDecp90, sinDecp90);

	viewMatrix.setRowVector(0, viewX);
	viewMatrix.setRowVector(1, viewY);
	viewMatrix.setRowVector(2, viewZ);
//		viewMatrix.selfTranspose();
}

function setView(lat,long)
{
	if (lat < Math.PI && lat > -Math.PI)
		viewLat = lat;
	
	var vL = long % (2.0 * Math.PI);
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
	var vL = viewLong % (2.0 * Math.PI);
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
		var scaling = 1.0 / telescopes[currentTelescope]._pixelSizeSky;

		var halfTelRes = 0.5 * telescopes[currentTelescope]._CCDresolution;

		var idxLcl;
		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			if (idxLcl != currentHome)
			{
				var relPos = getRelPos(universe[currentHome]._position,universe[idxLcl]._position);

				var viewPos = viewMatrix.dot(relPos.unit); // transform relative position into view coordinates
				var angSize = universe[idxLcl]._sizeBasis / relPos.r; // radians
				var maxAngle = telescopes[currentTelescope]._FOV + angSize;
				if ((Math.abs(viewPos.theta) < maxAngle || Math.abs(viewPos.theta) > (2.0 * Math.PI - maxAngle)) &&
				Math.abs(viewPos.psi) < maxAngle) // needs to be in front of telescope
				{
					var angSizePx = angSize * scaling; // pixels
					var x = viewPos.theta * scaling; // pixels
					var y = viewPos.psi * scaling; // pixels

					var viewGalaxy = {}
					var inView = true;
					// center of the galaxy is within the field of view of the telescope
/*					if (x >= -halfTelRes && x <= halfTelRes &&
						y >= -halfTelRes && y <= halfTelRes)

					{
						inView = true;
					}
					else
					{
						var eqSize;
						var polSize;
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
							var bulgeSize = universe[idxLcl]._bulgeSize * angSizePx;
							if (polSize < bulgeSize)
								polSize = bulgeSize;
						}
						var CosOr = universe[idxLcl]._cosOrientation;
						var SinOr = universe[idxLcl]._sinOrientation;
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
						var flux = universe[idxLcl]._luminosity * Math.pow(relPos.radius * 2.06265e11,-2);
						var Mv = -2.5 * Math.log10(flux) - 26.75;


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
	var bestIdx = -1;
	var bestDist = 0;
	var relPosBest;
	var idxLcl;
	var lookPos = new ThreeVector(Math.cos(long) * Math.cos(lat),Math.sin(long) * Math.cos(lat),Math.sin(lat));
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (idxLcl != currentHome)
		{
			var relPos = getRelPos(universe[currentHome]._position,universe[idxLcl]._position);
			var relPosUnit = relPos.unit;
			var dot = relPosUnit.dot(lookPos);
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
