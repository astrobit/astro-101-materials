class OrbitalPosition
{
	constructor(meanLongitude,meanAnomaly,eccentricAnomaly,trueAnomaly,longMascNode,helioLongitude,helioRadius,helioLatitude,helioLongitudeProjected,radiusProjected)
	{
		this.meanLongitude = meanLongitude;
		this.meanAnomaly = meanAnomaly;
		this.eccentricAnomaly = eccentricAnomaly;
		this.trueAnomaly = trueAnomaly;
		this.longMascNode = longMascNode;
		this.helioLongitude = helioLongitude;
		this.helioRadius = helioRadius;
		this.helioLatitude = helioLatitude
		this.helioLongitudeProjected = helioLongitudeProjected;
		this.radiusProjected = radiusProjected;
	}
	
}

class OrbitalParameters
{
	constructor(epoch, semiMajorAxis,periodYears,orbitalEccentricity,meanLongitude,longitudeAscendingNode,longitudePerihelion,orbitalInclination)
	{
		this._degrees = 180.0 / Math.PI;
		this._radians = Math.PI / 180.0;

		this.semiMajorAxis = semiMajorAxis;
		this.orbitalEccentricity = orbitalEccentricity;
		this.periodYears = periodYears;
		this.epoch = epoch;

		this._meanLongitude = meanLongitude;
		this._longitudePerihelion = longitudePerihelion;
		this._longitudeAscendingNode = longitudeAscendingNode;
		this._orbitalInclination = orbitalInclination;

		if (this._meanLongitude === undefined || this._meanLongitude === null)
			this._meanLongitudeDegrees = null;
		else
			this._meanLongitudeDegrees = this._meanLongitude * this._degrees;
		if (this._longitudePerihelion === undefined || this._longitudePerihelion === null)
			this._longitudePerihelionDegrees = null;
		else
			this._longitudePerihelionDegrees = this._longitudePerihelion * this._degrees;
		if (this._longitudeAscendingNode === undefined || this._longitudeAscendingNode === null)
			this._longitudeAscendingNodeDegrees = null;
		else
			this._longitudeAscendingNodeDegrees = this._longitudeAscendingNode * this._degrees;
		if (this._orbitalInclination === undefined || this._orbitalInclination === null)
			this._orbitalInclinationDegrees = null;
		else
			this._orbitalInclinationDegrees = this._orbitalInclination * this._degrees;

	}
	get meanLongitude()
	{
		return this._meanLongitude;
	}
	set meanLongitude(value)
	{
		this._meanLongitude = value;
		this._meanLongitudeDegrees = this._meanLongitude * this._degrees;
	}
	get meanLongitudeDegrees()
	{
		return this._meanLongitudeDegrees;
	}
	set meanLongitudeDegrees(value)
	{
		this._meanLongitudeDegrees = value;
		this._meanLongitude = this._meanLongitudeDegrees * this._radians;
	}
	get longitudePerihelion()
	{
		return this._longitudePerihelion;
	}
	set longitudePerihelion(value)
	{
		this._longitudePerihelion = value;
		this._longitudePerihelionDegrees = this._longitudePerihelion * this._degrees;
	}
	get longitudePerihelionDegrees()
	{
		return this._longitudePerihelionDegrees;
	}
	set longitudePerihelionDegrees(value)
	{
		this._longitudePerihelionDegrees = value;
		this._longitudePerihelion = this._longitudePerihelionDegrees * this._radians;
	}
	get longitudeAscendingNode()
	{
		return this._longitudeAscendingNode;
	}
	set longitudeAscendingNode(value)
	{
		this._longitudeAscendingNode = value;
		this._longitudeAscendingNodeDegrees = this._longitudeAscendingNode * this._degrees;
	}
	get longitudeAscendingNodeDegrees()
	{
		return this._longitudeAscendingNodeDegrees;
	}
	set longitudeAscendingNodeDegrees(value)
	{
		this._longitudeAscendingNodeDegrees = value;
		this._longitudeAscendingNode = this._longitudeAscendingNodeDegrees * this._radians;
	}
	get orbitalInclination()
	{
		return this._orbitalInclination;
	}
	set orbitalInclination(value)
	{
		this._orbitalInclination = value;
		this._orbitalInclinationDegrees = this._orbitalInclination * this._degrees;
	}
	get orbitalInclinationDegrees()
	{
		return this._orbitalInclinationDegrees;
	}
	set orbitalInclinationDegrees(value)
	{
		this._orbitalInclinationDegrees = value;
		this._orbitalInclination = this._orbitalInclinationDegrees * this._radians;
	}

