
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


// random Gaussian disribution
//Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
// modified to allow a mean and standard deviation
function random_gaussian(mean, stdev) { 
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * stdev / Math.PI * 0.5 + mean;
}

// Function to download data to a file
// Source: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file/30832210#30832210
// Author(s): Kanchu (https://stackoverflow.com/users/1458751/kanchu), Awesomeness01 (https://stackoverflow.com/users/4181717/awesomeness01), trueimage(https://stackoverflow.com/users/2430498/trueimage)
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
	var uncertainty_res = 0;
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
	else
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


