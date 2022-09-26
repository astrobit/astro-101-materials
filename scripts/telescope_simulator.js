

function populateTelescopesSelect()
{
	let select = document.getElementById("selectTelescope");
	let i;
	for (i = 0; i < telescopesSelect.length; i++)
	{
		if (telescopesSelect[i].instruments !== null && telescopesSelect[i].instruments.length > 0)
		{
			let option = document.createElement("option");
			option.text = telescopesSelect[i].name;
			select.add(option)
		}
	}
}


let g_selectTelescopeIdx = null;
let g_selectInstrument = null;
let g_selectTelescope = null;
let g_selectSelectTelescope = null;
let g_selectFocus = null;
let g_selectFilter = null;
function OnSelectFilter()
{
	const select = document.getElementById("selectFilter");
	const instrument = g_selectInstrument;
	
	let i;
	let found = false;
	if (select.value == "No Filter")
	{
		g_selectFilter = null;
	}
	else
	{
		if (instrument.type == "Imager" && instrument.filters.length > 0)
		{
			for (i = 0; i < instrument.filters.length && !found; i++)
			{
				if (select.value == instrument.filters[i].name)
				{
					g_selectFilter = instrument.filters[i];
					found = true;
				}
			}
		}
		else
			g_selectFilter = null;
		
	}
}

function OnSelectInstrument()
{
	const select = document.getElementById("selectInstrument");
	const telescope = g_selectSelectTelescope;
	
	let i;
	let found = false;
	for (i = 0; i < telescope.instruments.length && !found; i++)
	{
		if (select.value == telescope.instruments[i].name)
		{
			g_selectInstrument = telescope.instruments[i].instrument;
			g_selectFocus = telescope.instruments[i].focus;
			populateFiltersSelect();
			found = true;
		}
	}
	OnSelectFilter();

}


function OnSelectTelescope()
{
	const select = document.getElementById("selectTelescope");
	let i;
	let found = false;
	for (i = 0; i < telescopesSelect.length && !found; i++)
	{
		if (telescopesSelect[i].name == select.value)
		{
			g_selectTelescopeIdx = telescopesSelect[i].idx;
			g_selectSelectTelescope = telescopesSelect[i];
			g_selectTelescope = telescopesSelect[i].telescope;
			populateInstrumentSelect();
			found = true;
		}
	}
	OnSelectInstrument();
}

function populateInstrumentSelect()
{
	let select = document.getElementById("selectInstrument");
	// clear existing options
	while (select.options.length > 0)
	{
		select.remove(0);
	}
	const telescope = g_selectSelectTelescope;
	
	let i;
	for (i = 0; i < telescope.instruments.length; i++)
	{
		let option = document.createElement("option");
		option.text = telescope.instruments[i].name;
		select.add(option)
	}
}

function populateFiltersSelect()
{
	let select = document.getElementById("selectFilter");
	// clear existing options
	while (select.options.length > 0)
	{
		select.remove(0);
	}
	const instrument = g_selectInstrument;
	
	if (instrument.type == "Imager" && instrument.filters.length > 0)
	{
		select.disabled = false;
		let option = document.createElement("option");
		option.text = "No Filter";
		select.add(option)
		let i;
		for (i = 0; i < instrument.filters.length; i++)
		{
			let option = document.createElement("option");
			option.text = instrument.filters[i].name;
			option.style = "text-align:center;"
			select.add(option)
		}
	}
	else
	{
		select.disabled = true;
	}
}
populateTelescopesSelect();
OnSelectTelescope(); // make sure everything is initially populated


let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d");

//const minimumControlsHeightTop = 190;

theCanvas.height = window.innerHeight - 120;
theCanvas.width = window.innerWidth;

let	g_clusters = newClusters("OpC");

let g_clusterSelectList = new Object();

function waitForClustersReady()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		// clear existing options
		
		let i;
		for (i = 0; i < g_clusters.length; i++)
		{
			const cluster = g_clusters.at(i);
			if (cluster.cluster.stars > 0 && cluster.cluster.cluster_size < (5.0 / 60.0)) // 5'
			{
				let option = document.createElement("option");
				option.text = cluster.main_id;
				g_clusterSelectList[option.text] = cluster.main_id;
				select.add(option)
			}
		}
		OnSelectCluster();
	}
	else
		window.setTimeout(waitForClustersReady, 100.0);
}
waitForClustersReady();

