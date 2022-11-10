//
// Requires:
//
// CHANGE LOG
// 
// 2022-Sep-25
// Additions
// - this change log
// - add ValidateString function
// - add ValidateBoolean function
// - add gamma funtion
// - add factorial function
// - add bessel function
// - add bessel_D function
// - add newton_raphson function
// - add Averager class
// - add AngularAverager class
// - add SphericalAverager class
// Changes
// - Clean up comment formatting
// - modify ValidateValue function to use typeof instead of !== undefined
//
// 2022-Nov-09
// Additions
// - add SIprefix to determine the approriate SI prefix for a value. Note: excludes centi-, hecto-, deci-, and deca-

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
//                              that contains the numeric value to 
//								search
// output: (Number) - the index within the array at which findValue is 
//                    	found. If the findValue is not found, null is 
//						returned
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
// Note: this generates a semi-normal distribution wherein all data 
// lies within approximately one standard deviation of the mean.
// modified to allow a mean and standard deviation
// input: mean (Number) - the value around which the distribution 
//							should vary
//        stdev (Number) - the standard deviation of the distribution
// output: (Number) a random number that is distributed in a normal
//                  distribution about the mean with the given standard 
//					deviation
//
/////////////////////////////////////////////////////////////////////////

let g_gauss_gset = null; // second value created with each instance of use
// will alternate between null and a value; not intended for public use
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
//        filename (String) - the name of the file that the downloading 
//								user recieves
//        type (String) - the MIME type of information that the file 
//							contains
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
//  class Sig_Figs
//
// a container class that holds the value and uncertainty information
// public keys:
//		value (number) - the value
//		uncertainty (number) - the numberuncertainty in the value
//		rounding (number) - the rounding to be used for retreiving the 
//							value
//
/////////////////////////////////////////////////////////////////////////

