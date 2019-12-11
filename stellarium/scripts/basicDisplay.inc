//
// Author: Brian W. Mulligan
// Version: 1.0
// License: GPL v3.0
// Description: displays a title, the observer location, and the date and time on the screen
// usage: var foo = Object.create(basicDisplay);
//        foo.display(); // display the info
//        foo.hide(); // hide the display
//        foo.display(); // re-display the info
//        foo.display(); // re-display the info (useful for changing time / location)
//        foo.color("#ff0000"); // change the color to e.g. red
//        foo.display(); // re-display the info
//
include("DegMinSec.inc");
function intDiv(a, b)
{
	var ret = Math.floor(a / b);
	if (ret < 0)
		ret = ret + 1;
	return ret;
}

function mod(a, b)
{
	var temp = a / b;
	var ret = (temp - Math.floor(temp)) * b;
	return ret;
}

var basicDisplay = {
	labelTitle : undefined,
	labelDateTime : undefined,
	labelPosition : undefined,
	textTitle : undefined,
	colorTitle: "#ffff00",
	colorPosition: "#ffff00",
	colorDateTime: "#ffff00",
	locTitleX: 20,
	locTitleY: 20,
	sizeTitle: 30,
	sizePosition: 30,
	sizeDateTime: 30,
	timezone: -6.0, // relative to UTC
	display : function() {
		var currTime = core.getJDay();
		currTime = currTime + 0.5; // correct to midnight based day start
 // adjust time to user specified time zone
		currTime = currTime + this.timezone / 24.0;
		var isLeapYear = false;
		var year;
		var month = 1;
		var day = 1;
		var hour;
		var minute;
		var second;
		if (currTime >= 2299161.0) // start of gregorian calendar
		{
			// 1461 days per average 4 years
			// 36524 days per average century, 36525 days in first cnetury of 4
			// 146097 days per 4 centuries
			var gregorianTime = currTime - 2159351.0; // Dec 25, 1199 (Julian), would be Jan 1, 1200 (Proleptic Gregorian)


			var quadCentury = Math.floor(gregorianTime / 146097.0);
//			core.debug("QC: " + quadCentury);
			var dayInQuadCentury = gregorianTime - quadCentury * 146097.0;
//			core.debug("dQC: " + dayInQuadCentury);
			var centuryInQuadCentury = 0;

			if (dayInQuadCentury >= 36525.0)
			{
				centuryInQuadCentury = Math.floor((dayInQuadCentury - 36525.0) / 36524.0) + 1.0; 
// +1 since we subtract off first 36525 days
				dayInCentury = dayInQuadCentury - centuryInQuadCentury * 36524.0 - 1.0; // extra 1 for the leap year in year 0
			}
			else
			{
				dayInCentury = dayInQuadCentury;
			}
//			core.debug("cQC: " + centuryInQuadCentury);
//			core.debug("dC: " + dayInCentury);

			var daysInFirstQuad = 1461.0;
			if (centuryInQuadCentury > 0)
				daysInFirstQuad = 1460.0;

			var quadYearInCentury = 0;
			if (dayInCentury > daysInFirstQuad)
				quadYearInCentury = Math.floor((dayInCentury - daysInFirstQuad) / 1461.0) + 1.0; 
			var dayInQuadYear = dayInQuadYear = dayInCentury - quadYearInCentury * 1461.0;
			if (centuryInQuadCentury > 0 && quadYearInCentury > 0)
				dayInQuadYear = dayInQuadYear + 1;

//			core.debug("qyC: " + quadYearInCentury);
//			core.debug("dQY: " + dayInQuadYear);

			var daysInFirstYear = 365.0;
			if (centuryInQuadCentury == 0)
				daysInFirstYear = 366.0;

			var yearInQuadYear = 0;
			if (dayInQuadYear > daysInFirstYear)
				yearInQuadYear = Math.floor((dayInQuadYear - daysInFirstYear) / 365.0) + 1.0; 
			var dayInYear = dayInQuadYear - yearInQuadYear * 365.0 - 1.0;
			if (yearInQuadYear == 0 || (quadYearInCentury == 0 && centuryInQuadCentury > 0))
				dayInYear = dayInYear + 1;

//			core.debug("yQY: " + yearInQuadYear);
//			core.debug("dY: " + dayInYear);

			isLeapYear = (yearInQuadYear == 0 && (centuryInQuadCentury == 0 || quadYearInCentury != 0));

			year = quadCentury * 400 + centuryInQuadCentury * 100 +  quadYearInCentury * 4 + yearInQuadYear + 1200.0; // 1200 is since we started on Jan 1, 1200 (Proleptic Gregorian)


		}
		else
		{
			var quadYear = Math.floor(currTime / 1461.0);
			var dayInQuadYear = currTime - quadYear * 1461.0;
			var yearInQuadYear = 0;
			if (dayInQuadYear > 366.0)
			{
				yearInQuadYear = Math.floor((dayInQuadYear - 366.0) / 365.0) + 1.0;
				dayInYear = dayInQuadYear - yearInQuadYear * 365.0 - 1.0; // extra 1 for the leap year in year 0
			}
			else
			{
				isLeapYear = true;
				dayInYear = dayInQuadYear;
			}
			year = quadYear * 4.0 + yearInQuadYear - 4713.0;
			if (year >= 0)
				year = year + 1.0;
		}
		if (isLeapYear && dayInYear >= 366.0)
		{
			year = year + 1;
			dayInYear = dayInYear - 366.0;
		}
		if (!isLeapYear && dayInYear >= 365.0)
		{
			year = year + 1;
			dayInYear = dayInYear - 365.0;
		}
		var dayInMonth = dayInYear + 1; // since dayInYear has 0 on Jan 1, add 1 to it
		if (dayInMonth >= 32.0)
		{
			month = month + 1;
			dayInMonth = dayInMonth - 31.0;
			if ((isLeapYear && dayInMonth >= 30.0) || (!isLeapYear && dayInMonth >= 29.0))
			{
				month = month + 1;
				if (isLeapYear)
					dayInMonth = dayInMonth - 29.0;
				else
					dayInMonth = dayInMonth - 28.0;
				if (dayInMonth >= 32.0)
				{
					month = month + 1;
					dayInMonth = dayInMonth - 31.0;
					if (dayInMonth >= 31.0)
					{
						month = month + 1;
						dayInMonth = dayInMonth - 30.0;
						if (dayInMonth >= 32.0)
						{
							month = month + 1;
							dayInMonth = dayInMonth - 31.0;
							if (dayInMonth >= 31.0)
							{
								month = month + 1;
								dayInMonth = dayInMonth - 30.0;
								if (dayInMonth >= 32.0)
								{
									month = month + 1;
									dayInMonth = dayInMonth - 31.0;
									if (dayInMonth >= 32.0)
									{
										month = month + 1;
										dayInMonth = dayInMonth - 31.0;
										if (dayInMonth >= 31.0)
										{
											month = month + 1;
											dayInMonth = dayInMonth - 30.0;
											if (dayInMonth >= 32.0)
											{
												month = month + 1;
												dayInMonth = dayInMonth - 31.0;
												if (dayInMonth >= 31.0)
												{
													month = month + 1;
													dayInMonth = dayInMonth - 30.0;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		dayOfMonth = Math.floor(dayInMonth);
		timeOfDay = (dayInMonth - dayOfMonth) * 24.0;
		timeHourNum = Math.floor(timeOfDay);
		minuteInHour = Math.floor((timeOfDay - timeHourNum) * 60.0);
		
		secondinMinute = Math.floor((timeOfDay - timeHourNum) * 3600.0 - minuteInHour * 60.0);

		
		var timeHourVerbose = "";
		if (timeHourNum < 10)
			timeHourVerbose = "0" + timeHourNum;
		else
			timeHourVerbose = timeHourNum;
		var timeMinVerbose = "";
		if (minuteInHour < 10)
			timeMinVerbose = "0" + minuteInHour;
		else
			timeMinVerbose = minuteInHour;
		var timeSecVerbose = "";
		if (secondinMinute < 10)
			timeSecVerbose = "0" + secondinMinute;
		else
			timeSecVerbose = secondinMinute;


		switch(month)
		{
		case 1:
			monthVerbose = "Jan";
			break;
		case 2:
			monthVerbose = "Feb";
			break;
		case 3:
			monthVerbose = "Mar";
			break;
		case 4:
			monthVerbose = "Apr";
			break;
		case 5:
			monthVerbose = "May";
			break;
		case 6:
			monthVerbose = "Jun";
			break;
		case 7:
			monthVerbose = "Jul";
			break;
		case 8:
			monthVerbose = "Aug";
			break;
		case 9:
			monthVerbose = "Sep";
			break;
		case 10:
			monthVerbose = "Oct";
			break;
		case 11:
			monthVerbose = "Nov";
			break;
		case 12:
			monthVerbose = "Dec";
			break;
		}

		var absYear = Math.abs(year);
		var epoch = "CE";
		if (year < 0)
			epoch = "BCE";

		var dayOfMonthVerbose = dayOfMonth;
		if (dayOfMonth < 10)
			dayOfMonthVerbose = "0" + dayOfMonth;
		timeVerbose = dayOfMonthVerbose + " " + monthVerbose + " " + absYear + " " + epoch + " " + timeHourVerbose + ":" + timeMinVerbose + ":" + timeSecVerbose;



//		var DateTime = core.getDate("local");
//		var timeYear = DateTime[0] + DateTime[1] + DateTime[2] + DateTime[3];
//		var timeMonth = DateTime[5] + DateTime[6];
//		var timeDay = DateTime[8] + DateTime[9];
//		var timeHour = DateTime[11] + DateTime[12];
//		var timeMin = DateTime[14] + DateTime[15];
//		var timeSec = DateTime[17] + DateTime[18];
//		var timeVerbose = timeDay + " ";

//		switch(timeMonth)
//		{
//		case "01":
//			timeVerbose = timeVerbose + "Jan";
//			break;
//		case "02":
//			timeVerbose = timeVerbose + "Feb";
//			break;
//		case "03":
//			timeVerbose = timeVerbose + "Mar";
//			break;
//		case "04":
//			timeVerbose = timeVerbose + "Apr";
//			break;
//		case "05":
//			timeVerbose = timeVerbose + "May";
//			break;
//		case "06":
//			timeVerbose = timeVerbose + "Jun";
//			break;
//		case "07":
//			timeVerbose = timeVerbose + "Jul";
//			break;
//		case "08":
//			timeVerbose = timeVerbose + "Aug";
//			break;
//		case "09":
//			timeVerbose = timeVerbose + "Sep";
//			break;
//		case "10":
//			timeVerbose = timeVerbose + "Oct";
//			break;
//		case "11":
//			timeVerbose = timeVerbose + "Nov";
//			break;
//		case "12":
//			timeVerbose = timeVerbose + "Dec";
//			break;
//		}
//		timeVerbose = timeVerbose + " " + timeYear;

//		timeVerbose = timeVerbose + " " + timeHour + ":" + timeMin + ":" + timeSec;

		var posInfo = core.getObserverLocationInfo();
		var dmsLatitude = Object.create(DegMinSec);
		var dmsLongitude = Object.create(DegMinSec);

		dmsLatitude.convert(posInfo["latitude"]);
		var posLatVerbose = dmsLatitude.verbose("latitude");

		dmsLongitude.convert(posInfo["longitude"]);
		var posLongVerbose = dmsLongitude.verbose("longitude");

		var posVerbose = posLatVerbose + " " + posLongVerbose;
		if (this.textTitle != undefined)
		{
			if (this.labelTitle == undefined)
			{
				this.labelTitle = LabelMgr.labelScreen(tr(this.textTitle), this.locTitleX, this.locTitleY, true, this.sizeTitle, this.colorTitle);
			}
			else
			{
				LabelMgr.setLabelText(this.labelTitle,tr(this.textTitle));
				LabelMgr.setLabelShow(this.labelTitle,true);
			}
		}

		if (this.labelPosition == undefined)
		{
			this.labelPosition = LabelMgr.labelScreen(posVerbose, this.locTitleX, this.locTitleY + this.sizeTitle, true, this.sizePosition, this.colorPosition);
			this.labelDateTime = LabelMgr.labelScreen(timeVerbose, this.locTitleX, this.locTitleY + this.sizeTitle + this.sizePosition, true, this.sizeDateTime, this.colorDateTime);
		}
		else
		{
			LabelMgr.setLabelText(this.labelPosition,posVerbose);
			LabelMgr.setLabelShow(this.labelPosition,true);
		}

		if (this.labelDateTime == undefined)
		{
			this.labelDateTime = LabelMgr.labelScreen(timeVerbose, this.locTitleX, this.locTitleY + this.sizeTitle + this.sizePosition, true, this.sizeDateTime, this.colorDateTime);
		}
		else
		{
			LabelMgr.setLabelText(this.labelDateTime,timeVerbose);
			LabelMgr.setLabelShow(this.labelDateTime,true);
		}
	},
	hideTitle : function() 
	{
		if (this.labelTitle != undefined)
			LabelMgr.setLabelShow(this.labelTitle,false);
	},
	hidePosition : function() 
	{
		if (this.labelPosition != undefined)
			LabelMgr.setLabelShow(this.labelPosition,false);
	},
	hideDateTime : function() 
	{
		if (this.labelDateTime != undefined)
			LabelMgr.setLabelShow(this.labelDateTime,false);
	},
	showTitle : function() 
	{
		if (this.labelTitle != undefined)
			LabelMgr.setLabelShow(this.labelTitle,true);
	},
	showPosition : function() 
	{
		if (this.labelPosition != undefined)
			LabelMgr.setLabelShow(this.labelPosition,true);
	},
	showDateTime : function() 
	{
		if (this.labelDateTime != undefined)
			LabelMgr.setLabelShow(this.labelDateTime,true);
	},
	hide : function() {
		this.hideTitle();
		this.hidePosition();
		this.hideDateTime();
	},
	setColors : function(color) {
		this.colorTitle = color;
		this.colorPosition = color;
		this.colorDateTime = color;
	}

};
