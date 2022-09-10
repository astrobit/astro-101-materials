// retreive the list of stars with V magntiude less than 6 from simbad
// @@TODO make the magnitude range customizable

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

function starFindByID(main_id)
{
	return binarySearch(stars,main_id,"main_id");
}


if (starsRawJSONData == null)
{
//	const query = "https://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=SELECT%20*%20FROM%20basic%20JOIN%20allfluxes%20ON%20allfluxes.oidref%20=%20basic.oid%20WHERE%20allfluxes.V%20%3C%206%20OR%20main_id%20=%20%27gam%20cep%27%20OR%20main_id%20=%20%27mu.%20Cet%27%20OR%20main_id%20=%20%27ome%20Dra%27%20OR%20main_id%20=%20%27nu.02%20Dra%27%20OR%20main_id%20=%20%27tet%20Hya%27%20OR%20main_id%20=%20%27iot%20Per%27%20OR%20main_id%20=%20%27ome%20Psc%27%20OR%20main_id%20=%20%27eta%20UMi%27";

	const query = "https://www.astronaos.com/astronomy/stars_m6.json";	
	if (typeof fetch !== 'undefined')
	{
		console.log("Fetch request")
		// use the fetch API if available
		fetch(query)
		.then(result => result.text())
		.then( data => {starsRawJSONData = data;
		 	localStorage.setItem("starsData",starsRawJSONData);
			localStorage.setItem("starsUpdateDateTime",currDateTime);
			starsProcess();
					})
	}
	else // good ol' AJAX
	{
		console.log("AJAX request")
		let starsXHTTP = new XMLHttpRequest();

		starsXHTTP.onreadystatechange = function() {
		//	console.log(this.readyState + " " + this.status);
			if (this.readyState == 4 && this.status == 200)
			{
				starsRawJSONData = starsXHTTP.responseText;
		 		localStorage.setItem("starsData",starsRawJSONData);
				localStorage.setItem("starsUpdateDateTime",currDateTime);
				starsProcess();
			}
		}
		starsXHTTP.open("GET", query, true);
		starsXHTTP.send();
	}
}
else
{
	starsProcess();
}

function starsProcess()
{
	const radians = Math.PI / 180.0;
	const degrees = 180.0 / Math.PI;
	const starsJSON = JSON.parse(starsRawJSONData);
	const NGPdec = 27.13 * radians;
	const NGPra = (12.0 + 51.4 / 60.0) * 15.0 * radians;
	const galCosNGP = Math.cos(NGPdec)
	const galSinNGP = Math.sin(NGPdec)
	const JC = ((Date.now() / 86400000.0 + 2440587.50000) - 2451545.50000) / 36525.0;
	const obliquity = (23.0 + 26.0 / 60 + 21.45 / 3600.0 - JC / 3600.0 * (46.815 + JC * (-0.0006 - 0.00181 * JC))) * radians;
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
		const decRad = star.dec * radians;
		const raRad = star.ra * radians;
		const cosDec = Math.cos(decRad);
		const sinDec = Math.sin(decRad);
		const cosRA = Math.cos(raRad);
		const sinRA = Math.sin(raRad);
		const sinB = cosDec * galCosNGP * Math.cos(raRad - NGPra) + sinDec * galSinNGP
		//const cosB = Math.sqrt(1.0 - sinB * sinB)
		// calculate galactic latitude and longitude
		star.gallat = Math.asin(sinB) * degrees;
		star.gallong = (Math.atan2(sinDec - sinB * galSinNGP,cosDec * Math.sin(raRad - NGPra) * galCosNGP ) * degrees + 393) % 360.0;
		// calculate ecliptic coorinates
		const sinBeta = sinDec * cosTilt - cosDec * sinTilt * sinRA;
		star.eclat = Math.asin(sinBeta) * degrees;
		star.eclong = (Math.atan2(sinRA * cosTilt + Math.tan(decRad) * sinTilt,cosRA)* degrees + 363) % 360.0;
		
		star.num_sp_type = null;
		star.num_sp_type_subtype = null;
		if (star.sp_type !== null)
		{
			switch (star.sp_type.charAt(0))
			{
			case 'O':
				star.num_sp_type = 100;
				break;
			case 'B':
				star.num_sp_type = 200;
				break;
			case 'A':
				star.num_sp_type = 300;
				break;
			case 'F':
				star.num_sp_type = 400;
				break;
			case 'G':
				star.num_sp_type = 500;
				break;
			case 'K':
				star.num_sp_type = 600;
				break;
			case 'M':
				star.num_sp_type = 700;
				break;
//			case 'R':
//				star.num_sp_type = 800;
//				break;
//			case 'N':
//				star.num_sp_type = 900;
//				break;
//			case 'S':
//				star.num_sp_type = 1000;
//				break;
//			case 'C':
//				star.num_sp_type = 1100;
//				break;
			default:
				break;
			}
			if (star.num_sp_type != null)
			{
				const sp_type_subtype_str = star.sp_type.substring(1,3);
				const sp_type_subtype = Number(sp_type_subtype_str);
				if (star.num_sp_type > 0 && !isNaN(sp_type_subtype))
				{
					star.num_sp_type_subtype = sp_type_subtype;
					star.num_sp_type += Math.floor(sp_type_subtype * 10.0);
				}
				else
				{
					star.num_sp_type += 50;
				}
			}
				
		}
		stars.push(star);
	}
	stars.sort(function (a,b){if (a.main_id < b.main_id) return -1; else if (a.main_id > b.main_id) return 1; else return 0;});
	let idx = starFindByID("* eta UMi");
	if (idx !== null)
	{
		stars[idx].V = 4.95;
	}
	else
	{
		console.log("failed to update V magnitude for eta UMi");
	}
	idx = starFindByID("* ome Psc");
	if (idx !== null)
	{
		stars[idx].V = 4.00;
	}
	else
	{
		console.log("failed to update V magnitude for ome Psc");
	}
	idx = starFindByID("* iot Per");
	if (idx !== null)
	{
		stars[idx].V = 4.05;
	}
	else
	{
		console.log("failed to update V magnitude for iot Per");
	}
	idx = starFindByID("* tet Hya");
	if (idx !== null)
	{
		stars[idx].V = 3.85;
	}
	else
	{
		console.log("failed to update V magnitude for tet Hya");
	}
	idx = starFindByID("* nu.02 Dra");
	if (idx !== null)
	{
		stars[idx].V = 4.85;
	}
	else
	{
		console.log("failed to update V magnitude for nu.02 Dra");
	}
	idx = starFindByID("* ome Dra");
	if (idx !== null)
	{
		stars[idx].V = 4.75;
	}
	else
	{
		console.log("failed to update V magnitude for ome Dra");
	}
	idx = starFindByID("* mu. Cet");
	if (idx !== null)
	{
		stars[idx].V = 4.25;
	}
	else
	{
		console.log("failed to update V magnitude for mu. Cet");
	}
	idx = starFindByID("* gam Cep");
	if (idx !== null)
	{
		stars[idx].V = 3.20;
	}
	else
	{
		console.log("failed to update V magnitude for gam Cep");
	}
	starsReady = true;
}