class Sig_Figs
{
	constructor(value,uncertainty,rounding)
	{
		this.value = value;
		this.uncertainty = uncertainty;
		this.rounding = rounding;
	}
/////////////////////////////////////////////////////////////////////////
//
//  getter value_string
//
// this function returns the value as a string, rounded to this.rounding
// inputs: none
// outputs: (string) - the value as a string, rounded to this.rounding
/////////////////////////////////////////////////////////////////////////
	get value_string()
	{
		return this.value.toFixed(this.rounding)
	}
/////////////////////////////////////////////////////////////////////////
//
//  getter uncertainty_string
//
// this function returns the uncertainty as a string, rounded to
// this.rounding
// inputs: none
// outputs: (string) - the uncertainty as a string, rounded to 
//						this.rounding
/////////////////////////////////////////////////////////////////////////
	get uncertainty_string()
	{
		return this.uncertainty.toFixed(this.rounding)
	}
/////////////////////////////////////////////////////////////////////////
//
//  getter standard_notation
//
// this function returns the value and uncertainty as a string in 
// standard notation.
// if the |value| > 10,000 or |value| < 0.0001, then the value and 
// uncertainty will be returned using scientific notation.
// inputs: none
// outputs: (string) - the value and uncertatinty in standard notation
/////////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////////
//
//  function sig_figs
//
// this function rounds a value and uncertainty to an 
// appropriate number of significant figures, based on the uncertainty
// the value and uncertainty are output as an object with keys
// `value' and `uncertainty', respectively.
// inputs: value(number) - the value
// 			uncertainty(number) - the uncertainty
// outputs: (object: Sig_Figs) - a Sig_Figs object that contains
/////////////////////////////////////////////////////////////////////////


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
// interpret the font size specified in a CSS style object or a context 
// font specification
// input: font (String) - the string to interpret; for a CSS style the 
//						entire style string may be provided
// output: (Object) - an object containing the size of the specified font
//				key: units (String) - the specified units; may be "%", 
//										"px", "em", or "vw"
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
// output: (boolean) - true if the variable is identified, non-null, and 
//						a number, false otherwise
//
/////////////////////////////////////////////////////////////////////////
function ValidateValue(value)
{
	return (typeof value == 'number' && value !== null)
}

/////////////////////////////////////////////////////////////////////////
//
//  function ValidateString
//
// confirm that a variable is identified, non-null, and string
// input: value - the variable to test
// output: (boolean) - true if the variable is identified, non-null, and 
//						a string, false otherwise
//
/////////////////////////////////////////////////////////////////////////
function ValidateString(value)
{
	return (typeof value == 'string' && value !== null)
}


/////////////////////////////////////////////////////////////////////////
//
//  function ValidateBoolean
//
// confirm that a variable is identified, non-null, and a boolean type
// input: value - the variable to test
// output: (boolean) - true if the variable is identified, non-null, and 
//						a boolean, false otherwise
//
/////////////////////////////////////////////////////////////////////////
function ValidateBoolean(value)
{
	return (typeof value == 'boolean' && value !== null)
}

/////////////////////////////////////////////////////////////////////////
//
//  function getFile
//
// confirm that a variable is identified, non-null, and numeric
// input: url - the URL from which to fetch; note the fetch will be 
//					accomplished using a GET
// output: (Promise) - a promise that provides the text of the response 
// 						or error
//
/////////////////////////////////////////////////////////////////////////
function getFile(url)
{
	let ret = null;
	if (typeof fetch !== 'undefined')
	{
		// use the fetch API if available
//		ret = new Promise(function(fSuccess,fError){fetch(url, { mode: 'no-cors'}).then(
		ret = new Promise(function(fSuccess,fError){fetch(url).then(
			function(result)
			{
				fSuccess(result.text());
			},
			function(error)
			{
				console.log("getFile fetch error " + error);
				fError(error);
			})
		});
	}
	else 
	{
		ret = new Promise(function(fSuccess,fError){
			let request = new XMLHttpRequest();
			request.onreadystatechange = function() {
			//	console.log(this.readyState + " " + this.status);
				if (this.readyState == 4)
				{
					if (this.status == 200)
					{
						fSuccess(request.responseText);
					}
					else
					{
				console.log("getFile AJAX error " + request.statusText);
						fError(request.statusText);
					}
				}
			}
			request.open("GET", url, true);
			request.send();
		});			
	}
	return ret;
}

/////////////////////////////////////////////////////////////////////////
//
//  function gamma
//
// calculate the gamma function Γ(n) = (n - 1)!
// input: url (string) - the URL from which to fetch; note the fetch will 
//							be accomplished using a GET
// output: (Promise) - a promise that provides the text of the response 
//							or error
//
/////////////////////////////////////////////////////////////////////////

function gamma(n)
{
	return factorial(n - 1);
}


/////////////////////////////////////////////////////////////////////////
//
//  function factorial
//
// calculate a factorial (n!). Note this function is recursive, so should 
// not be used for large numbers
// input: n (number) - the number for which to calculate the factoral
// output: (number) - the factorial of n, or 1 if n is invalid or 
//						negative
//
/////////////////////////////////////////////////////////////////////////

function factorial(n)
{
	let g = 1;
	if (ValidateValue(n) && n > 1)
		g *= n * factorial (n - 1);
	return g;
}


/////////////////////////////////////////////////////////////////////////
//
//  function bessel
//
// calculate a bessel function of the first kind.
// J_a(x) = sum((-1)^m / (m! Γ(m + a + 1) (x/2)^(2m + a)))
// input: a (number) - the value of a at which to calculate the result 
//        x (number) - the value of x at which to calculate the result
//        e (number, undefined, or null) - the epsilon to use to 
//						determine convergence. Default  is Number.EPSILON
// output: (number) - the bessel function J_a(x)
//
/////////////////////////////////////////////////////////////////////////


function bessel(a,x,e)
{
	let m = 0;
	let ret = 0;
	let fdelta = 1;
	let epsilon = e;
	if (e === undefined || e == null)
	{
		epsilon = Number.EPSILON;
	}
	do
	{
		let sign = (m % 2) == 1 ? -1 : 1;
		let denom = factorial(m) * gamma(m + a + 1);
		let delta = Math.pow(x * 0.5,2 * m + a) / denom * sign;
		let delta_deriv = (m + a * 0.5) * Math.pow(x * 0.5,2 * m + a - 1) / denom * sign;
		ret += delta;
		fdelta = Math.abs(delta / ret);
		m++;
	} while (fdelta > epsilon);
	return ret;
}


/////////////////////////////////////////////////////////////////////////
//
//  function bessel_D
//
// calculate the first derivative of a bessel function of the first kind.
// J_a(x) = sum((-1)^m / (m! Γ(m + a + 1) (x/2)^(2m + a)))
// input: a (number) - the value of a at which to calculate the result 
//        x (number) - the value of x at which to calculate the result
//        e (number, undefined, or null) - the epsilon to use to 
//						determine convergence. Default  is Number.EPSILON
// output: (number) - the derivative of the bessel function J_a'(x)
//
/////////////////////////////////////////////////////////////////////////

function bessel_D(a,x,e)
{
	let m = 0;
	let ret = 0;
	let ret_deriv = 0;
	let fdelta = 1;
	let epsilon = e;
	if (e === undefined || e == null)
	{
		epsilon = Number.EPSILON;
	}
	do
	{
		let sign = (m % 2) == 1 ? -1 : 1;
		let denom = factorial(m) * gamma(m + a + 1);
		let delta = Math.pow(x * 0.5,2 * m + a) / denom * sign;
		let delta_deriv = (m + a * 0.5) * Math.pow(x * 0.5,2 * m + a - 1) / denom * sign;
		ret += delta;
		ret_deriv += delta_deriv;
		fdelta = Math.abs(delta / ret);
		m++;
	} while (fdelta > epsilon);
	return ret_deriv;
}


/////////////////////////////////////////////////////////////////////////
//
//  function newton_raphson
//
// find a root of a function using Newton-Raphson iteration
// input: x0 (number) - the initial guess
//        f (function) - the function for which to find the root
//        f_prime (function) - the derivative of the function
//        tolerance (number) - the smallest change in x near the root
//						for which to accept the root is found
//        epsilon (number) - the smallest value of f' for which 
//						computation is allowed; meant to prevent
//						excessively large jumps
//        max_iterations (number) - the maximum number of iterations
//						allowed to attempt convergence
// output: (number) - the root of the function f found near x_0
//
/////////////////////////////////////////////////////////////////////////


function newton_raphson(x0, f, f_prime, tolerance, epsilon, max_iterations)
{
	let i = 0;
	let x = x0;
	let delta = 1;
	let yp;
	let ret = null;
	let big;
	do
	{
		let y = f(x);
		yp = f_prime(x);
		big = (Math.abs(yp) > epsilon)
		{
			delta = -y / yp;
			x += delta;
		}
		i++;
	} while (big && Math.abs(delta) > tolerance && i < max_iterations)
	if (Math.abs(delta) < tolerance)
		ret = x;
	return ret;
} 





/////////////////////////////////////////////////////////////////////////
//
//  class Averager
//
// a class used to calculate the average, standard deviation, and 
// standard error of a set of values.
// public keys:
//		none
//
/////////////////////////////////////////////////////////////////////////


class Averager
{
	constructor()
	{
		this._sum = 0;
		this._count = 0;
		this._sum_sq = 0;
		this._max = null;
		this._min = null;
		
		this._avg = NaN;
		this._stdevp = NaN;
		this._stdevs = NaN;
		this._sterrp = NaN;
		this._sterrs = NaN;
	
		this._statistics_count_last = 0;	
	}
	

/////////////////////////////////////////////////////////////////////////
//
//  function _calc_statistics
//
// calculate the current average, standard deviations, and standard
// errors; intended for internal use, but may be called externally to 
// ensure the calculations have been performed.
// inputs: none
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	_calc_statistics()
	{
		if (this._count > 0 && this._count > this._statistics_count_last)
		{
			this._avg = this._sum / this._count;
			this._stdevp = Math.sqrt(this._sum_sq * this._count - this._sum * this._sum) / this._count;
			const isc = 1.0 / Math.sqrt(this._count);
			this._sterrp = this._stdevp * isc;
			if (this._count > 1)
			{
				this._stdevs = Math.sqrt((this._sum_sq * this._count - this._sum * this._sum) / (this._count * this._count - this._count));
				this._sterrs = this._stdevs * isc;
			}
			this._statistics_count_last = this._count;
		}
	}
	
/////////////////////////////////////////////////////////////////////////
//
//  function add
//
// add a value to the set for the average
// inputs: value(number) - the value to include in the set
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	add(value)
	{
		if (ValidateValue(value))
		{
			this._sum += value;
			this._sum_sq += value * value;
			this._count++;
			if (this._max === null || value > this._max)
				this._max = value;
			if (this._min === null || value < this._min)
				this._min = value;
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  get average
//
// returns the average of the set, or NaN if there is no data in the set
// inputs: none
// output: (number) the average of the set, or NaN if there is no data in 
//				the set
//
/////////////////////////////////////////////////////////////////////////
	get average()
	{
		this._calc_statistics();
		return this._avg;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get stdevp
//
// returns the standard deviation of a population, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard devation of the population, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get stdevp()
	{
		this._calc_statistics();
		return this._stdevp;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get stdevs
//
// returns the standard deviation of a sample, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard devation of the sample, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get stdevs()
	{
		this._calc_statistics();
		return this._stdevs; 
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sterrp
//
// returns the standard error of a population, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard error of the population, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get sterrp()
	{
		this._calc_statistics();
		return this._sterrp;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sterrs
//
// returns the standard error of a sample, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard error of the sample, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get sterrs()
	{
		this._calc_statistics();
		return this._sterrs;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get max
//
// returns the maxmimum value of the set, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the maximum value of the set, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get max()
	{
		return this._max !== null ? this._max : NaN;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get min
//
// returns the minimum value of the set, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the minimum value of the set, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get min()
	{
		return this._min !== null ? this._min : NaN;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get count
//
// returns the number of values in the set
// inputs: none
// output: (number) the number of values in the set
//
/////////////////////////////////////////////////////////////////////////
	get count()
	{
		return this._count;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sum
//
// returns the sum of the values in the set
// inputs: none
// output: (number) the sum of the values in the set
//
/////////////////////////////////////////////////////////////////////////
	get sum()
	{
		return this._sum;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sumsq
//
// returns the sum of the square of the values in the set
// inputs: none
// output: (number) the sum of the square of the values in the set
//
/////////////////////////////////////////////////////////////////////////
	get sumsq()
	{
		return this._sumsq;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get copyFrom
//
// copies the data from a similar Averager-like object
// inputs: data (object) - an object that contains data similar
//							to an Averager
// output: none
//
/////////////////////////////////////////////////////////////////////////
	copyFrom(data)
	{
		if (typeof data == 'object' && data !== null)
		{
			if (typeof data._sum !== 'undefined')
				this._sum = data._sum;
			if (typeof data._count !== 'undefined')
				this._count = data._count;
			if (typeof data._sum_sq !== 'undefined')
				this._sum_sq = data._sum_sq;
			if (typeof data._max !== 'undefined')
				this._max = data._max;
			if (typeof data._min !== 'undefined')
				this._min = data._min;
			if (typeof data._avg !== 'undefined')
				this._avg = data._avg;
			if (typeof data._stdevp !== 'undefined')
				this._stdevp = data._stdevp;
			if (typeof data._stdevs !== 'undefined')
				this._stdevs = data._stdevs;
			if (typeof data._sterrp !== 'undefined')
				this._sterrp = data._sterrp;
			if (typeof data._sterrs !== 'undefined')
				this._sterrs = data._sterrs;
			if (typeof data._statistics_count_last !== 'undefined')
				this._statistics_count_last = data._statistics_count_last;
		}
	}
}



/////////////////////////////////////////////////////////////////////////
//
//  class AngularAverager
//
// a class used to calculate the average, standard deviation, and 
// standard error of a set of angles.
// public keys:
//		none
//
/////////////////////////////////////////////////////////////////////////

class AngularAverager
{
	constructor()
	{
		this._x = new Averager();
		this._y = new Averager();
		
		this._avg = NaN;
		this._stdevp = NaN;
		this._stdevs = NaN;
		this._sterrp = NaN;
		this._sterrs = NaN;

		this._statistics_count_last = 0;	
	}
/////////////////////////////////////////////////////////////////////////
//
//  get copyFrom
//
// copies the data from a similar AngularAverager-like object
// inputs: data (object) - an object that contains data similar
//							to an AngularAverager
// output: none
//
/////////////////////////////////////////////////////////////////////////
	copyFrom(data)
	{
		if (typeof data == 'object' && data !== null)
		{
			if (typeof data._x !== 'undefined')
				this._x.copyFrom(data._x);
			if (typeof data._y !== 'undefined')
				this._y.copyFrom(data._y);
			if (typeof data._avg !== 'undefined')
				this._avg = data._avg;
			if (typeof data._stdevp !== 'undefined')
				this._stdevp = data._stdevp;
			if (typeof data._stdevs !== 'undefined')
				this._stdevs = data._stdevs;
			if (typeof data._sterrp !== 'undefined')
				this._sterrp = data._sterrp;
			if (typeof data._sterrs !== 'undefined')
				this._sterrs = data._sterrs;
			if (typeof data._statistics_count_last !== 'undefined')
				this._statistics_count_last = data._statistics_count_last;
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  function _calc_statistics
//
// calculate the current average, standard deviations, and standard
// errors; intended for internal use, but may be called externally to 
// ensure the calculations have been performed.
// inputs: none
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	_calc_statistics()
	{
		if (this._count > 0 && this._count > this._statistics_count_last)
		{
			this._avg = degrees(Math.atan2(this._y.average, this._x.average));
			//const yx = this._y.average / this._x.average;
			const ixy = Math.abs(1.0  / (this._x.average + this._y.average));
			this._stdevp = degrees(Math.sqrt((this._y.average * this._x.stdevp) ** 2 + (this._x.average * this._y.stdevp) ** 2) * ixy);
			this._stdevs = degrees(Math.sqrt((this._y.average * this._x.stdevs) ** 2 + (this._x.average * this._y.stdevs) ** 2) * ixy);
			this._sterrp = degrees(Math.sqrt((this._y.average * this._x.sterrp) ** 2 + (this._x.average * this._y.sterrp) ** 2) * ixy);
			this._sterrs = degrees(Math.sqrt((this._y.average * this._x.sterrs) ** 2 + (this._x.average * this._y.sterrs) ** 2) * ixy);
			this._statistics_count_last = this._x.count;
		}
	}
	
	
/////////////////////////////////////////////////////////////////////////
//
//  function add
//
// add a angle to the set for the average
// inputs: value(number) - the angle to include in the set
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	add(value)
	{
		if (ValidateValue(value))
		{
			const angle_rad = radians(value);
			const x = Math.cos(angle_rad);
			const y = Math.sin(angle_rad);
			
			this._x.add(x);
			this._y.add(y);
			
			
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  get average
//
// returns the average of the set, or NaN if there is no data in the set
// inputs: none
// output: (number) the average of the set, or NaN if there is no data in 
//				the set
//
/////////////////////////////////////////////////////////////////////////
	get average()
	{
		this._calc_statistics();
		return this._avg;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get stdevp
//
// returns the standard deviation of a population, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard devation of the population, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get stdevp()
	{
		this._calc_statistics();
		return this._stdevp;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get stdevs
//
// returns the standard deviation of a sample, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard devation of the sample, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get stdevs()
	{
		this._calc_statistics();
		return this._stdevs; 
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sterrp
//
// returns the standard error of a population, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard error of the population, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get sterrp()
	{
		this._calc_statistics();
		return this._sterrp;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get sterrs
//
// returns the standard error of a sample, or NaN if there is no
// data in the set
// inputs: none
// output: (number) the standard error of the sample, or NaN if 
//					there is no data in the set
//
/////////////////////////////////////////////////////////////////////////
	get sterrs()
	{
		this._calc_statistics();
		return this._sterrs;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get count
//
// returns the number of values in the set
// inputs: none
// output: (number) the number of values in the set
//
/////////////////////////////////////////////////////////////////////////
	get count()
	{
		return this._x.count;
	}
}


class SphereAngularAverager
{
	constructor()
	{
		this._x = new Averager();
		this._y = new Averager();
		this._z = new Averager();
		
		this._theta = new Object();
		this._theta._avg = NaN;
		this._theta._stdevp = NaN;
		this._theta._stdevs = NaN;
		this._theta._sterrp = NaN;
		this._theta._sterrs = NaN;

		this._psi = new Object();
		this._psi._avg = NaN;
		this._psi._stdevp = NaN;
		this._psi._stdevs = NaN;
		this._psi._sterrp = NaN;
		this._psi._sterrs = NaN;
		
		this._statistics_count_last = 0;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get copyFrom
//
// copies the data from a similar SphereAngularAverager-like object
// inputs: data (object) - an object that contains data similar
//							to an SphereAngularAverager
// output: none
//
/////////////////////////////////////////////////////////////////////////
	copyFrom(data)
	{
		if (typeof data == 'object' && data !== null)
		{
			if (typeof data._x !== 'undefined')
				this._x.copyFrom(data._x);
			if (typeof data._y !== 'undefined')
				this._y.copyFrom(data._y);
			if (typeof data._y !== 'undefined')
				this._z.copyFrom(data._z);
			if (typeof data._theta !== 'undefined')
				this._theta = data._theta;
			if (typeof data._psi !== 'undefined')
				this._psi = data._psi;
			if (typeof data._statistics_count_last !== 'undefined')
				this._statistics_count_last = data._statistics_count_last;
		}
	}

/////////////////////////////////////////////////////////////////////////
//
//  function _calc_statistics
//
// calculate the current average, standard deviations, and standard
// errors; intended for internal use, but may be called externally to 
// ensure the calculations have been performed.
// inputs: none
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	_calc_statistics()
	{
		if (this._x.count > 0 && this._x.count > this._statistics_count_last)
		{
			this._psi._avg = degrees(Math.asin(this._z.average));
			const isqrt1mx = 1.0 / Math.sqrt(1.0 - this._z.average * this._z.average);
			
			this._psi._stdevp = degrees(isqrt1mx * this._z.stdevp);
			this._psi._stdevs = degrees(isqrt1mx * this._z.stdevs);
			this._psi._sterrp = degrees(isqrt1mx * this._z.sterrp);
			this._psi._sterrs = degrees(isqrt1mx * this._z.sterrs);


			
			this._theta._avg = degrees(Math.atan2(this._y.average, this._x.average));
			//const yx = this._y.average / this._x.average;
			const ixy = Math.abs(1.0  / (this._x.average + this._y.average));
			this._theta._stdevp = degrees(Math.sqrt((this._y.average * this._x.stdevp) ** 2 + (this._x.average * this._y.stdevp) ** 2) * ixy);
			this._theta._stdevs = degrees(Math.sqrt((this._y.average * this._x.stdevs) ** 2 + (this._x.average * this._y.stdevs) ** 2) * ixy);
			this._theta._sterrp = degrees(Math.sqrt((this._y.average * this._x.sterrp) ** 2 + (this._x.average * this._y.sterrp) ** 2) * ixy);
			this._theta._sterrs = degrees(Math.sqrt((this._y.average * this._x.sterrs) ** 2 + (this._x.average * this._y.sterrs) ** 2) * ixy);

			this._statistics_count_last = this._x.count;
		}
	}
	
	
/////////////////////////////////////////////////////////////////////////
//
//  function add
//
// add a angle to the set for the average
// inputs: theta(number) - the angle relative to x in the x-y plane to 
//							add to the set
//         psi(number) - the angle relative to x in the x-z plane to add 
//							to the set
// output: none; values are stored internally
//
/////////////////////////////////////////////////////////////////////////
	add(theta,psi)
	{
		if (ValidateValue(theta) && ValidateValue(psi))
		{
			const theta_rad = radians(theta);
			const psi_rad = radians(psi);
			const cos_psi = Math.cos(psi_rad);
			const x = Math.cos(theta_rad) * cos_psi;
			const y = Math.sin(theta_rad) * cos_psi;
			const z = Math.sin(psi_rad);
			
			this._x.add(x);
			this._y.add(y);
			this._z.add(z);
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  get theta
//
// returns an AngularAverager-like object containing the average,
// stadnard deviations and standard errors of the angle relative to x
// in the x-y plane
// inputs: none
// output: (object) - an AngularAverager-like object containing the average,
// stadnard deviations and standard errors of the angle relative to x
// in the x-y plane
//
/////////////////////////////////////////////////////////////////////////
	get theta()
	{
		this._calc_statistics();
		return {average: this._theta._avg, stdevp: this._theta._stdevp, stdevs: this._theta._stdevs, sterrp: this._theta._sterrp, sterrs: this._theta._sterrs, count: this._x.count};
	}
/////////////////////////////////////////////////////////////////////////
//
//  get psi
//
// returns an AngularAverager-like object containing the average,
// stadnard deviations and standard errors of the angle relative to x
// in the x-z plane
// inputs: none
// output: (object) - an AngularAverager-like object containing the average,
// stadnard deviations and standard errors of the angle relative to x
// in the x-z plane
//
/////////////////////////////////////////////////////////////////////////
	get psi()
	{
		this._calc_statistics();
		return {average: this._psi._avg, stdevp: this._psi._stdevp, stdevs: this._psi._stdevs, sterrp: this._psi._sterrp, sterrs: this._psi._sterrs, count: this._x.count};
	}
/////////////////////////////////////////////////////////////////////////
//
//  get count
//
// returns the number of values in the set
// inputs: none
// output: (number) the number of values in the set
//
/////////////////////////////////////////////////////////////////////////
	get count()
	{
		return this._x.count;
	}

}

/////////////////////////////////////////////////////////////////////////
//
//  SIprefix
//
// reduces a value to the nearest value with an SI prefix
// note: excludes centi-, hecto-, deci-, and deca-
// inputs: value
// output: (Object):
//				value: (number) the number of values in the set
//				prefix: (string) the SI prefix
//
/////////////////////////////////////////////////////////////////////////

const _SIprefixes = ["y","z","a","f","p","n","µ", "m", "-", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function SIprefix(value)
{
	const logV = Math.log10(value);
	const l3 = Math.floor(Math.floor(logV) / 3);
	const idx = Math.max(Math.min(l3 + 8,16),0);
	return {value: value * Math.pow(10.0,-l3 * 3), prefix: _SIprefixes[idx]};
}