	getOrbitalPosition(jd)
	{
		const radians = Math.PI / 180.0;
		const degrees = 180.0 / Math.PI;
//		let meanLongitudeRadians = meanLongitude * radians;
//		let longitudePerihelionRadians = longitudePerihelion * radians;
//		let longitudeAscendingNodeRadians = longitudeAscendingNode * radians;
//		let orbitalInclinationRadians = orbitalInclination * radians;


		const meanLongitude = 2.0 * Math.PI / 365.242191 * (jd - this.epoch) / this.periodYears + this._meanLongitude;
		const meanAnomaly = meanLongitude - this._longitudePerihelion;

		// solve for Eccentric Anomaly using Netwon-Raphson
		let E = meanAnomaly;
		let y = E - this.orbitalEccentricity * Math.sin(E) - meanAnomaly;
		let dy = 1.0 - this.orbitalEccentricity * Math.cos(E);
		let del = y / dy;
		while (Math.abs(y) > 0.0000001)
		{
			E -= del;
			y = E - this.orbitalEccentricity * Math.sin(E) - meanAnomaly;
			dy = 1.0 - this.orbitalEccentricity * Math.cos(E);
			del = y / dy;
		} 
		E -= del;
		const eccentricAnomaly = E;
		// calculate true anomaly
		const tanNuover2 = Math.tan(E * 0.5) * Math.sqrt((1.0 + this.orbitalEccentricity) / (1.0 - this.orbitalEccentricity));
		const trueAnomaly = Math.atan(tanNuover2) * 2.0;
		// calculate true heliocentric longitude
		const helioLongitude = trueAnomaly + this._longitudePerihelion;
		// calculate actual radius
		const helioRadius = this.semiMajorAxis * (1.0 - this.orbitalEccentricity * this.orbitalEccentricity) / (1.0 + this.orbitalEccentricity * Math.cos(trueAnomaly))
		const longMascNode = helioLongitude - this._longitudeAscendingNode;
		// calculate 
		const helioLatitude = Math.asin(Math.sin(longMascNode) * Math.sin(this._orbitalInclination));
		const helioLongitudeProjected = Math.atan(Math.tan(longMascNode) * Math.cos(this._orbitalInclination)) + this._longitudeAscendingNode;
		const radiusProjected = helioRadius * Math.cos(helioLatitude);
		
		return new OrbitalPosition(meanLongitude,meanAnomaly,eccentricAnomaly,trueAnomaly,longMascNode,helioLongitude,helioRadius,helioLatitude,helioLongitudeProjected,radiusProjected)
	}
}

// data source:
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/fact_notes.html
function interpretVSOP2013Parameters(params)
{
	const longitudePerihelion = Math.atan2(params.h0,params.k0);
	const longitudeAscendingNode = Math.atan2(params.q0,params.p0);
	const orbitalEccentricity = params.k0 / Math.cos(longitudePerihelion);
	const orbitalInclination = Math.asin(2.0 * params.q0 * Math.cos(longitudeAscendingNode));

	const ret = new OrbitalParameters(params.epoch,
									params.a0, // semi-Major axis
									2.0 * Math.PI / params.n * 1000.0, // period
									orbitalEccentricity,
									params.lambda0, // mean longitude
									longitudeAscendingNode,
									longitudePerihelion,
									orbitalInclination);
//	ret.semiMajorAxis = params.a0;
//	ret.meanLongitude = params.lambda0;
//	ret.longitudePerihelion = Math.atan2(params.h0,params.k0);
//	ret.longitudeAscendingNode = Math.atan2(params.q0,params.p0);
//	ret.orbitalEccentricity = params.k0 / Math.cos(ret.longitudePerihelion);
//	ret.orbitalInclination = Math.asin(2.0 * params.q0 * Math.cos(ret.longitudeAscendingNode));
//	ret.periodYears = 

//	ret.meanLongitudeDegrees = ret.meanLongitude * degrees;
//	ret.longitudePerihelionDegrees = ret.longitudePerihelion * degrees;
//	ret.longitudeAscendingNodeDegrees = ret.longitudeAscendingNode * degrees;
//	ret.orbitalInclinationDegrees = ret.orbitalInclination * degrees;

//	ret.epoch = params.epoch;
	return ret;
}

