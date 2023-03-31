//
// Requires:
// commonGP.js
//
// CHANGE LOG
// 
// 2023-Mar-29
// Additions
// - this change log
// - created file

/////////////////////////////////////////////////////////////////////////
//
//  function __FITS_byteSwap
//
// swaps two entries in an array
// input: array: an object of Array type
//			i: index of first entry to swap
//			j: index of second entry to swap
// output: none
//
/////////////////////////////////////////////////////////////////////////

function __FITS_byteSwap(array,i,j)
{
	const swap = array[i];
	array[i] = array[j];
	array[j] = swap;
}

/////////////////////////////////////////////////////////////////////////
//
//  class FITS
//
// a container class that holds FITS image data
// public keys:
//		none
//
// header information can be found in key head
// image data can be found in key data
// key ready indicates if file has been successfully loaded
// key failed will be set if there was an error in trying to load the file
// key error will contain information about the failed load
//		
//
/////////////////////////////////////////////////////////////////////////

class FITS
{

/////////////////////////////////////////////////////////////////////////
//
//  function constructor
//
// initialized the instance
// input: none
// output: none
//
/////////////////////////////////////////////////////////////////////////
	constructor()
	{
		this.failed = false;
		this.error = null;
		this.ready = false;
		this.head = new Object();
		this.data = null;
	}
/////////////////////////////////////////////////////////////////////////
//
//  function readBlobArray
//
// initialized the instance
// input: blobArray: an instance of an ArrayBuffer containing the data for the FITS file
// output: none (this.ready will be set on success)
//
/////////////////////////////////////////////////////////////////////////
	readBlobArray(blobArray)
	{
		if (blobArray != null)
		{
			const view = new Int8Array(blobArray);
			let bQuit = false;
			let iOffset = 0;
			this.head = new Object(); //new Array();
			this.head.fieldList = new Array();
			let lastKey = null;
			// read the FITS header
			// this routine will read each 80 byte segment and either drop it into a general list, or if the keyword has an associated value it will retrieve the value
			while (!bQuit)
			{
				// get the field as a string from the data
				let field = new String();
				for (let i = 0; i < 80; i++)
				{
					field += String.fromCharCode(view[i + iOffset]);
				}
				// 
				// add the field into the full list of fields
				this.head.fieldList.push(field);
				iOffset += 80; // increment the counter
				const sl = field.slice(0,3); // grab the first three characters to check if this is the last of the text fields
				bQuit = (sl == "END") || ((iOffset + 80) > view.length); // quit if we're out of data or if we've reached the end
				if (field.charAt(8) == "=") // see if there is a value in this field
				{
					const slkey = field.slice(0,8).trim(); // get the keyword
					const keyval = field.slice(9).trim(); // get the value
					const stringEndPlace = keyval.charAt(0) == "'" ? keyval.indexOf("'",1) : -1; // if the value is a string (starts with '), find the end of the string
					const commentPlace = keyval.indexOf("/",stringEndPlace == -1 ? 0 : stringEndPlace); // find the start of the comment if one exists
					const commentFixed = (commentPlace != -1) ? keyval.slice(0,commentPlace).trim() : keyval; // get the value without any comments
					const commentItself = (commentPlace != -1) ? keyval.slice(commentPlace + 1).trim() : ""; // get the comments
					
					if (stringEndPlace != -1) // value is a string
					{
						const keyString = commentFixed.slice(1,stringEndPlace).trim(); // get the string data
						this.head[slkey] = {value: keyString, comment: commentItself}; // place the value and any comments as a key in the head
						if (slkey == "DATE" || slkey == "DATE-OBS" || slkey == "DATE-END") // if the data is a date, interpret the date
						{
							this.head[slkey].date = Date.parse(keyString);
						}
					}
					else// if (keyval
					{
						const alphaOmega = "09"; // check to see if the data is numeric
						if ((commentFixed.charCodeAt(0) >= alphaOmega.charCodeAt(0) && commentFixed.charCodeAt(0) <= alphaOmega.charCodeAt(1)) || commentFixed.charAt(0) == "-" || commentFixed.charAt(0) == "+") 
						{
							this.head[slkey] = {value: +commentFixed, comment: commentItself};
						}
						else // not numeric (probably either blank or boolean; save it as a string
						{
							this.head[slkey] = {value: commentFixed, comment: commentItself};
						}
					}// store the key in case there is a CONTIN?UE
					lastKey = slkey;
				}
				else if (field.slice(0,8).trim() == "CONTINUE" && lastKey !== null && this.head[lastKey] instanceof String)
				{
					const keyval = field.slice(9).trim(); // get the value
					const stringEndPlace = keyval.charAt(0) == "'" ? keyval.indexOf("'",1) : -1; // if the value is a string (starts with '), find the end of the string
					const commentPlace = keyval.indexOf("/",stringEndPlace == -1 ? 0 : stringEndPlace); // find the start of the comment if one exists
					const commentFixed = (commentPlace != -1) ? keyval.slice(0,commentPlace).trim() : keyval; // get the value without any comments
					const commentItself = (commentPlace != -1) ? keyval.slice(commentPlace + 1).trim() : ""; // get the comments

					const keyString = commentFixed.slice(1,stringEndPlace).trim(); // get the additional string data
					const adjString = this.head[lastKey].value.slice(0,-1) + keyString; // strip the & from the trail of the previous string, and append the additional string
					this.head[lastKey].value = adjString; // save the adjusted string as the new value
				}
			}
			// add BSCALE and BZERO keywords if they don't exist
			if (!("BSCALE" in this.head))
				this.head.BSCALE = {value: 1.0, comment:"added by fiteES6.js"};
			if (!("BZERO" in this.head))
				this.head.BZERO = {value: 0.0, comment:"added by fiteES6.js"};
			// determine how large the image data is
			let size = 1;
			for (let i = 0; i < this.head.NAXIS.value; i++)
			{
				const key = "NAXIS" + (i + 1);
				size *= this.head[key].value;
			}
			this.data = null;
			let dataView = null;
			// determine architecture endianness
			let testArray = new ArrayBuffer(8);
			let testArrayView64 = new BigInt64Array(testArray);
			testArrayView64[0] = BigInt("0x0a0b0c0d0e0f0102"); // create a test 64 bit number and see how it gets stored
			let testArrayView8 = new Int8Array(testArray);
			const bBigEndianArch = (testArrayView8[0] == 0x0a); // if the current arch is big endian, the first byte will be 0xa, otherwise it will be 0x2
			let dataSegment = blobArray.slice(iOffset); // get the image data from the blob array
			
			
			if (this.head.BITPIX.value == 16) // data is 16 bit signed integer
			{
				this.data = new Int16Array(size);
				
				if (!bBigEndianArch) // if the arch is little endian, convert the image data
				{
					let dataView8 = new Int8Array(dataSegment);
					for (let i = 0; i < dataView8.length; i+=2)
					{
						__FITS_byteSwap(dataView8,i,i+1);
					}
				}

				dataView = new Int16Array(dataSegment);
			}
			else if (this.head.BITPIX.value == 32) // data is 32 bit signed integer
			{
				this.data = new Int32Array(size);

				if (!bBigEndianArch) // if the arch is little endian, convert the image data
				{
					let dataView8 = new Int8Array(dataSegment);
					for (let i = 0; i < dataView8.length; i+=4)
					{
						__FITS_byteSwap(dataView8,i,i + 3);
						__FITS_byteSwap(dataView8,i + 1,i + 2);
					}
				}

				dataView = new Int32Array(dataSegment);
			}
			else if (this.head.BITPIX.value == 64) // data is 64 bit signed integer
			{
				this.data = new BigInt64Array(size);
				if (!bBigEndianArch) // if the arch is little endian, convert the image data
				{
					let dataView8 = new Int8Array(dataSegment);
					for (let i = 0; i < dataView8.length; i+=8)
					{
						__FITS_byteSwap(dataView8,i    ,i + 7);
						__FITS_byteSwap(dataView8,i + 1,i + 6);
						__FITS_byteSwap(dataView8,i + 2,i + 5);
						__FITS_byteSwap(dataView8,i + 3,i + 4);
					}
				}
				dataView = new BigInt64Array(dataSegment);
			}
			else if (this.head.BITPIX.value == -32) // data is 32 bit float (single precision float)
			{
				this.data = new Float32Array(size);
				if (!bBigEndianArch) // if the arch is little endian, convert the image data
				{
					let dataView8 = new Int8Array(dataSegment);
					for (let i = 0; i < dataView8.length; i+=4)
					{
						__FITS_byteSwap(dataView8,i,i + 3);
						__FITS_byteSwap(dataView8,i + 1,i + 2);
					}
				}
				dataView = new Float32Array(dataSegment);
			}
			else if (this.head.BITPIX.value == -64) // data is 64 bit float (double precision float)
			{
				this.data = new Float64Array(size);
				if (!bBigEndianArch) // if the arch is little endian, convert the image data
				{
					let dataView8 = new Int8Array(dataSegment);
					for (let i = 0; i < dataView8.length; i+=8)
					{
						__FITS_byteSwap(dataView8,i    ,i + 7);
						__FITS_byteSwap(dataView8,i + 1,i + 6);
						__FITS_byteSwap(dataView8,i + 2,i + 5);
						__FITS_byteSwap(dataView8,i + 3,i + 4);
					}
				}
				dataView = new Float64Array(dataSegment);
			}
			else // data is 8-bit unsigned integer, or character data
			{
				this.data = new Uint8Array(size);
				dataView = new Uint8Array(dataSegment);
			}
			// transfer from the endianness-correcteed blob array to the stored data
			for (let i = 0;i < size && i < dataView.length; i++)
			{
				this.data[i] = dataView[i];
			}
			// all done, signal ready
			this._prepareTransform();
			this._prepareImage();
			this.ready = true;
		}
	}
	
