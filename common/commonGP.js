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
	let imin = 0;
	let imax = sortedArray.length - 1;
	let ret = null;
	if (sortedArray.length > 0)
	{
		let i;
		let found = false;
		do
		{
			i = Math.floor((imax + imin) / 2);
//			console.log(i + " " + imin + " " + imax)
			let	testVal;
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
// Note: this generates a semi-normal distribution wherein all data lies within
// approximately one standard deviation of the mean.
// modified to allow a mean and standard deviation
// input: mean (Number) - the value around which the distribution should vary
//        stdev (Number) - the standard deviation of the distribution
// output: (Number) a random number that is distributed in a normal
//                  distribution about the mean with the given standard 
//					deviation
//
/////////////////////////////////////////////////////////////////////////

let g_gauss_gset = null;
function random_gaussian(mean, stdev)
{ 
	let ret;
	if (g_gauss_gset == null)
	{
		let rsq;
		let v1;
		let v2;
		do
		{
			v1 = 2.0 * Math.random() - 1.0;
			v2 = 2.0 * Math.random() - 1.0;
			rsq = v1 * v1 + v2 * v2;
		}
		while (rsq >= 1.0 || rsq == 0.0);
		const fac = Math.sqrt(-2.0 * Math.log(rsq) / rsq);
		ret = v2 * fac * stdev + mean;
		g_gauss_gset = v1 * fac;
	}
	else
	{
		ret = g_gauss_gset * stdev + mean;
		g_gauss_gset = null;
	}
	return ret;
}


/////////////////////////////////////////////////////////////////////////
//
// function error_function
//
// Error Function (erf), using the Bürmann series
// 
// input: x (Number) - the value at which to calculate the error function
// output: (Number) the error function evaluated at x
//
/////////////////////////////////////////////////////////////////////////

const g_errf_twooversqrtpi = 2.0 / Math.sqrt(Math.PI);
const g_errf_errfC1 = 31.0 / 200.0;
const g_errf_errfC2 = 341.0 / 20000.0;

function error_function(x)
{
	const exsq = Math.exp(-x * x);
	const sign = Math.sign(x);
	return sign * g_errf_twooversqrtpi * Math.sqrt(1.0 - exsq) * (g_errf_twooversqrtpi + g_errf_errfC1 * exsq - g_errf_errfC2 * exsq * exsq);
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
    let file = new Blob([data], {type: type});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
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
class Sig_Figs
{
	constructor(value,uncertainty,rounding)
	{
		this.value = value;
		this.uncertainty = uncertainty;
		this.rounding = rounding;
	}
	get value_string()
	{
		return this.value.toFixed(this.rounding)
	}
	get uncertainty_string()
	{
		return this.uncertainty.toFixed(this.rounding)
	}
	get standard_notation()
	{
		const log_value = Math.log10(Math.abs(this.value));
		if (log_value >= 4 || log_value <= -4)
		{
			const sign = (this.value < 0);
			const power = Math.pow(10.0,-Math.floor(log_value));
			const exp = Math.floor(log_value);
			const exp_u = Math.floor(Math.log10(this.uncertainty));
			
			const mantissa = this.value * power;
			const mantissa_u = this.uncertainty * power;
			const rounding = Math.max(0,exp - exp_u);
			
//			return "(" + this.value_string + " ± " + this.uncertainty_string + ")";
			const exponent = toSuperscript(exp.toFixed(0));
			return "(" + mantissa.toFixed(rounding) + " ± " + mantissa_u.toFixed(rounding) + ")×10" + exponent;
		}
		else
			return "(" + this.value_string + " ± " + this.uncertainty_string + ")";
	}
	
	
}
function sig_figs(value, uncertainty)
{
	let uncertainty_res = -1;
	let value_res = 0;
	let rounding = 0;
	if (uncertainty > 0)
	{
		const uncertainty_log = Math.floor(Math.log10(uncertainty));
		rounding = Math.max(0,-uncertainty_log);
		const mult = Math.pow(10,uncertainty_log);
		uncertainty_res = Math.round(uncertainty / mult) * mult;
		value_res = Math.round(value / mult) * mult;
	}
	else if (value > 0)
	{
		const value_log = Math.floor(Math.log10(value));
		rounding = Math.max(0,-value_log);
		const mult = Math.pow(10,value_log);
		uncertainty_res = uncertainty;
		value_res = Math.round(value / mult) * mult;
	}
	
	return new Sig_Figs(value_res,uncertainty_res,rounding);
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
	const vstring = value.toString();
	let ret = new String();
	let i;
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
	const vstring = value.toString();
	let ret = new String();
	let i;
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
	let ret = new Object();
	// if font is a style, look for font-size
	const style = font.search("font-size:");
	let value = new String();
	let units = new String();
	const charCode0 = String('0').charCodeAt(0);
	const charCode9 = String('9').charCodeAt(0);
	
	if (style >= 0)
	{
		let i = style + 10;
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
		let i = 0;
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

/////////////////////////////////////////////////////////////////////////
//
//  function shuffle
// Source: https://bost.ocks.org/mike/shuffle/
// Author(s): Mike Bostock
//
// randomly shuffle the elements of an array using a Fisher–Yates shuffle.
// input: arrray (Array) - the array to shuffle
// output: (Array) - the array with the data randomly shuffled.
//
/////////////////////////////////////////////////////////////////////////

function shuffle(array) {
  let m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

/////////////////////////////////////////////////////////////////////////
//
//  function ValidateValue
//
// confirm that a variable is identified, non-null, and numeric
// input: value - the variable to test
// output: (boolean) - true if the variable is identified, non-null, and a number, false otherwise
//
/////////////////////////////////////////////////////////////////////////
function ValidateValue(value)
{
	return (value !== undefined && value !== null && typeof(value) == "number");
}

