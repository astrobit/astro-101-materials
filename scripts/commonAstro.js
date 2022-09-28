//
// Requires:
// common.js
// commonGP.js
// VectorMaxtrix.js
//
// CHANGE LOG
// 
// 2022-Sep-24
// Additions
// - this change log
// - add MagToFlux function to get the flux (in erg/s/cm²) of 0 magnitude in Johnson filters
// - add fluxToPhotonFlux function to calculate photon flux (in 1/s/cm²) from an energy flux (erg/s/cm²) for a given wave band.
// - add airyDiskSize function to calculate the angular size (in radians) of an Airy disk
// - add drawStarFlux function to draw a star on an image given a flux and color
// - add airmass function to calculate the airmass for an observer, given zenith angle, altitude, and assumed atmospheric height
// - add extinction_coefficient to get the atmospheric extinction coefficient (in magnitudes per airmass) for a given filter
// - add numericSpectralType function to create anumeric spectral type and luminoisity class given a string
// - add comment and descriptions
// - add processSimbad
// - add simbadQuery
// Changes
// - Clear up Physical Constants so that gets only give values instead of performing calculations
// - use ValidateValue to validate numbers, instead of x !== undefined and x !== null
// - use more typical pseudocolor to determine RGB in UBVRItoRGB if B, V, and R are available
// - replaced Phys_Const class with a simple Phys const object
// Removed
// - Phys_Const class
//
// 2022-Sep-26
// Changes
// - calculation for Airy disk size was incorrect - fix calculation to use 1/pi instead of 1/2
//
// 2022-Sep-28
// Changes
// - flip order of traversal of image from (x -> y) to (y->x) to optimize memory access in drawStar and drawStarFlux
// - add saturation effect to drawStarFlux; at flux > 1.2 max, the flux will bleed into pixels to the right, emulating transfer effects
//

/////////////////////////////////////////////////////////////////////////
//
//  const Phys
//
// a container object that holds standard physical constants
// public keys:
//		kSpeedOfLight (number) - the speed of light in cm/s
//		kPlanck (number) - Planck's constant in erg s
//		kAstronomicalUnit (number) - the length of the astronomical unit in cm; IAU Resolution B2, 2012
//		kDegreesRadians (number) - the number of radians in one degree
//		kArcSecRadians (number) - the number of radians in one arc-second
//		kMasRadians (number) - the number of radians in one milli-arc-second (mas)
//		kYearSeconds (number) - the length of a calendar year in seconds
//		kRadiusEarth (number) - the radius of Earth in km
//
/////////////////////////////////////////////////////////////////////////

const Phys = {
	kSpeedOfLight: 29979245800.0,
	kPlanck: 6.62607015e-27,
	kAstronomicalUnit: 14959787070000.0,
	kDegreesRadians: Math.PI / 180.0,
	kArcSecRadians:  Math.PI / (180.0 * 3600.0),
	kMasRadians: Math.PI / (180.0 * 3600.0 * 1000.0),
	kParsec: 3600.0 * 180.0 / Math.PI * 14959787070000.0,
	kYearSeconds: 365.0 * 86400.0,
	kRadiusEarth:  6371.0
}

//let commonAstroLogRegister = 0; // used to report to the log choices of minimum and maximum magnitudes

/////////////////////////////////////////////////////////////////////////
//
//  function UBVRItoRGB
//
// transform a UBVRI magnitude to an RGB color; uses B-V
// input: U (number or null) - UV magnitude
//        B (number or null) - B magnitude
//        V (number or null) - V magnitude
//        R (number or null) - R magnitude
//        I (number or null) - I magnitude
//        brightMag (number, null, or undefined) - magnitude to use as maximum brightness; default is 0
//        dimMag (number, null, or undefined) - magnitude to use as zero brightness; default is 6
// output: (Object, RGB) - an RGB object containing the color of the object
//
/////////////////////////////////////////////////////////////////////////

