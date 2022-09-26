//
// Requires:
// commonGP.js
// commonAstro.js
//
// Optional dependencies:
// sp_types.js
//
// CHANGE LOG
// 
// 2022-Sep-24
// Additions
// - this change log
// - calculate distance modulus for stars
// - determine full set of fluxes for stars using spectral type (sp_types.js) is sp_types.js is available
// Changes
// - use degrees and radians functions from commonGP
// - added comments and documentation in file
// - switch to numericSpectralType function in commonAstro
// - return link to star object from findStarByID instead of the index of the star

let currDate = new Date();
let currDateTime = currDate.getTime();
let starsRawJSONData = null;
if ("starsUpdateDateTime" in localStorage)
{
	const starsUpdateDateTime = localStorage.getItem("starsUpdateDateTime");
	let forceUpdate = false;
	if (currDateTime > (starsUpdateDateTime + 604800000)) // 1 week
	{
		forceUpdate = true;
	}
	if ("starsData" in localStorage && !forceUpdate)
	{
		starsRawJSONData = localStorage.getItem("starsData");
	}
}

let starsReady = false;
let stars = new Array();

/////////////////////////////////////////////////////////////////////////
//
//  function starFindByID
//
// find a star in the set by its simbad main_id
// input: id (string) - the id (from the main_id field) of the star
// output: (object) - the data for the star if found; null otherwise
//
/////////////////////////////////////////////////////////////////////////
function starFindByID(main_id)
{
	let ret = null;
	const idx = binarySearch(stars,main_id,"main_id");
	if (idx !== null && idx > 0)
	{
		ret = stars[idx];
	}
	return ret;
}


/////////////////////////////////////////////////////////////////////////
//
// the following code requests the stars with magnitude < 6 from the server
// then calls the starsProcess function once the data is received.
//
/////////////////////////////////////////////////////////////////////////

if (starsRawJSONData == null)
{
//	const query = "https://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=SELECT%20*%20FROM%20basic%20JOIN%20allfluxes%20ON%20allfluxes.oidref%20=%20basic.oid%20WHERE%20allfluxes.V%20%3C%206%20OR%20main_id%20=%20%27gam%20cep%27%20OR%20main_id%20=%20%27mu.%20Cet%27%20OR%20main_id%20=%20%27ome%20Dra%27%20OR%20main_id%20=%20%27nu.02%20Dra%27%20OR%20main_id%20=%20%27tet%20Hya%27%20OR%20main_id%20=%20%27iot%20Per%27%20OR%20main_id%20=%20%27ome%20Psc%27%20OR%20main_id%20=%20%27eta%20UMi%27";

	const query = "https://www.astronaos.com/astronomy/stars/stars_m6.json";	
	let promise = getFile(query);
	promise.then(function (value) 
	{ 
		starsRawJSONData = value;
	 	localStorage.setItem("starsData",starsRawJSONData);
		localStorage.setItem("starsUpdateDateTime",currDateTime);
		starsProcess();
	},
	function (error)
	{
		console.log("stars.js: error retreiving stars - " + error);
	});
}
else
{
	starsProcess();
}

/////////////////////////////////////////////////////////////////////////
//
//  function starsProcess
//
// process the json file received from a Simbad query, transforming
// the data into an object array containing each star in the set
// input: none
// output: none
//
/////////////////////////////////////////////////////////////////////////

