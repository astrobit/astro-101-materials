

var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }

var theContext = theCanvas.getContext("2d");
var timer = 0;

// random Gaussian disribution
//Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
// modified to allow a mean and standard deviation
function randn_bm(mean, stdev) { 
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * stdev / Math.PI * 0.5 + mean;
}

var H0 = (Math.random() - 0.5) * 2.0 + 72.0;
var currentHome = 0;

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


class Measurement
{
	constructor(flux, flux_u, dist, dist_u, rv, rv_u,vrot,vrot_u)
	{
		this._fromGalaxy = currentHome;
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

var measH0 = -1;
var measH0u = -1;
var measIntercept = -1;
var measInterceptu = -1;

function updateHubbleLaw()
{
	var v = new Array();
	var d = new Array();
	var idxLcl;
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (universe[idxLcl]._dist_u != -1 && universe[idxLcl]._redshift_u != -1)
		{
			v.push(universe[idxLcl]._redshift * 299792.458);
			d.push(universe[idxLcl]._dist);
		}
	}
	if (v.length > 2)
	{
		var lls = new LLS(d,v);
		measH0 = lls.slope;
		measH0u = lls.slope_uncertainty;
		measIntercept = lls.intercept;
		measInterceptu = lls.intercept_uncertainty;
	}
	else if (v.length == 2)
	{
		measH0 = (v[1] - v[0]) / (d[1] - d[0]);
		measH0u = -2;
		measIntercept = v[1] - measH0 * d[1];
		measInterceptu = -2;
	}
	draw();
}

class Galaxy
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

	constructor()
	{
		this._position = new ThreeVector((Math.random() - 0.5) * 2.0 * 1000.0, // Mpc
										(Math.random() - 0.5) * 2.0 * 1000.0, // Mpc
										(Math.random() - 0.5) * 2.0 * 1000.0); // Mpc
		this._luminosity = randL();

		this._velocityPeculiar = new ThreeVector(
										(Math.random() - 0.5) * 2.0 * 700.0, // km/s
										(Math.random() - 0.5) * 2.0 * 700.0, // km/s
										(Math.random() - 0.5) * 2.0 * 700.0); // km/s
		this._velocityPeculiarUnit = new ThreeVector(this._velocityPeculiar);
		this._velocityPeculiarUnit.selfUnit();


		this._orientation = Math.random() * 2.0 * Math.PI;
		this._cosOrientation = Math.cos(this._orientation);
		this._sinOrientation = Math.sin(this._orientation);
		this._galaxyType = Math.floor(Math.random() + 0.5); // 0 or 1
		this._sizeBasis = this._luminosity / 2.0e10 * 0.03;

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
		this.clearMeasurements();
		this._measurements = new Array();

	}

	computeValues()
	{
		this.clearMeasurements();
		var relPos = this._position.subtract(universe[currentHome]._position)
		var dist_True = relPos.radius;

		var dist = 0;
		var rv = 0;
		var vrot = 0;
		var flux = 0;

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
			if (this._measurements[idxLcl]._fromGalaxy == currentHome)
			{
				if (this._measurements[idxLcl]._dist_u != -1)
				{
					dist += this._measurements[idxLcl]._dist;
					dist_u = this._measurements[idxLcl]._dist_u;
					Ndist++;
				}
				if (this._measurements[idxLcl]._rv_u != -1)
				{
					rv += this._measurements[idxLcl]._rv;
					rv_u = this._measurements[idxLcl]._rv_u;
					Nrv++;
				}
				if (this._measurements[idxLcl]._vrot_u != -1)
				{
					vrot += this._measurements[idxLcl]._vrot;
					vrot_u = this._measurements[idxLcl]._vrot_u;
					Nvrot++;
				}
				if (this._measurements[idxLcl]._flux_u != -1)
				{
					flux += this._measurements[idxLcl]._flux;
					flux_u = this._measurements[idxLcl]._flux_u;
					Nflux++;
				}
			}
		}
		if (Ndist != 0)
			dist /= Ndist;
		if (Nrv != 0)
			rv /= Nrv;
		if (Nvrot != 0)
			vrot /= Nvrot;
		if (Nflux != 0)
			flux /= Nflux;
		for (idxLcl = 0; idxLcl < this._measurements.length; idxLcl++)
		{
			if (this._measurements[idxLcl]._fromGalaxy == currentHome)
			{
				if (this._measurements[idxLcl]._dist_u != -1)
				{
					var err = this._measurements[idxLcl]._dist - dist;
					distVar += err * err;
				}
				if (this._measurements[idxLcl]._rv_u != -1)
				{
					var err = this._measurements[idxLcl]._rv - rv;
					rvVar += err * err;
				}
				if (this._measurements[idxLcl]._vrot_u != -1)
				{
					var err = this._measurements[idxLcl]._vrot - vrot;
					vrotVar += err * err;
				}
				if (this._measurements[idxLcl]._flux_u != -1)
				{
					var err = this._measurements[idxLcl]._flux - flux;
					fluxVar += err * err;
				}
			}
		}