let g_starsCluster = null;
let g_selectedCluster = null;
function OnSelectCluster()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		let cluster = g_clusters.findClusterByID(g_clusterSelectList[select.value]);
		g_selectedCluster = cluster;
		if (cluster !== null)
		{
			g_starsCluster = newStarSet(cluster.star_set);
		}
		else
			g_starsCluster = null;
	}
}

let g_exposure = 10.0;
function OnSetExposure()
{
		let select = document.getElementById("exposure");
		let value = select.value.trim();
		let i = 0;
		while (i < value.length && ((value.charCodeAt(i) >= 0x30 && value.charCodeAt(i) <= 0x39) || value.charCodeAt(i) == 0x2e))
			i++;
		let exposure = Number(value.substring(0,i));
		if (!isNaN(exposure) && exposure > 0)
		{
			if (i < value.length)
			{
				while (i < value.length && value.charCodeAt(i) == 0x20)
					i++;
				if (i < value.length && value.charAt(i) == 'd')
				{
					if (exposure > 0.166666667)
						exposure = 0.166666667;
					select.value = exposure + "d";
					exposure *= 86400.0;
				}
				else if (i < value.length && value.charAt(i) == 'h')
				{
					if (exposure > 4)
						exposure = 4;
					select.value = exposure + "h";
					exposure *= 3600.0;
				}
				else if (i < value.length && value.charAt(i) == 'm')
				{
					if (exposure > 240)
						exposure = 240;
					select.value = exposure + "m";
					exposure *= 60.0;
				}
				else
				{
					if (exposure > 14400)
						exposure = 14400;
					select.value = exposure + "s";
				}
			}
			else
			{
				if (exposure > 14400)
					exposure = 14400;
				select.value = exposure + "s";
			}
			g_exposure = exposure;
		}
		else
			select.value = g_exposure + "s";
				
}
let select = document.getElementById("exposure");
select.value = g_exposure + "s";


let g_dl = false;
let g_dlDataFilled = false;
let g_dlData = "Star, U, B, V, R, I, J, H, K, sp_type, lm class, sp type qual, dm, used sp_type, used lum class, Au, Av, Ab, Ar, Ai, Aj, Ah, Ak, A, σA, bA, σbA\n";

