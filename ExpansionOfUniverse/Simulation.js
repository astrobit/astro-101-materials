

var theCanvas = document.getElementById("theCanvas");

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
		this._x = (Math.random() - 0.5) * 2.0 * 1000.0; // Mpc
		this._y = (Math.random() - 0.5) * 2.0 * 1000.0; // Mpc
		this._z = (Math.random() - 0.5) * 2.0 * 1000.0; // Mpc
		this._luminosity = randL();

		this._vpec_x = (Math.random() - 0.5) * 2.0 * 700.0; // km/s
		this._vpec_y = (Math.random() - 0.5) * 2.0 * 700.0; // km/s
		this._vpec_z = (Math.random() - 0.5) * 2.0 * 700.0; // km/s

		this._orientation = Math.random() * Math.PI;
		this._galaxyType = Math.floor(Math.random() + 0.5); // 0 or 1
		this._sizeBasis = this._luminosity / 2.0e10 * 0.03;

		if (this._galaxyType == 0) // elliptical
		{
			this._radiusEquatorial = this._sizeBasis;
			this._radiusPolar = this._sizeBasis * (Math.random() * 0.25 + 0.75);
		}
		else
		{
			this._bulgeSize = this._sizeBasis * (Math.random() * 0.25 + 0.75);
			this._diskSize = this._sizeBasis;
			this._orientationFace = Math.random() * Math.PI;
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
		var x = this._x - universe[currentHome]._x;
		var y = this._y - universe[currentHome]._y;
		var z = this._z - universe[currentHome]._z;
		var dist_True = Math.sqrt(x * x + y * y + z * z);

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
		var x = this._x - universe[currentHome]._x;
		var y = this._y - universe[currentHome]._y;
		var z = this._z - universe[currentHome]._z;
		var dist = Math.sqrt(x * x + y * y + z * z);
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
		var x = this._x - universe[currentHome]._x;
		var y = this._y - universe[currentHome]._y;
		var z = this._z - universe[currentHome]._z;
		var dist = Math.sqrt(x * x + y * y + z * z);

		var ux = x / dist;
		var uy = y / dist;
		var uz = z / dist;

		var vPec = Math.sqrt(this._vpec_x * this._vpec_x + this._vpec_y * this._vpec_y + this._vpec_z * this._vpec_z);

		var vx = this._vpec_x / vPec;
		var vy = this._vpec_y / vPec;
		var vz = this._vpec_z / vPec;

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
	for (idxLcl = 0; idxLcl < inView.length; idxLcl++)
	{
		universe[inView[idxLcl]].takeImage(50.0);
	}
	updateHubbleLaw();
}


function takeSpectrum()
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < inView.length; idxLcl++)
	{
		universe[inView[idxLcl]].takeSpectrum(10.0);
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
			this._diameter = diameter;
			this._focalLength = focalLength;
			this._CCDresolution = CCDresolution;
			this._CCDsize = CCDsize;
			this._SpectrographResolution = SpectrographResolution;

			this._magnification = this._focalLength * 1000.0 / this._CCDsize * this._CCDresolution;
		}
	}
	var telescopes = new Array();
	telescopes.push(new Telescope("the Telescope", 0.0, 0.0, 15.0, 15.0, 2048, 2048 * 0.024, 45000));



var universe = new Array();
var viewLong = 0.0;
var viewLat = 0.0;

function createUniverse()
{
	var home = new Galaxy();
	home._x = 0;
	home._y = 0;
	home._z = 0;
	home._id = 'Milky Way';
	universe.push(home);
	var idxLcl;
	for (idxLcl = 0; idxLcl < 999; idxLcl++)
	{
		universe.push(new Galaxy());
	}
}// JavaScript source code



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
			var x = universe[idxLcl]._x - universe[currentHome]._x;
			var y = universe[idxLcl]._y - universe[currentHome]._y;
			var z = universe[idxLcl]._z - universe[currentHome]._z;
			var dist = Math.sqrt(x * x + y * y + z * z);
			if (idxLcl != currentHome)
				nearestList.push(new GalData(idxLcl,dist));

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
		var x = universe[0]._x - universe[currentHome]._x;
		var y = universe[0]._y - universe[currentHome]._y;
		var z = universe[0]._z - universe[currentHome]._z;
		var dist = Math.sqrt(x * x + y * y + z * z);
		viewLong = Math.atan2(y,x);
		viewLat = Math.asin(z / dist);
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
		draw();
	}
	window.setTimeout(checkUpdate, 1000.0/30.0);

}

window.setTimeout(checkUpdate, 1000.0/30.0);
createUniverse();
update = true;