		if (Ndist > 1)
			dist_u = Math.sqrt(distVar / (Ndist - 1.0)) / Math.sqrt(Ndist);
		if (Nrv > 1)
			rv_u = Math.sqrt(rvVar / (Nrv - 1.0)) / Math.sqrt(Nrv);
		if (Nvrot > 1)
			vrot_u = Math.sqrt(vrotVar / (Nvrot - 1.0)) / Math.sqrt(Nvrot);
		if (Nflux > 1)
			flux_u = Math.sqrt(fluxVar / (Nflux - 1.0)) / Math.sqrt(Nflux);

// Tully-Fisher Distance
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		var dist_tf = 0;
		var dist_tf_u = -1;
		if (Nflux != 0 && Nvrot != 0 && dist_True >= 35.0)
		{
			var lum_tf =  4.0e10 * Math.pow(vrot / 200.0,4.0);
			var lum_tf_u = 4.0 * lum_tf * vrot_u / vrot;
			dist = Math.sqrt(lum_tf / flux * 0.25 / Math.PI) / 2.06265e11;
			var ul = 0.5 * lum_tf_u / lum_tf;
			var uf = 0.5 * flux_u / flux;
			dist_u = dist * Math.sqrt(ul * ul + uf * uf);
		}
		if (flux_u != -1)
		{
			this._Mv = -2.5 * Math.log10(flux) - 26.75;
			this._Mv_u = 2.5 * flux_u / flux / Math.log(10.0);
		}
		if (dist_u != -1)
		{
			this._dist = dist;
			this._dist_u = dist_u;
		}
		if (rv_u != -1)
		{
			this._redshift = rv / 299792.458;
			this._redshift_u = rv_u / 299792.458;
		}
//		console.log(this._id + ' ' + this._dist + ' ' + this._redshift + ' ' + this._redshift_u + ' ' + this._Mv);

	}

	takeImage(SN)
	{
		var relPos = this._position.subtract(universe[currentHome]._position)
		var dist = relPos.radius;
		var flux = this._luminosity * Math.pow(dist * 2.06265e11,-2) * 0.25 / Math.PI;
		var measFlux = flux * (1.0 + randn_bm(0,1.0 / SN));
		var measFlux_err = flux / SN;
		var measDist = 0;
		var measDist_err = -1;
		if (dist < 35.0)
		{
			measDist = dist * (1.0 + randn_bm(0,1.0 / SN));
			measDist_err = measDist / SN;
		}
		this._measurements.push(new Measurement(measFlux,measFlux_err,measDist,measDist_err,0,-1,0,-1));
		this.computeValues();
	}

	takeSpectrum(resolution)
	{
		var relPos = this._position.subtract(universe[currentHome]._position)
		var dist = relPos.radius;
		relPos.selfUnit();

		var ux = relPos.x;
		var uy = relPos.y;
		var uz = relPos.z;

		var vPec = this._velocityPeculiar.radius;

		var vx = this._velocityPeculiarUnit.x;
		var vy = this._velocityPeculiarUnit.y;
		var vz = this._velocityPeculiarUnit.z;

		var rv_Hubble = H0 * dist;
		var rv_pec = (vx * ux + vy * uy + vz * uz) * vPec;
		var rv = rv_Hubble + rv_pec;
		var measRv = randn_bm(rv,resolution);

		var redshift = measRv / 299792.458;

// Tully-Fisher
//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		var vrot = Math.pow(this._luminosity / 4.0e10,0.25) * 200.0;
		var measVrot = randn_bm(vrot,resolution);

		this._measurements.push(new Measurement(0,-1,0,-1,measRv,resolution,measVrot,resolution));
		this.computeValues();
	}
}


