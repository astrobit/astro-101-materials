class Focus
{
	constructor(name, focal_length, f_stop, field_angle, plate_scale, instruments)
	{
		this._name = name;
		this._focal_length = focal_length;
		if (ValidateValue(field_angle))
			this._field_angle = field_angle;
		else
			this._field_angle = null;			
		if (ValidateValue(plate_scale))
			this._plate_scale = plate_scale;
		else
			this._plate_scale = degrees(1.0 / (focal_length * 1000.0)) * 3600.0; 
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
		this.resolution_imager = resolution;
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
		this.resolution_spectromer = resolution;
		this.quantum_efficiency = quantum_efficiency;
		this.readout_time = readout_time;
		this.gain = gain;
		this.readout_noise = readout_noise;
		this.full_scale = full_scale;
	}
}

class ImagingSpectrograph // for modern fiber type spectrographs that generate data cubes
{
	constructor(name, type, min_wavelength, max_wavelength, resolution_spectromer, resolution_imager, quantum_efficiency, readout_time, fiber_size, gain, readout_noise, full_scale)
	{
		this.name = name;
		this.type = "Imaging Spectrograph";
		this.min_wavelength = min_wavelength;
		this.max_wavelength = max_wavelength;
		this.resolution_spectromer = resolution_spectromer;
		this.resolution_imager = resolution_imager;
		this.quantum_efficiency = quantum_efficiency;
		this.readout_time = readout_time;
		this.gain = gain;
		this.readout_noise = readout_noise;
		this.full_scale = full_scale;
		this.fiber_size = fiber_size;
	}
}

let telescopes = new Array();
let foci = new Array();
let focus;
let instruments = new Array();
let instrument;


foci = new Array();
instruments = new Array();
instruments.push(new Imager("FLI Proline PL 1000",300,1000,1024,0.70,0.5,24.0, 4.0, 9, 65536,UVBRI)) /// based on the spec sheet; gain is a guess - I can probably find it somewhere Ill have to look
foci.push(new Focus("Prime Focus",0.8128,16,null,null,instruments));
telescopes.push(new Telescope("2\" Refracting Telescope",0.0508, false, 	30.67079, -104.02276, 300*12*2.54/100, false,foci));

foci = new Array();
instruments = new Array();
instruments.push(new Imager("FLI Proline PL 1000",300,1000,1024,0.70,0.5,24.0, 4.0, 9, 65536,UVBRI)) /// based on the spec sheet; gain is a guess - I can probably find it somewhere Ill have to look
foci.push(new Focus("Prime Focus",0.8128,4,null,null,instruments));
telescopes.push(new Telescope("8\" Newtonian Telescope",0.2032, false, 	30.67079, -104.02276, 300*12*2.54/100, false,foci));


foci = new Array();
instruments = new Array();
instruments.push(new Imager("FLI Proline PL 1000",300,1000,1024,0.70,0.5,24.0, 4.0, 9, 65536,UVBRI)) /// based on the spec sheet; gain is a guess - I can probably find it somewhere Ill have to look
foci.push(new Focus("Prime Focus",4.4,4,null,null,instruments));
telescopes.push(new Telescope("UT 16\" Reflector",0.4064, false, 	30.67079, -104.02276, 600*12*2.54/100, false,foci));

foci = new Array();
foci.push(new Focus("Prime",2.29,3.0,0,0,null));
instruments = new Array();
instruments.push(new Imager("Prime Focus Corrector",400,1000,2048,0.43,209.7,15.0, 1.0, 2, 65536,UVBRI)) /// based on CCD3041 spec sheet; gain and max counts a guess; readout time and readout noise based on 2 kHz sampling and memory of using this POS camera
foci.push(new Focus("Prime Focus Corrector",2.272,2.98,46.2,1.3553,instruments));

telescopes.push(new Telescope("McDonald Observatory 30\" Telescope",0.767, false, 	30.67079, -104.02276, 6640*12*2.54/100, false,foci));


foci = new Array();
foci.push(new Focus("Prime",8.13,3.9,63.5,25.4,null));
instruments = new Array();
instruments.push(new Imager("ProEM",120,1200,1024,0.95,10.4,13.0, 1.0, 3.5, 65535,UVBRI))
instruments.push(new Imager("CQUEAN",300,1100,1024,0.9,20.0,13.0, 2.0, 2.9, 65535,UVBRI))
foci.push(new Focus("Cassegrain",28.53,13.7,20,7.23,instruments));
foci.push(new Focus("Coude",47.70,22.9,0,4.3,null));
telescopes.push(new Telescope("Otto Struve Telescope",2.08, false, 	30.67146, -104.02283, 6660*12*2.54/100, false,foci));


foci = new Array();
instruments = new Array();
instruments.push(new Imager("Wiro Double Prime",200,1100,4096,0.8,21,13.0, 2.6, 5.2, 65535,UVBRI))
// min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
foci.push(new Focus("Prime",4.83,2.1,null,null,instruments));

telescopes.push(new Telescope("Wyoming Infrared Observatory",2.3, false, 	41.097050, -105.977038, 2943, false,foci));



