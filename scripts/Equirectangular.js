// JavaScript source code

class Equirectangular 
{
	calculate(latitude,longitude)
	{ // ignore central latitude for now. Use of central latitude requires additional projection and gets complicated
		const cenLatRad =  this.centralLatitude * Math.PI / 180.0;
		let delLong = (longitude - this.centralLongitude) / 180.0;
		if (delLong > 1.0)
			delLong = 1.0 - delLong;
		else if (delLong < -1.0)
			delLong = -1.0 + delLong;

		return {x: delLong, y: (latitude - this.centralLatitude) / 90.0 * Math.cos(cenLatRad)};
	}
	calculateReverse(x,y)
	{
		const lat = y * 90.0 / Math.cos(cenLatRad) + this.centralLatitude;
		let long = x * 180.0 + this.centralLongitude;
		long += 360.0;
		long %= 360.0;
		if (long > 180.0)
			long -= 180.0;
		return {lat: lat, long: long};
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