function UBVRItoRGB(U,B,V,R,I,brightMag,dimMag)
{
	let brightMagInternal = brightMag;
	if (!ValidateValue(brightMag))
	{
		brightMagInternal = 0.0;
//		if (!(commonAstroLogRegister & 0x01))
//		{
//			console.log("using mag 0.0 as bright")
//			commonAstroLogRegister = commonAstroLogRegister  | 0x01;
//		}
	}
	let dimMagInternal = dimMag;
	if (!ValidateValue(dimMag))
	{
		dimMagInternal = 6.0;
//		if (!(commonAstroLogRegister & 0x02))
//		{
//			console.log("using mag 6.0 as dim")
//			commonAstroLogRegister = commonAstroLogRegister  | 0x02;
//		}
	}

	let cB = 255;
	let cG = 255;
	let cR = 255;
	let colorIndex = null;
	if (ValidateValue(B) && ValidateValue(V) && ValidateValue(R))
	{ // do a pseudocolor if all three visual filter magnitudes are available.
		const dimmest = Math.max(B,V,R);
		const brightest = Math.min(B,V,R);
		cB = Math.max(0,Math.min(255,(B - dimmest) / (brightest - dimmest) * 255));
		cG = Math.max(0,Math.min(255,(V - dimmest) / (brightest - dimmest) * 255));
		cR = Math.max(0,Math.min(255,(R - dimmest) / (brightest - dimmest) * 255));
	}
	else
	{
		if (ValidateValue(B) && ValidateValue(V))
		{
			colorIndex = B - V;
			colorBlue = 0.0;
			colorRed = 1.35;
			colorYel = 0.65;
		}
		else if (ValidateValue(R) && ValidateValue(V))
		{
			colorIndex = V - R;
			colorBlue = 0.0;
			colorRed = 1.20;
			colorYel = 0.55;
		}
		else if (ValidateValue(U) && ValidateValue(B))
		{
			colorIndex = U - B;
			colorBlue = 0.0;
			colorRed = 1.10;
			colorYel = 0.15;
		}
		else if (ValidateValue(R) && ValidateValue(I))
		{
			colorIndex = R - I;
			colorBlue = 0.0;
			colorRed = 0.8;
			colorYel = 0.35;
		}

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
				const Bdel = Math.round(colorIndex / colorYel * 128.0) + 127;
				cR = Bdel;
				cG = Bdel;
				cB = 255;
			}
			else
			{
				const Bdel = Math.round((colorRed - colorIndex) / (colorRed - colorYel) * 255.0);
				cR = 255;
				cG = Bdel;
				cB = Bdel;
			}
		}
	}
	let brightBasis = null;
	if (ValidateValue(V))
		brightBasis = V;
	else if (ValidateValue(R))
		brightBasis = R;
	else if (ValidateValue(B))
		brightBasis = B;
	else if (ValidateValue(U))
		brightBasis = U;
	else if (ValidateValue(I))
		brightBasis = I;
	else
		brightBasis = dimMagInternal;

	let bright = 0;
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

/////////////////////////////////////////////////////////////////////////
//
//  function MagtoFlux
//
// get the energy flux for a given magnitude in a given filter
// source: https://lweb.cfa.harvard.edu/~dfabricant/huchra/ay145/mags.html
// input: band (string) - the filter in which to find the flux; allowed values are UVBRI, griz, and HJK
//        mag (number) - the magnitude to transform
// output: (number) - the flux in erg/s/cm²/Hz
//
/////////////////////////////////////////////////////////////////////////
const AstroMagnitudeFluxZero = {
	U: 1.810e-20,
	B: 4.260e-20,
	V: 3.640e-20,
	R: 3.080e-20,
	I: 2.550e-20,
	J: 1.600e-20,
	H: 1.080e-20,
	K: 0.670e-20,
	g: 3.370e-20,
	r: 4.490e-20,
	i: 4.760e-20 ,
	z: 4.810e-20 
};

function MagtoFlux(band,mag)
{
	const mf = Math.pow(10.0,-mag * 0.4);
	const flux = (band in AstroMagnitudeFluxZero) ? AstroMagnitudeFluxZero[band] : AstroMagnitudeFluxZero["V"];
	return mf * flux;
	
}

/////////////////////////////////////////////////////////////////////////
//
//  function fluxToPhotonFlux
//
// get the photon flux for a given band given an energy flux
// source: https://lweb.cfa.harvard.edu/~dfabricant/huchra/ay145/mags.html
// input: wavelength (number) - the central wavelength (in cm) of the band
//        bandwidth (number) - the full width of the band
// output: (number) - the flux in photons/s/cm²
//
/////////////////////////////////////////////////////////////////////////

function fluxToPhotonFlux(wavelength,bandwidth, flux)
{
	const w = Phys.kSpeedOfLight * (1.0 / (wavelength - bandwidth * 0.5) - 1.0 / (wavelength + bandwidth * 0.5));
	const e = Phys.kPlanck * Phys.kSpeedOfLight / wavelength;
	return flux / e * w;
}