	_prepareTransform()
	{
		// see if the image is rotated
		if (this.head.NAXIS.value >= 2)
		{
			// determine which axis is which; most likely we will find either axis 1 = RA and axis 2 = dec, or vice versa
			const ctype1_data = this.head.CTYPE1.value.substr(0,4);
			const ctype2_data = this.head.CTYPE2.value.substr(0,4);
			this.ra_axis = (ctype1_data == "RA--") ? 1 : ((ctype2_data == "RA--") ? 2 : 0)
			this.dec_axis = (ctype1_data == "DEC-") ? 1 : ((ctype2_data == "DEC-") ? 2 : 0)
			this.proj_type = this.head.CTYPE1.value.substr(5,3);

			if (this.ra_axis == 0 || this.dec_axis == 0)
			{
				// find each axis
				for (let i = 0; i < this.head.NAXIS.value; i++)
				{
					const key = "CTYPE" + i;
					const axis = this.head[key].value.substr(0,4);
					if (axis == "RA--")
					{
						this.ra_axis = i;
						this.proj_type = this.head[key].value.substr(4,3);
					}
					else if (axis == "DEC-")
					{
						this.dec_axis = i;
						this.proj_type = this.head[key].value.substr(4,3);
					}
				}
			}
			this.thetap = ("LONPOLE" in this.head) ? radians(this.head.LONPOLE.value) : 0.0;
			const costhetap = Math.cos(this.thetap);
			const sinthetap = Math.sin(this.thetap);
			this.alphap = radians(this.head["CRVAL" + this.ra_axis].value);
			this.decp = radians(this.head["CRVAL" + this.dec_axis].value);
			const cosalphap = Math.cos(this.alphap);
			const sinalphap = Math.sin(this.alphap);
			const cosdecp = Math.cos(this.decp);
			const sindecp = Math.sin(this.decp);
			
			
			this.trx = null;
			if (this.proj_type == "TAN")  // 
			{
				this.trx = new Object();
				this.trx.r11 = -sinalphap * sinthetap - cosalphap * costhetap * sindecp;
				this.trx.r12 = cosalphap * sinthetap - sinalphap * costhetap * sindecp;
				this.trx.r13 = costhetap * cosdecp;
				this.trx.r21 = sinalphap * costhetap - cosalphap * sinthetap * sindecp;
				this.trx.r22 = -cosalphap * costhetap - sinalphap * sinthetap * sindecp;
				this.trx.r23 = sinthetap * cosdecp;
				this.trx.r31 = cosalphap * cosdecp;
				this.trx.r32 = sinalphap * cosdecp;
				this.trx.r33 = sindecp;
			}	
		}
	}
	_prepareImage()
	{
		this.min_nonzero = null
		this.max_nonzero = null
		
		this.min = null;
		this.max = null;
		this.mean = null;
		this.median = null;
		let dataCopy = new Array();
		this.histogram = new Object();
		
		let summer = 0;
		// find the mean, median, min, and max values
		for (let i = 0; i < this.data.length; i++)
		{
			dataCopy.push(this.data[i]);
			summer += this.data[i];
			if (this.max == null || this.data[i] > this.max)
				this.max = this.data[i];
			if (this.min == null || this.data[i] < this.min)
				this.min = this.data[i];
			if (this.data[i] != 0)
			{
				if (this.max_nonzero == null || this.data[i] > this.max_nonzero)
					this.max_nonzero = this.data[i];
				if (this.min_nonzero == null || this.data[i] < this.min_nonzero)
					this.min_nonzero = this.data[i];
			}
			const datastring = this.data[i].toString();
			if (datastring in this.histogram)
				this.histogram[datastring]++
			else
				this.histogram[datastring] = 0;
			
		}
		this.mean = summer / this.data.length;
		dataCopy.sort();
		this.median = dataCopy[(this.data.length >> 1)];
		if ((this.data.length & 0x1) == 0x00) // even number, average to find the median
		{
			this.median *= 0.5;
			this.median += dataCopy[(this.data.length >> 1) - 1] * 0.5;
		}
		
	}
	