let g_reprocessed_Fluxes = false;
function work(){

// determine which planet is currently selected


	// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

	if (g_starsCluster !== null && g_starsCluster.ready)
	{
		var imageX = theCanvas.width * 0.5;
		var imageY = theCanvas.height * 0.5;
		var size = Math.floor(Math.min(theCanvas.width,theCanvas.height) * 0.80);
		var halfWidth = size * 0.5;
		var halfHeight = size * 0.5;
		
		const mapImage = new ImgData(theContext, imageX - halfWidth, imageY - halfHeight, size, size);
		const len = g_starsCluster.length;
		let i;
/*		if (!g_reprocessed_Fluxes && g_synphotReady)
		{
//			for (i = 0; i < len; i++)
//			{
//				let star = g_starsCluster.at(i);
//				star.fluxes = determineFluxes(star,g_starsCluster.dm_avg);
//			}
/*			let attempted_fluxes_dl = "Star, U, B, V, R, I, J, H, K, sp_type, lm class, sp type qual, dm, used sp_type, used lum class, Au, Av, Ab, Ar, Ai, Aj, Ah, Ak, A, σA, bA, σbA\n";
			
			for (i = 0; i < g_attemptedFluxes.length; i++)
			{
				attempted_fluxes_dl += "\"" + g_attemptedFluxes[i].star.main_id +"\", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.U + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.B + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.V + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.R + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.I + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.J + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.H + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.K + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].star.num_sp_type + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].star.num_luminosity_class + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].star.sp_qual + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.dm + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].phot.num_sp_type + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].phot.num_luminosity_class + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.U + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.B + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.V + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.R + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.I + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.J + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.H + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A.K + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.Am + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.sigmaAm + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A_intercept + ", "
				attempted_fluxes_dl += g_attemptedFluxes[i].fluxes.A_sigmaIntercept + ", "
				attempted_fluxes_dl += "\n";
				
			}
//			download(attempted_fluxes_dl,"attempts.csv","csv");
//			download(g_astroUnreadableSpType,"sp_types_unreadable.txt");
			g_reprocessed_Fluxes = true;
		}*/
		const lambda = g_selectFilter === null ? 550.0e-9 : g_selectFilter.central_wavelength * 1e-9;
		const D = g_selectTelescope._diameter;
		const Acm = D * D * 100.0 * 100.0 * Math.PI;
		const a = D * 0.5; // m
		const f = g_selectFocus._focal_length; // m
		if (g_selectInstrument.type == "Imager")
		{
			const chipsize = g_selectInstrument.pixel_size * 1.0e-6 * g_selectInstrument.resolution;
			const resolution = g_selectInstrument.resolution;
			const altitude = g_selectTelescope._altitude;
			const r1 = 3.831705970207513;//newton_raphson(3.0,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);
			const diff_arcsec = r1 * 0.5 * lambda / D * (180.0 * 3600.0 / Math.PI);
			const pixel_scale = (chipsize / resolution) / f * (180.0 * 3600.0 / Math.PI);
			const fov = pixel_scale * resolution;
			const seeing = 2.0 - altitude / 4200 * 1.5; // very rought method of calculating seeing: 2" at sea level down to 0.5" at Keck (4200 m)
			const seeing_disk_pixels = g_selectTelescope._adaptive_optics ? 0.5 : seeing / pixel_scale;
			let displayCount = 0;
			const integration_time = 0.01;
			const optical_transparency = 0.8;
			const quatum_efficiency = g_selectInstrument.quantum_efficiency;
			
			for (i = 0; i < len; i++)
			{
				const star = g_starsCluster.at(i);
				let x = ((star.ra - g_selectedCluster.cluster.ra.average) * 15.0 * 3600.0) * pixel_scale / halfWidth;
				let y = ((star.dec - g_selectedCluster.cluster.dec.average) * 15.0 * 3600.0) * pixel_scale / halfHeight;
				if (Math.abs(x) <= 1.0 && Math.abs(y) <= 1.0)
				{
/*					if (!g_dl)
					{
						g_dlDataFilled = true;
						g_dlData += "\"" + star.main_id +"\", "
						g_dlData += star.fluxes.U + ", "
						g_dlData += star.fluxes.B + ", "
						g_dlData += star.fluxes.V + ", "
						g_dlData += star.fluxes.R + ", "
						g_dlData += star.fluxes.I + ", "
						g_dlData += star.fluxes.J + ", "
						g_dlData += star.fluxes.H + ", "
						g_dlData += star.fluxes.K + ", "
						g_dlData += star.num_sp_type + ", "
						g_dlData += star.num_luminosity_class + ", "
						g_dlData += star.sp_qual + ", "
						g_dlData += star.fluxes.dm + ", "
						g_dlData += star.fluxes.phot.num_sp_type + ", "
						g_dlData += star.fluxes.phot.num_luminosity_class + ", "
						g_dlData += star.fluxes.A.U + ", "
						g_dlData += star.fluxes.A.B + ", "
						g_dlData += star.fluxes.A.V + ", "
						g_dlData += star.fluxes.A.R + ", "
						g_dlData += star.fluxes.A.I + ", "
						g_dlData += star.fluxes.A.J + ", "
						g_dlData += star.fluxes.A.H + ", "
						g_dlData += star.fluxes.A.K + ", "
						g_dlData += star.fluxes.Am + ", "
						g_dlData += star.fluxes.sigmaAm + ", "
						g_dlData += star.fluxes.A_intercept + ", "
						g_dlData += star.fluxes.A_sigmaIntercept + ", "
						g_dlData += "\n";
					}*/
					//console.log("here " + starsm6.at(i).latitude + " " + starsm6.at(i).longitude + " " + projection.x + " " + projection.y);
					let filter;
					let mag;
					let flux = 0;
					if (g_selectFilter !== null)
					{
						if (g_selectFilter.name == "K")
						{
							mag = star.fluxes.K + extinction_coefficient("K");
						}
						else if (g_selectFilter.name == "H")
						{
							mag = star.fluxes.H + extinction_coefficient("H");
						}
						else if (g_selectFilter.name == "J")
						{
							mag = star.fluxes.J + extinction_coefficient("J");
						}
						else if (g_selectFilter.name == "I")
						{
							mag = star.fluxes.I + extinction_coefficient("I");
						}
						else if (g_selectFilter.name == "R")
						{
							mag = star.fluxes.R + extinction_coefficient("R");
						}
						else if (g_selectFilter.name == "V")
						{
							mag = star.fluxes.V + extinction_coefficient("V");
						}
						else if (g_selectFilter.name == "B")
						{
							mag = star.fluxes.B + extinction_coefficient("B");
						}
						else if (g_selectFilter.name == "U")
						{
							mag = star.fluxes.U + extinction_coefficient("U");
						}
						const filt = getFilterUVBRI(g_selectFilter.name);
						if (filt !== null)
							flux = fluxToPhotonFlux(filt.central_wavelength * 1.0E-9,(filt.blue_spectral_width + filt.red_spectral_width) * 1.0E-9,MagtoFlux(g_selectFilter.name,mag));
					}
					else
					{
						flux = 0;
						if (star.U !== null)
						{
							const filt = getFilterUVBRI("U");
							flux += fluxToPhotonFlux(filt.central_wavelength * 1.0E-9,(filt.blue_spectral_width + filt.red_spectral_width) * 1.0E-9,MagtoFlux("U",star.U + extinction_coefficient("U")));
						} // @@TODO: estimate the magnitude based on spectral type and other relevant magnitudes
						if (star.B !== null)
						{
							flux += fluxToPhotonFlux(UVBRI[1].central_wavelength * 1.0E-9,(UVBRI[1].blue_spectral_width + UVBRI[1].red_spectral_width) * 1.0E-9,MagtoFlux("B",star.B + extinction_coefficient("B")));
						} // @@TODO: estimate the magnitude based on spectral type and other relevant magnitudes
						if (star.V !== null)
						{
							flux += fluxToPhotonFlux(UVBRI[2].central_wavelength * 1.0E-9,(UVBRI[2].blue_spectral_width + UVBRI[2].red_spectral_width) * 1.0E-9,MagtoFlux("V",star.V + extinction_coefficient("V")));
						} // @@TODO: estimate the magnitude based on spectral type and other relevant magnitudes
						if (star.R !== null)
						{
							flux += fluxToPhotonFlux(UVBRI[3].central_wavelength * 1.0E-9,(UVBRI[3].blue_spectral_width + UVBRI[3].red_spectral_width) * 1.0E-9,MagtoFlux("R",star.R + extinction_coefficient("R")));
						} // @@TODO: estimate the magnitude based on spectral type and other relevant magnitudes
						if (star.I !== null)
						{
							flux += fluxToPhotonFlux(UVBRI[4].central_wavelength * 1.0E-9,(UVBRI[4].blue_spectral_width + UVBRI[4].red_spectral_width) * 1.0E-9,MagtoFlux("I",star.I + extinction_coefficient("I")));
						} // @@TODO: estimate the magnitude based on spectral type and other relevant magnitudes
					}
					
					
					const px_filling = flux * g_exposure * optical_transparency * quatum_efficiency * Acm / g_selectInstrument.gain;
//					const 
					const color = new RGB(255,255,255);
					
					drawStarFlux(mapImage, (1.0 - x) * halfWidth, (1.0 - y) * halfHeight, seeing_disk_pixels, px_filling,g_selectInstrument.full_scale,color);
				}
			}
		}
	//	console.log(displayCount);
		mapImage.draw();
	}
	else
	{
		if (g_clusters.ready)
		{
			theContext.save();
			theContext.textAlign = "center";
			theContext.fillStyle = "#FFFFFF";
			theContext.font = "20px Arial";
			theContext.fillText("Standby .. Slewing Telescope",theCanvas.width * 0.5,theCanvas.height * 0.5);
			theContext.restore();
		}
		else
		{
			theContext.save();
			theContext.textAlign = "center";
			theContext.fillStyle = "#FFFFFF";
			theContext.font = "20px Arial";
			theContext.fillText("Standby .. Opening Dome",theCanvas.width * 0.5,theCanvas.height * 0.5);
			theContext.restore();
		}
	}
//	if (!g_dl && g_dlDataFilled)
//	{
//		download(g_dlData,"data.csv","csv");
//		g_dl = true;
//	}
	commonUIdraw(theContext);
	
	window.setTimeout(work, 1000.0/30.0);
}

work();

