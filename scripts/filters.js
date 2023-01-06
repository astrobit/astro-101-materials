class Filter
{
	constructor (name, central_wavelength, blue_spectral_width, red_spectral_width, maximum_transmission)
	{
		this.name = name;
		this.central_wavelength = central_wavelength;
		this.blue_spectral_width = blue_spectral_width;
		this.red_spectral_width = red_spectral_width;
		this.maximum_transmission = maximum_transmission;
	}
}

let filters = new Array();
let filter;

let UVBRI = new Array();
UVBRI.push(new Filter("U",364,66,66,0.5));
UVBRI.push(new Filter("B",445,94,94,0.5));
UVBRI.push(new Filter("V",551,88,88,0.5));
UVBRI.push(new Filter("R",658,138,138,0.5));
UVBRI.push(new Filter("I",806,149,149,0.5));


let UVBRIX = new Array();
// source: https://old.aip.de/en/research/facilities/stella/instruments/data/johnson-ubvri-filter-curves
UVBRIX.push(new Filter("U",365.6,34.0,34.0,0.65));
UVBRIX.push(new Filter("B",435.3,78.1,78.1,0.8));
UVBRIX.push(new Filter("V",547.7,99.1,99.1,0.95));
UVBRIX.push(new Filter("R",536.9,106.56,106.56,0.85));
UVBRIX.push(new Filter("I",879.7,289.2,289.2,0.95));
//UVBRIX.push(new Filter("Z",900,149,149,0.5));
// source: http://star-www.rl.ac.uk/docs/sc6.htx/sc6se7.html
UVBRIX.push(new Filter("Y",1020,120,120,0.5));
UVBRIX.push(new Filter("J",1220,213,213,0.5));
UVBRIX.push(new Filter("H",1630,307,307,0.5));
UVBRIX.push(new Filter("K",2190,390,390,0.5));
UVBRIX.push(new Filter("L",3450,472,472,0.5));
UVBRIX.push(new Filter("M",4750,460,460,0.5));
UVBRIX.push(new Filter("N",10500,2500,2500,0.5));
UVBRIX.push(new Filter("Q",21000,5800,5800,0.5));

function getFilterUVBRI(filter)
{
	let i;
	let ret = null;
	for (i = 0; i < UVBRIX.length && ret === null; i++)
	{
		if (UVBRIX[i].name == filter)
			ret = UVBRIX[i];
	}
	return ret;
}

let SloanFilters = new Array();
// source: https://old.aip.de/en/research/facilities/stella/instruments/data/sloanugriz-filter-curves
SloanFilters.push(new Filter("u'",361.5,33.9,33.9,0.7));
SloanFilters.push(new Filter("g'",475.4,138.7,138.7,0.9));
SloanFilters.push(new Filter("r'",620.4,124.0,124.0,0.9));
SloanFilters.push(new Filter("i'",769.8,130.3,130.3,0.9));
SloanFilters.push(new Filter("z'",966.5,255.8,255.8,0.9));