	radec(x,y)
	{
		let ret = null;
		if (ValidateValue(x) && ValidateValue(y) && this.head.NAXIS.value >= 2 && this.proj_type == "TAN")  // 
		{
			const qx = radians(this.head["CDELT" + this.ra_axis].value) * (x - this.head["CRPIX" + this.ra_axis].value);
			const qy = radians(this.head["CDELT" + this.dec_axis].value) * (y - this.head["CRPIX" + this.dec_axis].value);
			
			const phi = Math.atan2(qx,-qy);
			const phideg = degrees(phi);
			const cosphi = Math.cos(phi);
			const sinphi = Math.sin(phi);
			const theta = Math.atan(1.0 / Math.sqrt(qx * qx + qy * qy));
			const thetadeg = degrees(theta);
			const costheta = Math.cos(theta);
			const sintheta = Math.sin(theta);
			
			const lp = cosphi * costheta;
			const mp = sinphi * costheta;
			const np = sintheta;
			
			const l = lp * this.trx.r11 + mp * this.trx.r21 + np * this.trx.r31;
			const m = lp * this.trx.r12 + mp * this.trx.r22 + np * this.trx.r32;
			const n = lp * this.trx.r13 + mp * this.trx.r23 + np * this.trx.r33;
			
			const alpha = degrees(Math.atan2(m,l));
			const dec = degrees(Math.asin(n));
			
			ret = {ra: alpha, dec:dec, phi: phideg, theta: thetadeg, qx: degrees(qx), qy:degrees(qy), x: x, y: y};
		}
		return ret;
	}
	get width()
	{
		return (NAXIS1 in this.head) ? this.head.NAXIS1.value : null;
	}
	get height()
	{
		return (NAXIS2 in this.head) ? this.head.NAXIS2.value : null;
	}
	createImage(context,stretch,invert,colorizer)
	{
		let imageData = context.createImageData(this.width, this.height);
		const logs = (stretch == "log" || stretch == "loglog" || stretch == "sqrtlog");
			
			
		let stretchfunction = function(x) {return x;};
		let procfunction = function(x) {return x;};
		let shift = 0;
		let lower = this.min;
		let slope = 1;
		if (!logs)
		{
			if (stretch == "sqrt")
				stretchfunction = function(x) {return Math.sqrt(x);}
			else if (stretch == "cuberoot")
				stretchfunction = function(x) {return Math.cbrt(x);}
			slope = 1.0 / (this.max - this.min);
		}
		else
		{
			shift = this.min < 1 ? (-this.min + 1) : 0.0; // note: if all values are less than 1 and are small, this can cause significant data loss
			if (stretch == "sqrtlog")
			{
				procfunction = function(x) {return Math.sqrt(Math.log(x));}
			}
			else if (stretch == "loglog")
			{
				procfunction = function(x) {return Math.log(Math.log(x));}
			}
			else
			{
				procfunction = function(x) {return Math.log(x);}
			}
			lower = procfunction(this.min + shift);
			slope = 1.0 / (procfunction(this.max + shift) - lower);
		}
		let colorFunction = SAOImageColorTypeGeneral;
		if (ValidateString(colorizer))
		{
			if (colorizer == "heat" || colorizer == "blackbody")
				colorFunction = SAOImageColorTypeBlackbody;
			else if (colorizer == "A" || colorizer == "a")
				colorFunction = SAOImageColorTypeA;
			else if (colorizer == "B" || colorizer == "B")
				colorFunction = SAOImageColorTypeB;
			
		}
		 
		for (let i = 0; i < this.data.length; i++)
		{
			const x = (i % this.width);
			const y = Math.floor(i / this.width);
			const imageDataRow = this.height - row - 1;
			const imageDataPos = (imageDataRow + x) * 4;
			const val = stretchfunction((procfunction(this.data[i] + shift) - lower) * slope);
			const pval = Math.floor(255 * (invert ? (1.0 - val) : val));
			const color = colorFunction(pval);
			imageData.data[imageDataPos + 0] = color.r;
			imageData.data[imageDataPos + 1] = color.g;
			imageData.data[imageDataPos + 2] = color.b;
			imageData.data[imageDataPos + 3] = 255;
		}
		return imageData;
	}
}

/////////////////////////////////////////////////////////////////////////
//
//  function requestFITS
//
// initialized the instance
// input: source (String): the path to the file to load
// output: FITS: a FITS class instance which will contain the data once it is retrieved and processed
//
/////////////////////////////////////////////////////////////////////////

function requestFITS(source)
{

	let ret = new FITS();
	
	let _dataPromise = getFileBinary(source)//);
	if (typeof _dataPromise != 'undefined' && _dataPromise !== null)
		_dataPromise.then(function(value){value.arrayBuffer().then(function(valueBlobArray){ret.readBlobArray(valueBlobArray)},function(error){ret.failed = true; ret.failed = error;});},function(error){ret.failed = true;ret.error = error;});

	return ret;
}

