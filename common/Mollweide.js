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
