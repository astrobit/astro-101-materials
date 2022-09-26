//
// Author: Brian W. Mulligan
// Version: 1.0
// License: GPL v3.0
// Description: converts decimal hours to hours /minutes / seconds and back; can return a verbose string with the position, prepended with direction
// usage: var foo = Object.create(HrMinSec);
//        foo.convert(12.345);
//        var fooStringLatitude = foo.verbose("latitude");
//        var fooDecimal = foo.decimal();
//

include("addLeadingZero.inc");

///
/// HrMinSec
/// an object that converts decimal hours to hours, minutes, seconds, and a sign value
/// provides the following data / methods:
/// hrSign : sign of the angle
/// hours : the integer value of the hours
/// minutes : the integer value of the minutes
/// seconds : the decimal value of the seconds
/// convert(decimalhours) : fill the hrSign, hours, minutes, and seconds fields based on the specified decimalhours.
///		returns: none
/// decimal : get the decimal value of the angle stored in hours, minutes, seconds
/// verbose(showPlusSign) : get a string containing the hour, with form `XDD:MM:SS', where X is either '-', '+', or empty; '+' will only occur is showPlusSign = true
///		returns: string value

var HrMinSec = {
	hrSign : undefined,
	hours : undefined,
	minutes : undefined, 
	seconds : undefined,

	convert : function (decimalHours)
	{
		if (decimalHours < 0)
			this.hrSign = -1;
		else
			this.hrSign = 1;
		var hrAbs = Math.abs(decimalHours);
		this.hours = Math.floor(hrAbs);
		this.minutes = Math.floor((hrAbs - this.hours) * 60.0);
		this.seconds = (hrAbs - this.hours - this.minutes / 60.0) * 3600.0;
	},
	decimal : function()
	{
		var ret;
		if (this.hrSign != undefined && this.hours != undefined && this.minutes != undefined && this.seconds != undefined)
		{
			ret = this.hrSign * (this.hours + (this.minutes + this.seconds / 60.0) / 60.0);
		}
		return ret;
	},
	verbose : function(showPlusSign)
	{
		var ret;
		if (this.hrSign != undefined && this.hours != undefined && this.minutes != undefined && this.seconds != undefined)
		{
			ret = addLeadingZero(this.hours) + ":" +  addLeadingZero(this.minutes) + ":" + addLeadingZero(Math.floor(this.seconds));
			if (this.hrSign < 0)
				ret = "-" + ret;
			else if (showPlusSign)
				ret = "+" + ret;
		}
		return ret;
	}
};
