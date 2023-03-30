"use strict";

let blobResult = null;
let blobArray = null;

let _dataPromise = getFileBinary("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");
if (typeof _dataPromise != 'undefined' && _dataPromise !== null)
	_dataPromise.then(function(value){blobResult = value},function(error){console.log("request failed with error " + error)});


function waiter()
{
	if (blobArray != null)
	{
		const view = new Int8Array(blobArray);
		let bQuit = false;
		let iOffset = 0;
		let head = new Array();
		while (!bQuit)
		{
			let key = new String();
			for (let i = 0; i < 80; i++)
			{
				key += String.fromCharCode(view[i + iOffset]);
			}
			head.push(key);
			iOffset += 80;
			bQuit = (key.slice(3) == "END") || (iOffset + 80 > view.length);
		}
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