const VSOP2013 =
{
	Mercury:	{a0: 0.3870983099,	lambda0: 4.4026086317, k0: 0.0446606294,	h0: 0.2007233087,	q0: 0.0406156406,	p0: 0.0456354933,	n: 26087.9031406855, epoch:2451544.0},
	Venus:		{a0: 0.7233298199,	lambda0: 3.1761344616, k0: -0.0044928210,	h0:  0.0050668515,	q0: 0.0068241139,	p0: 0.0288228192,	n: 10213.2855474344, epoch:2451544.0},
	EMB:		{a0: 1.0000010176,	lambda0: 1.7534703694, k0: -0.0037408181,	h0: 0.0162844892,	q0: -0.0000000014,	p0: -0.0000000010,	n: 6283.0758503532, epoch:2451544.0},
	Mars:		{a0: 1.5236793402,	lambda0: 6.2035000141, k0: 0.0853655932,	h0: -0.0378997092,	q0: 0.0104704280,	p0: 0.0122844865,	n: 3340.6124341455, epoch:2451544.0},
	Jupiter:	{a0: 5.2026032063,	lambda0: 0.5995461070, k0: 0.0469858470,	h0: 0.0120037197,	q0: -0.0020656227,	p0: 0.0111838646,	n: 529.6909615623, epoch:2451544.0},
	Saturn:		{a0: 9.5549103860,	lambda0: 0.8740185101, k0: -0.0029599134,	h0: 0.0554296361,	q0: -0.0087174559,	p0: 0.0198914362,	n: 213.2990861085, epoch:2451544.0},
	Uranus:		{a0: 19.2184385555,	lambda0: 5.4812253957, k0: -0.0459530748,	h0: 0.0056483402,	q0: 0.0018592408,	p0: 0.0064860185,	n: 74.7816590308, epoch:2451544.0},
	Neptune:	{a0: 30.1104159870,	lambda0: 5.3118979332, k0: 0.0059988382,	h0: 0.0066918100,	q0: -0.0102914751,	p0: 0.0115167667,	n: 38.1329722261, epoch:2451544.0}
}

const VSOP2013readable = {
	Mercury: interpretVSOP2013Parameters(VSOP2013.Mercury),
	Venus: interpretVSOP2013Parameters(VSOP2013.Venus),
	EMB: interpretVSOP2013Parameters(VSOP2013.EMB),
	Mars: interpretVSOP2013Parameters(VSOP2013.Mars),
	Jupiter: interpretVSOP2013Parameters(VSOP2013.Jupiter),
	Saturn: interpretVSOP2013Parameters(VSOP2013.Saturn),
	Uranus: interpretVSOP2013Parameters(VSOP2013.Uranus),
	Neptune: interpretVSOP2013Parameters(VSOP2013.Neptune),
}


let g_earthDataLast;
let g_earthDataJDLast = -1000000000000;
function getOrbitalPositionEarth(jd)
{
	if (jd != g_earthDataJDLast)
	{
		g_earthDataLast = Planets.Earth.orbitalParameters.getOrbitalPosition(jd); 
		g_earthDataJDLast = jd;
	}
	return g_earthDataLast;
}



