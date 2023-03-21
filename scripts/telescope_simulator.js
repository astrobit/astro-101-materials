let g_starsCluster = null;
let g_selectedCluster = null;
let	g_clusters = newClusters("OpC");
let g_clusterSelectList = new Object(); // this object stores names of clusters because the option text erases extra spaces in the id

let g_starListReady = false;

let theCanvas = document.getElementById("theCanvas");

//let theContext = theCanvas.getContext("2d");
//theContext.willReadFrequently = true;

//const minimumControlsHeightTop = 190;
const recttop = document.getElementById("seeing").getBoundingClientRect();
//const rectbot = document.getElementById("recenter").getBoundingClientRect();

theCanvas.height = Math.max(window.innerHeight - 60 - recttop.bottom,400);
theCanvas.width = window.innerWidth - 40;



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
function OnSelectFilter(filter)
{
	const select = document.getElementById("selectFilter");
	const instrument = g_selectInstrument;

	let i;
	let found = false;
	if (select.value == "No Filter")
	{
		g_selectFilter = null;
		g_starListReady = false;
		fillStarList();
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
			g_starListReady = false;
			fillStarList();
		}
		else
		{
			g_selectFilter = null;
			g_starListReady = false;
			fillStarList();
		}		
	}
	draw();
}

function OnSelectInstrument()
{
	const select = document.getElementById("selectInstrument");
	const telescope = g_selectSelectTelescope;
	
	let i;
	let found = false;
	let filter = null;
	for (i = 0; i < telescope.instruments.length && !found; i++)
	{
		if (select.value == telescope.instruments[i].name)
		{
			g_selectInstrument = telescope.instruments[i].instrument;
			g_selectFocus = telescope.instruments[i].focus;
			if (g_selectFilter !== null)
				filter = g_selectFilter.name;
			else
				filter = null;
			populateFiltersSelect();
			found = true;
		}
	}
	if (filter !== null)
	{
		// reselect the prior filter if available.
		if (g_selectInstrument.type == "Imager" && g_selectInstrument.filters.length > 0)
		{
			found = false;
			for (i = 0; i < g_selectInstrument.filters.length && !found; i++)
			{
				if (filter == g_selectInstrument.filters[i].name)
				{
					const selectFilter = document.getElementById("selectFilter");
					selectFilter.value = filter;
					found = true;
				}
			}
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



function readify_name(name)
{
	let ret = name;
	if (name.startsWith("Cl"))
	{
		ret = name.substr(2).trim();
	}
	else if (name.startsWith("NAME"))
	{
		ret = name.substr(4).trim();
	}
	else if (name.startsWith("HIDDEN NAME")) {
		ret = name.substr(11).trim();
	}
	return ret;
}

function waitForClustersReady()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		// clear existing options
		let cluster_list = new Array();
		
		let i;
		for (i = 0; i < g_clusters._ids.length; i++)
		{
			const cluster = g_clusters.at(g_clusters._ids[i].idx);
			if (cluster.cluster.stars > 0)//&& cluster.cluster.cluster_size < (5.0 / 60.0)) // 5'
			{
				cluster_list.push({ idx: g_clusters._ids[i].idx, id: readify_name(g_clusters._ids[i].id) });
			}
		}
		cluster_list.sort(function (a, b) { return a.id.localeCompare(b.id) });
		for (i = 0; i < cluster_list.length; i++)
		{
			let option = document.createElement("option");
			option.text = cluster_list[i].id;
			g_clusterSelectList[option.text] = cluster_list[i].idx;
			select.add(option)
		}
		OnSelectCluster();
	}
	else
		window.setTimeout(waitForClustersReady, 100.0);
}
waitForClustersReady();


function waitForStarsReady()
{
	if (g_starsCluster !== null && g_starsCluster.ready)
	{
		g_starListReady = false;
		fillStarList();
		draw();
	}
	else
		window.setTimeout(waitForStarsReady, 100.0);
}

function OnSelectCluster()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		let cluster = g_clusters.at(g_clusterSelectList[select.value]);
		g_selectedCluster = cluster;
		if (cluster !== null)
		{
			g_starsCluster = newStarSet(cluster.star_set);
		}
		else
			g_starsCluster = null;
	}
	draw();
	window.setTimeout(waitForStarsReady, 100.0);
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
					exposure *= 86400.0;
				}
				else if (i < value.length && value.charAt(i) == 'h')
				{
					exposure *= 3600.0;
				}
				else if (i < value.length && value.charAt(i) == 'm')
				{
					exposure *= 60.0;
				}
			}
			if (exposure < 0.1)
				exposure = 0.1;
			else if (exposure > 14400)
				exposure = 14400;
			if (exposure < 300)				
				select.value = Math.round(exposure * 100) / 100 + " sec";
			else if (exposure < 7200)
				select.value = Math.round(exposure / 60 * 100) / 100 + " min";
			else 
				select.value = Math.round(exposure / 3600 * 100) / 100 + " hr";
			g_exposure = exposure;
		}
		else
			select.value = g_exposure + "s";
				
	draw();
}
let select = document.getElementById("exposure");
select.value = g_exposure + "s";


