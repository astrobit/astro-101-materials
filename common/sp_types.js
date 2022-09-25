//
// Requires:
// commonAstro.js
//
// CHANGE LOG
//
// CHANGE LOG
// 
// 2022-Sep-24
// - Created file
//


let g_synphot = null;
let g_synphotReady = false;

/////////////////////////////////////////////////////////////////////////
//
//  function findSynPhot
//
// find spectral type information based on numeric spectral type and luminosity class
// input: numeric_spectral_type (number or null) - the numeric spectral class to search for
//        numeric_luminosity_class (number or null) - the numeric luminosity class to search for
// output: (Array of Objects) - an array consisting of the photometry information for the specified spectral type and luminosity class, if found
//								otherwise, null
//
/////////////////////////////////////////////////////////////////////////

function findSynPhot(numeric_spectral_type, numeric_luminosity_class)
{
	let ret = null;
	if (g_synphotReady)
	{
		let i;
		ret = new Array();
		for (i = 0; i < g_synphot.length; i++)
		{
			if (g_synphot[i].num_sp_type == numeric_spectral_type && (numeric_luminosity_class == null || g_synphot[i].num_luminosity_class == numeric_luminosity_class))
			{
				ret.push(g_synphot[i]);
			}
		}
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function findNearestSynPhot
//
// find spectral type information based on numeric spectral type and luminosity class
// this function will return spectral types that are similar to the requested
// type, rather than only exact matches; for example, an G5 type (numeric type 5xx) requested will
// return all F5 - F9.9, G, and K0 - K5 types that match the luminosity class (if luminosity class is specified) 
// input: numeric_spectral_type (number or null) - the numeric spectral class to search for
//        numeric_luminosity_class (number or null) - the numeric luminosity class to search for
// output: (Array of Objects) - an array consisting of the photometry information for the specified spectral type and luminosity class, if found
//								otherwise, null
//
/////////////////////////////////////////////////////////////////////////

function findNearestSynPhot(numeric_spectral_type, numeric_luminosity_class)
{
	let ret = null;
	if (g_synphotReady)
	{
		let i;
		ret = new Array();
		for (i = 0; i < g_synphot.length; i++)
		{
			if (Math.abs(g_synphot[i].num_sp_type - numeric_spectral_type) <= 100 && (g_synphot[i].num_luminosity_class == numeric_luminosity_class || numeric_luminosity_class == null))
			{
				ret.push(g_synphot[i]);
			}
		}
	}
	return ret;
}


/////////////////////////////////////////////////////////////////////////
//
//  function processSynphot
//
// find spectral type data from the synphot.dat file
// this function intended for internal use
// input: data (number or null) - the blob containing the synphot.dat file data
// output: none
//
/////////////////////////////////////////////////////////////////////////


function processSynphot(data)
{
	g_synphot = new Array();
	const lines = data.split(/\r?\n/);
	let i;
	for (i = 0; i < lines.length; i++)
	{
		const line = lines[i];
		let curr = new Object();
		curr.sp_type = line.substring(21,27).trim();
		curr.logTe = Number(line.substring(28,33).trim());
		curr.UmV = Number(line.substring(34,40).trim());
		curr.BmV = Number(line.substring(41,47).trim());
		curr.VmR = Number(line.substring(48,54).trim());
		curr.VmI = Number(line.substring(55,61).trim());
		curr.VmJ = Number(line.substring(62,68).trim());
		curr.VmH = Number(line.substring(69,75).trim());
		curr.VmK = Number(line.substring(76,82).trim());
		curr.metallicity = Number(line.substring(83,88).trim());
		curr.Mbol = Number(line.substring(89,93).trim());
		curr.BCv = Number(line.substring(94,99).trim());
		curr.BCi = Number(line.substring(100,105).trim());
		curr.BCk = Number(line.substring(106,111).trim());
		curr.filename = Number(line.substring(156,line.length).trim());

		curr.metallicity_code = null;		
		if (curr.sp_type.charAt(0) == 'w' || curr.sp_type.charAt(0) == 'r')
		{
			curr.metallicity_code = curr.sp_type.charAt(0);
			const corrected_sp_type = curr.sp_type.substring(1,curr.sp_type.length);
			curr.sp_type = corrected_sp_type;
		}
		let nst = numericSpectralType(curr.sp_type);
		if (nst !== null)
		{
			curr.num_luminosity_class = nst.num_luminosity_class;
			curr.luminosity_class = nst.luminosity_class;
			curr.num_sp_type = nst.num_sp_type;
		}
				
		g_synphot.push(curr);
	}
	g_synphotReady = true;
	if (star_sets !== undefined)
	{
		for (i = 0; i < star_sets.length; i++)
		{
			if (star_sets[i].ready)
			{
				let j;
				
				for (j = 0; j < star_sets[i]._data.length; j++)
				{
					if (star_sets[i]._data[j].fluxes === undefined)
						star_sets[i]._data[j].fluxes = determineFluxes(star_sets[i]._data[j]);
				}
			}
		}
	}
	else if (starsReady !== undefined && starsReady && stars !== undefined)
	{
		for (i = 0; i < stars.length; i++)
		{
			if (stars[i].fluxes === undefined)
				stars[i].fluxes = determineFluxes(stars[i]);
		}
	}
}

/////////////////////////////////////////////////////////////////////////
//
//  function getSynPhot
//
// retreives and processed the synphot.dat file
// this function intended for internal use
// input: none
// output: none
//
/////////////////////////////////////////////////////////////////////////

function getSynPhot()
{
	const file = "https://www.astronaos.com/astronomy/spectra/synphot.dat";

	getFile(file).then(function (value)
	{
		processSynphot(value)
	},
	function (error)
	{
		console.log("Unable to read synphot.dat: " + error);
	}
	);
}
getSynPhot();

/////////////////////////////////////////////////////////////////////////
//
//  function processSpectrum
//
// processes the data for a spectrum that is retreived
// this function intended for internal use
// input: spectrum (object) - the container for the spectrum data
// 			data (string) - the blob containing the spectrum data to parse
// output: none
//
/////////////////////////////////////////////////////////////////////////
function processSpectrum(spectrum,data)
{
	spectrum.data = new Array();
	const lines = data.split(/\r?\n/);
	let i;
	for (i = 0; i < lines.length; i++)
	{
		const line = lines[i];
		let curr = new Object();
		curr.wl = Number(line.substring(0,6).trim())
		curr.f = Number(line.substring(8,16).trim())
		curr.stdev = Number(line.substring(18,26).trim())
		spectrum.data.push(curr);
	}
	spectrum.ready = true;
}


let g_spectra_retrieved = new Array();

/////////////////////////////////////////////////////////////////////////
//
//  function getSpectrum
//
// retreives a spectrum of a spectral type from the server
// input: spectral_type (string) - the spectral type of the spectrum to retrieve. This type must match the type in the synphot data
// output: (Object)
//
/////////////////////////////////////////////////////////////////////////
function getSpectrum(spectral_type)
{
	let ret = null;
	let i;
	for (i = 0; i < g_spectra_retrieved.length && ret === null; i++)
	{
		if (g_spectra_retrieved[i].spectral_type == spectral_type)
		{
			ret = g_spectra_retrieved[i];
		}
	}
	if (ret === null)
	{
		let spectrum = new Object();
		spectrum.spectral_type = spectral_type;
		spectrum.ready = false;
		spectrum.data = null;
		spectra_retrieved.push(spectrum);
		ret = spectra_retrieved[spectra_retrieved.length - 1];
		const file = "https://www.astronaos.com/astronomy/spectra/" + spectral_type + ".dat";
		getFile(file).then(function (value)
		{
			processSynphot(ret,value)
		},
		function (error)
		{
			console.log("Unable to read " + file + ": " + error);
		}
		);
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function calculateFluxes
//
// calculates the fluxes in all filters for a given star, using
//  the supplied synphot data for a specific spectral type
// input: star (object:Star) - the star information
//        phot (object) - the synphot data to use to calculate the fluxes 
//        dm (number) - the distance modulus of the star
// output: (object) containing the fluxes of the star
//
/////////////////////////////////////////////////////////////////////////

function calculateFluxes(star,phot,dm)
{
	let ret = null;
	if (typeof star == 'object' && star !== null && typeof phot == 'object' && phot !== null)
	{
		const starF = new Object();
		let V = phot.Mbol -  phot.BCv + dm;
		let exp = {
				V : V,
				U : phot.UmV + V,
				B : phot.BmV + V,
				R : V - phot.VmR,
				I : V - phot.VmI, 
				Ib : phot.Mbol -  phot.BCi + dm,
				J : V - phot.VmJ,
				H : V - phot.VmH,
				K : V - phot.VmK, 
				Kb : phot.Mbol -  phot.BCk + dm,
				u_ : phot.UmV + V, // using Johnson U for now
				g_ : phot.BmV + V, // using Johnson B for now
				r_ : V - phot.VmR, // using Johnson R for now
				i_ : V - phot.VmI, // using Johnson I for now
				z_ : V - phot.VmJ}; // using Johnson J for now
		const wl = {u_: 358.0, U: 365.6, B: 435.3, g_: 475.4, V: 547.7, r_: 620.4, R: 634.9, i_: 769.8, I: 879.7, Ib: 879.7, z_:966.5, J: 1220.0, H: 1630.0, K: 2190.0, Kb: 2190.0};
		let keys = Object.keys(exp);
		let i;
		let al = new Object();
		let x = new Array();
		let y = new Array();
		let fluxes = new Object();

		for (i = 0; i < keys.length; i++)
		{
			if (keys[i] in star && star[keys[i]] !== null)
				starF[keys[i]] = star[keys[i]];
			else if (keys[i] == "Ib" && "I" in star && star.I !== null)
				starF[keys[i]] = star.I;
			else if (keys[i] == "Kb" && "K" in star && star.K !== null)
				starF[keys[i]] = star.K
			else
				starF[keys[i]] = null;
		}
		
		let Awl = 0;
		fluxes.Am = 0;
		fluxes.sigmaAm = 0;
		fluxes.A_intercept = 0;
		fluxes.A_sigmaIntercept = 0;
		for (i = 0; i < keys.length; i++)
		{
			
			if (starF[keys[i]] !== null)
			{
				const awl = starF[keys[i]] - exp[keys[i]];
				al[keys[i]] = awl
				x.push(1.0 / wl[keys[i]]);
				y.push(awl);
				fluxes.Am = awl * wl[keys[i]];
				fluxes.sigmaAm = fluxes.Am;
				Awl = wl[keys[i]];
			}
			else
			{
				al[keys[i]] = null;
			}
		}

		if (x.length > 1)
		{
			const lls = new LLS(x,y);

			fluxes.Am = lls.slope;
			fluxes.sigmaAm = lls.slope_uncertainty;
			fluxes.A_intercept = lls.intercept;
			fluxes.A_sigmaIntercept = lls.intercept_uncertainty;
		}
		else
		{
			// estimate A_intercept somehow. Leave this off for now.			
		}
		fluxes.A = new Object();
		fluxes.exp = new Object();
		fluxes.exp_adj = new Object();
		
		for (i = 0; i < keys.length; i++)
		{
			fluxes["A"][keys[i]] = fluxes.Am / wl[keys[i]] + fluxes.A_intercept;
			fluxes["exp"][keys[i]] = exp[keys[i]];
			fluxes["exp_adj"][keys[i]] = exp[keys[i]] + fluxes["A"][keys[i]];
			if (starF[keys[i]] !== null)
				fluxes[keys[i]] = starF[keys[i]];
			else
				fluxes[keys[i]] = fluxes["exp_adj"][keys[i]];
		}
		
		fluxes.dm = dm;
		
		fluxes.phot = phot;
		ret = fluxes;
	}
	return ret;
}


let g_attemptedFluxes = new Array();

/////////////////////////////////////////////////////////////////////////
//
//  function determineFluxes
//
// calculates the fluxes in all filters for a given star, using
//  the spectral type of the star, if known, or attempting to identify the
// spectral type using available filter magnitudes.
// input: star (object:Star) - the star information
//        suggested_dm (object) - the distance modulus of the star, if known
// output: (object) containing the fluxes of the star
//
/////////////////////////////////////////////////////////////////////////

function determineFluxes(star,suggested_dm)
{
	let ret = null;
	if (g_synphotReady)
	{
			
		let dm = star.dm;// !== null ? (-5.0 * Math.log10(star.plx_value) + 10) : 0
		if ((dm === null || dm === undefined) && suggested_dm !== null && suggested_dm !== undefined)
		{
			dm = suggested_dm;
		}
		let phot = null;
		if (star.num_sp_type !== undefined && star.num_sp_type !== null && star.sp_qual !== null && (star.sp_qual == "A" || star.sp_qual == "B" || star.sp_qual == "C"))
		{
			let phots = findSynPhot(star.num_sp_type,star.num_luminosity_class);
			if (phots == null || phots.length == 0)
				phots = findNearestSynPhot(star.num_sp_type,star.num_luminosity_class);
			if (phots !== null)
			{
				if (phots.length > 1)
				{
					let i;
					let min_ak = 1000000;
					let min_sigma_a_idx = -1;
					for (i = 0; i < phots.length; i++)
					{
						let fluxes = calculateFluxes(star,phots[i],dm);
						let flux_attempt = {type:"short",phot: phots[i], fluxes: fluxes, star: star};
						g_attemptedFluxes.push(flux_attempt);
						if (fluxes.A.K >= 0 && fluxes.Am > 0 && fluxes.A.K < min_ak)
						{
							min_sigma_a_idx = i;
							min_ak = fluxes.A.K;
						}
					}
					if (min_sigma_a_idx != -1)
						phot = phots[min_sigma_a_idx];
					else
						phot = null;
				}
				else if(phots.length == 1)
				{
					phot = phots[0];
				}
			}
			else
				console.log("Could not find phot matches for " + star.sp_type);
		}
		
		if (phot !== null)
		{
			let fluxes = calculateFluxes(star,phot,dm);
			if (fluxes.A.K > 1.5) // in the event the extinction in k is really large, try a better fit.
				phot = null;
		}
		if (phot === null) 
		{
			let i;
//			let min_sigma_a = 10000;
			let min_sigma_a_idx = -1;
			let min_ak = 100000;
//			let min_sigma_a_neg = -1000000;
			let min_sigma_a_neg_idx = -1;
			let min_ak_neg = -100000;
			for (i = 0; i < g_synphot.length; i++)
			{
				let fluxes = calculateFluxes(star,g_synphot[i],dm);
				let flux_attempt = {type:"long",phot: g_synphot[i], fluxes: fluxes, star: star};
				g_attemptedFluxes.push(flux_attempt);
				if (fluxes.A.K >= 0 && fluxes.Am > 0 && fluxes.A.K < min_ak)
				{
					min_sigma_a_idx = i;
					min_ak = fluxes.A.K;
				}
				else if (fluxes.A.K < 0 && fluxes.Am > 0 && fluxes.A.K > min_ak_neg)
				{
					min_sigma_a_neg_idx = i;
					min_ak_neg = fluxes.A.K;
				}
			}
			if (min_sigma_a_idx != -1)
			{
				phot = g_synphot[min_sigma_a_idx];
				if (dm == 0)
					dm = min_ak;
			}
			else if (min_sigma_a_neg_idx != -1)
				phot = g_synphot[min_sigma_a_neg_idx];
			else
				phot = g_synphot[44]; // just pick one
		}
		
		ret = calculateFluxes(star,phot,dm);
		if (dm == 0 && ret !== null && ret.A.K > 0)
		{
			dm = ret.A.K; // best guess
			ret = calculateFluxes(star,phot,dm);
		}
	}
	return ret;	
}
