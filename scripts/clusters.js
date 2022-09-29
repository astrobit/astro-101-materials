//
// Requires:
// common.js
// commonGP.js
// commonAtro.js
// stars2.js
//
// CHANGE LOG
// 
// 2022-Sep-24
// create file
// Additions

class _Clusters
{
	_combineSupplemental()
	{
		let i;
		let j;
		for (i = 0; i < this._dataSupplemental.length; i++)
		{
			let supplemental = this._dataSupplemental[i];
			let cluster_curr = this._data[i];
			if (i > this._data.length || supplemental.main_id != cluster_curr.main_id)
				cluster_curr = findClusterByID(supplemental.main_id);
			if (cluster_curr !== null)
			{
				cluster_curr.cluster = new Object();
				cluster_curr.cluster.plx = new Averager();
				cluster_curr.cluster.pmra = new Averager();
				cluster_curr.cluster.pmdec = new Averager();
				cluster_curr.cluster.rvz_radvel = new Averager();
				
				cluster_curr.cluster.plx.copyFrom(supplemental.plx);
				cluster_curr.cluster.pmra.copyFrom(supplemental.pmra);
				cluster_curr.cluster.pmdec.copyFrom(supplemental.pmdec);
				cluster_curr.cluster.rvz_radvel.copyFrom(supplemental.rvz_radvel);
				cluster_curr.cluster.ra = supplemental.ra;
				cluster_curr.cluster.dec = supplemental.dec;
				cluster_curr.cluster.cluster_size = supplemental.cluster_size;
				
				cluster_curr.cluster.stars = supplemental.stars;
			}
			else
			{
				cluster_curr.cluster = null;
			}
		}
		this._ready = true;
	}