foci = new Array();
// ommitted the George and Cynthia Mitchell Spectrograph (GCMS) / VIRUS-P
foci.push(new Focus("Prime",10.68,3.93,0,0,null))
instruments = new Array();
//instruments.push(new Spectrograph("IGRINS",1470,1810,40000,0.8,2.05,1,50000)) // omit until I impllment spectrometers
instruments.push(new Imager("DIAFI/TK3",300,1000,2048,0.8,41.94,24.0, 0.584, 4.2, 65535,UVBRI))
instruments.push(new Imager("DIAFI/EV1",300,1000,4096,0.8,55.92,15,0.75,2,65535,UVBRI))
foci.push(new Focus("Ritchey-Cassegrain f/8.8",23.91,8.8,61.5,8.62,instruments))
foci.push(new Focus("Cassegrain f/17.7",47.98,17.65,31,4.29,null))
/// omitting the spectrographs on the Cassegrain - I'd have to get ahold of Phillip to get full details, and it really isn't worth it for this
//instruments = new Array(); 
//instruments.push(new Spectrograph("Tull Spectrograph (TS1)",....)
//instruments.push(new Spectrograph("Cross-Dispersed Echelle Spectrograph (TS2)",....)
foci.push(new Focus("Coude f/32.5",88.43,32.54,6,2.32,null))
telescopes.push(new Telescope("Harlan J. Smith Telescope",2.72, false, 	30.67174, -104.02202, 6660*12*2.54/100, false,foci));

foci = new Array();
instruments = new Array();
instruments.push(new Imager("HSC",400,1000,2048 * 17,0.96,20.0,15.0, 3.0, 4.5, 65535,UVBRI)) // https://www.subarutelescope.org/Observing/Instruments/HSC/
foci.push(new Focus("f/2",16.4,2,0,0,instruments));//focal_length, f_stop, field_angle, plate_scale, instruments)
telescopes.push(new Telescope("Subaru Telescope",8.2, false, 	19 + 49/60.0 + 32/3600.0, -(155 + 28/60 + 34/3600), 4139, false,foci));


telescopes.push(new Telescope("Hobby-Eberly Telescope",10.0, false, (30.0 + 40.0/60 + 53.2/3600), (-(104 + 53.0/3600)), 2026, true,[new Focus("Prime",13.08,0,0,0)]));

foci = new Array();
instruments = new Array();
instruments.push(new Imager("SALTICAM",400,1000,4096,0.80,21.0,15.0, 2.5, 3.3, 65535,UVBRI)) // http://pysalt.salt.ac.za/proposal_calls/current/ProposalCall.html#h.o6okpawumt1k
// quantum efficiency is a guess
foci.push(new Focus("Prime",13.08,0,0,0,instruments));
telescopes.push(new Telescope("Southern African Large Telescope",10.0, false, -(32.0 + 22.0/60 + 34/3600), ((20 + 48/60 + 38.0/3600)), 1798, true,foci));

foci = new Array();
foci.push(new Focus("f/15",149.6,15,0,0.725,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
foci.push(new Focus("f/25",249.7,25,0,1.211,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
foci.push(new Focus("f/40",395.0,40,0,1.915,null));//focal_length, f_stop, field_angle, plate_scale, instruments)
telescopes.push(new Telescope("Keck I Telescope",10.95, false, 	19 + 49/60.0 + 35/3600.0, -(155 + 28/60 + 28/3600), 4145, true,foci));


foci = new Array();

instruments = new Array();
instruments.push(new Imager("WFC(3) (UV/O)",200,1000,4096,0.70,96.0,15.0, 1.55, 3.6, 65535,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
instruments.push(new Imager("WFC(3) (IR)",800,1700,1024,0.85,21.75,18.0, 2.3, 12.0, 65535,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
instruments.push(new Imager("ACS WFC",350,1100,4096,0.80,100.0,15.0, 2.0, 4, 65535,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
instruments.push(new Imager("ACS SBC",115,170,1024,0.35,20.0,25.0, 1, 0, 65535,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
foci.push(new Focus("f/24",57.6,24,0,0,instruments));//focal_length, f_stop, field_angle, plate_scale, instruments)

telescopes.push(new Telescope("Hubble Space Telescope",2.4, true, 	0, 0, 540000.0, false,foci));



// 10 ks; 10 nJ -> S/N = 10
// 10^-19 erg/cm^2 Hz -> S/N 10
// 
foci = new Array();
instruments = new Array();
instruments.push(new Imager("NIRCam Short",600,2300,2040,0.5,10.7,18.0, 2, 1, 65536,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
// data from https://jwst-docs.stsci.edu/jwst-near-infrared-camera/nircam-instrumentation/nircam-detector-overview
// the quantum efficiency and readout noise don't seem to be readily available for this instrument
// strictly speaking, this instrument has different capabilities between 600 nm and 2350 nm, and 2350 - 5000 nm. For now just leave it all the same.
instruments.push(new Imager("NIRCam Long",2400,5000,2040,0.5,10.7,36.0, 2, 1, 65536,UVBRI)) // min_wavelength, max_wavelength, resolution, quantum_efficiency, readout_time, pixel_size, gain, readout_noise, full_scale, filters)
foci.push(new Focus("f/20.2",131.4,20.2,0,0,instruments));//focal_length, f_stop, field_angle, plate_scale, instruments)
telescopes.push(new Telescope("James Webb Space Telescope",6.5, true, 	0, 0, 100000000.0, false,foci));


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

