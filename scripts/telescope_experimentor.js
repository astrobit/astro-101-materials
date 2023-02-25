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

let g_selectFilter = null;
function OnSelectFilter(filter)
{
	const select = document.getElementById("selectFilter");

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
		for (i = 0; i < UVBRI.length && !found; i++)
		{
			if (select.value == UVBRI[i].name)
			{
				g_selectFilter = UVBRI[i];
				found = true;
			}
		}
		g_starListReady = false;
		fillStarList();
	}
	draw();
}

function populateFiltersSelect()
{
	let select = document.getElementById("selectFilter");
	// clear existing options
	while (select.options.length > 0)
	{
		select.remove(0);
	}
	
	if (UVBRI.length > 0)
	{
		select.disabled = false;
		let option = document.createElement("option");
		option.text = "No Filter";
		select.add(option)
		let i;
		for (i = 0; i < UVBRI.length; i++)
		{
			let option = document.createElement("option");
			option.text = UVBRI[i].name;
			option.style = "text-align:center;"
			select.add(option)
		}
	}
	else
	{
		select.disabled = true;
	}
}
populateFiltersSelect();

function waitForClustersReady()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		// clear existing options
		let cluster_list = new Array();
		
		let i;
		for (i = 0; i < g_clusters.length; i++)
		{
			const cluster = g_clusters.at(i);
			if (cluster.cluster.stars > 0)//&& cluster.cluster.cluster_size < (5.0 / 60.0)) // 5'
			{
				cluster_list.push(cluster.main_id);
//				let j;
//				for (j = 0; j < cluster._ids.length; j++)
//				{
//					if (cluster._ids[j] !== cluster.main_id)
//						cluster_list.push(cluster._ids[j]);
//				}
			}
		}
		cluster_list.sort();
		for (i = 0; i < cluster_list.length; i++)
		{
			let option = document.createElement("option");
			option.text = cluster_list[i];
			g_clusterSelectList[option.text] = cluster_list[i];
				
			select.add(option)
			if (cluster_list[i] == "Cl Westerlund    1")
				select.value = option.text;
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
		let cluster = g_clusters.findClusterByID(g_clusterSelectList[select.value]);
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
		select.value = g_exposure + " s";
				
	draw();
}
let select = document.getElementById("exposure");
select.value = g_exposure + " s";

let g_diameter = 10.0;
select = document.getElementById("mirror_diameter");
select.value = g_diameter;

let g_focal_length = 10.0;
select = document.getElementById("mirror_focal_length");
select.value = g_focal_length;

let g_elevation = 2000.0;
select = document.getElementById("elevation");
select.value = g_elevation;

let g_adaptive_optics = false;
select = document.getElementById("adaptive_optics");
select.checked = g_adaptive_optics;

let g_space_based = false;

let g_camera_resolution = 1024;
let g_pixel_size = 24.3;
let g_quantum_efficiency = 0.7;
let g_camera_max_wavelength = 800.0;
let g_camera_min_wavelength = 300.0;
let g_camera_gain = 2;
let g_camera_full_scale = 65536;


function OnSetDiameter()
{
	let select = document.getElementById("mirror_diameter");
	let value = select.value.trim();
	g_diameter = Math.min(Math.max(Number(value),0.01),12472000);
	g_focal_length = Math.min(Math.max(Number(value),0.5 * g_diameter),500 * g_diameter);
	select.value = g_diameter;
	select = document.getElementById("mirror_focal_length");
	select.value = g_focal_length;
	g_starListReady = false;
	fillStarList();
	draw();
}

function OnSetFocalLength()
{
	let select = document.getElementById("mirror_focal_length");
	let value = select.value.trim();
	g_focal_length = Math.min(Math.max(Number(value),0.5 * g_diameter),500 * g_diameter);
	select.value = g_focal_length;
	g_starListReady = false;
	fillStarList();
	draw();
}

function OnSetElevation()
{
	let select = document.getElementById("elevation");
	let value = select.value.trim();
	g_elevation = Math.min(Math.max(Number(value),-100),8848.9); // 8848.9 = Mt. Everest
	select.value = g_elevation;
	g_starListReady = false;
	fillStarList();
	draw();
}