	_processRawData()
	{
		this._data = processSimbad(this._rawData)
		const radians = Math.PI / 180.0;
		const degrees = 180.0 / Math.PI;
		const NGPdec = 27.13 * radians;
		const NGPra = (12.0 + 51.4 / 60.0) * 15.0 * radians;
		const galCosNGP = Math.cos(NGPdec)
		const galSinNGP = Math.sin(NGPdec)
		const JC = ((Date.now() / 86400000.0 + 2440587.50000) - 2451545.50000) / 36525.0;
		const obliquity = (23.0 + 26.0 / 60 + 21.45 / 3600.0 - JC / 3600.0 * (46.815 + JC * (-0.0006 - 0.00181 * JC))) * radians;
		const cosTilt = Math.cos(obliquity);
		const sinTilt = Math.sin(obliquity);

		this._ids = new Array();//new Object();

		const datalen = this._data.length;
		let i;
		for (i = 0; i < datalen; i++)
		{
			let cluster = this._data[i];
			const decRad = this._data[i].dec * radians;
			const raRad = this._data[i].ra * radians;
			const cosDec = Math.cos(decRad);
			const sinDec = Math.sin(decRad);
			const cosRA = Math.cos(raRad);
			const sinRA = Math.sin(raRad);
			const sinB = cosDec * galCosNGP * Math.cos(raRad - NGPra) + sinDec * galSinNGP
			//const cosB = Math.sqrt(1.0 - sinB * sinB)
			// calculate galactic latitude and longitude
			this._data[i].gallat = Math.asin(sinB) * degrees;
			this._data[i].gallong = (Math.atan2(sinDec - sinB * galSinNGP,cosDec * Math.sin(raRad - NGPra) * galCosNGP ) * degrees + 393) % 360.0;
			// calculate ecliptic coorinates
			const sinBeta = sinDec * cosTilt - cosDec * sinTilt * sinRA;
			this._data[i].eclat = Math.asin(sinBeta) * degrees;
			this._data[i].eclong = (Math.atan2(sinRA * cosTilt + Math.tan(decRad) * sinTilt,cosRA)* degrees + 363) % 360.0;
			
			// create object with list of ids
			const names = this._data[i].ids.split("|");
			let j;
			this._ids.push({id: this._data[i].main_id, idx: i});
			for (j = 0; j < names.length; j++)
				this._ids.push({id: names[j], idx: i});
			this._data[i].star_set = new String();		
			let lastChar = null;
			for (j = 0; j < this._data[i].main_id.length; j++)
			{
				const code = this._data[i].main_id.charCodeAt(j);
				if (code == 0x20)
				{
					if (lastChar === null || lastChar !== '_')
					{
						this._data[i].star_set += "_";
						lastChar = "_";
					}
				}
				else
				{
					lastChar = this._data[i].main_id.charAt(j);
					this._data[i].star_set += lastChar;
				}
				
			}
		}
		if (this._ids.length > 0)
		{
			this._ids.sort(function(a,b){let ret = 0; if (a.id < b.id) ret = -1; else if (a.id > b.id) ret = 1; return ret;});  
			let new_ids = new Array();
			let last_id = null;
			for (i = 0; i < this._ids.length; i++)
			{
				if (last_id == null || this._ids[i].id != last_id)
				{
					last_id = this._ids[i].id;
					new_ids.push(this._ids[i]);
				}
			}
			this._ids = new_ids;
		}
		this._baseReady = true;	
		this._rawData = null; // drop raw data string to save memory
		if (this._supplementalReady)
		{
			this._combineSupplemental()
		}
	}
	_processSupplementalData(value)
	{
		let supplemental = JSON.parse(value);
		this._dataSupplemental = supplemental.data;
		this._supplementalReady = true;
		if (this._baseReady)
		{
			this._combineSupplemental()
		}
	}
	constructor(set)
	{
		this._set = set;
		this._data = null;
		this._dataSupplemental = null;
		this._rawData = null;
		this._ready = false;
		this._supplementalReady = false;
		this._baseReady = false;
		
		this._storageName = "clusters";
		this._storageDateTime = "clusters-update-time";
	
		if (this._storageDateTime in localStorage && this._storageName in localStorage)
		{
			const updateTime = localStorage.getItem(this._storageDateTime);
			const currDateTime = (new Date()).getTime();
			const forceUpdate = (currDateTime > (updateTime + 604800000)); // 1 week;
			if (!forceUpdate)
			{
				this._rawData = localStorage.getItem(this._storageName);
			}
		}
		this.failed = false;
		this._dataPromise = null;
		this._dataPromiseSupplemental = null;
		if (this._rawData === null)
		{
			const filePath = "https://www.astronaos.com/astronomy/stars/clusters_" + set + ".json";
			this._dataPromise = getFile(filePath);
		}
		else
			this._processRawData();
		const filePath = "https://www.astronaos.com/astronomy/stars/clusters_" + set + "_supplemental.json";
		this._dataPromiseSupplemental = getFile(filePath);

	}
/////////////////////////////////////////////////////////////////////////
//
//  function findClusterByID
//
// searches for a cluster with the given name / id
// input: id (string) - the idnetifier for the cluster
// output: (object) - an object containing the information about the cluster
//
/////////////////////////////////////////////////////////////////////////
	findClusterByID(id)
	{
		let ret = null;
		if (this._ready)
		{
			const res = binarySearch(this._ids,id,"id");
			if (res !== null)
				ret = this._data[this._ids[res].idx];
		}
//		if (this._ready && id in this._ids)
//		{
//			ret = this._data[this._ids[id]];
//		}
		return ret;
	}
	_processResponse(value)
	{
		this._rawData = value; 
		const currDateTime = (new Date()).getTime();
		try {
			localStorage.setItem(this._storageName,this._rawData);
			localStorage.setItem(this._storageDateTime,currDateTime);
		}
		catch(e)
		{
 		    console.log("Warning: " + e + " - length = " + this._rawData.length);
		}
		this._processRawData();
	}
/////////////////////////////////////////////////////////////////////////
//
//  get ready
//
// returns true if the cluster data has been received and processed and is ready for use
// input: none
// output: (boolean) - true if the data is ready for use, false otherwise
//
/////////////////////////////////////////////////////////////////////////
	get ready()
	{
		return this._ready;
	}
/////////////////////////////////////////////////////////////////////////
//
//  function at
//
// returns true if the cluster data has been received and processed and is ready for use
// input: idx )number) the index of the cluster for which to retreive the data
// output: (object) - an object containing the information about the cluster
//
/////////////////////////////////////////////////////////////////////////
	at(idx)
	{
		var ret = null;
		if (this._ready && idx < this._data.length)
		{
			ret = this._data[idx];
		}
		return ret;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get length
//
// returns the total number of clusters of this type
// input: none
// output: (number) - the total number of clusters of this type
//
/////////////////////////////////////////////////////////////////////////
	get length()
	{
		return this._data.length;
	}
}



/////////////////////////////////////////////////////////////////////////
//
//  function newClusters
//
// creates a _Cluster class and retrieves a set of cluster data from the server
// input: set (string) - the types of cluster to retreive. currently only open clusters ("OpC") is allowed
// output: (Object, _Cluster) - a _Cluster object containing information about all clusters of the selected type
//
/////////////////////////////////////////////////////////////////////////

function newClusters(set)
{
	let ret = new _Clusters(set);
	if (typeof ret._dataPromise !== 'undefined' && ret._dataPromise !== null)
		ret._dataPromise.then(function(value){ret._processResponse(value)},function(error){ret.failed = true; console.log("Clusters request failed with error " + error)});
	if (typeof ret._dataPromiseSupplemental !== 'undefined' && ret._dataPromiseSupplemental !== null)
		ret._dataPromiseSupplemental.then(function(value){ret._processSupplementalData(value)},function(error){ret.failed = true; console.log("Clusters Supplemental request failed with error " + error)});
	
	
	return ret;
}



