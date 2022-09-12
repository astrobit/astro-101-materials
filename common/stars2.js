// retreive the list of stars with V magntiude less than 6 from simbad
// @@TODO make the magnitude range customizable
class _Stars
{
	_processRawData()
	{
		const radians = Math.PI / 180.0;
		const degrees = 180.0 / Math.PI;
		const starsJSON = JSON.parse(this._rawData);
		const NGPdec = 27.13 * radians;
		const NGPra = (12.0 + 51.4 / 60.0) * 15.0 * radians;
		const galCosNGP = Math.cos(NGPdec)
		const galSinNGP = Math.sin(NGPdec)
		const JC = ((Date.now() / 86400000.0 + 2440587.50000) - 2451545.50000) / 36525.0;
		const obliquity = (23.0 + 26.0 / 60 + 21.45 / 3600.0 - JC / 3600.0 * (46.815 + JC * (-0.0006 - 0.00181 * JC))) * radians;
		const cosTilt = Math.cos(obliquity);
		const sinTilt = Math.sin(obliquity);

		this._data = new Array();
		
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
				Object.defineProperty(star, keywords[j], {writable:true, value:starsJSON.data[i][j]});
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
			if (star.main_id == "* eta UMi")
			{
//				Object.defineProperty(star, "V", {value:4.95});
				star.V = 4.95;
			}
			else if (star.main_id == "* ome Psc")
			{
//				Object.defineProperty(star, "V", {value:4.00});
				star.V = 4.00;
			}
			else if (star.main_id == "* iot Per")
			{
//				Object.defineProperty(star, "V", {value:4.05});
				star.V = 4.05;
			}
			else if (star.main_id == "* tet Hya")
			{
//				Object.defineProperty(star, "V", {value:3.85});
				star.V = 3.85;
			}
			else if (star.main_id == "* nu.02 Dra")
			{
//				Object.defineProperty(star, "V", {value:4.85});
				star.V = 4.85;
			}
			else if (star.main_id == "* ome Dra")
			{
//				Object.defineProperty(star, "V", {value:4.75});
				star.V = 4.75;
			}
			else if (star.main_id == "* mu. Cet")
			{
//				Object.defineProperty(star, "V", {value:4.25});
				star.V = 4.25;
			}
			else if (star.main_id == "* gam Cep")
			{
//				Object.defineProperty(star, "V", {value:3.20});
				star.V = 3.20;
			}

			this._data.push(star);
		}
		this._data.sort(function (a,b){if (a.main_id < b.main_id) return -1; else if (a.main_id > b.main_id) return 1; else return 0;});
		this._ready = true;	
	}
	constructor(set)
	{
		this._data = null;
		this._rawData = null;
		this._ready = false;
		
		this._storageName = "stars-"+set;
		this._storageDateTime = "stars-"+set+"-update-time";
		if (this._storageDateTime in localStorage && this._storageName in localStorage)
		{
			const updateTime = localStorage.getItem(this._storageDateTime);
			const currDateTime = Date().getTime();
			const forceUpdate = (currDateTime > (updateTime + 604800000)); // 1 week;
			if (!forceUpdate)
			{
				this._rawData = localStorage.getItem(this._storageName);
			}
		}
		if (this._rawData === null)
		{
			const filePath = "https://www.astronaos.com/astronomy/stars_" + set + ".json";
			this._dataPromise = getFile(filePath);
		}
		else
			this._processRawData();
	}
	findStarByID(id)
	{
		var ret = null;
		if (this._ready)
			ret = binarySearch(this._data,id,"main_id");
		return ret;
	}
	_processResponse(value)
	{
		this._rawData = value; 
		try {
			localStorage.setItem(this._storageName,this._rawData);
			localStorage.setItem(this._storageDateTime,currDateTime);
		}
		catch(e)
		{
 		    console.log("Local Storage is full, unable to store " + this._storageName);
		}
		this._processRawData();
	}
	get ready()
	{
		return this._ready;
	}
	at(idx)
	{
		var ret = null;
		if (this._ready && idx < this._data.length)
		{
			ret = this._data[idx];
		}
		return ret;
	}
	get length()
	{
		return this._data.length;
	}
}

function newStarSet(set)
{
	let ret = new _Stars(set);
	ret._dataPromise.then(function(value){ret._processResponse(value)},function(error){console.log("Stars request failed with error " + error)});
	return ret;
}
let starsm6 = newStarSet("m6");


let starsReady = false;
let stars = null;

function waitForStarsReady()
{
	if (!starsm6.ready)
	{
		window.setTimeout(waitForStarsReady, 333.0);
	}
	else
	{
		starsReady =  true;
		stars = starsm6._data;
	}
}
waitForStarsReady();


function starFindByID(main_id)
{
	return starsm6.findStarByID(main_id);
}

