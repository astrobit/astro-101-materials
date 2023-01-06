
let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d");
theContext.willReadFrequently = true;


theCanvas.height = Math.max(window.innerHeight - 60,100);
theCanvas.width = Math.max(window.innerWidth - 40,100);

const kStellarMass = 1.0;
const kPlanets = [{d:0.32



function draw()
{
	// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

	const SNR = 10.0;
	const collecting_area = g_diameter * g_diameter * Math.PI * 1.0e4; // cm²
	const wavelength = 550.0e-7;
	const filter_bandwidth = 176.0e-7;
	const latitude = radians(30.0);
	const slew_rate = Math.PI / 30.0;
	
	const limiting_flux = PhotonFluxToFlux(wavelength,filter_bandwidth,SNR * SNR / (collecting_area * g_exposure));
	const limiting_mag = -2.5 * Math.log10(limiting_flux / AstroMagnitudeFluxZero.V);
	
	const max_brt_novae = -8.8;
	const max_brt_SNia = -19.3;
	const max_brt_SNii = -18; // roughly
	
	const limiting_dist_novae = Math.pow(10.0,(limiting_mag - max_brt_novae) * 0.2 + 1);
	const limiting_dist_SNia = Math.pow(10.0,(limiting_mag - max_brt_SNia) * 0.2 + 1);
	const limiting_dist_SNii = Math.pow(10.0,(limiting_mag - max_brt_SNii) * 0.2 + 1);
	const circumpolar_area = 2 * latitude;
	const visible_area = (4 * Math.PI - 2.0 * circumpolar_area) * 21/24.0 + circumpolar_area;
	
	const sample_volume_novae =  visible_area * limiting_dist_novae * limiting_dist_novae * limiting_dist_novae / 3.0;
	const sample_volume_snia =  visible_area * limiting_dist_SNia * limiting_dist_SNia * limiting_dist_SNia / 3.0;
	const sample_volume_snii =  visible_area * limiting_dist_SNii * limiting_dist_SNii * limiting_dist_SNii / 3.0;
	
	const fov = 1024 * 15.0e-6 / g_focal_length;
	const survey_time = visible_area / (fov * fov) * (g_exposure + fov / slew_rate);
	const survey_days = survey_time * 2.0 / 86400.0; // estimate 12h per day
	const frac_nightly = 1.0 / survey_days;
	
	const cost = Math.pow(g_diameter,2.1) * 1.1;
	
	
	const galaxy_volume = 1.0e18 / 12;//4.0 * Math.PI / 3.0 * (350e3)**3; 12 galaxies / Mpc³ (Fletcher 1946)
	const cap_rate = Math.min(frac_nightly * 5.0,1.0);
	const rate_novae = sample_volume_novae / galaxy_volume * 30 * cap_rate;
	const rate_snia = sample_volume_snia / galaxy_volume / 100 * cap_rate;
	const rate_snii = sample_volume_snii / galaxy_volume / 100 * cap_rate;
	
	
	theContext.textAlign = "left";
	theContext.fillStyle = "#FFFFFF";
	theContext.font = "20px Arial";
	theContext.save();
	theContext.translate(0,50);
	theContext.fillText("Limiting Magnitude: " + limiting_mag.toFixed(0),theCanvas.width * 0.5 - 50,10);
	theContext.fillText("Time to Complete Survey (days): " + survey_days.toFixed(1),theCanvas.width * 0.5 - 50,40);
	theContext.fillText("Cost (millions $): " + cost.toFixed(1),theCanvas.width * 0.5 - 50,70);
	const ldnp = SIprefix(limiting_dist_novae);
	theContext.fillText("Distance Novae: " + ldnp.value.toFixed(0) + " " + ldnp.prefix + "pc",theCanvas.width * 0.5 - 50,100);
	const ldSNiap = SIprefix(limiting_dist_SNia);
	const ldSNiip = SIprefix(limiting_dist_SNii);
	theContext.fillText("Distance SN Ia: " + ldSNiap.value.toFixed(0) + " " + ldSNiap.prefix + "pc",theCanvas.width * 0.5 - 50,130);
	theContext.fillText("Distance SN Ib/c/II: " + ldSNiip.value.toFixed(0) + " " + ldSNiip.prefix + "pc",theCanvas.width * 0.5 - 50,160);
	theContext.fillText("Expected Novae (/yr): " + rate_novae.toFixed(0),theCanvas.width * 0.5 - 50,190);
	theContext.fillText("Expected SN Ia (/yr): " + rate_snia.toFixed(0),theCanvas.width * 0.5 - 50,220);
	theContext.fillText("Expected SN Ib/c/II (/yr): " + rate_snii.toFixed(0),theCanvas.width * 0.5 - 50,250);
	theContext.restore();
	
	
}
draw();
