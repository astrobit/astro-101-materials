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
// Removed
// - manual setting of V magnitude for some bright stars; now rely on sp_types to calculate fluxes


/////////////////////////////////////////////////////////////////////////
//
//  class _Stars
//
// a container class that holds simbad (tables basic and allfluxes) and other data for stars
// public keys:
//		none
//
// individual stars contain the following information:
//		(see http://simbad.cds.unistra.fr/simbad/tap/tapsearch.html)
//		all basic table fields
//		all allfluxes table fields
//		gallat (number) - the galactic latitude of the star in degrees (J2000.0).
//		gallon (number) - the galactic longitude of the star in degrees (J2000.0).
//		eclat (number) - the ecliptic latitude of the star in degrees (J2000.0).
//		eclon (number) - the ecliptic longitude of the star in degrees (J2000.0).
//		num_sp_type (number) - the numeric spectral type of the star - see numericSpectralType in commonAstro.js
//		num_sp_type_subtype (number) - the numeric spectral sub-type type of the star - see numericSpectralType in commonAstro.js
//		num_luminosity_class  (number) - the numeric luminosity class of the star - see numericSpectralType in commonAstro.js
//		luminosity_class (string) - the luminosity class of the star
//		dm (number or null) - the distance modulus for the star
//		dm_sigma (number or null) - the uncertainty in the distance modulus for the star
//		fluxes (object or null) - the full flux information for the star, based on spectral type and distance; see sp_types.js
//		
//
/////////////////////////////////////////////////////////////////////////

class _Stars
{
/////////////////////////////////////////////////////////////////////////
//
//  function _processRawData
//
// process the json file received from a Simbad query, transforming
// the data into an object array containing each star in the set
// input: none
// output: none
//
/////////////////////////////////////////////////////////////////////////
	_processRawData()
	{
		const starsJSON = JSON.parse(this._rawData);
		const NGPdec = radians(27.13);
		const NGPra = radians((12.0 + 51.4 / 60.0) * 15.0);
		const galCosNGP = Math.cos(NGPdec)
		const galSinNGP = Math.sin(NGPdec)
		const JC = ((Date.now() / 86400000.0 + 2440587.50000) - 2451545.50000) / 36525.0;
		const obliquity = radians((23.0 + 26.0 / 60 + 21.45 / 3600.0 - JC / 3600.0 * (46.815 + JC * (-0.0006 - 0.00181 * JC))));
		const cosTilt = Math.cos(obliquity);
		const sinTilt = Math.sin(obliquity);
		

		this._data = new Array();
		
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
				Object.defineProperty(star, keywords[j], {writable:true, value:starsJSON.data[i][j]});
			}
			const decRad = radians(star.dec);
			const raRad = radians(star.ra);
			const cosDec = Math.cos(decRad);
			const sinDec = Math.sin(decRad);
			const cosRA = Math.cos(raRad);
			const sinRA = Math.sin(raRad);
			const sinB = cosDec * galCosNGP * Math.cos(raRad - NGPra) + sinDec * galSinNGP
			//const cosB = Math.sqrt(1.0 - sinB * sinB)
			// calculate galactic latitude and longitude
			star.gallat = degrees(Math.asin(sinB))
			star.gallong = (degrees(Math.atan2(sinDec - sinB * galSinNGP,cosDec * Math.sin(raRad - NGPra) * galCosNGP )) + 393) % 360.0;
			// calculate ecliptic coorinates
			const sinBeta = sinDec * cosTilt - cosDec * sinTilt * sinRA;
			star.eclat = degrees(Math.asin(sinBeta));
			star.eclong = (degrees(Math.atan2(sinRA * cosTilt + Math.tan(decRad) * sinTilt,cosRA)) + 363) % 360.0;
			
			star.num_sp_type = null;
			star.num_sp_type_subtype = null;
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

