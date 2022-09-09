
class StarPositionActvity
{
	constructor()
	{
		this._title = "Measure Position of a Star";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = false;
		
		this._RA_Center = 132.92;
		this._Dec_Center = 37.060;
		this._scatter = 2.0 / 3600.0; // 2"
		
		this._min_x = (this._RA_Center - 5.0 * this._scatter) / 15.0;
		this._max_x = (this._RA_Center + 5.0 * this._scatter) / 15.0;
		this._min_y = this._Dec_Center - 5.0 * this._scatter;
		this._max_y = this._Dec_Center + 5.0 * this._scatter;

		this._axisHorizontal = new GraphAxis("xaxis","Right Ascension",this._min_x,this._max_x);
		this._axisHorizontal._labelFormatter._isTime = true;
		this._axisHorizontal._labelFormatter._showUnitsTime = true;
		this._axisHorizontal._labelFormatter._timeUnitsColons = false;
		this._axisHorizontal._labelFormatter._timeFormat = "H 0M 0S.ss";
		
		this._axisVertical = new GraphAxis("yaxis","Declination",this._min_y,this._max_y);
		this._axisVertical._labelFormatter._isAngle = true;
		this._axisVertical._labelFormatter._showUnitsAngle = true;
		this._axisVertical._labelFormatter._angleFormat = "D 0M 0S.ss";

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("positions","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		
		this._averageRA = null;
		this._averageDec = null;
		this._stdDevRA = null;
		this._stdDevDec = null;
		this._stdErrRA = null;
		this._stdErrDec = null;
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var curr = new GraphDatum(random_gaussian(this._RA_Center,this._scatter)/15.0,random_gaussian(this._Dec_Center,this._scatter));
			this._measurements.add(curr);
		}
		this.average();
	}
	average()
	{
		if (this._measurements.length > 0)
		{
			var raSum = 0;
			var decSum = 0;
			var ra2Sum = 0;
			var dec2Sum = 0;
			var i;
			for (i = 0; i < this._measurements.length; i++)
			{
				var curr = this._measurements.at(i);
				raSum += curr.x;
				ra2Sum += (curr.x * curr.x);
				decSum += curr.y;
				dec2Sum += (curr.y * curr.y);
			}
			var invCount = 1.0 / this._measurements.length;
			this._averageRA = raSum * invCount;
			this._averageDec = decSum * invCount;
			var averageVarRA = ra2Sum * invCount;
			var averageVarDec = dec2Sum * invCount;
			
			if (this._measurements.length > 1)
			{
				var varRA2Sum = 0;
				var varDec2Sum = 0;
				for (i = 0; i < this._measurements.length; i++)
				{
					var curr = this._measurements.at(i);
					
					var varRA = (curr.x - this._averageRA);
					var varDec = (curr.y - this._averageDec);
					varRA2Sum += varRA * varRA;
					varDec2Sum += varDec * varDec;
				}

				var invCountStdDev = Math.sqrt(1.0 / (this._measurements.length - 1));
				this._stdDevRA = Math.sqrt(varRA2Sum * invCountStdDev);
//				this._stdDevRA = Math.sqrt(averageVarRA - invCount * this._averageRA * this._averageRA);
//				this._stdDevRA = Math.sqrt(ra2Sum + this._averageRA * this._averageRA - 2.0 * raSum * this._averageRA ) * invCountStdDev;
				this._stdDevDec = Math.sqrt(varDec2Sum * invCountStdDev);
//				this._stdDevDec = Math.sqrt(averageVarDec - invCount * this._averageDec * this._averageDec);
//				this._stdDevDec = Math.sqrt(dec2Sum + this._averageDec * this._averageDec - 2.0 * decSum * this._averageDec ) * invCountStdDev;
				this._stdErrRA = this._stdDevRA * Math.sqrt(invCount);
				this._stdErrDec = this._stdDevDec * Math.sqrt(invCount);
			}
		}
	}		
	linearRegression()
	{
		var line = this._measurements.LinearLeastSquare()
		// nothing to do for this case
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,25);
		if (this._averageRA !== null && this._averageDec !== null)
		{
			var raDMS = degreestoDMS(this._averageRA);
			var decDMS = degreestoDMS(this._averageDec);
			context.translate(250,0);

			context.fillText("Averages",0,0);
			context.translate(0,25);
			context.save();
				context.translate(-125,0);
				context.fillText("Right Ascension",0,0);
				context.translate(0,25);
				context.fillText(raDMS.deg.toString() + "h" + raDMS.min.toString() + "m" + raDMS.sec.toString() + "s",0,0);
				context.translate(0,25);
				if (this._stdErrRA !== null)
				{
					var raErrDMS = degreestoDMS(this._stdErrRA);
					context.fillText("±" + raErrDMS.sec.toString() + "s",0,0);
					context.translate(0,25);
				}
			context.restore();
			
			context.save();
				context.translate(125,0);
				context.fillText("Declination",0,0);
				context.translate(0,25);
				context.fillText(decDMS.deg.toString() + "°" + decDMS.min.toString() + "'" + decDMS.sec.toString() + "\"",0,0);
				context.translate(0,25);
				if (this._stdErrDec !== null)
				{
					var decErrDMS = degreestoDMS(this._stdErrDec);
					context.fillText("±" + decErrDMS.sec.toString() + "\"",0,0);
					context.translate(0,25);
				}
			context.restore();
		}
		context.restore();
	}

}


