// data source:
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/fact_notes.html

function getOrbitalPosition(jd,periodYears,meanLongitude,epoch,semiMajorAxis,longitudePerihelion,orbitalEccentricity,orbitalInclination,longitudeAscendingNode)
{
	var radians = Math.PI / 180.0;
	var degrees = 180.0 / Math.PI;
	var meanLongitudeRadians = meanLongitude * radians;
	var longitudePerihelionRadians = longitudePerihelion * radians;
	var longitudeAscendingNodeRadians = longitudeAscendingNode * radians;
	var orbitalInclinationRadians = orbitalInclination * radians;


	var ret = new Object();
	ret.meanLongitude = 2.0 * Math.PI / 365.242191 * (jd - epoch) / periodYears + meanLongitudeRadians;
	ret.meanAnomaly = ret.meanLongitude - longitudePerihelionRadians;
	var meanAnomalyDeg = (ret.meanAnomaly * degrees) % 360.0;
	if (meanAnomalyDeg < 0.0)
		meanAnomalyDeg += 360.0;

	// solve for Eccentric Anomaly using Netwon-Raphson
	var E = ret.meanAnomaly;
	var y = E - orbitalEccentricity * Math.sin(E) - ret.meanAnomaly;
	var dy = 1.0 - orbitalEccentricity * Math.cos(E);
	var del = y / dy;
	while (Math.abs(y) > 0.0000001)
	{
		E -= del;
		y = E - orbitalEccentricity * Math.sin(E) - ret.meanAnomaly;
		dy = 1.0 - orbitalEccentricity * Math.cos(E);
		del = y / dy;
	} 
	E -= del;
	ret.eccentricAnomaly = E;
	// calculate true anomaly
	var tanNuover2 = Math.tan(E * 0.5) * Math.sqrt((1.0 + orbitalEccentricity) / (1.0 - orbitalEccentricity));
	ret.trueAnomaly = Math.atan(tanNuover2) * 2.0;
	// calculate true heliocentric longitude
	ret.helioLongitude = ret.trueAnomaly + longitudePerihelionRadians;
	// calculate actual radius
	ret.helioRadius = semiMajorAxis * (1.0 - orbitalEccentricity * orbitalEccentricity) / (1.0 + orbitalEccentricity * Math.cos(ret.trueAnomaly))
	var longMascNode = ret.helioLongitude - longitudeAscendingNodeRadians;
	// calculate 
	ret.helioLatitude = Math.asin(Math.sin(longMascNode) * Math.sin(orbitalInclinationRadians));
	ret.helioLongitudeProjected = Math.atan(Math.tan(longMascNode) * Math.cos(orbitalInclinationRadians)) + longitudeAscendingNodeRadians;
	ret.radiusProjected = ret.radius * Math.cos(ret.helioLatitude);
	return ret;
}