class PlanetView
{
	constructor()
	{
		this.planetHelio = new ThreeVector();
		this.matrixGeo = new ThreeMatrix();
		this.matrixPlanet = new ThreeMatrix();
	}
	calculateViewingParameters(earthHelio,planetHelio,semiMajorAxis,meanRadius,polarRadius,equatorialRadius,Vmag,style,image)
	{
		this.style = style;
		this.image = image;
		this.planetHelio.selfCopy(planetHelio);
		this.planetEarthHelio = planetHelio.subtract(earthHelio);

		// create matrix for ecliptic coordinate system
		this.matrixGeo.loadBasis(earthHelio,null,LinAlg.unitZ)
		this.matrixGeo.selfTranspose();

		this.planetEarthGeo = this.matrixGeo.dot(this.planetEarthHelio);

		// create matrix for determining phase
		this.matrixPlanet.loadBasis(planetHelio,null,LinAlg.unitZ)
		this.matrixPlanet.selfTranspose();

		this.earthPlanetGeo = this.matrixPlanet.dot(this.planetEarthHelio.scale(-1.0));


		this.dist =this.planetEarthHelio.radius;
		this.elongLong = this.planetEarthGeo.theta + Math.PI;
		this.elongLat = this.planetEarthGeo.psi;
		if (semiMajorAxis < 1.0)
			this.angSizeAvg = meanRadius / (1.495978707e8);
		else
			this.angSizeAvg = meanRadius / (semiMajorAxis * 1.495978707e8);

		this.angSizePolar = polarRadius / (this.planetEarthHelio.radius * 1.495978707e8);
		this.angSizeEq = equatorialRadius / (this.planetEarthHelio.radius * 1.495978707e8);
		// get the Earth's elongation longitude and latitude from the point of view of the planet
		this.earthLongitudePlanet = this.earthPlanetGeo.theta;
		this.earthLatitudePlanet = this.earthPlanetGeo.psi;

		this.phase = (-this.earthPlanetGeo.theta / Math.PI * 4.0) % 8.0;
		if (this.phase < 0.0)
			this.phase += 8.0;
		if (this.phase <= 4.0)
			this.illuminationFraction = this.phase * 0.25;
		else
			this.illuminationFraction = 2.0 - this.phase * 0.25;
		if (this.illuminationFraction > 0.0)
			this.appBright = 5.0 * Math.log10(this.planetHelio.radius * this.planetEarthGeo.radius / Math.sqrt(this.illuminationFraction)) + Vmag;
		else
			this.appBright = 100.0;

		if (this.planetEarthGeo.theta > 0.0)
			this.brightLimbPositionAngle = Math.PI + this.planetEarthGeo.psi;
		else
			this.brightLimbPositionAngle = -this.planetEarthGeo.psi;
		if (this.brightLimbPositionAngle < 0.0)
			this.brightLimbPositionAngle += Math.PI * 2.0;

	}
}
class PlanetData
{
	constructor(mass, eqrad,polrad,meanrad,density,gm,bondAlbedo,geoAlbedo,Vmag,obliquity,sidPeriodRot,synPeriodRot,orbitalParameters,averageColor)
	{
		this.mass = mass; // x10^24 kg
		this.eqrad = eqrad; // km
		this.polrad = polrad; // km
		this.meanrad = meanrad; // km
		this.density = density; // km/m^3
		this.gm = gm; // 10^6 km^3/s^2
		this.bondAlbedo = bondAlbedo;
		this.geoAlbedo = geoAlbedo;
		this.Vmag = Vmag;
		this.obliquity = obliquity; // degrees
		this.sidPeriodRot = sidPeriodRot; // hours
		this.synPeriodRot = synPeriodRot; // hours
		this.orbitalParameters = orbitalParameters;
		this.averageColor = averageColor;

	}

