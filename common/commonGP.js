/////////////////////////////////////////////////////////////////////////
//
//  function binarySearch
//
// performs a binary search on a sorted array of objects that contain
// a number in the specified key.
// inputs: sortedArray (Array) - an array of Objects that contain
//                               numeric data in the specified key
//         findValue (Number) - the number to find within the array
//         key (String)       - the key within the Objects in the array
//                              that contains the numeric value to search
// output: (Number) - the index within the array at which findValue is 
//                    found. If the findValue is not found, null is returned
//
/////////////////////////////////////////////////////////////////////////

function binarySearch(sortedArray,findValue,key)
{
	var imin = 0;
	var imax = sortedArray.length - 1;
	var ret = null;
	if (sortedArray.length > 0)
	{
		var i;
		var found = false;
		do
		{
			i = Math.floor((imax + imin) / 2);
//			console.log(i + " " + imin + " " + imax)
			var	testVal;
			if (typeof key === 'undefined' || key === null)
				testVal = sortedArray[i];
			else
				testVal = sortedArray[i][key];
			if (findValue < testVal)
			{
				if (imin != i)
					imax = i;
				else
					imax = i - 1;
//				console.log("<")
			}
			else if (findValue > testVal)
			{
				if (imin != i)
					imin = i;
				else
					imin = i + 1;
//				console.log(">")
			}
			else
				found = true;
		}
		while (imin < imax && !found);
		if (found)
		{
			ret = i;
		}
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
// function random_gaussian
//
// random Gaussian disribution
//Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
// modified to allow a mean and standard deviation
// input: mean (Number) - the value around which the distribution should vary
//        stdev (Number) - the standard deviation of the distribution
// output: (Number) a random number that is distributed in a normal
//                  distribution about the mean with the given standard 
//					deviation
//
/////////////////////////////////////////////////////////////////////////

function random_gaussian(mean, stdev) { 
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * stdev / Math.PI * 0.5 + mean;
}

/////////////////////////////////////////////////////////////////////////
//
// function download
//
// Function to download data to a file
// Source: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file/30832210#30832210
// Author(s): Kanchu (https://stackoverflow.com/users/1458751/kanchu), 
//			Awesomeness01 (https://stackoverflow.com/users/4181717/awesomeness01), 
//			trueimage(https://stackoverflow.com/users/2430498/trueimage)
//
// input: data (String) - a string containing the data to be downloaded
//        filename (String) - the name of the file that the downloading user recieves
//        type (String) - the MIME type of information that the file contains
// outputs: none 
//     (note: output is a file download for the client)
//
/////////////////////////////////////////////////////////////////////////

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
/////////////////////////////////////////////////////////////////////////
//
//  function sig_figs
//
// this function rounds a value and uncertainty to an 
// appropriate number of significant figures, based on the uncertainty
// the value and uncertainty are output as an object with keys
// `value' and `uncertainty', respectively.
// an additional key `rounding' is included that is for use with
// the .toFixed method to ensure proper display of values
/////////////////////////////////////////////////////////////////////////
function sig_figs(value, uncertainty)
{
	var uncertainty_res = -1;
	var value_res = 0;
	var rounding = 0;
	if (uncertainty > 0)
	{
		var uncertainty_log = Math.floor(Math.log10(uncertainty));
		rounding = -uncertainty_log;
		if (rounding < 0)
			rounding = 0;
		var mult = Math.pow(10,uncertainty_log);
		uncertainty_res = Math.round(uncertainty / mult) * mult;
		value_res = Math.round(value / mult) * mult;
	}
	else if (value > 0)
	{
		var value_log = Math.floor(Math.log10(value));
		rounding = -value_log;
		if (rounding < 0)
			rounding = 0;
		var mult = Math.pow(10,value_log);
		uncertainty_res = uncertainty;
		value_res = Math.round(value / mult) * mult;
	}
	
	return {value:value_res, uncertainty: uncertainty_res, rounding: rounding};
}
/////////////////////////////////////////////////////////////////////////
//
//  function toSubscript
//
// convert the numbers in a string to unicode subscript numbers
// input: value (String) - the string containing the numbers to convert
// output: (String) - the same string with all numbers converted to 
//                    unicode subscript
//
/////////////////////////////////////////////////////////////////////////

function toSubscript(value)
{
	var vstring = value.toString();
	var ret = new String();
	var i;
	for (i = 0; i < vstring.length; i++)
	{
		switch(vstring.charAt(i))
		{
		case '0':
			ret += String.fromCharCode(0x2080)
			break;
		case '1':
			ret += String.fromCharCode(0x2081)
			break;
		case '2':
			ret += String.fromCharCode(0x2082)
			break;
		case '3':
			ret += String.fromCharCode(0x2083)
			break;
		case '4':
			ret += String.fromCharCode(0x2084)
			break;
		case '5':
			ret += String.fromCharCode(0x2085)
			break;
		case '6':
			ret += String.fromCharCode(0x2086)
			break;
		case '7':
			ret += String.fromCharCode(0x2087)
			break;
		case '8':
			ret += String.fromCharCode(0x2088)
			break;
		case '9':
			ret += String.fromCharCode(0x2089)
			break;
		case '-':
			ret += String.fromCharCode(0x208b)
			break;
		case '+':
			ret += String.fromCharCode(0x208a)
			break;
		default:
			ret += vstring.charAt(i);
			break;
		}
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function toSubscript
//
// convert the numbers in a string to unicode superscript numbers
// input: value (String) - the string containing the numbers to convert
// output: (String) - the same string with all numbers converted to 
//                    unicode superscript
//
/////////////////////////////////////////////////////////////////////////

function toSuperscript(value)
{
	var vstring = value.toString();
	var ret = new String();
	var i;
	for (i = 0; i < vstring.length; i++)
	{
		switch(vstring.charAt(i))
		{
		case '0':
			ret += String.fromCharCode(0x2070)
			break;
		case '1':
			ret += String.fromCharCode(0x20b9)
			break;
		case '2':
			ret += String.fromCharCode(0x00b2)
			break;
		case '3':
			ret += String.fromCharCode(0x00b3)
			break;
		case '4':
			ret += String.fromCharCode(0x2074)
			break;
		case '5':
			ret += String.fromCharCode(0x2075)
			break;
		case '6':
			ret += String.fromCharCode(0x2076)
			break;
		case '7':
			ret += String.fromCharCode(0x2077)
			break;
		case '8':
			ret += String.fromCharCode(0x2078)
			break;
		case '9':
			ret += String.fromCharCode(0x2079)
			break;
		case '-':
			ret += String.fromCharCode(0x207b)
			break;
		case '+':
			ret += String.fromCharCode(0x207a)
			break;
		default:
			ret += vstring.charAt(i);
			break;
		}
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function getFontSize
//
// interpret the font size specified in a CSS style object or a context font specification
// input: font (String) - the string to interpret; for a CSS style the entire style string may be provided
// output: (Object) - an object containing the size of the specified font
//				key: units (String) - the specified units; may be "%", "px", "em", or "vw"
//				key: value (Number) - the numeric font size
//
/////////////////////////////////////////////////////////////////////////

function getFontSize(font)
{
	var ret = new Object();
	// if font is a style, look for font-size
	var style = font.search("font-size:");
	var value = new String();
	var units = new String();
	var charCode0 = String('0').charCodeAt(0);
	var charCode9 = String('9').charCodeAt(0);
	
	if (style >= 0)
	{
		var i = style + 10;
		while (i < font.length && (font.charAt(i) == ' ' || font.charAt(i) == '\t'))
			i++;
		while (i < font.length && ((font.charCodeAt(i) >= charCode0 && font.charCodeAt(i) <= charCode9) || font.charAt(i) == '.'))
		{
			value += font.charAt(i);
			i++;
		}
		while (i < font.length && (font.charAt(i) == ' ' || font.charAt(i) == '\t'))
			i++;
		while (i < font.length && (font.charAt(i) != ';' && font.charAt(i) != ' ' && font.charAt(i) != '\t'))
		{
			units += font.charAt(i);
			i++;
		}
	}
	else
	{	
		var i = 0;
		// find the number
		while (i < font.length && (font.charCodeAt(i) < charCode0 || font.charCodeAt(i) > charCode9))
		{
			i++;
		}
		while (i < font.length && ((font.charCodeAt(i) >= charCode0 && font.charCodeAt(i) <= charCode9) || font.charAt(i) == '.'))
		{
			value += font.charAt(i);
			i++;
		}
		while (i < font.length && (font.charAt(i) == ' ' || font.charAt(i) == '\t'))
			i++;
		while (i < font.length && (font.charAt(i) != ';' && font.charAt(i) != ' ' && font.charAt(i) != '\t'))
		{
			units += font.charAt(i);
			i++;
		}
	}
	ret.units = units;
	ret.value = Number(value);
	return ret;
}

