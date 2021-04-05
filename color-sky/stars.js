// retreive the list of stars with V magntiude less than 6 from simbad
// @@TODO make the magnitude range customizable
var starsXHTTP = new XMLHttpRequest();
var starsReady = false;
var stars = new Array();

function starFindByID(main_id)
{
	var imin = 0;
	var imax = stars.length - 1;
	var ret = null;
	if (stars.length > 0)
	{
		var i;
		do
		{
			i = Math.floor((imax + imin) / 2);
			if (main_id < stars[i].main_id)
			{
				imax = i;
			}
			else if (main_id > stars[i].main_id)
			{
				imin = i;
			}
		}
		while (imin < imax && stars[i].main_id != main_id);
		if (stars[i].main_id == main_id)
		{
			ret = i;
		}
	}
	return ret;
}
starsXHTTP.onreadystatechange = function() {
//	console.log(this.readyState + " " + this.status);
	if (this.readyState == 4 && this.status == 200)
	{
		var starsJSON = JSON.parse(starsXHTTP.responseText);
		var keywords = new Array();
		var i;
		for (i = 0; i < starsJSON.metadata.length; i++)
		{
			keywords.push(starsJSON.metadata[i].name);
		}
		for (i = 0; i < starsJSON.data.length; i++)
		{
			var star = new Object();
			var j;
			for (j = 0; j < starsJSON.data[i].length; j++)
			{
				Object.defineProperty(star, keywords[j], {value:starsJSON.data[i][j]});
			}
			stars.push(star);
		}
		stars.sort(function (a,b){if (a.main_id < b.main_id) return -1; else if (a.main_id > b.main_id) return 1; else return 0;});
		var idx = starFindByID("* eta UMi");
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
}
starsXHTTP.open("GET", "http://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=SELECT%20*%20FROM%20basic%20JOIN%20allfluxes%20ON%20allfluxes.oidref%20=%20basic.oid%20WHERE%20allfluxes.V%20%3C%206%20OR%20main_id%20=%20%27gam%20cep%27%20OR%20main_id%20=%20%27mu.%20Cet%27%20OR%20main_id%20=%20%27ome%20Dra%27%20OR%20main_id%20=%20%27nu.02%20Dra%27%20OR%20main_id%20=%20%27tet%20Hya%27%20OR%20main_id%20=%20%27iot%20Per%27%20OR%20main_id%20=%20%27ome%20Psc%27%20OR%20main_id%20=%20%27eta%20UMi%27", true);
starsXHTTP.send();