var randomizedAsteroidList = new Array();

var g_irand;

for (g_irand = 0; g_irand < minorPlanetsTrojans.length; g_irand++)
{
	randomizedAsteroidList.push(minorPlanetsTrojans[g_irand]);
}
randomizedAsteroidList = shuffle(randomizedAsteroidList);

class AsteroidNearJupiter
{
	constructor()
	{
		this._title = "Measure Position of an Asteroid Near Jupiter";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		var jd = 2459800.5;
		var jupiter = Planets.Jupiter.orbitalParameters.getOrbitalPosition(jd); 
		this._asteroidData = new Array();
		var max_y = 1;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			var curr = randomizedAsteroidList[i].orbitalParameters.getOrbitalPosition(jd);
			var relPosition = curr.helioLongitude - jupiter.helioLongitude;
			var fPi = Math.floor(relPosition / twoPi);
			relPosition -= fPi * twoPi;
			if (relPosition > Math.PI)
				relPosition -= twoPi;
			
			var data = new GraphDatum(relPosition * 180.0 / Math.PI,randomizedAsteroidList[i].orbitalParameters.semiMajorAxis);
			this._asteroidData.push(data);
			if (data.y < min_y)
				min_y = data.y;
			if (data.y > max_y)
				max_y = data.y;
		}
		this._min_x = -180.0;
		this._max_x = 180.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	

		this._axisHorizontal = new GraphAxis("xaxis","Position Relative to Jupiter",-180.0,180.0);
		this._axisHorizontal._labelFormatter._isAngle = true;
		this._axisHorizontal._labelFormatter._showUnitsAngle = true;
		this._axisHorizontal._labelFormatter._angleFormat = "D.dd";
		
		this._axisVertical = new GraphAxis("yaxis","Distance From the Sun (au)",min_y,max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("positions","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("positions","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graph.addTrend(this._graphTrend);
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
//		if (this._linearTrendComputed && this._graphTrend._type == "linear")
//			this.linearRegression(false);
//		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
//			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.restore();
	}

}


class AsteroidDiameterBrightnessActivity
{
	constructor()
	{
		this._title = "Measure Brightness and Diameter of Asteroids";
		this._loglogAllowed = true;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0.00001;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			var curr = randomizedAsteroidList[i]
			if (curr.H !== null && curr.diameter !== null)
			{
				var data = new GraphDatum(curr.H,curr.diameter);
				this._asteroidData.push(data);
				if (data.x < min_x)
					min_x = data.x;
				if (data.x > max_x)
					max_x = data.x;
				if (data.y < min_y)
					min_y = data.y;
				if (data.y > max_y)
					max_y = data.y;
			}			
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Absolute Magnitude",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Diameter (km)",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("positions","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("positions","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "D = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ") km) M";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "D = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") M + (" + b.value.toString() + "±" + b.uncertainty.toString() + ") km";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}

class AsteroidDiameterDistanceActivity
{
	constructor()
	{
		this._title = "Measure Distance and Diameter of Asteroids";
		this._loglogAllowed = true;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0.00001;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			var curr = randomizedAsteroidList[i]
			if (curr.a !== null && curr.diameter !== null)
			{
				var data = new GraphDatum(curr.a,curr.diameter);
				this._asteroidData.push(data);
				if (data.x < min_x)
					min_x = data.x;
				if (data.x > max_x)
					max_x = data.x;
				if (data.y < min_y)
					min_y = data.y;
				if (data.y > max_y)
					max_y = data.y;
			}			
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Distance (au)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Diameter (km)",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("data","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "D = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ")) a";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "D = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") km/au a + (" + b.value.toString() + "±" + b.uncertainty.toString() + ") km";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}

