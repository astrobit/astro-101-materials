// JavaScript source code

class Equirectangular 
{
	calculate(latitude,longitude)
	{ // ignore central latitude for now. Use of central latitude requires additional projection and gets complicated
		var cenLatRad =  this.centralLatitude * Math.PI / 180.0;
		var delLong = (longitude - this.centralLongitude) / 180.0;
		if (delLong > 1.0)
			delLong = 1.0 - delLong;
		else if (delLong < -1.0)
			delLong = -1.0 + delLong;

		return {x: delLong, y: (latitude - this.centralLatitude) / 90.0 * Math.cos(cenLatRad)};
	}
	constructor(centralLongitude,centralLatitude)
	{
		if (centralLongitude != null)
			this.centralLongitude = centralLongitude;
		else
			this.centralLongitude = 0.0;
		if (centralLatitude != null)
			this.centralLatitude = centralLatitude;
		else
			this.centralLatitude = 0.0;
	}
}