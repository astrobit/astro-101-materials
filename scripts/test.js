"use strict";

let blobResult = null;
let blobArray = null;

let _dataPromise = getFileBinary("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");
if (typeof _dataPromise != 'undefined' && _dataPromise !== null)
	_dataPromise.then(function(value){blobResult = value},function(error){console.log("request failed with error " + error)});


function byteSwap(array,i,j)
{
	const swap = array[i];
	array[i] = array[j];
	array[j] = swap;
}
function waiter()
{
	if (blobArray != null)
	{
		const view = new Int8Array(blobArray);
		let bQuit = false;
		let iOffset = 0;
		let head = new Object(); //new Array();
		head.keyList = new Array();
		let lastKey = null;
		while (!bQuit)
		{
			let key = new String();
			for (let i = 0; i < 80; i++)
			{
				key += String.fromCharCode(view[i + iOffset]);
			}
			head.keyList.push(key);
			iOffset += 80;
			const sl = key.slice(0,3);
			bQuit = (sl == "END") || (iOffset + 80 > view.length);
			if (key.charAt(8) == "=")
			{
				const slkey = key.slice(0,8).trim();
				const keyval = key.slice(9).trim();
				const stringEndPlace = keyval.charAt(0) == "'" ? keyval.indexOf("'",1) : -1;
				const commentPlace = keyval.indexOf("/",stringEndPlace == -1 ? 0 : stringEndPlace);
				const commentFixed = (commentPlace != -1) ? keyval.slice(0,commentPlace).trim() : keyval;
				const commentItself = (commentPlace != -1) ? keyval.slice(commentPlace + 1).trim() : "";
				
				if (stringEndPlace != -1) // is a string
				{
					const keyString = commentFixed.slice(1,stringEndPlace).trim();
					head[slkey] = {value: keyString, comment: commentItself};
				}
				else// if (keyval
				{
					const alphaOmega = "09";
					if ((commentFixed.charCodeAt(0) >= alphaOmega.charCodeAt(0) && commentFixed.charCodeAt(0) <= alphaOmega.charCodeAt(1)) || commentFixed.charAt(0) == "-" || commentFixed.charAt(0) == "+") // seemingly numeric data
					{
						head[slkey] = {value: +commentFixed, comment: commentItself};
					}
					else
					{
						head[slkey] = {value: commentFixed, comment: commentItself};
					}
				}
				lastKey = slkey;
			}
			else if (key.slice(0,8).trim() == "CONTINUE" && lastKey !== null)
			{
				const keyval = key.slice(9).trim();
				const stringEndPlace = keyval.charAt(0) == "'" ? keyval.indexOf("'",1) : -1;
				const commentPlace = keyval.indexOf("/",stringEndPlace == -1 ? 0 : stringEndPlace);
				const commentFixed = (commentPlace != -1) ? keyval.slice(0,commentPlace).trim() : keyval;
				const commentItself = (commentPlace != -1) ? keyval.slice(commentPlace + 1).trim() : "";

				const keyString = commentFixed.slice(1,stringEndPlace).trim();
				const adjString = head[lastKey].value.slice(0,-1) + keyString;
				head[lastKey].value = adjString;
			}
		}
		if (!("BSCALE" in head))
			head.BSCALE = {value: 1.0, comment:"added by fiteES6.js"};
		if (!("BZERO" in head))
			head.BZERO = {value: 0.0, comment:"added by fiteES6.js"};
		let size = 1;
		for (let i = 0; i < head.NAXIS.value; i++)
		{
			const key = "NAXIS" + (i + 1);
			size *= head[key].value;
		}
		let data = null;
		let dataView = null;
		// determine architecture endianness
		let testArray = new ArrayBuffer(8);
		let testArrayView64 = new BigInt64Array(testArray);
		testArrayView32[0] = 0x0a0b0c0d0e0f0102;
		let testArrayView8 = new Int8Array(testArray);
		const bBigEndianArch = (testArrayView8[0] = 0x0a);
		let dataSegment = blobArray.slice(iOffset);
		
		if (head.BITPIX.value == 16)
		{
			data = new Int16Array(size);
			
			if (!bBigEndianArch)
			{
				let dataView8 = new Int8Array(dataSegment);
				for (let i = 0; i < dataView8.length; i+=2)
				{
					byteSwap(dataView8,i,i+1);
				}
			}

			dataView = new Int16Array(dataSegment);
		}
		else if (head.BITPIX.value == 32)
		{
			data = new Int32Array(size);

			if (!bBigEndianArch)
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
		else if (head.BITPIX.value == 64)
		{
			data = new BigInt64Array(size);
			if (!bBigEndianArch)
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
		else if (head.BITPIX.value == -32)
		{
			data = new Float32Array(size);
			if (!bBigEndianArch)
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
		else if (head.BITPIX.value == -64)
		{
			data = new Float64Array(size);
			if (!bBigEndianArch)
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
		else //if (head.BITPIX.value == 8)
		{
			data = new Uint8Array(size);
			dataView = new Uint8Array(dataSegment);
		}
		for (let i = 0;i < size && i < dataView.length; i++)
		{
			data[i] = dataView[i];
		}
		
//		var bBigEnd = ("BYTEORDR" in head) ? ;    // FITS is defined as big endian

		// BITPIX
		// 8-bit (unsigned) integer bytes
		// 16-bit (signed) integers
		// 32-bit (signed) integers
		// 32-bit single precision floating point real numbers
		// 64-bit double precision floating point real numbers
		
		console.log("array ready");
	}
	else if (blobResult != null)
	{
		console.log("blob ready");
		blobResult.arrayBuffer().then(function(value){blobArray = value},function(error){console.log("blobl arrray request failed with error " + error)});
		window.setTimeout(waiter, 1000.0);
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