function OnSetAdaptiveOptics()
{
	let select = document.getElementById("adaptive_optics");
	g_adaptive_optics = select.checked;
	g_starListReady = false;
	fillStarList();
	draw();
}

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
//		const pixel_scale = degrees(g_selectInstrument.pixel_size * 1.0e-6 / f) * 3600.0;
//		const diff_arcsec_hwhm = diff_arcsec * Math.sqrt(2.0 * Math.log(2.0)) * 4.0;
//		const seeing_disk_pixels = g_selectTelescope._adaptive_optics ? diff_arcsec_hwhm / pixel_scale : Math.max(seeing,diff_arcsec_hwhm) / pixel_scale;
//		let displayCount = 0;
		const lambda = g_selectFilter === null ? 550.0e-9 : g_selectFilter.central_wavelength * 1e-9;
		const D = g_diameter;
		const a = D * 0.5; // m
		const Acm = a * a * 100.0 * 100.0 * Math.PI;
		const f = g_focal_length; // m

		const optical_transparency = 0.8;
		const quatum_efficiency = g_quantum_efficiency;
		const filt = g_selectFilter !== null ? getFilterUVBRI(g_selectFilter.name) : null;
		const extinction = g_selectFilter !== null ? extinction_coefficient(g_selectFilter.name) : null;
		let filter_transmission = 1.0;

		let instrument_sensitivity = 1.0;
		let flux_m0;
		const filters = ["U","B","V","R","I"];
		if (filt !== null)
		{
			filter_transmission = filt.maximum_transmission;
			instrument_sensitivity = 1.0;//
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
		const flux_scaling = optical_transparency * quatum_efficiency * Acm / g_camera_gain * filter_transmission * instrument_sensitivity;



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
			
		const lambda = g_selectFilter === null ? 550.0e-9 : g_selectFilter.central_wavelength * 1e-9;
		const D = g_diameter;
		const Acm = D * D * 100.0 * 100.0 * Math.PI;
		const a = D * 0.5; // m
		const f = g_focal_length; // m
		const arcsecRadians = (180.0 * 3600.0 / Math.PI);
		const radiansArcsec = Math.PI / (180.0 * 3600.0)
		const altitude = g_elevation;
		const r1 = 3.831705970207513; // first zero of Bessel function of 1st kind - location of the first minimum of the Airy disk
		const diff_radians = airyDiskSize(lambda, D);
		const diff_arcsec = degrees(diff_radians) * 3600.0;
		const seeing = (g_space_based || g_adaptive_optics) ? 0.0 : (altitude < 5600 ? 1.0 - altitude / 4200 * 0.75 : 0.25); // very rought method of calculating seeing: 2" at sea level down to 0.5" at Keck (4200 m)

		setOutputText("diameter",g_diameter.toString() + " m");
		let collecting_area = Math.round(Math.PI * (g_diameter ** 2));
		let collecting_area_units = "m²"
		if (collecting_area < 2)
		{
			collecting_area = Math.round(Math.PI * (g_diameter ** 2) * 1.0e4);
			collecting_area_units = "cm²"
		}
		else if (collecting_area < 10)
			collecting_area = Math.round(Math.PI * (g_diameter ** 2) * 10.0) / 10.0;
		setOutputText("collecting area",collecting_area + " " + collecting_area_units);
		setOutputText("focal length",g_focal_length.toString() + " m");
		const plate_scale_displ = Math.round(degrees(1.0e-3 / f) * 3600.0 * 1000.0) / 1000.0;
		setOutputText("plate scale",plate_scale_displ.toString() + " \"/mm");
		const diff_arcsec_displ = Math.round(diff_arcsec * 1000.0) / 1000.0;
		setOutputText("angular resolution",diff_arcsec_displ.toString() + "\"");
		const seeing_displ = Math.round(seeing * 2.0 * 10.0) / 10.0;
		setOutputText("adaptive optics",g_adaptive_optics ? "yes" : "no");
		if (g_space_based)
			setOutputText("seeing","n/a");
		else
			setOutputText("seeing",seeing_displ.toString() + "\"");

		const optical_transparency = 0.8;
		const chipsize = g_pixel_size * 1.0e-6 * g_camera_resolution;
		const resolution = g_camera_resolution;
		const pixel_scale = degrees(g_pixel_size * 1.0e-6 / f) * 3600.0;
		const fov = pixel_scale * resolution;
		
		setOutputText("resolution",g_camera_resolution.toString() + "×" + g_camera_resolution.toString());
		const pixel_scale_displ = Math.round(pixel_scale * 100.0) / 100.0;
		setOutputText("pixel scale",pixel_scale_displ + "\" / px");
		const fov_displ = Math.round(fov / 60.0 * 10.0) / 10.0;
		setOutputText("field of view",fov_displ + "'");

		drawer.maxWidth = resolution;//window.innerWidth - 40;
		drawer.maxHeight = resolution;//Math.max(window.innerHeight - 60 - recttop.bottom,400);
		
		drawer.imageResolution = g_camera_resolution;
		drawer.centralPosition(g_selectedCluster.cluster.ra.average / 15.0, g_selectedCluster.cluster.dec.average);
		drawer.seeingDisk = seeing;//2.0; //"
		drawer.pixelSize = g_pixel_size * 1.0e-6; // m
		drawer.focalLength = f; // 1m
		drawer.diffractionDiskSize = diff_radians;// / Math.PI * wavelength / diameter;
		drawer.draw(g_exposure); // 100 s exposure
		let canvasDiv = document.getElementById("canvasdiv")
		canvasDiv.scrollLeft= Math.max((g_camera_resolution - window.innerWidth)* 0.5,0);

	}

}
draw();