function takeImage()
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		universe[inViewList[idxLcl].idx].takeImage(50.0);
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


class Telescope
{
	constructor(name, lat, long, diameter, focalLength, CCDresolution, CCDsize, SpectrographResolution)
	{
		this._name = name;
		this._lat = lat;
		this._long = long;
		this._diameter = diameter; // in m
		this._focalLength = focalLength; // in m
		this._CCDresolution = CCDresolution; // pixels per row and column
		this._CCDsize = CCDsize; // in mm - total width of chip
		this._SpectrographResolution = SpectrographResolution;

		this._FOV = this._CCDsize / (this._focalLength * 1000.0); // in radians 
		this._FOVdegrees = this._FOV * 180.0 / Math.PI;
		this._FOVarcSec = this._FOVdegrees * 3600.0;

		this._magnification = this._focalLength * 1000.0 / this._CCDsize * this._CCDresolution;
		this._pixelSizeSky = this._FOV / this._CCDresolution; // radiansPerpixel
		this._pixelSizeSkyDegrees = this._pixelSizeSky * 180.0 / Math.PI;
		this._pixelSizeSkyarcSec = this._pixelSizeSkyDegrees * 3600.0;
	}
}
var telescopes = new Array();
telescopes.push(new Telescope("the Telescope", 0.0, 0.0, 15.0, 15.0, 2048, 2048 * 0.024, 45000));



var universe = new Array();
var viewLong = 0.0;
var viewLat = 0.0;

function createUniverse()
{
	var debug = false;
	var home = new Galaxy();
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
		var tempX = new Galaxy();
		tempX._position.x = 100;
		tempX._position.y = 0;
		tempX._position.z = 0;
		tempX._id = 'Test x';
		universe.push(tempX);

		var tempMX = new Galaxy();
		tempMX._position.x = -100;
		tempMX._position.y = 0;
		tempMX._position.z = 0;
		tempMX._id = 'Test -x';
		universe.push(tempMX);

		var tempZ = new Galaxy();
		tempZ._position.x = 0;
		tempZ._position.y = 0;
		tempZ._position.z = 100;
		tempZ._id = 'Test Z';
		universe.push(tempZ);

		var tempMZ = new Galaxy();
		tempMZ._position.x = 0;
		tempMZ._position.y = 0;
		tempMZ._position.z = -100;
		tempMZ._id = 'Test -Z';
		universe.push(tempMZ);

		var tempY = new Galaxy();
		tempY._position.x = 0;
		tempY._position.y = 100;
		tempY._position.z = 0;
		tempY._id = 'Test Y';
		universe.push(tempY);

		var tempMY = new Galaxy();
		tempMY._position.x = 0;
		tempMY._position.y = -100;
		tempMY._position.z = 0;
		tempMY._id = 'Test -Y';
		universe.push(tempMY);
	}
	else
	{
		var idxLcl;
		for (idxLcl = 0; idxLcl < 999; idxLcl++)
		{
			universe.push(new Galaxy());
		}
	}
}


var latDir = 0.0;
var longDir = 0.0;
var slew = 32.0;





function moveHome(toMW)
{
	var idxLcl;
	if (toMW)
	{
		currentHome = 0;
	}
	else
	{
		class GalData
		{
			constructor (i,d)
			{
				this._i = i;
				this._d = d;
			}
		};
		var nearestList = new Array();

		var u = Math.random();
		while (u == 0) Math.random();

		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			var relPos = universe[idxLcl]._position.subtract(universe[currentHome]._position);
			if (idxLcl != currentHome)
				nearestList.push(new GalData(idxLcl,relPos.radius));

			universe[idxLcl].clearMeasurements();
		}
		nearestList.sort(function(a, b){return a._d - b._d});

		var nearIdx = Math.round(u * 15);
		currentHome = nearestList[nearIdx]._i;
	}
	viewLong = 0.0;
	viewLat = 0.0;

	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		if (buttons[idxLcl]._text == "Find Milky Way")
		{
			buttons[idxLcl]._disabled = currentHome == 0;
		}
		if (buttons[idxLcl]._text == "Return to the Milky Way")
		{
			buttons[idxLcl]._disabled = currentHome == 0;
		}
	}
	measH0 = -1;
	measH0u = -1;
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		universe[idxLcl].computeValues();
	}
	updateHubbleLaw();
	draw();
}
function findHome()
{
	if (currentHome != 0)
	{
		var relPos = new ThreeVector(universe[currentHome]._position);
		relPos.selfScale(-1.0);
//		var x = relPos.x;
//		var y = relPos.y;
//		var z = relPos.z;
//		var dist = relPos.radius;
		viewLong = relPos.theta;//Math.atan2(y,x);
		viewLat = relPos.psi;//Math.asin(z / dist);
	}
	draw();
}





buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,50,"🡡",50,function(){latDir = 1;},function(){latDir = 0;},function(){return latDir == 1;},true,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,150,"🡣",50,function(){latDir = -1;},function(){latDir = 0;},function(){return latDir == -1;},true,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 425,100,"🡢",50,function(){longDir = 1;},function(){longDir = 0;},function(){return longDir == 1;},true,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 325,100,"🡠",50,function(){longDir = -1;},function(){longDir = 0;},function(){return longDir == -1;},true,false,false));

buttons.push(new Button(theContext, theCanvas.width * 0.5 + 325,210,"Fast",40,function(){slew = 32.0},function(){},function(){return slew == 32.0;},false,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 425,210,"Slow",40,function(){slew = 1.0},function(){},function(){return slew == 1.0;},false,false,false));

buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,260,"Find Milky Way",40,findHome,function(){},function(){return this._isDown;},false,false,true));

buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,355,"Take Image",40,takeImage,function(){},function(){return this._isDown;},false,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,410,"Take Spectrum",40,takeSpectrum,function(){},function(){return this._isDown;},false,false,false));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 375,465,"Download Measurements",30,downloadMeasurements,function(){},function(){return this._isDown;},false,false,false));
buttons.push(new Button(theContext, 175,350,"Download Dist/Vel Data",30,downloadAnalysis,function(){},function(){return this._isDown;},false,false,false));
buttons.push(new Button(theContext, 175,400,"Download Hubble Data",30,downloadHubbleAnalysis,function(){},function(){return this._isDown;},false,false,false));

buttons.push(new Button(theContext, theCanvas.width * 0.5 - 105,775,"Return to the Milky Way",24,function(){moveHome(true);},function(){},function(){return this._isDown;},false,false,true));
buttons.push(new Button(theContext, theCanvas.width * 0.5 + 105,775,"Move to a New Galaxy",24,function(){moveHome(false);},function(){},function(){return this._isDown;},false,false,false));


