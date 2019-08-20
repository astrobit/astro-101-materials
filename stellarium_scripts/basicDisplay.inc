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
	display : function() {
		var DateTime = core.getDate("local");
		var timeYear = DateTime[0] + DateTime[1] + DateTime[2] + DateTime[3];
		var timeMonth = DateTime[5] + DateTime[6];
		var timeDay = DateTime[8] + DateTime[9];
		var timeHour = DateTime[11] + DateTime[12];
		var timeMin = DateTime[14] + DateTime[15];
		var timeSec = DateTime[17] + DateTime[18];
		var timeVerbose = timeDay + " ";

		switch(timeMonth)
		{
		case "01":
			timeVerbose = timeVerbose + "Jan";
			break;
		case "02":
			timeVerbose = timeVerbose + "Feb";
			break;
		case "03":
			timeVerbose = timeVerbose + "Mar";
			break;
		case "04":
			timeVerbose = timeVerbose + "Apr";
			break;
		case "05":
			timeVerbose = timeVerbose + "May";
			break;
		case "06":
			timeVerbose = timeVerbose + "Jun";
			break;
		case "07":
			timeVerbose = timeVerbose + "Jul";
			break;
		case "08":
			timeVerbose = timeVerbose + "Aug";
			break;
		case "09":
			timeVerbose = timeVerbose + "Sep";
			break;
		case "10":
			timeVerbose = timeVerbose + "Oct";
			break;
		case "11":
			timeVerbose = timeVerbose + "Nov";
			break;
		case "12":
			timeVerbose = timeVerbose + "Dec";
			break;
		}
		timeVerbose = timeVerbose + " " + timeYear;

		timeVerbose = timeVerbose + " " + timeHour + ":" + timeMin + ":" + timeSec;

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
