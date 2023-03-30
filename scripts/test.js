"use strict";

function byteSwap(array,i,j)
{
	const swap = array[i];
	array[i] = array[j];
	array[j] = swap;
}

class FITS
{
	constructor()
	{
		this.ready = false;
		this.head = new Object();
		this.data = null;
	}
	readBlobArray(blobArray)
	{
		if (blobArray != null)
		{
			const view = new Int8Array(blobArray);
			let bQuit = false;
			let iOffset = 0;
			this.head = new Object(); //new Array();
			this.head.keyList = new Array();
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
				else if (key.slice(0,8).trim() == "CONTINUE" && lastKey !== null && this.head[lastKey] instanceof String)
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
			if (!("BZERO" in head))
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
						byteSwap(dataView8,i,i+1);
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
						byteSwap(dataView8,i,i + 3);
						byteSwap(dataView8,i + 1,i + 2);
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
						byteSwap(dataView8,i    ,i + 7);
						byteSwap(dataView8,i + 1,i + 6);
						byteSwap(dataView8,i + 2,i + 5);
						byteSwap(dataView8,i + 3,i + 4);
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
						byteSwap(dataView8,i,i + 3);
						byteSwap(dataView8,i + 1,i + 2);
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
						byteSwap(dataView8,i    ,i + 7);
						byteSwap(dataView8,i + 1,i + 6);
						byteSwap(dataView8,i + 2,i + 5);
						byteSwap(dataView8,i + 3,i + 4);
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
			this.ready = true;
		}
	}
}

function requestFITS(source)
{

	let ret = new FITS();
	
	let _dataPromise = getFileBinary(source)//);
	if (typeof _dataPromise != 'undefined' && _dataPromise !== null)
		_dataPromise.then(function(value){value.arrayBuffer().then(function(valueBlobArray){ret.readBlobArray(valueBlobArray)},function(error){console.log("blob arrray request failed with error " + error)});},function(error){console.log("request failed with error " + error)});

}

let g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");

function waiter()
{
	if (g_testFits.ready)
	{
		console.log("array ready");
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
