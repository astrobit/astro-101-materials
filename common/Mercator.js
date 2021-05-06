// JavaScript source code

class Mercator 
{
	calculate(latitude,longitude)
	{ // ignore central latitude for now. Use of central latitude requires additional projection and gets complicated
		var latRad =  latitude * Math.PI / 180.0;
		var delLong = (longitude - this.centralLongitude) / 180.0;
		if (delLong > 1.0)
			delLong = 1.0 - delLong;
		else if (delLong < -1.0)
			delLong = -1.0 + delLong;

		return {x: delLong, y: Math.log(Math.tan(Math.PI * 0.25 + latRad * 0.5)) / this.latScalar};
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
		this.latitudeMax = 80.0;
		this.latScalar = Math.log(Math.tan(Math.PI * 0.25 + this.latitudeMax * Math.PI / 180.0 * 0.5))
	}
}
