// JavaScript source code

class Mollweide 
{
	calculate(latitude,longitude)
	{ // ignore central latitude for now. Use of central latitude requires additional projection and gets complicated
		var latRad =  latitude * Math.PI / 180.0;
		// solve for the theta parameter using Newton Raphson
		var piSinLat = Math.PI * Math.sin(latRad);
		var theta = latRad;
		if (latRad != Math.PI * 0.5 && latRad != Math.PI * -0.5)
		{
			var delTheta = 0;
			do
			{
				theta -= delTheta;
				delTheta = (2.0 * theta + Math.sin(2.0 * theta) - piSinLat) / (2.0 * (1.0 + Math.cos(2.0 * theta)));
			}
			while (Math.abs(delTheta) > 0.000001);
			theta -= delTheta;
		}
		var delLong = (longitude - this.centralLongitude) / 180.0;
		delLong = delLong % 2.0
		if (delLong > 1.0)
			delLong -= 2.0
		if (delLong < -1.0)
			delLong += 2.0

		return {x: delLong * Math.cos(theta), y: Math.sin(theta)};
	}
	calculateReverse(x,y)
	{
		var R = x ** 2 + y ** 2;
		var theta;
		var lat;
		var long;
		if (R > 1.0 || R < -1.0) // outside the circle/ellipse
		{
			if (x > 0)
				long = 180.0 + this.centralLongitude;
			else
				long = -180.0 + this.centralLongitude;
			var yedge = Math.sqrt(1.0 - x ** 2);
			if (y < 0)
				yedge *= -1;
			lat = Math.asin(yedge) * 180.0 / Math.PI;
		}
		else		 
		{
			theta = Math.asin(y);
			var delLong = x / Math.cos(theta);
			var latSin = (2.0 * theta + Math.sin(2.0 * theta)) / Math.PI;
			if (latSin >= -1.0 && latSin <= 1.0)
				lat = (Math.asin((2.0 * theta + Math.sin(2.0 * theta)) / Math.PI)) * 180.0 / Math.PI;
			else if (latSin < 0.0)
				lat = -90.0;
			else
				lat = 90.0;
			long = delLong * 180.0 + this.centralLongitude;
		}
		long += 360.0;
		long %= 360.0;
		if (long > 180.0)
			long -= 360.0;
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