class AsteroidOrbitalParametersctivity
{
	constructor()
	{
		this._title = "Measure Orbital Parameters of Asteroids";
		this._loglogAllowed = true;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0.00001;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			var curr = randomizedAsteroidList[i]
			var x = curr.om;
			var y = curr.i;
			if (ValidateValue(x) && ValidateValue(y))
			{
				var data = new GraphDatum(x,y);
				this._asteroidData.push(data);
				if (data.x < min_x)
					min_x = data.x;
				if (data.x > max_x)
					max_x = data.x;
				if (data.y < min_y)
					min_y = data.y;
				if (data.y > max_y)
					max_y = data.y;
			}			
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
		if (this._min_x < 0.01)
			this._min_x = 0.01;
	
		this._axisHorizontal = new GraphAxis("xaxis","Longitude of Ascending Node (°)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Orbital Inclination (°)",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("data","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "i = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ")) Ω";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "i = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") Ω + (" + b.value.toString() + "±" + b.uncertainty.toString() + ")°";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}



class StarSpTypeColorActivity
{
	constructor()
	{
		this._title = "Measure Spectral Type and Color of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < stars.length; i++)
		{
			var curr = stars[i]

			if (ValidateValue(curr.B) && ValidateValue(curr.V) && ValidateValue(curr.num_sp_type))
			{
				var x = curr.num_sp_type;
				var y = curr.B - curr.V;
				if (ValidateValue(x) && ValidateValue(y) && x > 100 && x <= 600 && ValidateValue(curr.num_sp_type_subtype))
				{
					var data = new GraphDatum(x,y);
					this._asteroidData.push(data);
					if (data.x < min_x)
						min_x = data.x;
					if (data.x > max_x)
						max_x = data.x;
					if (data.y < min_y)
						min_y = data.y;
					if (data.y > max_y)
						max_y = data.y;
				}			
			}
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Numeric Spectral Type",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Color Index (B - V)",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("data","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "B - V = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ")) n";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "B - V = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") n + (" + b.value.toString() + "±" + b.uncertainty.toString() + ")";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}

class StarColorColorActivity
{
	constructor()
	{
		this._title = "Measure B - V Color and V - R Color of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < stars.length; i++)
		{
			var curr = stars[i]

			if (ValidateValue(curr.B) && ValidateValue(curr.V) && ValidateValue(curr.R))
			{
				var x = curr.B - curr.V;
				var y = curr.V - curr.R;
				if (ValidateValue(x) && ValidateValue(y) && x < 1.5 && y > -0.5)
				{
					var data = new GraphDatum(x,y);
					this._asteroidData.push(data);
					if (data.x < min_x)
						min_x = data.x;
					if (data.x > max_x)
						max_x = data.x;
					if (data.y < min_y)
						min_y = data.y;
					if (data.y > max_y)
						max_y = data.y;
				}			
			}
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Color Index (B - V)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Color Index (V - R)",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("data","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "V - R = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ")) (B - V)";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "V - R = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") (B - V) + (" + b.value.toString() + "±" + b.uncertainty.toString() + ")";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}


class StarRedshiftGalLongActivity
{
	constructor()
	{
		this._title = "Measure Redshift and Galactic Longitude of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		var max_x = 0;
		var min_x = 1000000;
		var max_y = 0;
		var min_y = 1000;
					
		var twoPi = Math.PI * 2.0;
		var i;
		for (i = 0; i < stars.length; i++)
		{
			var curr = stars[i]

			var x = curr.gallong;
			var y = curr.rvz_redshift;
			if (ValidateValue(x) && ValidateValue(y))
			{
				var data = new GraphDatum(x,y);
				this._asteroidData.push(data);
				if (data.x < min_x)
					min_x = data.x;
				if (data.x > max_x)
					max_x = data.x;
				if (data.y < min_y)
					min_y = data.y;
				if (data.y > max_y)
					max_y = data.y;
			}			
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = -0.0005;//Math.floor(min_y * 100000.0) / 100000.0;
		this._max_y = 0.0005;//Math.ceil(max_y * 100000.0) / 100000.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Galactic Longitude (°)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Redshift",this._min_y,this._max_y);

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisHorizontal);
		this._graph.addVerticalAxis(this._axisVertical);
		this._measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
		this._graph.addDataSet(this._measurements);
		this._graphTrend = new GraphTrend("data","xaxis", "yaxis", "linear", 0,0,"#ff0000");
		this._graphTrend.disable = true;
		this._graph.addTrend(this._graphTrend);
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
		
	}
	
	measure(number)
	{
		var i;
		for (i = 0; i < number; i++)
		{
			var idx = this._measurements.length;
			if (idx < this._asteroidData.length)
				this._measurements.add(this._asteroidData[idx]);
		}
		this.average();
		if (this._linearTrendComputed && this._graphTrend._type == "linear")
			this.linearRegression(false);
		if (this._loglogTrendComputed && this._graphTrend._type == "exponential")
			this.linearRegression(true);
	}
	average()
	{
		// nothing to do for this case
	}		
	linearRegression(loglog)
	{
		if (loglog)
		{
			this._lls = this._measurements.LinearLeastSquare(true);
			this._graphTrend._type = "exponential";
			this._graphTrend._exponent = this._lls.slope;
			this._graphTrend._coefficent = Math.pow(2.0,this._lls.intercept);
			this._loglogTrendComputed = true;
			this._graphTrend.disable = false;
		}
		else
		{
			this._lls = this._measurements.LinearLeastSquare();
			this._graphTrend._type = "linear";
			this._graphTrend._m = this._lls.slope;
			this._graphTrend._b = this._lls.intercept;
			this._linearTrendComputed = true;
			this._graphTrend.disable = false;
		}
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		context.strokeStyle = "#ffffff";
		context.fillStyle = "#ffffff";
		context.font = "20px Arial";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.save();
		context.translate(0,510);
		context.fillText("Number of Measurements: " + this._measurements.length.toString(), 250,0);
		context.translate(0,35);
		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				var vD_1 = Math.pow(2.0,this._lls.intercept);
				var sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				var D_1 = sig_figs(vD_1,sD_1);
				var Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "z = ((" + D_1.value.toString() + "±" + D_1.uncertainty.toString() + ")) ℓ";
				var expString = "(" + Exp.value.toString() + "±" + Exp.uncertainty.toString() + ")";
				
				context.fillText(eqnString, 250,0);
				var offset = context.measureText(eqnString).width;
				context.textAlign = "left";
				context.font = "12px Arial";
				context.fillText(expString, 250 + offset * 0.5,-8);
			
			}
			else
			{
				var b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				var m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				var eqnString = "z = (" + m.value.toString() + "±" + m.uncertainty.toString() + ") deg.⁻¹ ℓ + (" + b.value.toString() + "±" + b.uncertainty.toString() + ")";
				context.fillText(eqnString, 250,0);
			}
			context.translate(0,35);
		}
		context.restore();
	}

}
var starPostionActivity = new StarPositionActvity();
var asteroidNearJupiterActivity = new AsteroidNearJupiter();
var asteroidDiameterBrightnessActivity = new AsteroidDiameterBrightnessActivity();
var asteroidDiameterDistanceActivity = new AsteroidDiameterDistanceActivity();
var asteroidOrbitalParametersctivity = new AsteroidOrbitalParametersctivity();
var starSpTypeColorActivity = new StarSpTypeColorActivity();
var starRedshiftGalLongActivity = new StarRedshiftGalLongActivity();
var starColorColorActivity = new StarColorColorActivity();

var currentActivity = starPostionActivity;

var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

var theContext = theCanvas.getContext("2d");

var select = document.getElementById("selectActivity");
var option = document.createElement("option");
option.text = starPostionActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidNearJupiterActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidDiameterBrightnessActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidDiameterDistanceActivity._title;

select.add(option)


option = document.createElement("option");
option.text = asteroidOrbitalParametersctivity._title;

select.add(option)

option = document.createElement("option");
option.text = starSpTypeColorActivity._title;

select.add(option)

option = document.createElement("option");
option.text = starRedshiftGalLongActivity._title;

select.add(option)

option = document.createElement("option");
option.text = starColorColorActivity._title;

select.add(option)




var g_bLogLogDisplay = false;

function OnActivitySelect()
{
	if (select.value == asteroidNearJupiterActivity._title)
		currentActivity = asteroidNearJupiterActivity;
	else if (select.value == asteroidDiameterBrightnessActivity._title)
		currentActivity = asteroidDiameterBrightnessActivity;
	else if (select.value == asteroidDiameterDistanceActivity._title)
		currentActivity = asteroidDiameterDistanceActivity;
	else if (select.value == asteroidOrbitalParametersctivity._title)
		currentActivity = asteroidOrbitalParametersctivity;
	else if (select.value == starSpTypeColorActivity._title)
		currentActivity = starSpTypeColorActivity;
	else if (select.value == starRedshiftGalLongActivity._title)
		currentActivity = starRedshiftGalLongActivity;
	else if (select.value == starColorColorActivity._title)
		currentActivity = starColorColorActivity;
	else
		currentActivity = starPostionActivity;
	if (!currentActivity._loglogAllowed)
	{
		g_bLogLogDisplay = false;
		var btn = document.getElementById("buttonLogPlot");
		btn.innerText = "Display Log-Log Plot";
		btn.disabled = true;
	}
	else
	{
		g_bLogLogDisplay = false;
		var btn = document.getElementById("buttonLogPlot");
		btn.innerText = "Display Log-Log Plot";
		btn.disabled = false;
	}
	if (!currentActivity._linearAnalysisAllowed)
	{
		var btn = document.getElementById("buttonLinearRegression");
		btn.disabled = true;
	}
	else
	{
		var btn = document.getElementById("buttonLinearRegression");
		btn.disabled = false;
	}
	
	
}

OnActivitySelect(); // call it right away to make sure everything set up correctly

function OnMeasureSelect()
{
	currentActivity.measure(g_currentNumMeasure);
}
function OnAverageSelect()
{
	currentActivity.average();
}
function OnLinearRegressionSelect()
{
	currentActivity.linearRegression(g_bLogLogDisplay);
}
function OnLogPlotSelect()
{
	if (currentActivity._loglogAllowed)
	{
		g_bLogLogDisplay = !g_bLogLogDisplay;
	}
	var btn = document.getElementById("buttonLogPlot");
	if (g_bLogLogDisplay)
	{
		btn.innerText = "Display Linear Plot";
	}
	else
	{
		btn.innerText = "Display Log-Log Plot";
	}
		
}
var g_currentNumMeasure = 1;
function OnMeasurmentNumberSelect()
{
	var measNum = document.getElementById("rangeMeasurementNumber");
	var measBus = document.getElementById("buttonMeasure");
	var N = 10 ** (new Number(measNum.value));
	if (N > 1)
		measBus.innerText = "Make " + N.toString() + " Measurements";
	else
		measBus.innerText = "Make " + N.toString() + " Measurement";
	g_currentNumMeasure = N;
}

var minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 120; // 60 larger than normal (60) to accomodate drop down box
theCanvas.width = window.innerWidth;
//theCanvas.width = theCanvas.height;


function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);


	commonUIdraw(theContext);

	theContext.save();
		theContext.translate(theCanvas.width * 0.5 - 250,0);
		if (currentActivity._loglogAllowed)
		{
			currentActivity._axisHorizontal.log = g_bLogLogDisplay;
			currentActivity._axisVertical.log = g_bLogLogDisplay;
		}
		else
		{
			currentActivity._axisHorizontal.log = false;
			currentActivity._axisVertical.log = false;
		}
		currentActivity.graph(theContext);
	theContext.restore();

	window.setTimeout(work, 1.0/30.0);
}

work();

