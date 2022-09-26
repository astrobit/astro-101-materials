//
// Author: Brian W. Mulligan
// Version: 1.0
// License: GPL v3.0
// Description: Add a leading zero to an integer value. e.g.: 1 returns "01"; 12 return "12", -3 returns "-03"; -12 returns "-12"
// usage: var strValue = addLeadingZero(value);
// returns: string value with leading zero if value is an integer; string value of value if value is ot an integer; undefined if value is undefined
//

function addLeadingZero(value)
{
	var ret;
	if (value != undefined)
	{
		var varLcl = Number(value);
		if (!isNaN(varLcl))
		{
			var absVal = Math.abs(value);
			if (absVal < 10)
				ret = "0" + absVal;
			else
				ret = absVal;
			// if the value is negtive, add leading "-"
			if (value < 0)
			{
				ret = "-" + ret;
			}
		}
		else// value is not an integer; return the value as a string
			ret = value.toString();
	}
	// else return undefined
	return ret;
}

