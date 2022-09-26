// JavaScript source code
class Element
{
	constructor(Z,A)
	{
		this.Z = Z;
		this.N = N;
	}
}
class Isotope
{
	constructor(Z,A,modes)
	{
		this.Z = Z;
		this.N = N;
		this.modes = modes;
			var A = Number(parsed[i].substring(0,2));
			var Z = Number(parsed[i].substring(4,6));
			var type = parsed[i].charAt(7);
			var elem = parsed[i].substring(11,15);
			var s = parsed[i].charAt(16);
			var massExcess = Number(parsed[i].substring(18,30).trim());
			var massExcessUncertainty = Number(parsed[i].substring(31,41).trim());
			var isomerExcitationEnergy = Number(parsed[i].substring(42,53));
			var isomerExcitationEnergyUncertainty = Number(parsed[i].substring(54,64));
	}
}
class DecayMode
{
	constructor(mode,halflife,lifetimeUnits,probability,daughters)
	{
		this.mode = mode;
		this.halflife = halflife;
		this.lifetimeUnits = lifetimeUnits;
		this.probability = probability;
		this.daughters = daughters;
	}
}
class Daughter
{
	constructor (Z,N,delta)
	{
		this.Z = Z;
		this.N = N;
		this.delta = delta;
	}
}



var isotopeData = new Array();
var isotopeRawData;
if (typeof fetch !== 'undefined')
{
	console.log("Fetch request")
	// use the fetch API if available
	fetch("https://www.astronaos.com/astronomy/nubase_1.mas20.txt")
	.then(result => result.text())
	.then( data => {isotopeRawData = data;
		processIsotopes();
		})
}
else // good ol' AJAX
{
	console.log("AJAX request")
	var isotopesXHTTP = new XMLHttpRequest();

	isotopesXHTTP.onreadystatechange = function() {
	//	console.log(this.readyState + " " + this.status);
		if (this.readyState == 4 && this.status == 200) //warning: this may be a status 0 instead of 200? need to test
		{
			isotopeRawData = isotopesXHTTP.responseText;
			processIsotopes();
		}
	}
	isotopesXHTTP.open("GET", "https://www.astronaos.com/astronomy/nubase_1.mas20.txt", true);
	isotopesXHTTP.send();
}

function processIsotopes()
{
	var last = 0;
	var i;
	var len = isotopeRawData.length;
	console.log("Parsing File");
	var parsed = new Array();
	for (i = 0; i < len; i++)
	{
		if (isotopeRawData.charCodeAt(i) == 10 || isotopeRawData.charCodeAt(i) == 13) // CR or LF
		{
			if (isotopeRawData.charCodeAt(last) != 10 && isotopeRawData.charCodeAt(last) != 13) // CR or LF
			{
				var currStr = isotopeRawData.substring(last,i - 1);
				parsed.push(isotopeRawData.substring(last,i - 1));
			}
			last = i + 1;
		}
	}
	if (isotopeRawData.charCodeAt(len - 1) != 10 && isotopeRawData.charCodeAt(len - 1) != 13)
	{
		parsed.push(isotopeRawData.substring(last + 1,len - 1));
	}
	console.log("Parsing Entries");
	len = parsed.length;
	for (i = 0;i < len; i++)
	{
		if (parsed[i][0] != '#') // ignore comments
		{
			var A = Number(parsed[i].substring(0,2));
			var Z = Number(parsed[i].substring(4,6));
			var type = parsed[i].charAt(7);
			var elem = parsed[i].substring(11,15);
			var s = parsed[i].charAt(16);
			var massExcess = Number(parsed[i].substring(18,30).trim());
			var massExcessUncertainty = Number(parsed[i].substring(31,41).trim());
			var isomerExcitationEnergy = Number(parsed[i].substring(42,53));
			var isomerExcitationEnergyUncertainty = Number(parsed[i].substring(54,64));
			var iEEOrigin = parsed[i].substring(65,66);
			var halfLife = parsed[i].substring(69,77).trim();
			var halfLifeUnit = parsed[i].substring(78,79).trim();
			var halfLifeUncertainty = parsed[i].substring(81,87).trim();
			var spinAndParity = parsed[i].substring(88,101).trim();
			var updateYear = parsed[i].substring(102,103).trim();
			var discoveryYear = parsed[i].substring(114,117).trim();
			var modes = parsed[i].substring(119,parsed[i].length - 1).trim();


			
		}
	}
}