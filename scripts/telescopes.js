class Focus
{
	constructor(name, focal_length, f_stop, field_angle, plate_scale, instruments)
	{
		this._name = name;
		this._focal_length = focal_length;
		this._field_angle = field_angle;
		this._plate_scale = plate_scale;
		this._f_stop = f_stop;
		this._instruments = instruments;
	}
}

class Telescope
{
	constructor(name, diameter, space_based, latitude, longitude, altitude, adaptive_optics, foci)
	{
		this._name = name;
		this._diameter = diameter;
		this._space_based = space_based;
		this._latitude = latitude;
		this._longitude = longitude;
		this._altitude = altitude;
		this._adaptive_optics = adaptive_optics;
		this._foci = foci;
	}
}

class Imager
{
	constructor(name, min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
	{
		this.name = name;
		this.type = "Imager";
		this.min_wavelength = min_wavelength;
		this.max_wavelength = max_wavelength;
		this.resolution = resolution;
		this.quantum_efficiency = quantum_efficiency;
		this.readout_time = readout_time;
		this.pixel_size = pixel_size;
		this.gain = gain;
		this.readout_noise = readout_noise;
		this.full_scale = full_scale;
		this.filters = filters;
	}
}


class Spectrograph
{
	constructor(name, type, min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, gain, readout_noise, full_scale)
	{
		this.name = name;
		this.type = "Spectrograph";
		this.min_wavelength = min_wavelength;
		this.max_wavelength = max_wavelength;
		this.resolution = resolution;
		this.quantum_efficiency = quantum_efficiency;
		this.readout_time = readout_time;
		this.gain = gain;
		this.readout_noise = readout_noise;
		this.full_scale = full_scale;
	}
}
class Filter
{
	constructor (name, central_wavelength, blue_spectral_width, red_spectral_width, maximum_transmission)
	{
		this.name = name;
		this.central_wavelength = central_wavelength;
		this.blue_spectral_width = blue_spectral_width;
		this.red_spectral_width = red_spectral_width;
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

let telescopes = new Array();
let foci = new Array();
let focus;
let instruments = new Array();
let instrument;

telescopes.push(new Telescope("Hobby-Eberly Telescope",10.0, false, (30.0 + 40.0/60 + 53.2/3600), (-(104 + 53.0/3600)), 2026, true,[new Focus("Prime",13.08,0,0,0)]));

foci = new Array();
// ommitted the George and Cynthia Mitchell Spectrograph (GCMS) / VIRUS-P
foci.push(new Focus("Prime",10.68,3.93,0,0,null))
instruments = new Array();
instruments.push(new Spectrograph("IGRINS",1470,1810,40000,0.8,2.05,1,50000))
instruments.push(new Imager("DIAFI/TK3",300,1000,2048,0.8,41.94,24.0, 0.584, 4.2, 260000,UVBRI))
instruments.push(new Imager("DIAFI/EV1",300,1000,4096,0.8,55.92,15,0.75,2,260000,UVBRI))
foci.push(new Focus("Ritchey-Cassegrain f/8.8",23.91,8.8,61.5,8.62,instruments))
foci.push(new Focus("Cassegrain f/17.7",47.98,17.65,31,4.29,null))
/// omitting the spectrographs on the Cassegrain - I'd have to get ahold of Phillip to get full details, and it really isn't worth it for this
//instruments = new Array(); 
//instruments.push(new Spectrograph("Tull Spectrograph (TS1)",....)
//instruments.push(new Spectrograph("Cross-Dispersed Echelle Spectrograph (TS2)",....)
foci.push(new Focus("Coude f/32.5",88.43,32.54,6,2.32,null))
telescopes.push(new Telescope("Harlan J. Smith Telescope",2.72, false, 	30.67174, -104.02202, 6660*12*2.54/100, false,foci));

foci = new Array();
foci.push(new Focus("Prime",8.13,3.9,63.5,25.4,null));
instruments = new Array();
instruments.push(new Imager("ProEM",120,1200,1024,0.95,10.4,13.0, 1.0, 3.5, 500000,UVBRI))
instruments.push(new Imager("CQUEAN",300,1100,1024,0.9,20.0,13.0, 2.0, 2.9, 65535,UVBRI))
foci.push(new Focus("Cassegrain",28.53,13.7,20,7.23,instruments));
foci.push(new Focus("Coude",47.70,22.9,0,4.3,null));
telescopes.push(new Telescope("Otto Struve Telescope",2.08, false, 	30.67146, -104.02283, 6660*12*2.54/100, false,foci));


foci = new Array();
foci.push(new Focus("Prime",2.29,3.0,0,0,null));
instruments = new Array();
instruments.push(new Imager("Prime Focus Corrector",400,1000,2048,0.43,209.7,15.0, 1.0, 2, 65536,UVBRI)) /// based on CCD3041 spec sheet; gain and max counts a guess; readout time and readout noise based on 2 kHz sampling and memory of using this POS camera
foci.push(new Focus("Prime Focus Corrector",2.272,2.98,46.2,1.3553,instruments));

telescopes.push(new Telescope("McDonald Observatory 30\"",0.767, false, 	30.67079, -104.02276, 6640*12*2.54/100, false,foci));


foci = new Array();
foci.push(new Focus("f/15",149.6,15,0,0.725,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
foci.push(new Focus("f/25",249.7,25,0,1.211,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
foci.push(new Focus("f/40",395.0,40,0,1.915,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
telescopes.push(new Telescope("Keck",10.95, false, 	19 + 49/60.0 + 35/3600.0, -(155 + 28/60 + 28/3600), 4145, true,foci));

foci = new Array();
instruments = new Array();
instruments.push(new Imager("HSC",400,1000,2048 * 17,0.96,20.0,15.0, 3.0, 4.5, 50000,UVBRI)) // https://www.subarutelescope.org/Observing/Instruments/HSC/
foci.push(new Focus("f/2",16.4,2,0,0,instruments));//focal_length, f_stop, field_angle, plate_scale, instruments)
telescopes.push(new Telescope("Subaru",8.2, false, 	19 + 49/60.0 + 32/3600.0, -(155 + 28/60 + 34/3600), 4139, false,foci));


let telescopesSelect = new Array();

function prepTelescopes()
{
	let i;
	const m = telescopes.length;
	for (i = 0; i < m; i++)
	{
		let telescope = telescopes[i];
		let sel = new Object();
		sel.name = telescope._name;
		sel.idx = i;
		sel.telescope = telescope;
		sel.instruments = new Array();
		if (telescope._foci !== null && telescope._foci !== undefined)
		{
			let j;
			for (j = 0; j < telescope._foci.length; j++)
			{
				let focus = telescope._foci[j];
				if (focus._instruments !== null && focus._instruments !== undefined)
				{
					let k;
					for (k = 0; k < focus._instruments.length; k++)
					{
						let instrument = focus._instruments[k];
						let inst = new Object();
						inst.name = instrument.name;
						inst.focus_idx = j;
						inst.inst_idx = k;
						inst.focus = focus;
						inst.instrument = instrument;
						sel.instruments.push(inst);
					}	
				}
			}
		}
		telescopesSelect.push(sel);
	}
}
prepTelescopes();

