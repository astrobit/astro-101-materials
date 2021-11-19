
var commonAstroLogRegister = 0;

class PhysicalConstants
{
	constructor()
	{
		// 29979245800 is the CODATA 2017 value for the speed of light in cm/s
		this._kSpeedOfLight = 29979245800.0;
		// 14959787070000 is the length of an astronomical unit in cm, per IAU 2009 Resolution B2
		this._kAstronomicalUnit = 14959787070000.0;
		// seconds per year. A year is taken to be exactly 365.0 days
		this._kYearSeconds = 365.0 * 86400.0;
		// degrees to radians
		this._kDegreesRadians = Math.PI / 180.0;
		// arc-seconds to radians
		this._kArcSecRadians = this.kDegreesRadians / 3600.0;
		// milli-arc-seconds (mas) to radians
		this._kMasRadians = this.kArcSecRadians / 1000.0;
		// parsecs in cm
		this._kParsec = 3600.0 / this.kDegreesRadians * this.kAstronomicalUnit;
	}
	get kSpeedOfLight()
	{
		// 29979245800 is the CODATA 2017 value for the speed of light in cm/s
		return 29979245800.0;
	}
	set kSpeedOfLight(value)
	{}
	get kAstronomicalUnit()
	{
		// 14959787070000 is the length of an astronomical unit in cm, per IAU 2009 Resolution B2
		return 14959787070000.0;
	}
	set kAstronomicalUnit(value)
	{}
	get kDegreesRadians()
	{
		return this._kDegreesRadians;
	}
	set kDegreesRadians(value)
	{}
	get kArcSecRadians()
	{
		return this._kArcSecRadians;
	}
	set kArcSecRadians(value)
	{}
	get kMasRadians()
	{
		return this._kMasRadians;
	}
	set kMasRadians(value)
	{}
	get kParsec()
	{
		return this._kParsec;
	}
	set kParsec(value)
	{}
	get kYearSeconds()
	{
		// seconds per year. A year is taken to be exactly 365.0 days
		return 365.0 * 86400.0;
	}
	set kYearSeconds(value)
	{}
}

var Phys = new PhysicalConstants();

function UBVRItoRGB(U,B,V,R,I,brightMag,dimMag)
{
	var brightMagInternal = brightMag;
	if (typeof brightMag === 'undefined' || brightMag === null)
	{
		brightMagInternal = 0.0;
		if (!(commonAstroLogRegister & 0x01))
		{
			console.log("using mag 0.0 as bright")
			commonAstroLogRegister = commonAstroLogRegister  | 0x01;
		}
	}
	var dimMagInternal = dimMag;
	if (typeof dimMag === 'undefined' || dimMag === null)
	{
		dimMagInternal = 6.0;
		if (!(commonAstroLogRegister & 0x02))
		{
			console.log("using mag 6.0 as dim")
			commonAstroLogRegister = commonAstroLogRegister  | 0x02;
		}
	}

	var colorIndex = null;
	if (B !== null && V !== null)
	{
		colorIndex = B - V;
		colorBlue = 0.0;
		colorRed = 1.35;
		colorYel = 0.65;
	}
	else if (V !== null && R !== null)
	{
		colorIndex = V - R;
		colorBlue = 0.0;
		colorRed = 1.20;
		colorYel = 0.55;
	}
	else if (U !== null && B !== null)
	{
		colorIndex = U - B;
		colorBlue = 0.0;
		colorRed = 1.10;
		colorYel = 0.15;
	}
	else if (R !== null && I !== null)
	{
		colorIndex = R - I;
		colorBlue = 0.0;
		colorRed = 0.8;
		colorYel = 0.35;
	}

	var cB = 255;
	var cG = 255;
	var cR = 255;
	if (colorIndex !== null)		
	{
		cB = 255;
		cG = 255;
		cR = 255;

		if (colorIndex < colorBlue)
		{
			cR = 127;
			cG = 127;
		}
		else if (colorIndex > colorRed)
		{
			cR = 255;
			cG = 0;
			cB = 0;
		}
		else if (colorIndex < colorYel)
		{
			var Bdel = Math.round(colorIndex / colorYel * 128.0) + 127;
			cR = Bdel;
			cG = Bdel;
			cB = 255;
		}
		else
		{
			var Bdel = Math.round((colorRed - colorIndex) / (colorRed - colorYel) * 255.0);
			cR = 255;
			cG = Bdel;
			cB = Bdel;
		}
	}
	var brightBasis = null;
	if (V !== null)
		brightBasis = V;
	else if (R !== null)
		brightBasis = R;
	else if (B !== null)
		brightBasis = B;
	else if (U !== null)
		brightBasis = U;
	else if (I !== null)
		brightBasis = I;
	else
		brightBasis = dimMagInternal;

	var bright = 0;
	if (brightBasis != null)
	{
		bright = 1.0 - (brightBasis - brightMagInternal) / (dimMagInternal - brightMagInternal);//Math.pow(10.0,-brightBasis/5*1.2);
		if (bright > 1.0)
			bright = 1.0;
		if (bright < 0.0)
			bright = 0.0;
		cR *= bright;
		cG *= bright;
		cB *= bright;
	}
	
	return new RGB(Math.round(cR), Math.round(cG), Math.round(cB));//, bright:bright};
}