//let g_dl = false;
//let g_dlDataFilled = false;
//let g_dlData = "Star, U, B, V, R, I, J, H, K, sp_type, lm class, sp type qual, dm, used sp_type, used lum class, Au, Av, Ab, Ar, Ai, Aj, Ah, Ak, A, σA, bA, σbA\n";

//let g_reprocessed_Fluxes = false;

function setOutputText(id,value)
{
	let elem = document.getElementById(id);
	if (elem !== null)
		elem.value = value;
}

let drawer = newTelescopeRenderer(theCanvas);

function fillStarList()
{
	if (g_starsCluster !== null && g_starsCluster.ready)
	{
		drawer.resetStarList();
		const lambda = g_selectFilter === null ? (g_selectInstrument.min_wavelength + g_selectInstrument.max_wavelength) * 0.5e-9: g_selectFilter.central_wavelength * 1e-9;
		const D = g_selectTelescope._diameter;
		const a = D * 0.5; // m
		const Acm = a * a * 100.0 * 100.0 * Math.PI;
		const f = g_selectFocus._focal_length; // m

		const optical_transparency = 0.8;
		const quatum_efficiency = g_selectInstrument.quantum_efficiency;
		const filt = g_selectFilter !== null ? getFilterUVBRI(g_selectFilter.name) : null;
		const extinction = g_selectFilter !== null ? extinction_coefficient(g_selectFilter.name) : null;
		let filter_transmission = 1.0;

		let instrument_sensitivity = 1.0;
		let flux_m0;
		const filters = ["U","B","V","R","I"];
		if (filt !== null)
		{
			filter_transmission = filt.maximum_transmission;
			let delta_red = filt.central_wavelength - g_selectInstrument.max_wavelength;
			let red_red = Math.max(Math.min(delta_red / filt.red_spectral_width,0),-1); // if between -1 and 0, some loss; if < -1, no loss, if > 0, full loss
			let red_blue = Math.min(Math.max(delta_red / filt.blue_spectral_width,0),1) // if between 0 and 1, some loss; if > 1, full loss, if < 0, no loss
			let red = (-red_red + (1 - red_blue)) * 0.5;
			let delta_blue = filt.central_wavelength - g_selectInstrument.min_wavelength;
			let blue_red = Math.max(Math.min(delta_blue / filt.red_spectral_width,0),-1); // if between -1 and 0, some loss; if < -1, full loss, if > 0, no loss
			let blue_blue = Math.min(Math.max(delta_blue / filt.blue_spectral_width,0),1) // if between 0 and 1, some loss; if > 1, no loss, if < 0, full loss
			let blue = (blue_blue + (1 + blue_red)) * 0.5;
			instrument_sensitivity = Math.min(red,blue);
			flux_m0 = fluxToPhotonFlux(filt.central_wavelength * 1.0E-7,(filt.blue_spectral_width + filt.red_spectral_width) * 1.0E-7,MagtoFlux(g_selectFilter.name,extinction_coefficient(g_selectFilter.name))); 
		}
		else
		{
			let j;
			flux_m0 = {};
			for (j = 0; j < filters.length; j++)
			{
				const filt = getFilterUVBRI(filters[j]);
				flux_m0[filters[j]] = fluxToPhotonFlux(filt.central_wavelength * 1.0E-7,(filt.blue_spectral_width + filt.red_spectral_width) * 1.0E-7,MagtoFlux(filters[j],extinction_coefficient(filters[j])));
			}
		}
		const flux_scaling = optical_transparency * quatum_efficiency * Acm / g_selectInstrument.gain * filter_transmission * instrument_sensitivity;



		const len = g_starsCluster.length;
		for (i = 0; i < len; i++)
		{
			const star = g_starsCluster.at(i);
			let flux = 0.0;
			if (filt !== null)
			{
				flux = flux_m0 * Math.pow(10.0,-star.fluxes[g_selectFilter.name] * 0.4);
			}
			else
			{
				for (j = 0; j < filters.length; j++)
				{
					flux += flux_m0[filters[j]] * Math.pow(10.0,-star.fluxes[filters[j]] * 0.4);
				}
			}

			let filter;
			const eff_flux = flux * flux_scaling;
//			if (g_selectFilter !== null && star.fluxes[g_selectFilter.name] < 8.5)
//				console.log(star.fluxes[g_selectFilter.name] + " " + flux + " " + eff_flux + " " + flux_scaling);
			if (!isNaN(eff_flux))
				drawer.addStar(star.ra / 15.0,star.dec,eff_flux);
		}
		g_starListReady = true;
	}
}