function downloadMeasurements()
{
	var idxLcl;
	var data = 'Galaxy, From Galaxy, Flux, Flux Uncertainty, Cepheid Distance, Cepheid Distance Uncertainty, Radial Velocity, Radial Velocity Uncertainty, Rotational Velocity, Rotational Velocity Uncertainty\n';
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		var jLcl;
		for (jLcl = 0; jLcl < universe[idxLcl]._measurements.length; jLcl++)
		{
			data += universe[idxLcl]._id + ', ' + universe[universe[idxLcl]._measurements[jLcl]._fromGalaxy]._id
			+ ', ' + universe[idxLcl]._measurements[jLcl]._flux
			+ ', ' + universe[idxLcl]._measurements[jLcl]._flux_u
			+ ', ' + universe[idxLcl]._measurements[jLcl]._dist
			+ ', ' + universe[idxLcl]._measurements[jLcl]._dist_u
			+ ', ' + universe[idxLcl]._measurements[jLcl]._rv
			+ ', ' + universe[idxLcl]._measurements[jLcl]._rv_u
			+ ', ' + universe[idxLcl]._measurements[jLcl]._vrot
			+ ', ' + universe[idxLcl]._measurements[jLcl]._vrot_u
			+ '\n';
		}
	}
	download(data,"ExpansionOfUniverseMeasurements.csv","csv");
}
function downloadAnalysis()
{
	var idxLcl;
	var data = 'Galaxy, From Galaxy, Distance, Distance Uncertainty, Radial Velocity, Radial Velocity Uncertainty, V Magnitude, V Magnitude Uncertainty, Redshift\n';
	var listHomes = new Array();
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		var jLcl;
		for (jLcl = 0; jLcl < universe[idxLcl]._measurements.length; jLcl++)
		{
			var found = false;
			for (kLcl = 0; kLcl < listHomes.length && !found; kLcl++)
			{
				found = universe[idxLcl]._measurements[jLcl]._fromGalaxy == listHomes[kLcl];
			}
			if (!found)
			{
				listHomes.push(universe[idxLcl]._measurements[jLcl]._fromGalaxy);
			}
		}
	}
	var saveCurrentHome = currentHome;

	for (kLcl = 0; kLcl < listHomes.length; kLcl++)
	{
		currentHome = listHomes[kLcl];
		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			universe[idxLcl].computeValues();
			if (universe[idxLcl]._dist_u != -1 || universe[idxLcl]._redshift_u != -1 || universe[idxLcl]._Mv_u != -1)
			{
				data += universe[idxLcl]._id
				+ ', ' + universe[currentHome]._id
				+ ', ' + universe[idxLcl]._dist
				+ ', ' + universe[idxLcl]._dist_u
				+ ', ' + universe[idxLcl]._redshift * 299792.458
				+ ', ' + universe[idxLcl]._redshift_u * 299792.458
				+ ', ' + universe[idxLcl]._Mv
				+ ', ' + universe[idxLcl]._Mv_u
				+ ', ' + universe[idxLcl]._redshift
				+ ', ' + universe[idxLcl]._redshift_u
				+ '\n';
			}
		}
	}
	download(data,"ExpansionOfUniverseAnalysis.csv","csv");
}

function downloadHubbleAnalysis()
{
	var idxLcl;
	var data = 'Galaxy, From Galaxy, Distance, Distance Uncertainty, Radial Velocity, Radial Velocity Uncertainty, V Magnitude, V Magnitude Uncertainty, Redshift\n';
	var listHomes = new Array();
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		var jLcl;
		for (jLcl = 0; jLcl < universe[idxLcl]._measurements.length; jLcl++)
		{
			var found = false;
			for (kLcl = 0; kLcl < listHomes.length && !found; kLcl++)
			{
				found = universe[idxLcl]._measurements[jLcl]._fromGalaxy == listHomes[kLcl];
			}
			if (!found)
			{
				listHomes.push(universe[idxLcl]._measurements[jLcl]._fromGalaxy);
			}
		}
	}
	var saveCurrentHome = currentHome;
	class HubbleData
	{
		constructor(fromGalaxy, H0, H0_u)
		{
			this._fromGalaxy = fromGalaxy;
			this._H0 = H0;
			this._H0_u = H0_u;
		}
	}
	var hubbleData = new Array();

	for (kLcl = 0; kLcl < listHomes.length; kLcl++)
	{
		currentHome = listHomes[kLcl];
		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			universe[idxLcl].computeValues();
		}
		updateHubbleLaw();
		hubbleData.push(new HubbleData(universe[currentHome]._id,measH0,measH0u));
	}

	data = 'From Galaxy, H0, H0 Uncertainty\n';
	for (idxLcl = 0; idxLcl < hubbleData.length; idxLcl++)
	{
		data +=
			hubbleData[idxLcl]._fromGalaxy
			+ ', ' + hubbleData[idxLcl]._H0
			+ ', ' + hubbleData[idxLcl]._H0_u
			+ '\n';
	}
	download(data,"ExpansionOfUniverseH0.csv","csv");

	currentHome = saveCurrentHome;
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		universe[idxLcl].computeValues();
		updateHubbleLaw();
	}
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

