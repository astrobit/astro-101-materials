// JavaScript source code

class Mercator 
{
	calculate(latitude,longitude)
	{ // ignore central latitude for now. Use of central latitude requires additional projection and gets complicated
		const latRad =  latitude * Math.PI / 180.0;
		let delLong = (longitude - this.centralLongitude) / 180.0;
		if (delLong > 1.0)
			delLong = 1.0 - delLong;
		else if (delLong < -1.0)
			delLong = -1.0 + delLong;

		return {x: delLong, y: Math.log(Math.tan(Math.PI * 0.25 + latRad * 0.5)) / this.latScalar};
	}
	calculateReverse(x,y)
	{
		const lat = (Math.atan(Math.exp(y * this.latScalar)) * 2.0 + Math.PI * 0.5) * 180.0 / Math.PI;
		let long = x * 180.0 + this.centralLongitude;
		long += 360.0;
		long %= 360.0;
		if (long > 180.0)
			long -= 180.0;
//		long -= 180.0;
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
		this.latitudeMax = 80.0;
		this.latScalar = Math.log(Math.tan(Math.PI * 0.25 + this.latitudeMax * Math.PI / 180.0 * 0.5))
	}
}