function draw()
{

	// clear the canvas
	if (g_starsCluster !== null && g_starsCluster.ready)
	{
		if (!g_starListReady)
		{
			fillStarList();
		}
		const len = g_starsCluster.length;
		let i;

		const clustRAdispl = degreestoHMSDisplayable(g_selectedCluster.cluster.ra.average !== null ? g_selectedCluster.cluster.ra.average : g_selectedCluster.ra);
		const clustDecdispl = degreestoDMSDisplayable(g_selectedCluster.cluster.dec.average !== null ? g_selectedCluster.cluster.dec.average : g_selectedCluster.dec);
		setOutputText("cluster ra",clustRAdispl.hr + "h " + clustRAdispl.min + "m " + clustRAdispl.sec + "s");
		setOutputText("cluster dec",clustDecdispl.deg + "° " + clustDecdispl.min + "' " + clustDecdispl.sec + "\"");
		let clustSize = g_selectedCluster.cluster.cluster_size;
		let clustSizeUnits = "°"
		if (clustSize !== null && clustSize < 1)
		{
			clustSize *= 60.0;
			clustSizeUnits = "'";
		}
		if (clustSize !== null && clustSize < 1)
		{
			clustSize *= 60.0;
			clustSizeUnits = "\"";
		}
		
			
		setOutputText("cluster size",clustSize !== null ? (Math.round(clustSize * 10.0) / 10.0).toString() + clustSizeUnits : "");
		setOutputText("cluster parallax",g_selectedCluster.cluster.plx.average !== null ? Math.round(g_selectedCluster.cluster.plx.average*10.0)/10.0 + " mas": (g_selectedCluster.plx_value !== null ? g_selectedCluster.plx_value + " mas" : ""));
			
		const lambda = g_selectFilter === null ? (g_selectInstrument.min_wavelength + g_selectInstrument.max_wavelength) * 0.5e-9: g_selectFilter.central_wavelength * 1e-9;
		const D = g_selectTelescope._diameter;
		const a = D * 0.5; // m
		const Acm = a * a * 100.0 * 100.0 * Math.PI;
		const f = g_selectFocus._focal_length; // m
		const arcsecRadians = (180.0 * 3600.0 / Math.PI);
		const radiansArcsec = Math.PI / (180.0 * 3600.0)
		const altitude = g_selectTelescope._altitude;
		const diff_radians = airyDiskSize(lambda, D);
		const diff_arcsec = degrees(diff_radians) * 3600.0;
		const seeing = g_selectTelescope._space_based ? diff_arcsec : (altitude < 5600 ? 1.0 - altitude / 4200 * 0.75 : 0.25); // very rought method of calculating seeing: 2" at sea level down to 0.5" at Keck (4200 m)

		setOutputText("diameter",g_selectTelescope._diameter.toString() + " m");
		let collecting_area = Math.round(Math.PI * (g_selectTelescope._diameter ** 2));
		let collecting_area_units = "m²"
		if (collecting_area < 2)
		{
			collecting_area = Math.round(Math.PI * (g_selectTelescope._diameter ** 2) * 1.0e4);
			collecting_area_units = "cm²"
		}
		else if (collecting_area < 10)
			collecting_area = Math.round(Math.PI * (g_selectTelescope._diameter ** 2) * 10.0) / 10.0;
		setOutputText("collecting area",collecting_area + " " + collecting_area_units);
		setOutputText("focal length",g_selectFocus._focal_length.toString() + " m");
		const plate_scale_displ = Math.round(degrees(1.0e-3 / f) * 3600.0 * 1000.0) / 1000.0;
		setOutputText("plate scale",plate_scale_displ.toString() + " \"/mm");
		const diff_arcsec_displ = Math.round(diff_arcsec * 1000.0) / 1000.0;
		setOutputText("angular resolution",diff_arcsec_displ.toString() + "\"");
		const seeing_displ = Math.round(seeing * 2.0 * 10.0) / 10.0;
		setOutputText("adaptive optics",g_selectTelescope._adaptive_optics ? "yes" : "no");
		if (g_selectTelescope._space_based)
			setOutputText("seeing","n/a");
		else
			setOutputText("seeing",seeing_displ.toString() + "\"");

//		const color = new RGB(255, 255, 255);
		if (g_selectInstrument.type == "Imager" || g_selectInstrument.type == "Imaging Spectrograph")
		{


			const chipsize = g_selectInstrument.pixel_size * 1.0e-6 * g_selectInstrument.resolution_imager;
			const resolution = g_selectInstrument.resolution_imager;
			const pixel_scale = degrees(g_selectInstrument.pixel_size * 1.0e-6 / f) * 3600.0;
			const fov = pixel_scale * resolution;
			
			setOutputText("resolution",g_selectInstrument.resolution_imager.toString() + "×" + g_selectInstrument.resolution_imager.toString());
			const pixel_scale_displ = Math.round(pixel_scale * 100.0) / 100.0;
			setOutputText("pixel scale",pixel_scale_displ + "\" / px");
			const fov_displ = Math.round(fov / 60.0 * 10.0) / 10.0;
			setOutputText("field of view",fov_displ + "'");

			drawer.maxWidth = resolution;//window.innerWidth - 40;
			drawer.maxHeight = resolution;//Math.max(window.innerHeight - 60 - recttop.bottom,400);
			
			drawer.imageResolution = g_selectInstrument.resolution_imager;
			drawer.centralPosition(g_selectedCluster.cluster.ra.average / 15.0, g_selectedCluster.cluster.dec.average);
			drawer.seeingDisk = seeing;//2.0; //"
			drawer.pixelSize = g_selectInstrument.pixel_size * 1.0e-6; // m
			drawer.focalLength = f; // 1m
			drawer.diffractionDiskSize = diff_radians;// / Math.PI * wavelength / diameter;
			drawer.draw(g_exposure); // 100 s exposure
			let canvasDiv = document.getElementById("canvasdiv")
			canvasDiv.scrollLeft= Math.max((g_selectInstrument.resolution_imager - window.innerWidth)* 0.5,0);

		}
	}
}

draw();