function checkUpdate()
{
	if (latDir != 0 || longDir != 0)
	{
		viewLat += latDir * Math.PI / 960.0 * slew;
		viewLong += longDir * Math.PI / 960.0 * slew;
		if (viewLat > (Math.PI * 0.5))
			viewLat = (Math.PI * 0.5);
		if (viewLat < (-Math.PI * 0.5))
			viewLat = (-Math.PI * 0.5);
		var vL = viewLong % (2.0 * Math.PI);
		if (vL < 0.0)
			vL += 2.0 * Math.PI;
		viewLong = vL;
		update = true;
	}
	if (update)
	{
		update = false;
		inViewList = new Array();

        var cosLong = Math.cos(viewLong);
        var sinLong = Math.sin(viewLong);
        var cosLat = Math.cos(viewLat);
		var sinLat = Math.sin(viewLat);

		var cosLongp90 = Math.cos(viewLong + Math.PI*0.5);
		var sinLongp90 = Math.sin(viewLong + Math.PI * 0.5);


		var viewZ = new ThreeVector(cosLong * cosLat, sinLong * cosLat, sinLat);
        //viewZ.selfScale(-1.0); // make sure it is unit
		var viewX = new ThreeVector(cosLongp90, sinLongp90, 0.0);
		var viewY = viewZ.cross(viewX);

		var viewMatrix = new ThreeMatrix();
		viewMatrix.setRowVector(0, viewX);
		viewMatrix.setRowVector(1, viewY);
		viewMatrix.setRowVector(2, viewZ);

		const kRadians = Math.PI / 180.0;
		const kDegrees = 180.0 / Math.PI;

		var halfTelRes = 0.5 * telescopes[0]._CCDresolution;

		var idxLcl;
		for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
		{
			if (idxLcl != currentHome)
			{
				var relPos = universe[idxLcl]._position.subtract(universe[currentHome]._position);
	//			var x = universe[idxLcl]._x - universe[currentHome]._x;
	//			var y = universe[idxLcl]._y - universe[currentHome]._y;
	//			var z = universe[idxLcl]._z - universe[currentHome]._z;
	//			var dist = Math.sqrt(x * x + y * y + z * z);
	//			var long = relPos.theta; //Math.atan2(universe[idxLcl]._y - universe[currentHome]._y,universe[idxLcl]._x - universe[currentHome]._x);
	//			var lat = relPos.psi;//Math.asin(z / dist);

				var viewPos = viewMatrix.dot(relPos.unit); // transform relative position into view coordinates
				if (viewPos.psi > 0.0) // needs to be in front of telescope
				{
					var scalar = (0.5 * Math.PI - viewPos.psi) / telescopes[0]._pixelSizeSky;
					viewPos.selfScale(scalar);

		//				var invDist = 1.0 / relPos.radius;
		//				var angSize = universe[idxLcl]._sizeBasis * invDist; // calculate the angular size of the object on the sky
					var angSizePx =  1.0 / (telescopes[0]._pixelSizeSky * relPos.radius); // calculate the size of the object on the sky in pixels
					var viewGalaxy = {}
					var inView = false;
					// center of the galaxy is within the field of view of the telescope
					if (viewPos.x >= -halfTelRes && viewPos.x <= halfTelRes &&
						viewPos.y >= -halfTelRes && viewPos.y <= halfTelRes)

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
						inView = testPointInEllipse(-telescopes[0]._CCDresolution * 0.5 - viewPos.x,-telescopes[0]._CCDresolution * 0.5 - viewPos.y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(telescopes[0]._CCDresolution * 0.5 - viewPos.x,-telescopes[0]._CCDresolution * 0.5 - viewPos.y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(telescopes[0]._CCDresolution * 0.5 + viewPos.x,-telescopes[0]._CCDresolution * 0.5 - viewPos.y,eqSize,polSize,CosOr,SinOr);
						if (!inView)
							inView = testPointInEllipse(-telescopes[0]._CCDresolution * 0.5 + viewPos.x,-telescopes[0]._CCDresolution * 0.5 - viewPos.y,eqSize,polSize,CosOr,SinOr);
					}

					if (inView)
					{
						viewGalaxy.idx = idxLcl;
						viewGalaxy.x = viewPos.x;
						viewGalaxy.y = -viewPos.y;
						var flux = universe[idxLcl]._luminosity * Math.pow(relPos.radius * 2.06265e11,-2);
						var Mv = -2.5 * Math.log10(flux) - 26.75;


						viewGalaxy.pixelScale = angSizePx;
						viewGalaxy.bright = (20.0 - Mv) / 3.0;
						inViewList.push(viewGalaxy);
					}
				}
			}
		}
		draw();
	}
	window.setTimeout(checkUpdate, 1000.0/30.0);

}

window.setTimeout(checkUpdate, 1000.0/30.0);
createUniverse();
update = true;