	getSimplePosition(jd)
	{
		const orbPos = this.orbitalParameters.getOrbitalPosition(jd); 
		const orbPosEarth = getOrbitalPositionEarth(jd); // note: a bit of a circular reference here

		const earthHelio = new ThreeVector(Math.cos(orbPosEarth.meanLongitude), Math.sin(orbPosEarth.meanLongitude), 0.0);

		const planetHelio = new ThreeVector(this.orbitalParameters.semiMajorAxis * Math.cos(orbPos.meanLongitude), this.orbitalParameters.semiMajorAxis * Math.sin(orbPos.meanLongitude), 0.0);

		let vp = new PlanetView();
		vp.calculateViewingParameters(earthHelio,planetHelio,this.orbitalParameters.semiMajorAxis,this.meanrad,this.polrad,this.eqrad,this.Vmag,this.averageColor,null)

		return vp;
	}
	getTruePosition(jd)
	{
		const orbPos = this.orbitalParameters.getOrbitalPosition(jd); 
		const orbPosEarth = getOrbitalPositionEarth(jd); 

		const earthHelio = new ThreeVector(Math.cos(orbPosEarth.helioLongitude) * Math.cos(orbPosEarth.helioLatitude), Math.sin(orbPosEarth.helioLongitude) * Math.cos(orbPosEarth.helioLatitude), Math.sin(orbPosEarth.helioLatitude));
		earthHelio.selfScale(orbPosEarth.helioRadius);
		const planetHelio = new ThreeVector(Math.cos(orbPos.helioLongitude) * Math.cos(orbPos.helioLatitude), Math.sin(orbPos.helioLongitude) * Math.cos(orbPos.helioLatitude), Math.sin(orbPos.helioLatitude));
		planetHelio.selfScale(orbPos.helioRadius);

		let vp = new PlanetView();
		vp.calculateViewingParameters(earthHelio,planetHelio,this.orbitalParameters.semiMajorAxis,this.meanrad,this.polrad,this.eqrad,this.Vmag,this.averageColor,null)

		return vp;
	}
}