const MonthDays = {
	dayStart: [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
	dayStartLeap: [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]
}


/////////////////////////////////////////////////////////////////////////
//
//  function findMonthDay
//
// returns the month and day given a day of year
// input: day (number) - day of the year
//        leapyear (boolean) - flag to indicate if the year is a leap year
// output: (Object) - the month and day of the month
//				month (number): the month
//				day (number): the day of the month
//
/////////////////////////////////////////////////////////////////////////
function findMonthDay(day, leapYear) {
	let monthMax = 12;
	let monthMin = 0;
	let pDays = MonthDays.dayStart;
	if (leapYear)
		pDays = MonthDays.dayStartLeap;
	do {
		let month = Math.floor((monthMax + monthMin) * 0.5);
		if (pDays[month] <= day)
			monthMin = month;
		else
			monthMax = month;
	} while (monthMin < (monthMax - 1));
	let monthIdx;
	if (pDays[monthMin] <= day)
		monthIdx = monthMin;
	else
		monthIdx = monthMin + 1;
	return { month: monthIdx + 1, day: day - pDays[monthIdx] + 1 };
}


/////////////////////////////////////////////////////////////////////////
//
//  function JDtoGregorian
//
// converts a Julian Date (JD) to a Gregorain calendar date
// input: jd (number) the Julian Date
// output: (Object) - the corresponding Gregorian date
//				year (number): the year
//				month (number): the month
//				day (number): the day of the month
//
/////////////////////////////////////////////////////////////////////////

function JDtoGregorian(jd) {
	let dayInYear = 0;
	let year = 0;
	let leapYear = false;
	let DN = Math.floor(jd + 0.5);
	let F = jd - DN + 0.5;
	let B = DN;
	if (DN > 2299160) {
		let A = Math.floor((DN - 1867216.25) / 36524.25);
		B = DN + 1 + A - Math.floor(A / 4);
	}
	let C = B + 1524;
	let D = Math.floor((C - 122.1) / 365.25);
	let E = Math.floor(365.25 * D);
	let G = Math.floor((C - E) / 30.6001);
	let d = C - E + F - Math.floor(G * 30.6001);
	let m = G - 1;
	if (G > 13.5)
		m = G - 13;
	y = D - 4715;
	if (m > 2.5)
		y--;
	/*
		if (jd > 2299160.50000) // truly Gregorian
		{
			let julianQuadCenturies = Math.floor((jd - 2305447.50000) / 146097);
			year = 1600 + julianQuadCenturies * 400;
			dayInYear = jd - 2305447.50000 - julianQuadCenturies * 146097;
			let julianCenturies = Math.floor(dayInYear / 36524);
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
			let julianQuads = Math.floor(dayInYear / 1461);
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
			let julianQuads = Math.floor(jd / 1461);
			let year = julianQuads * 4 - 4712;
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
		let md = findMonthDay(dayInYear,leapYear)
		*/
	return { year: y, month: m, day: d };
}


/////////////////////////////////////////////////////////////////////////
//
//  function degrees
//
// converts a value in radians to degrees
// input: value (number) the angle in radians
// output: (number) - the angle in degrees
//
/////////////////////////////////////////////////////////////////////////

function degrees(value)
{
	return value / Math.PI * 180.0;
}

/////////////////////////////////////////////////////////////////////////
//
//  function radians
//
// converts a value in degrees to radians
// input: value (number) the angle in degrees
// output: (number) - the angle in radians
//
/////////////////////////////////////////////////////////////////////////

function radians(value)
{
	return value * Math.PI / 180.0;
}


/////////////////////////////////////////////////////////////////////////
//
//  function degreestoDMS
//
// converts a value in degrees to degrees, arc-minutes, and arc-seconds
// input: value (number) the angle in degrees
// 			rounding (number, undefined, or null) the number of digits to round the arc-seconds value to; default is 2
// output: (object) - the angle in degrees, arc-minutes, and arc-seconds
//				deg (number): the degrees part of the angle
//				min (number): the arc-minutes part of the angle
//				sec (number): the arc-seconds part of the angle
//
/////////////////////////////////////////////////////////////////////////


function degreestoDMS(value,rounding)
{
	let roundLcl = rounding;
	if (!ValidateValue(rounding))
		roundLcl = 2;
	const round = Math.pow(10.0,roundLcl);

	const valAbs = Math.abs(value);
	let deg = Math.floor(valAbs);
	const min = Math.floor((valAbs - deg) * 60.0);
	const sec = Math.round(((valAbs - deg) * 60.0 - min) * 60.0 * round) / round;
	if (value < 0)
		deg *= -1;
	return { deg: deg, min: min, sec: sec };
}

/////////////////////////////////////////////////////////////////////////
//
//  function degreestoHMS
//
// converts a value in degrees to hours, minutes, and seconds of arc
// input: value (number) the angle in decimal hours
// 			rounding (number, undefined, or null) the number of digits to round the seconds value to; default is 2
// output: (object) - the angle in hours, minutes, and seconds
//				hr (number): the hours part of the angle
//				min (number): the minutes part of the angle
//				sec (number): the seconds part of the angle
//
/////////////////////////////////////////////////////////////////////////


function degreestoHMS(value,rounding)
{
	let roundLcl = rounding;
	if (!ValidateValue(rounding))
		roundLcl = 2;
	const round = Math.pow(10.0,roundLcl);
	
	const valH = Math.abs(value) / 15.0;
	let hr = Math.floor(valH);
	const min = Math.floor((valH - hr) * 60.0);
	const sec = Math.round(((valH - hr) * 60.0 - min) * 60.0 * round) / round;
	if (value < 0)
		hr *= -1;
	return { hr: hr, min: min, sec: sec };
}

/////////////////////////////////////////////////////////////////////////
//
//  function degreestoDMSDisplayable
//
// converts a value in degrees to degrees, arc-minutes, and arc-seconds, converted to strings with correct rounding for display
// input: value (number) the angle in decimal hours
// 			rounding (number, undefined, or null) the number of digits to round the seconds value to; default is 2
// output: (object) - the angle in degrees, arc-minutes, and arc-seconds
//				deg (String): the degrees part of the angle
//				min (String): the arc-minutes part of the angle
//				sec (String): the arc-seconds part of the angle
//
/////////////////////////////////////////////////////////////////////////


function degreestoDMSDisplayable(value,rounding)
{
	let roundLcl = rounding;
	if (!ValidateValue(rounding))
		roundLcl = 2;

	const dms = degreestoDMS(value,roundLcl);
	let min;
	if (dms.min < 10)
		min = "0" + dms.min.toString();
	else
		min = dms.min.toString();
	let sec;
	if (dms.sec < 10)
		sec = "0" + dms.sec.toString();
	else
		sec = dms.sec.toString();
	if (roundLcl > 0 && sec.length < 3)
	{
		sec += ".";
	}
	let idx;
	for (idx = sec.length; idx < (roundLcl + 3); idx++)
	{
		sec += "0";
	}
	return {deg: dms.deg, min: min, sec:sec};
}

/////////////////////////////////////////////////////////////////////////
//
//  function degreestoHMSDisplayable
//
// converts a value in degrees to hours, minutes, and seconds of arc, converted to strings with correct rounding for display
// input: value (number) the angle in decimal hours
// 			rounding (number, undefined, or null) the number of digits to round the seconds value to; default is 2
// output: (object) - the angle in hours, minutes, and seconds
//				hr (String): the hours part of the angle
//				min (String): the minutes part of the angle
//				sec (String): the seconds part of the angle
//
/////////////////////////////////////////////////////////////////////////

function degreestoHMSDisplayable(value,rounding)
{
	let roundLcl = rounding;
	if (!ValidateValue(rounding))
		roundLcl = 2;

	const dms = degreestoHMS(value,roundLcl);
	let min;
	if (dms.min < 10)
		min = "0" + dms.min.toString();
	else
		min = dms.min.toString();
	let sec;
	if (dms.sec < 10)
		sec = "0" + dms.sec.toString();
	else
		sec = dms.sec.toString();
	if (roundLcl > 0 && sec.length < 3)
	{
		sec += ".";
	}
	let idx;
	for (idx = sec.length; idx < (roundLcl + 3); idx++)
	{
		sec += "0";
	}
	return {hr: dms.hr, min: min, sec:sec};
}


/////////////////////////////////////////////////////////////////////////
//
//  class SpatialStarData
//
// a container class that holds the spatial (equirectangular) coordinates and velocity of a star.
// public keys:
//		positionApparent (Object: ThreeVector) - the apparent (observed) position of the object
//		positionTrue (Object: ThreeVector) - the true position of the object considering light travel time
//		velocity (Object: ThreeVector) - the observed spatial motion of the object
//
/////////////////////////////////////////////////////////////////////////

class SpatialStarData
{
	constructor()
	{
		this.positionApparent = new ThreeVector();
		this.positionTrue = new ThreeVector();
		this.velocity = new ThreeVector();
	}
	

/////////////////////////////////////////////////////////////////////////
//
//  function calculate
//
// calculates the spatial coordinates and velocity of a star given the RA & dec, parallax, redshift, and proper motion
// input: ra_degrees (number) - the right ascension of the object in degrees
// 			dec_degrees (number) - the declination of the object in degrees
// 			parallax_mas (number) - the parallax of the object in milli-arc-seconds (mas)
// 			redshift_z (number) - the measured redshift (z) of the object
// 			PM_ra_mas_yr (number) - the measured proper motion in right ascension in milli-arc-seconds per year (mas/yr)
// 			PM_dec_mas_yr (number) - the measured proper motion in declination in milli-arc-seconds per year (mas/yr)
// output: none
//
/////////////////////////////////////////////////////////////////////////
	calculate(ra_degrees,dec_degrees,parallax_mas,redshift_z,PM_ra_mas_yr,PM_dec_mas_yr)
	{
		// convert RA and Dec from degrees to radians
		const raRad = ra_degrees * Phys.kDegreesRadians;
		const decRad = dec_degrees * Phys.kDegreesRadians;
		// precalculate the cosine and sine of ra and dec.
		const cosRA = Math.cos(raRad);
		const sinRA = Math.sin(raRad);
		const cosDec = Math.cos(decRad);
		const sinDec = Math.sin(decRad);
		// calcualte the distance to the star in parsecs and cm; parallax is taken to be in milli-arcsec (mas).
		const distpc = 1000.0 / parallax_mas;
		const distcm = distpc * Phys.kParsec;

		// calculate the three dimensional spatial velocity, in cm/s
		this.positionApparent.x = distcm * cosRA * cosDec;
		this.positionApparent.y = distcm * sinRA * cosDec;
		this.positionApparent.z = distcm * sinDec;

		// calculate the radial velocity (in cm/s) from the determined shift in wavelength (z = Δλ/λ)
		// This uses the relativistic method to allow for large redshifts
		const oneplusz = redshift_z + 1.0;
		const vrad = (oneplusz * oneplusz - 1.0) / (oneplusz * oneplusz + 1.0) * Phys.kSpeedOfLight;
		// calculate the proper motion in radians per second. pmra and pmdec are assumed to be in milli-arcsec (mas) per year
		// A year is taken to be exactly 365.0 days
		const pmrarad = PM_ra_mas_yr * Phys.kMasRadians / Phys.kYearSeconds;
		const pmdecrad = PM_dec_mas_yr * Phys.kMasRadians / Phys.kYearSeconds;
		// calculate the spatial tangential velocity, in cm/s, in RA and dec from the proper motion and distance. 
		const vra = pmrarad * distcm;
		const vdec = pmdecrad * distcm;
		// calculate the three dimensional spatial velocity, in cm/s
		this.velocity.x = -sinRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * cosDec * vrad;
		this.velocity.y = cosRA * cosDec * vra + cosRA * -sinDec * vdec + cosRA * sinDec * vrad;
		this.velocity.z = cosDec * vdec + sinDec * vrad;
		
		const lightTravelTime = distcm / Phys.kSpeedOfLight;
		
		// calculate the three dimensional spatial velocity, in cm/s
		this.positionTrue = this.positionApparent.add(this.velocity.scale(lightTravelTime));
		
	}
}


/////////////////////////////////////////////////////////////////////////
//
//  function drawStar
//
// draws a star onto an image using (sin x / x)^2
// input: image (object: ImgData) the image on which to draw
// 			x (number) - the x-coordinate at which the star should be centered; may inclue fractions of a pixel
// 			y (number) - the y-coordinate at which the star should be centered; may inclue fractions of a pixel
//			size (number) - the size of the first minimum of the Airy disk in pixels
//			color (Object: RGB) - the color in which to draw the star
// output: none
//
/////////////////////////////////////////////////////////////////////////

function drawStar(image, x, y, size, color)
{

	const sizeLcl = Math.max(2,Math.ceil(size) * 2.0); // allow for first order diffraction ring
	const twoSizeLcl = 2.0 * sizeLcl;
	const xn = Math.floor(x);
	const yn = Math.floor(y);
	const dx = xn - x;
	const dy = yn - y;

	for (yl = 0; yl < twoSizeLcl; yl++)
	{
		for (xl = 0; xl < twoSizeLcl; xl++)
		{
			const xr = (xl - sizeLcl);
			const yr = (yl - sizeLcl);
			const xrdx = xr + dx;
			const yrdy = yr + dy;
			const r = Math.sqrt(xrdx * xrdx + yrdy * yrdy);
			let b = 1.0;
			if (r != 0)
			{
				const s = r / sizeLcl * Math.PI * 2.0;
				const bl = Math.sin(s) / s;
				b = bl * bl;
			}
			let starClrLcl = color.copy();
			starClrLcl.scale(b);
			image.addAtRelative(xr + xn, yr + yn, starClrLcl)
		}
	}
}

/////////////////////////////////////////////////////////////////////////
//
//  function airyDiskSize
//
// calculate the angular size of the first minimum of an Airy Disk given a wavelength and aperature
// input: wavelength (number) the wavelength, in the same units as aperture
// 			aperature (number) - the size of the aperture, in the same units as wavelength
// output: (number) - the size of the Airy disk in radians
//
/////////////////////////////////////////////////////////////////////////

function airyDiskSize(wavelength, aperature)
{
	return 3.831705970207513 / Math.PI * wavelength / aperature;
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawStarFlux
//
// draws a star onto an image using a normal (Gaussian) distribution
// input: image (object: ImgData) the image on which to draw
// 			x (number) - the x-coordinate at which the star should be centered; may inclue fractions of a pixel
// 			y (number) - the y-coordinate at which the star should be centered; may inclue fractions of a pixel
//			hwhm (number) - the half-width-half-max of the Gaussian
//			peak_count (number) - the flux (in ADU) at the center peak
//			max_count (number) - the maximum allowed count for peak brightness
//			color (object: RGB) - the color to draw the star
// output: none
//
/////////////////////////////////////////////////////////////////////////

function drawStarFlux(image, x, y, hwhm, peak_count, max_count, color)
{
	const stdev = hwhm / Math.sqrt(2.0 * Math.log(2.0));
	const maxSigma = Math.sqrt(2.0 * Math.log(peak_count));
	const twoSizeLcl = Math.ceil(maxSigma * stdev);
	const xn = Math.floor(x);
	const yn = Math.floor(y);
	const dx = xn - x;
	const dy = yn - y;
	const overflow_threshold = 1.2 * max_count; // @@TODO: make this an input parameter
	let flux_excess = 0;

	for (yl = -twoSizeLcl ; yl < twoSizeLcl; yl++)
	{
		flux_excess = 0; // don't 
		for (xl = -twoSizeLcl ; xl < twoSizeLcl; xl++)
		{
			const xrdx = xl + dx;
			const yrdy = yl + dy;
			const r = Math.sqrt(xrdx * xrdx + yrdy * yrdy);
			const s = -r * r / (stdev * stdev) * 0.5;
			const b = Math.exp(s);
			let n = Math.max(0,random_gaussian(peak_count * b,Math.sqrt(peak_count * b))); // shot noise
			n += flux_excess;
			const f = Math.min(n / max_count,1.0)
			flux_excess = (n > overflow_threshold) ? n - overflow_threshold : 0;
			let starClrLcl = color.copy();
			starClrLcl.scale(f);
			image.addAtRelative(xl + xn, yl + yn, starClrLcl)
		}
		for (;(xl + xn) < image.width && flux_excess > 0; xl++)
		{
			let n = flux_excess;
			const f = Math.min(n / max_count,1.0)
			flux_excess = (n > overflow_threshold) ? n - overflow_threshold : 0;
			let starClrLcl = color.copy();
			starClrLcl.scale(f);
			image.addAtRelative(xl + xn, yl + yn, starClrLcl)
		}
	}
}

/////////////////////////////////////////////////////////////////////////
//
//  function airmass
//
// calculates airmass based on zenit angle, observer's altitude, and assumed atmospheric height
// input: zenith_angle (number) the image on which to draw
// 			atmospheric_height (number, undefined, or null) - the assumed height of the atmosphere in km; default is 120 km
// 			observer_altitude (number, undefined, or null) - the observer's height above sea level in km; default is 0 km
// output: (number) the airmass
//
/////////////////////////////////////////////////////////////////////////

function airmass(zenith_angle, atmospheric_height, observer_altitude)
{
	const zenith_angle_rad = radians(zenith_angle);
	const cosz = Math.cos(zenith_angle_rad);
	const hatm = (ValidateValue(atmospheric_height)) ? atmospheric_height : 120.0; // km
	const hobs = (ValidateValue(observer_altitude)) ? observer_altitude : 0.0; 
	const rhat = Phys.kRadiusEarth / hatm;
	const yhat = hobs / hatm;
	
	const X = Math.sqrt(((rhat + yhat) *cosz) ** 2 + 2 * rhat * (1 - yhat) - yhat * yhat + 1) - (rhat + yhat) * cosz;
	return X;
}

/////////////////////////////////////////////////////////////////////////
//
//  function extinction_coefficient
//
// returns atmospheric extinction in a given filter
// input: filter (string) the filter for extinction; allowed values are UVBRIZYJHKLMNQ
// output: (number) the extinction in magnitudes per airmass
//
/////////////////////////////////////////////////////////////////////////
const AstroAtmosphericExtinction = {
	U: 0.523,// From de Vaucouleurs and Angione (1974), assuming airmass of about 0.98 (use airmass function with altitude = 6600 ft for exact value)
	B: 0.242,// From de Vaucouleurs and Angione (1974), assuming airmass of about 0.98 (use airmass function with altitude = 6600 ft for exact value)
	G: 0.226,// interpolated between B and V
	V: 0.155,// From de Vaucouleurs and Angione (1974), assuming airmass of about 0.98 (use airmass function with altitude = 6600 ft for exact value)
	R: 0.140,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	I: 0.126,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	Z: 0.120,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	Y: 0.115,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	J: 0.109,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	H: 0.100,// interpolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	K: 0.096,// from Manduca (1979) [PASP], assuming airmass of about 0.98 (use airmass function with altitude = 2096 m (KPNO) for exact value)
	L: 0.087,// from Manduca (1979) [PASP], assuming airmass of about 0.98 (use airmass function with altitude = 2096 m (KPNO) for exact value)
	M: 0.086,// extrapolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
	Q: 0.081 // extrapolated from J, K, L, and V using log k = (160.014324769689 nm) (1/λ) - 1.09786614731142, where λ is the central filter wavelength
};
function extinction_coefficient(filter)
{
	let ret = 0;
	if (filter in AstroAtmosphericExtinction)
		ret = AstroAtmosphericExtinction[filter];
	return ret;
}

//let g_astroUnreadableSpType = new String();
/////////////////////////////////////////////////////////////////////////
//
//  function numericSpectralType
//
// returns an object with numeric tranformation of the spectral type and luminosity class
// O = 1xx, B = 2xx, A = 3xx, F = 4xx, G = 5xx, K = 6xx, M = 7xx
// does not currently allow for brown dwarf, white dwarf, or other spectral types
// input: spectral_type (string) the spectral type and luinosity class as a string. Can include peculiar types, provisional classification
//     e.g O5.2 I, M3/4? V, B6p III
// output: (object) spectral type information, interpreted
//				sp_type_base (string): the base spectral type (OBAFGKM)
//				sp_type_subtype (string): the sub-type (e.g. 5 if G5)
//				num_sp_type (number): the spectral type as a number between 10 and 79.9, representing the type and sub-type
//				num_sp_type_subtype (number): the sub-type as a number (e.g. 7.5)
//				luminosity_class (string): the luminosity class, if available
//				num_luminosity_class (number): the luminosity class as a number (e.g. I = 1, V = 5)
///		output is null if the spetral type cannot be determined.
//
/////////////////////////////////////////////////////////////////////////

function numericSpectralType(spectral_type)
{
	let ret = null;
	
	if (spectral_type !== null)
	{
		ret = new Object();
		let sp_type_pending = 0;
		let sp_type_base = spectral_type.charAt(0);
		switch (spectral_type.charAt(0))
		{
		case 'O':
			sp_type_pending = 10;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'B':
			sp_type_pending = 20;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'A':
			sp_type_pending = 30;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'F':
			sp_type_pending = 40;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'G':
			sp_type_pending = 50;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'K':
			sp_type_pending = 60;
			sp_type_base = spectral_type.charAt(0);
			break;
		case 'M':
			sp_type_pending = 70;
			sp_type_base = spectral_type.charAt(0);
			break;
//			case 'R':
//				ret.num_sp_type = 800;
//				break;
//			case 'N':
//				ret.num_sp_type = 900;
//				break;
//			case 'S':
//				ret.num_sp_type = 1000;
//				break;
//			case 'C':
//				ret.num_sp_type = 1100;
//				break;
		default:
			break;
		}
		ret.num_sp_type = null;
		ret.sp_type_subtype = null;
		ret.num_luminosity_class = null;
		if (sp_type_pending > 0)
		{
			let i;
			let subtype = new String();
			let subtype2 = new String();
			for (i = 1; i < spectral_type.length && ((spectral_type.charCodeAt(i) >= 0x30 && spectral_type.charCodeAt(i) <= 0x39) || spectral_type.charCodeAt(i) == 0x2e); i++)
			{
				subtype += spectral_type.charAt(i);
			}
			let sp_type_subtype = Number(subtype);
			if (spectral_type.charAt(i) == '/')
			{
				i++;
				for (;i < spectral_type.length && ((spectral_type.charCodeAt(i) >= 0x30 && spectral_type.charCodeAt(i) <= 0x39) || spectral_type.charCodeAt(i) == 0x2e); i++)
				{
					subtype2 += spectral_type.charAt(i);
				}
				const sp_type_subtype2 = Number(subtype2);
				if (!isNaN(sp_type_subtype) && !isNaN(sp_type_subtype2))
				{
					sp_type_subtype += sp_type_subtype2;
					sp_type_subtype *= 0.5;
				}
			}
			if (subtype.length > 0 && !isNaN(sp_type_subtype))
			{
				if (sp_type_subtype > 9.9)
					sp_type_subtype = 9.9;
				ret.sp_type_base = sp_type_base;
				ret.sp_type_subtype = subtype;
				if (subtype2.length > 0)
					ret.sp_type_subtype += "/" + subtype2;
				ret.num_sp_type_subtype = sp_type_subtype;
				ret.num_sp_type = sp_type_pending + sp_type_subtype;
				ret.sp_type_qual = null;
				let j = i;
				if (j < spectral_type.length)
				{
					ret.spectral_type = spectral_type.substring(0,j - 1);
					if (spectral_type.charAt(j) == '(')
						j++;
					ret.luminosity_class = new String();
					while (j < spectral_type.length && (spectral_type.charCodeAt(j) == 0x49 || spectral_type.charCodeAt(j) == 0x56))
					{
						ret.luminosity_class += spectral_type.charAt(j);
						j++;
					}
					if (ret.luminosity_class == "I")
						ret.num_luminosity_class = 1;
					else if (ret.luminosity_class == "II")
						ret.num_luminosity_class = 2;
					else if (ret.luminosity_class == "III")
						ret.num_luminosity_class = 3;
					else if (ret.luminosity_class == "IV")
						ret.num_luminosity_class = 4;
					else if (ret.luminosity_class == "V")
						ret.num_luminosity_class = 5;
				}
			}
//			else
//			{
//				g_astroUnreadableSpType += spectral_type + "\n";
//			}
		}
//		else
//		{
//			g_astroUnreadableSpType += spectral_type + "\n";
//		}
	}
	return ret;
}


/////////////////////////////////////////////////////////////////////////
//
//  function processSimbad
//
// process the json file received from a Simbad query, transforming
// the data into an object with a key for each key provided in the 
// metadata of the simbad result
// input: response (string) - the response received from a Simbad query
// output: (object) - an array of objects containing the parsed data
//						recived from the simbad query
//
/////////////////////////////////////////////////////////////////////////

function processSimbad(response)
{
	const ret = new Array();
	const json = JSON.parse(response);
	let keywords = new Array();
	let i;
	const len = json.metadata.length;
	for (i = 0; i < len; i++)
	{
		keywords.push(json.metadata[i].name);
	}
	const datalen = json.data.length;
	for (i = 0; i < datalen; i++)
	{
		let object = new Object();
		let j;
		for (j = 0; j < json.data[i].length; j++)
		{
			Object.defineProperty(object, keywords[j], {writable:true, value:json.data[i][j]});
		}
		ret.push(object);
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function simbadQuery
//
// sends a TAP query to simbad, using the primary Stasbourg server
// input: query (string) - a plain text ADQL query
// output: (promise) - a promise that will return the result of the query as a string
//
/////////////////////////////////////////////////////////////////////////

function simbadQuery(query)
{
	
	const submitQuery = "https://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=" + encodeURIComponent(query);
	return getFile(submitQuery);
}