function starsProcess()
{
	const starsJSON = JSON.parse(starsRawJSONData);
	const NGPdec = 27.13 * radians;
	const NGPra = radians((12.0 + 51.4 / 60.0) * 15.0);
	const galCosNGP = Math.cos(NGPdec)
	const galSinNGP = Math.sin(NGPdec)
	const JC = ((Date.now() / 86400000.0 + 2440587.50000) - 2451545.50000) / 36525.0;
	const obliquity = radians((23.0 + 26.0 / 60 + 21.45 / 3600.0 - JC / 3600.0 * (46.815 + JC * (-0.0006 - 0.00181 * JC))));
	const cosTilt = Math.cos(obliquity);
	const sinTilt = Math.sin(obliquity);

	let keywords = new Array();
	let i;
	const len = starsJSON.metadata.length;
	for (i = 0; i < len; i++)
	{
		keywords.push(starsJSON.metadata[i].name);
	}
	const datalen = starsJSON.data.length;
	for (i = 0; i < datalen; i++)
	{
		let star = new Object();
		let j;
		for (j = 0; j < starsJSON.data[i].length; j++)
		{
			Object.defineProperty(star, keywords[j], {value:starsJSON.data[i][j]});
		}
		const decRad = radians(star.dec);
		const raRad = radians(star.ra)
		const cosDec = Math.cos(decRad);
		const sinDec = Math.sin(decRad);
		const cosRA = Math.cos(raRad);
		const sinRA = Math.sin(raRad);
		const sinB = cosDec * galCosNGP * Math.cos(raRad - NGPra) + sinDec * galSinNGP
		//const cosB = Math.sqrt(1.0 - sinB * sinB)
		// calculate galactic latitude and longitude
		star.gallat = degrees(Math.asin(sinB));
		star.gallong = (degrees(Math.atan2(sinDec - sinB * galSinNGP,cosDec * Math.sin(raRad - NGPra) * galCosNGP )) + 393) % 360.0;
		// calculate ecliptic coorinates
		const sinBeta = sinDec * cosTilt - cosDec * sinTilt * sinRA;
		star.eclat = degrees(Math.asin(sinBeta));
		star.eclong = (degrees(Math.atan2(sinRA * cosTilt + Math.tan(decRad) * sinTilt,cosRA)) + 363) % 360.0;
		let nst = numericSpectralType(star.sp_type);
		star.num_luminosity_class = null;
		star.luminosity_class = null;
		star.num_sp_type = null;
		star.num_sp_type_subtype = null;
		if (nst !== null)
		{
			star.num_luminosity_class = nst.num_luminosity_class;
			star.luminosity_class = nst.luminosity_class;
			star.num_sp_type = nst.num_sp_type;
			star.num_sp_type_subtype = nst.num_sp_type_subtype;
		}
		star.dm = (star.plx_value !== null) ? (-5.0 * Math.log10(star.plx_value) + 10) : null;
		star.dm_sigma = (star.plx_value !== null && star.plx_err !== null) ? star.plx_err / star.plx_value * 5.0 : null;
		
		if (typeof determineFluxes !== 'undefined' && typeof g_synphotReady !== 'undefined' && g_synphotReady)
			star.fluxes = determineFluxes(star);

		stars.push(star);
	}
	stars.sort(function (a,b){if (a.main_id < b.main_id) return -1; else if (a.main_id > b.main_id) return 1; else return 0;});
	let star = starFindByID("* eta UMi");
	if (star !== null)
	{
		star.V = 4.95;
	}
	else
	{
		console.log("failed to update V magnitude for eta UMi");
	}
	star = starFindByID("* ome Psc");
	if (star !== null)
	{
		star.V = 4.00;
	}
	else
	{
		console.log("failed to update V magnitude for ome Psc");
	}
	star = starFindByID("* iot Per");
	if (star !== null)
	{
		star.V = 4.05;
	}
	else
	{
		console.log("failed to update V magnitude for iot Per");
	}
	star = starFindByID("* tet Hya");
	if (star !== null)
	{
		star.V = 3.85;
	}
	else
	{
		console.log("failed to update V magnitude for tet Hya");
	}
	star = starFindByID("* nu.02 Dra");
	if (star !== null)
	{
		star.V = 4.85;
	}
	else
	{
		console.log("failed to update V magnitude for nu.02 Dra");
	}
	star = starFindByID("* ome Dra");
	if (star !== null)
	{
		star.V = 4.75;
	}
	else
	{
		console.log("failed to update V magnitude for ome Dra");
	}
	star = starFindByID("* mu. Cet");
	if (star !== null)
	{
		star.V = 4.25;
	}
	else
	{
		console.log("failed to update V magnitude for mu. Cet");
	}
	star = starFindByID("* gam Cep");
	if (star !== null)
	{
		star.V = 3.20;
	}
	else
	{
		console.log("failed to update V magnitude for gam Cep");
	}
	starsReady = true;
}