const Planets = {
	Mercury: new PlanetData(
	0.33011, // mass
	2439.7,// equatorial radius
	2439.7,// polar radius
	2439.7,// volumetric mean radius
	5427,// mean density 
	0.022032,// GM
	0.068,// bond albedo
	0.142,// geometric albedo
	-0.613,// V: V magnitude at distance of 1 au with full illumination
	0.034,// obliquity
	1407.6, // sidPeriodRot
	4222.6, //synPeriodRot
	VSOP2013readable.Mercury,// epoch
//	VSOP2013readable.Mercury.epoch,// epoch
//	VSOP2013readable.Mercury.semiMajorAxis,// semiMajorAxis
//	VSOP2013readable.Mercury.periodYears,//87.968/365.242191,// tropPeriod
//	VSOP2013readable.Mercury.orbitalEccentricity,//0.20563069,// orbitalEccentricity
//	VSOP2013readable.Mercury.orbitalInclinationDegrees,//7.00487,// orbitalInclination
//	VSOP2013readable.Mercury.longitudeAscendingNodeDegrees,//48.33167,  // longAscentNode
//	VSOP2013readable.Mercury.longitudePerihelionDegrees,//77.45645,// longPerihelion
//	VSOP2013readable.Mercury.meanLongitudeDegrees,//252.25084,// meanLong
	"#7F7F7F"), //averageColor
Venus: new PlanetData(
	4.8675, // mass
	6051.8, // equatorial radius
	6051.8, // polar radius
	6051.8, // volumetric mean radius
	5243, // mean density 
	0.32486, // GM
	0.77, // bond albedo
	0.689, // geometric albedo
	-4.38, // V0
	177.36, // obliquity
	-5832.6, // sidPeriodRot
	2802.0, //synPeriodRot
	VSOP2013readable.Venus,// epoch
//	2451544.0, // epoch
//	0.72333199, // semiMajorAxis
//	224.695/365.242191, // tropPeriod
//	0.0067,	 // orbitalEccentricity
//	3.395, // orbitalInclination
//	76.68069,  // longAscentNode
//	131.53298,  // longPerihelion
//	181.97973, // meanLong
	"#FFA500"), // averageColor
Earth: new PlanetData(
	5.9724, // mass
	6378.137, // equatorial radius
	6356.752, // polar radius
	6371.000, // volumetric mean radius
	5514, // mean density 
	0.39860, // GM
	0.306, // bond albedo
	0.434, // geometric albedo
	-3.99, // V0
	23.44, // obliquity
	23.9345, // sidPeriodRot
	24.0000, //synPeriodRot
	VSOP2013readable.EMB,// epoch
//	2451544.0, // epoch
//	1.00000011, // semiMajorAxis
//	1.0, // tropPeriod
//	0.01671022,	 // orbitalEccentricity
//	0.00005, // orbitalInclination
//	-11.26064,  // longAscentNode
//	102.94719,  // longPerihelion
//	100.46435, // meanLong
	"#0000FF"), // averageColor

Mars: new PlanetData(
	0.64171, // mass
	3396.2, // equatorial radius
	3376.2, // polar radius
	3389.5, // volumetric mean radius
	3933, // mean density 
	0.042828, // GM
	0.250, // bond albedo
	0.170, // geometric albedo
	-1.60, // V0
	25.19, // obliquity
	24.6229, // sidPeriodRot
	24.6597, //synPeriodRot
	VSOP2013readable.Mars,// epoch
//	2451544.0, // epoch
//	1.52366231  , // semiMajorAxis
//	686.973/365.242191, // tropPeriod
//	0.09341233   ,	 // orbitalEccentricity
//	1.85061, // orbitalInclination
//	49.57854,  // longAscentNode
//	336.04084 ,  // longPerihelion
//	355.45332, // meanLong
	"#FF0000"), // averageColor

Jupiter: new PlanetData(
	1898.19, // mass
	71492, // equatorial radius
	66854, // polar radius
	69911, // volumetric mean radius
	3933, // mean density 
	126.687, // GM
	0.343, // bond albedo
	0.538, // geometric albedo
	-9.40, // V0
	3.13, // obliquity
	9.9250, // sidPeriodRot
	9.9259, //synPeriodRot
	VSOP2013readable.Jupiter,// epoch
//	2451544.0, // epoch
//	5.20336301  , // semiMajorAxis
//	4330.595/365.242191, // tropPeriod
//	0.04839266   ,	 // orbitalEccentricity
//	1.30530, // orbitalInclination
//	100.55615,  // longAscentNode
//	14.75385 ,  // longPerihelion
//	34.40438, // meanLong
	"#D2B48C"), // averageColor

Saturn: new PlanetData(
	568.34, // mass
	60268, // equatorial radius
	54364, // polar radius
	58232, // volumetric mean radius
	687, // mean density 
	37.931, // GM
	0.342, // bond albedo
	0.499, // geometric albedo
	-8.91, // V0
	26.73, // obliquity
	10.656, // sidPeriodRot
	10.656, //synPeriodRot
	VSOP2013readable.Saturn,// epoch
//	2451544.0, // epoch
//	9.53707032  , // semiMajorAxis
//	10746.94/365.242191, // tropPeriod
//	0.05415060   ,	 // orbitalEccentricity
//	2.48446, // orbitalInclination
//	113.71504,  // longAscentNode
//	92.43194 ,  // longPerihelion
//	49.94432, // meanLong
	"#FFA500"), // averageColor

Uranus: new PlanetData(
	86.813, // mass
	25559, // equatorial radius
	24973, // polar radius
	25362, // volumetric mean radius
	1271, // mean density 
	5.7940, // GM
	0.300, // bond albedo
	0.488, // geometric albedo
	-7.11, // V0
	97.77, // obliquity
	-17.24, // sidPeriodRot
	17.24, //synPeriodRot
	VSOP2013readable.Uranus,// epoch
//	2451544.0, // epoch
//	19.1912639  , // semiMajorAxis
//	30588.740/365.242191, // tropPeriod
//	0.04716771   ,	 // orbitalEccentricity
//	0.76986, // orbitalInclination
//	74.22988,  // longAscentNode
//	170.96424 ,  // longPerihelion
//	313.23218, // meanLong
	"#93B8BE"), // averageColor

Neptune: new PlanetData(
	102.413, // mass
	24764, // equatorial radius
	24341, // polar radius
	24622, // volumetric mean radius
	1638, // mean density 
	6.8351, // GM
	0.290, // bond albedo
	0.442, // geometric albedo
	-6.94, // V0
	28.32, // obliquity
	-16.11, // sidPeriodRot
	16.11, //synPeriodRot
	VSOP2013readable.Neptune,// epoch
//	2451544.0, // epoch
//	30.06896348  , // semiMajorAxis
//	59799.9/365.242191, // tropPeriod
//	0.00858587,	 // orbitalEccentricity
//	1.76917, // orbitalInclination
//	131.72169,  // longAscentNode
//	44.97135 ,  // longPerihelion
//	304.88003, // meanLong
	"#3E66F9")
}; // averageColor