			this._data.push(star);
		}
		this._data.sort(function (a,b){if (a.main_id < b.main_id) return -1; else if (a.main_id > b.main_id) return 1; else return 0;});
			
		this._ready = true;	
		this._rawData = null; // drop raw data string to save memory
	}
	constructor(set)
	{
		this._data = null;
		this._rawData = null;
		this._ready = false;
		
		this._storageName = "stars-"+set;
		this._storageDateTime = "stars-"+set+"-update-time";
		this._dataPromise = null;
		if (this._storageDateTime in localStorage && this._storageName in localStorage)
		{
			const updateTime = localStorage.getItem(this._storageDateTime);
			const currDateTime = (new Date()).getTime();
			const forceUpdate = (currDateTime > (updateTime + 604800000)); // 1 week;
			if (!forceUpdate)
			{
				this._rawData = localStorage.getItem(this._storageName);
			}
		}
		this.failed = false;
		if (this._rawData === null)
		{
			const filePath = "https://www.astronaos.com/astronomy/stars/stars_" + set + ".json";
			this._dataPromise = getFile(filePath);
		}
		else
			this._processRawData();
	}
/////////////////////////////////////////////////////////////////////////
//
//  function findStarByID
//
// find a star in the set by its simbad main_id
// input: id (string) - the id (from the main_id field) of the star
// output: (object) - the data for the star if found; null otherwise
//
/////////////////////////////////////////////////////////////////////////
	findStarByID(id)
	{
		var ret = null;
		if (this._ready)
			ret = binarySearch(this._data,id,"main_id");
		return ret !== null ? this._data[ret] : null;
	}
/////////////////////////////////////////////////////////////////////////
//
//  function _processResponse
//
// process the blob received from a Simbad query
// this function is intended for internal use only
// input: value (string) - the text string response from a simbad query
// output: none
//
/////////////////////////////////////////////////////////////////////////
	_processResponse(value)
	{
		this._rawData = value; 
		const currDateTime = (new Date()).getTime();
		try {
			localStorage.setItem(this._storageName,this._rawData);
			localStorage.setItem(this._storageDateTime,currDateTime);
		}
		catch(e)
		{
 		    console.log("Warning: " + e + " - length = " + this._rawData.length);
		}
		this._processRawData();
	}
/////////////////////////////////////////////////////////////////////////
//
//  get ready
//
// returns a flag to indicate if all data has been processed and is ready for use
// input: none
// output: (boolean) - true if the data is ready for use, false otherwise
//
/////////////////////////////////////////////////////////////////////////
	get ready()
	{
		return this._ready;
	}
/////////////////////////////////////////////////////////////////////////
//
//  function at
//
// returns a flag to indicate if all data has been processed and is ready for use
// input: idx (number) - the index of the star to get
// output: (Object) - the selected star if idx is valid; null otherwise
//
/////////////////////////////////////////////////////////////////////////
	at(idx)
	{
		let ret = null;
		if (this._ready && idx < this._data.length)
		{
			ret = this._data[idx];
		}
		return ret;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get length
//
// returns the number of stars available in the set
// input: none
// output: (number) - the number of stars available in this set
//
/////////////////////////////////////////////////////////////////////////
	get length()
	{
		return this._data.length;
	}
}

/////////////////////////////////////////////////////////////////////////
//
//  function newStarSet
//
// creates a new set of stars; set refers to a specific group name of stars available on the server
// input: set (string) - the name of the set to retrieve
// output: (Object) - the selected star set
//
/////////////////////////////////////////////////////////////////////////
let star_sets = new Array();
function newStarSet(set)
{
	let ret = new _Stars(set);
	star_sets.push(ret);
	if (typeof ret._dataPromise != 'undefined' && ret._dataPromise !== null)
		ret._dataPromise.then(function(value){ret._processResponse(value)},function(error){ret.failed = true; console.log("Stars request failed with error " + error)});
	return ret;
}

let starsm6 = newStarSet("m6");
let starsReady = false;
let stars = null;


/////////////////////////////////////////////////////////////////////////
//
//  function waitForStarsReady
//
// waits for the set of stars with V magnitude < 6 to be available for use
// then populates the global stars object and starsReady flag
// this function is intended for internal use only
// input: none
// output: none
//
/////////////////////////////////////////////////////////////////////////
function waitForStarsReady()
{
	if (!starsm6.ready)
	{
		window.setTimeout(waitForStarsReady, 333.0);
	}
	else
	{
		starsReady =  true;
		stars = starsm6._data;
	}
}
waitForStarsReady();


/////////////////////////////////////////////////////////////////////////
//
//  function starFindByID
//
// searches the set of stars with magnitude < 6 for a star with the given id
// input: main_id (string) - the main simbbad ID of the star
// output: (object) - the star if found; null otherwise
//
/////////////////////////////////////////////////////////////////////////
function starFindByID(main_id)
{
	return starsm6.findStarByID(main_id);
}

