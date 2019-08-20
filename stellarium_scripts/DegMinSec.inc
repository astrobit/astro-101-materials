//
// Author: Brian W. Mulligan
// Version: 1.0
// License: GPL v3.0
// Description: converts decimal degrees to degrees /minutes / seconds and back; can return a verbose string with the position, prepended with direction
// usage: var foo = Object.create(DegMinSec);
//        foo.convert(12.345);
//        var fooStringLatitude = foo.verbose("latitude");
//        var fooDecimal = foo.dedcimal();
//

include("addLeadingZero.inc");

///
/// DegMinSec
/// an object that converts decimal degrees to degrees, minutes, seconds, and a sign value
/// provides the following data / methods:
/// degSign : sign of the angle
/// degrees : the integer value of the degrees
/// minutes : the integer value of the minutes
/// seconds : the decimal value of the seconds
/// convert(decimalDegrees) : fill the degSign, degrees, minutes, and seconds fields based on the specified decimalDegrees.
///		returns: none
/// decimal : get the decimal value of the angle stored in degrees, minutes, seconds
/// verbose(type) : get a string containing the angle, with form `XDD° MM' SS"', where X is either N/S (if type == latitude or declination), E/W (if type == longitude), or +/- (all other types)
///		returns: string value

var DegMinSec = {
	degSign : undefined,
	degrees : undefined,
	minutes : undefined, 
	seconds : undefined,

	convert : function (decimaldegrees)
	{
		if (decimaldegrees < 0)
			this.degSign = -1;
		else
			this.degSign = 1;
		var degAbs = Math.abs(decimaldegrees);
		this.degrees = Math.floor(degAbs);
		this.minutes = Math.floor((degAbs - this.degrees) * 60.0);
		this.seconds = (degAbs - this.degrees - this.minutes / 60.0) * 3600.0;
	},
	decimal : function()
	{
		var ret;
		if (this.degSign != undefined && this.degrees != undefined && this.minutes != undefined && this.seconds != undefined)
		{
			ret = this.degSign * (this.degrees + (this.minutes + this.seconds / 60.0) / 60.0);
		}
		return ret;
	},
	verbose : function(type)
	{
		var ret;
		if (this.degSign != undefined && this.degrees != undefined && this.minutes != undefined && this.seconds != undefined)
		{
			switch (type)
			{
			case "latitude":
			case "declination":
				if (this.degSign < 0)
					ret = "S";
				else
					ret = "N";
				break;
			case "longitude":
				if (this.degSign < 0)
					ret = "W";
				else
					ret = "E";
				break;
			default:
				if (this.degSign < 0)
					ret = "-";
				else
					ret = "+";
				break;
			}

			ret = ret + addLeadingZero(this.degrees) + "°" +  addLeadingZero(this.minutes) + "'" + addLeadingZero(Math.floor(this.seconds)) + "\"";
		}
		return ret;
	}
};
