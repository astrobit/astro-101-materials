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
		let head = new Object(); //new Array();
		head.keyList = new Array();
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
				const stringEndPlace = keyval.indexOf("'",1);
				const commentPlace = keyval.indexOf("/",stringEndPlace == -1 ? 0 : stringEndPlace);
				const commentFixed = (commentPlace != -1) ? keyval.slice(0,commentPlace).trim() : keyval;
				const commentItself = (commentPlace != -1) ? keyval.slice(commentPlace + 1).trim() : "";
				
				if (commentFixed.charAt(0) == "'") // is a string
				{
					const strend = commentFixed.indexOf("'",1);
					const keyString = commentFixed.slice(1,strend).trim();
					head[slkey] = {value: keyString, comment: commentItself};
				}
				else// if (keyval
				{
					const alphaOmega = "09";
					if (commentFixed.charCodeAt(0) >= alphaOmega.charCodeAt(0) && commentFixed.charCodeAt(0) <= alphaOmega.charCodeAt(1)) // seemingly numeric data
					{
						head[slkey] = {value: +commentFixed, comment: commentItself};
					}
					else
					{
						head[slkey] = {value: commentFixed, comment: commentItself};
					}
				}
			}
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