const MonthDays = {
	dayStart: [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
	dayStartLeap: [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]
}

function findMonthDay(day, leapYear) {
	var monthMax = 12;
	var monthMin = 0;
	var pDays = MonthDays.dayStart;
	if (leapYear)
		pDays = MonthDays.dayStartLeap;
	do {
		var month = Math.floor((monthMax + monthMin) * 0.5);
		if (pDays[month] <= day)
			monthMin = month;
		else
			monthMax = month;
	} while (monthMin < (monthMax - 1));
	var monthIdx;
	if (pDays[monthMin] <= day)
		monthIdx = monthMin;
	else
		monthIdx = monthMin + 1;
	return { month: monthIdx + 1, day: day - pDays[monthIdx] + 1 };
}

function JDtoGregorian(jd) {
	var dayInYear = 0;
	var year = 0;
	var leapYear = false;
	var DN = Math.floor(jd + 0.5);
	var F = jd - DN + 0.5;
	var B = DN;
	if (DN > 2299160) {
		var A = Math.floor((DN - 1867216.25) / 36524.25);
		B = DN + 1 + A - Math.floor(A / 4);
	}
	var C = B + 1524;
	var D = Math.floor((C - 122.1) / 365.25);
	var E = Math.floor(365.25 * D);
	var G = Math.floor((C - E) / 30.6001);
	var d = C - E + F - Math.floor(G * 30.6001);
	var m = G - 1;
	if (G > 13.5)
		m = G - 13;
	y = D - 4715;
	if (m > 2.5)
		y--;
	/*
		if (jd > 2299160.50000) // truly Gregorian
		{
			var julianQuadCenturies = Math.floor((jd - 2305447.50000) / 146097);
			year = 1600 + julianQuadCenturies * 400;
			dayInYear = jd - 2305447.50000 - julianQuadCenturies * 146097;
			var julianCenturies = Math.floor(dayInYear / 36524);
			year += julianCenturies * 100;
			dayInYear -= 36524;
	
			if (dayInYear > 36525)
			{
				year += 100;
				dayInYear -= 36525;
			}
			while (dayInYear >= 36524)
			{
				year += 100;
				dayInYear -= 36524;
			}
			var julianQuads = Math.floor(dayInYear / 1461);
			year += julianQuads * 4;
			dayInYear -= julianQuads * 1461;
			if (dayInYear >= 366)
			{
				year += 1;
				dayInYear -= 366;
			}
			while (dayInYear >= 365)
			{
				year += 1;
				dayInYear -= 365;
			}
			leapYear = Math.floor(year / 4) == year/4
		}
		else
		{
			var julianQuads = Math.floor(jd / 1461);
			var year = julianQuads * 4 - 4712;
			if (jd < 1721058)
				year--; // there is no year 0 
			dayInYear = jd - julianQuads * 1461;
			if (dayInYear >= 366)
			{
				year++;
				dayInYear -= 366;
			}
			while (dayInYear >= 365)
			{
				year++;
				dayInYear -= 365;
			}
			leapYear = Math.floor(year / 4) == year/4
		}
		var md = findMonthDay(dayInYear,leapYear)
		*/
	return { year: y, month: m, day: d };
}

function degrees(value)
{
	return value / Math.PI * 180.0;
}
function radians(value)
{
	return value * Math.PI / 180.0;
}
function degreestoDMS(value,rounding)
{
	var roundLcl = rounding;
	if (rounding === undefined || rounding === null)
		roundLcl = 2;
	var round = Math.pow(10.0,roundLcl);

	var valAbs = Math.abs(value);
	var deg = Math.floor(valAbs);
	var min = Math.floor((valAbs - deg) * 60.0);
	var sec = Math.round(((valAbs - deg) * 60.0 - min) * 60.0 * round) / round;
	if (value < 0)
		deg *= -1;
	return { deg: deg, min: min, sec: sec };
}
function degreestoHMS(value,rounding)
{
	var roundLcl = rounding;
	if (rounding === undefined || rounding === null)
		roundLcl = 2;
	var round = Math.pow(10.0,roundLcl);
	
	var valH = Math.abs(value) / 15.0;
	var hr = Math.floor(valH);
	var min = Math.floor((valH - hr) * 60.0);
	var sec = Math.round(((valH - hr) * 60.0 - min) * 60.0 * round) / round;
	if (value < 0)
		hr *= -1;
	return { hr: hr, min: min, sec: sec };
}

function degreestoDMSDisplayable(value,rounding)
{
	var roundLcl = rounding;
	if (rounding === undefined || rounding === null)
		roundLcl = 2;

	var dms = degreestoDMS(value,roundLcl);
	var min;
	if (dms.min < 10)
		min = "0" + dms.min.toString();
	else
		min = dms.min.toString();
	var sec;
	if (dms.sec < 10)
		sec = "0" + dms.sec.toString();
	else
		sec = dms.sec.toString();
	if (roundLcl > 0 && sec.length < 3)
	{
		sec += ".";
	}
	var idx;
	for (idx = sec.length; idx < (roundLcl + 3); idx++)
	{
		sec += "0";
	}
	return {deg: dms.deg, min: min, sec:sec};
}

function degreestoHMSDisplayable(value,rounding)
{
	var roundLcl = rounding;
	if (rounding === undefined || rounding === null)
		roundLcl = 2;

	var dms = degreestoHMS(value,roundLcl);
	var min;
	if (dms.min < 10)
		min = "0" + dms.min.toString();
	else
		min = dms.min.toString();
	var sec;
	if (dms.sec < 10)
		sec = "0" + dms.sec.toString();
	else
		sec = dms.sec.toString();
	if (roundLcl > 0 && sec.length < 3)
	{
		sec += ".";
	}
	var idx;
	for (idx = sec.length; idx < (roundLcl + 3); idx++)
	{
		sec += "0";
	}
	return {hr: dms.hr, min: min, sec:sec};
}


class SpatialStarData
{
	constructor()
	{
		this.positionApparent = new ThreeVector();
		this.positionTrue = new ThreeVector();
		this.velocity = new ThreeVector();
	}
	

	calculate(ra_degrees,dec_degrees,parallax_mas,redshift_z,PM_ra_mas_yr,PM_dec_mas_yr)
	{
		// convert RA and Dec from degrees to radians
		var raRad = ra_degrees * Phys.kDegreesRadians;
		var decRad = dec_degrees * Phys.kDegreesRadians;
		// precalculate the cosine and sine of ra and dec.
		var cosRA = Math.cos(raRad);
		var sinRA = Math.sin(raRad);
		var cosDec = Math.cos(decRad);
		var sinDec = Math.sin(decRad);
		// calcualte the distance to the star in parsecs and cm; parallax is taken to be in milli-arcsec (mas).
		var distpc = 1000.0 / parallax_mas;
		var distcm = distpc * Phys.kParsec;

		// calculate the three dimensional spatial velocity, in cm/s
		this.positionApparent.x = distcm * cosRA * cosDec;
		this.positionApparent.y = distcm * sinRA * cosDec;
		this.positionApparent.z = distcm * sinDec;

		// calculate the radial velocity (in cm/s) from the determined shift in wavelength (z = Δλ/λ)
		// This uses the relativistic method to allow for large redshifts
		var oneplusz = redshift_z + 1.0;
		var vrad = (oneplusz * oneplusz - 1.0) / (oneplusz * oneplusz + 1.0) * Phys.kSpeedOfLight;
		// calculate the proper motion in radians per second. pmra and pmdec are assumed to be in milli-arcsec (mas) per year
		// A year is taken to be exactly 365.0 days
		var pmrarad = PM_ra_mas_yr * Phys.kMasRadians / Phys.kYearSeconds;
		var pmdecrad = PM_dec_mas_yr * Phys.kMasRadians / Phys.kYearSeconds;
		// calculate the spatial tangential velocity, in cm/s, in RA and dec from the proper motion and distance. 
		var vra = pmrarad * distcm;
		var vdec = pmdecrad * distcm;
		// calculate the three dimensional spatial velocity, in cm/s
		this.velocity.x = -sinRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * cosDec * vrad;
		this.velocity.y = cosRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * sinDec * vrad;
		this.velocity.z = cosDec * vdec + sinDec * vrad;
		
		var lightTravelTime = distcm / Phys.kSpeedOfLight;
		
		// calculate the three dimensional spatial velocity, in cm/s
		this.positionTrue = this.positionApparent.add(this.velocity.scale(lightTravelTime));
		
	}
}

function drawStar(image, x, y, size, color)
{

	var sizeLcl = Math.ceil(size) * 2.0; // allow for first order diffraction ring
	if (size == 0)
		sizeLcl = 2;
	var twoSizeLcl = 2.0 * sizeLcl;
	var xn = Math.floor(x);
	var yn = Math.floor(y);
	var dx = xn - x;
	var dy = yn - y;

	for (xl = 0; xl < twoSizeLcl; xl++)
	{
		for (yl = 0; yl < twoSizeLcl; yl++)
		{
			var xr = (xl - sizeLcl);
			var yr = (yl - sizeLcl);
			var xrdx = xr + dx;
			var yrdy = yr + dy;
			var r = Math.sqrt(xrdx * xrdx + yrdy * yrdy);
			var b = 1.0;
			if (r != 0)
			{
				var s = r / sizeLcl * Math.PI * 2.0;
				var bl = Math.sin(s) / s;
				b = bl * bl;
			}
			var starClrLcl = color.copy();
			starClrLcl.scale(b);
			image.addAtRelative(xr + xn, yr + yn, starClrLcl)
		}
	}
}