var g_earthDataLast;
var g_earthDataJDLast = -1000000000000;
function getOrbitalPositionEarth(jd)
{
	if (jd != g_earthDataJDLast)
	{
		g_earthDataLast = getOrbitalPosition(jd,1.00004,100.46435,2451544.0,1.00000011,102.94719,0.01671022,0.00005,-11.26064);
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
	constructor(mass, eqrad,polrad,meanrad,density,gm,bondAlbedo,geoAlbedo,Vmag,obliquity,sidPeriodRot,synPeriodRot,epoch,semiMajorAxis,tropPeriod,orbitalEccentricity,orbitalInclination,longAscentNode,longPerihelion,meanLong,averageColor)
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
		this.semiMajorAxis = semiMajorAxis; // au
		this.orbitalEccentricity = orbitalEccentricity;
		this.orbitalInclination = orbitalInclination; // degrees
		this.tropPeriod = tropPeriod;
		this.longAscentNode = longAscentNode; // degrees
		this.longPerihelion = longPerihelion; // degrees
		this.meanLong = meanLong; // degrees
		this.averageColor = averageColor;
		this.epoch = epoch;

	}

	getSimplePosition(jd)
	{
		var degrees = 180.0 / Math.PI;
		var orbPos = getOrbitalPosition(jd,this.tropPeriod,this.meanLong,this.epoch,this.semiMajorAxis,this.longPerihelion,this.orbitalEccentricity,this.orbitalInclination,this.longAscentNode)
		var orbPosEarth = getOrbitalPositionEarth(jd);

		var earthHelio = new ThreeVector(Math.cos(orbPosEarth.meanLongitude), Math.sin(orbPosEarth.meanLongitude), 0.0);

		var planetHelio = new ThreeVector(this.semiMajorAxis * Math.cos(orbPos.meanLongitude), this.semiMajorAxis * Math.sin(orbPos.meanLongitude), 0.0);

		var vp = new PlanetView();
		vp.calculateViewingParameters(earthHelio,planetHelio,this.semiMajorAxis,this.meanrad,this.polrad,this.eqrad,this.Vmag,this.averageColor,null)

		return vp;
	}
	getTruePosition(jd)
	{
		var degrees = 180.0 / Math.PI;

		var orbPos = getOrbitalPosition(jd,this.tropPeriod,this.meanLong,this.epoch,this.semiMajorAxis,this.longPerihelion,this.orbitalEccentricity,this.orbitalInclination,this.longAscentNode)
		var orbPosEarth = getOrbitalPositionEarth(jd);
		//console.log(orbPosEarth.helioLongitude + " " + orbPosEarth.helioLatitude + " " + orbPosEarth.helioRadius)
		var earthHelio = new ThreeVector(Math.cos(orbPosEarth.helioLongitude) * Math.cos(orbPosEarth.helioLatitude), Math.sin(orbPosEarth.helioLongitude) * Math.cos(orbPosEarth.helioLatitude), Math.sin(orbPosEarth.helioLatitude));
		earthHelio.selfScale(orbPosEarth.helioRadius);
		var planetHelio = new ThreeVector(Math.cos(orbPos.helioLongitude) * Math.cos(orbPos.helioLatitude), Math.sin(orbPos.helioLongitude) * Math.cos(orbPos.helioLatitude), Math.sin(orbPos.helioLatitude));
		planetHelio.selfScale(orbPos.helioRadius);

		var vp = new PlanetView();
		vp.calculateViewingParameters(earthHelio,planetHelio,this.semiMajorAxis,this.meanrad,this.polrad,this.eqrad,this.Vmag,this.averageColor,null)

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
	2451544.0,// epoch
	0.38709893,// semiMajorAxis
	87.968/365.242191,// tropPeriod
	0.20563069,// orbitalEccentricity
	7.00487,// orbitalInclination
	48.33167,  // longAscentNode
	77.45645,// longPerihelion
	252.25084,// meanLong
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
	2451544.0, // epoch
	0.72333199, // semiMajorAxis
	224.695/365.242191, // tropPeriod
	0.0067,	 // orbitalEccentricity
	3.395, // orbitalInclination
	76.68069,  // longAscentNode
	131.53298,  // longPerihelion
	181.97973, // meanLong
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
	2451544.0, // epoch
	1.00000011, // semiMajorAxis
	1.0, // tropPeriod
	0.01671022,	 // orbitalEccentricity
	0.00005, // orbitalInclination
	-11.26064,  // longAscentNode
	102.94719,  // longPerihelion
	100.46435, // meanLong
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
	2451544.0, // epoch
	1.52366231  , // semiMajorAxis
	686.973/365.242191, // tropPeriod
	0.09341233   ,	 // orbitalEccentricity
	1.85061, // orbitalInclination
	49.57854,  // longAscentNode
	336.04084 ,  // longPerihelion
	355.45332, // meanLong
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
	2451544.0, // epoch
	5.20336301  , // semiMajorAxis
	4330.595/365.242191, // tropPeriod
	0.04839266   ,	 // orbitalEccentricity
	1.30530, // orbitalInclination
	100.55615,  // longAscentNode
	14.75385 ,  // longPerihelion
	34.40438, // meanLong
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
	2451544.0, // epoch
	9.53707032  , // semiMajorAxis
	10746.94/365.242191, // tropPeriod
	0.05415060   ,	 // orbitalEccentricity
	2.48446, // orbitalInclination
	113.71504,  // longAscentNode
	92.43194 ,  // longPerihelion
	49.94432, // meanLong
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
	2451544.0, // epoch
	19.1912639  , // semiMajorAxis
	30588.740/365.242191, // tropPeriod
	0.04716771   ,	 // orbitalEccentricity
	0.76986, // orbitalInclination
	74.22988,  // longAscentNode
	170.96424 ,  // longPerihelion
	313.23218, // meanLong
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
	2451544.0, // epoch
	30.06896348  , // semiMajorAxis
	59799.9/365.242191, // tropPeriod
	0.00858587,	 // orbitalEccentricity
	1.76917, // orbitalInclination
	131.72169,  // longAscentNode
	44.97135 ,  // longPerihelion
	304.88003, // meanLong
	"#3E66F9")
}; // averageColor