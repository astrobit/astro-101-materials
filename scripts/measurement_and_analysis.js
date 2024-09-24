let divRADec = document.getElementById("display data radec");
let divLLS = document.getElementById("display data LLS");

let outputNumMeasurements = document.getElementById("num measurements");
let outputRA = document.getElementById("ra");
let outputRAUnc = document.getElementById("ra unc");
let outputDec = document.getElementById("dec");
let outputDecUnc = document.getElementById("dec unc");

let outputLLSeq = document.getElementById("LLS eq");

let width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

const graphSize = Math.max(500,Math.min(window.innerHeight - 540,window.innerWidth));
// warning: I'm finding incorrect height and width information in my browser. The minimum of 500 should circumvent that problem for now...


function createDisplayBlockRA()
{
	let divDisplay = document.getElementById("display data");
	divDisplay.innerHTML = "<label style=\"color:white;text-align:left;\">Averages</label><br/><div style=\"width: 150px;display:inline-block;\"><label style=\"color:white;text-align:left;\">RA</label><br/><output id=\"ra\" style=\"color:white;text-align:left;\"></output><br/><output id=\"ra unc\" style=\"color:white;text-align:left;\"></output><br/></div><div style=\"width: 150px;display:inline-block;\"><label style=\"color:white;text-align:left;\">Dec</label><br/><output id=\"dec\" style=\"color:white;text-align:left;\"></output><br/><output id=\"dec unc\" style=\"color:white;text-align:left;\"></output><br/></div>";
	
	outputRA = document.getElementById("ra");
	outputRAUnc = document.getElementById("ra unc");
	outputDec = document.getElementById("dec");
	outputDecUnc = document.getElementById("dec unc");

}
function createDisplayBlockEq()
{
	let divDisplay = document.getElementById("display data");

	divDisplay.innerHTML = "<output id=\"LLS eq\" style=\"color:white;text-align:left;\"></output><br/>"

	outputLLSeq = document.getElementById("LLS eq");
}

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

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
		let i;
		for (i = 0; i < number; i++)
		{
			const curr = new GraphDatum(random_gaussian(this._RA_Center,this._scatter)/15.0,random_gaussian(this._Dec_Center,this._scatter));
			this._measurements.add(curr);
		}
		this.average();
	}
	average()
	{
		if (this._measurements.length > 0)
		{
			let raSum = 0;
			let decSum = 0;
			let ra2Sum = 0;
			let dec2Sum = 0;
			let i;
			for (i = 0; i < this._measurements.length; i++)
			{
				const curr = this._measurements.at(i);
				raSum += curr.x;
				ra2Sum += (curr.x * curr.x);
				decSum += curr.y;
				dec2Sum += (curr.y * curr.y);
			}
			const invCount = 1.0 / this._measurements.length;
			this._averageRA = raSum * invCount;
			this._averageDec = decSum * invCount;
			const averagevarRA = ra2Sum * invCount;
			const averagevarDec = dec2Sum * invCount;
			
			if (this._measurements.length > 1)
			{
				let letRA2Sum = 0;
				let letDec2Sum = 0;
				for (i = 0; i < this._measurements.length; i++)
				{
					let curr = this._measurements.at(i);
					
					let letRA = (curr.x - this._averageRA);
					let letDec = (curr.y - this._averageDec);
					letRA2Sum += letRA * letRA;
					letDec2Sum += letDec * letDec;
				}

				let invCountStdDev = Math.sqrt(1.0 / (this._measurements.length - 1));
				this._stdDevRA = Math.sqrt(letRA2Sum * invCountStdDev);
//				this._stdDevRA = Math.sqrt(averageletRA - invCount * this._averageRA * this._averageRA);
//				this._stdDevRA = Math.sqrt(ra2Sum + this._averageRA * this._averageRA - 2.0 * raSum * this._averageRA ) * invCountStdDev;
				this._stdDevDec = Math.sqrt(letDec2Sum * invCountStdDev);
//				this._stdDevDec = Math.sqrt(averageletDec - invCount * this._averageDec * this._averageDec);
//				this._stdDevDec = Math.sqrt(dec2Sum + this._averageDec * this._averageDec - 2.0 * decSum * this._averageDec ) * invCountStdDev;
				this._stdErrRA = this._stdDevRA * Math.sqrt(invCount);
				this._stdErrDec = this._stdDevDec * Math.sqrt(invCount);
			}
		}
	}		
	linearRegression()
	{
		const line = this._measurements.LinearLeastSquare()
		// nothing to do for this case
	}
	clear()
	{
		this._measurements.clear();
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
//		divRADec.style.visibility = 'visible';
//		divLLS.style.visibility = 'hidden';
		createDisplayBlockRA();
		
		outputNumMeasurements.value = this._measurements.length.toString();
		if (this._averageRA !== null && this._averageDec !== null)
		{
			const raDMS = degreestoDMS(this._averageRA);
			const decDMS = degreestoDMS(this._averageDec);

			outputRA.value = raDMS.deg.toString() + "h" + raDMS.min.toString() + "m" + raDMS.sec.toString() + "s";
			if (this._stdErrRA !== null)
			{
				const raErrDMS = degreestoDMS(this._stdErrRA);
				outputRAUnc.value = "±" + raErrDMS.sec.toString() + "s";
			}
			else
				outputRAUnc.value = "± ∞ s";
			
			outputDec.value	 = decDMS.deg.toString() + "°" + decDMS.min.toString() + "'" + decDMS.sec.toString() + "\"";
			if (this._stdErrDec !== null)
			{
				const decErrDMS = degreestoDMS(this._stdErrDec);
				outputDecUnc.value = "±" + decErrDMS.sec.toString() + "\"";
			}
			else
				outputDecUnc.value = "± ∞ \""
		}
		else
		{
			outputRA.value = "---";
			outputRAUnc.value = "± ∞ s";
			outputDec.value	 = "---";
			outputDecUnc.value = "± ∞ \""
		}
		
	}

}


let randomizedAsteroidList = new Array();

let g_irand;

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

		const jd = 2459800.5;
		const jupiter = Planets.Jupiter.orbitalParameters.getOrbitalPosition(jd); 
		this._asteroidData = new Array();
		let max_y = 1;
		let min_y = 1000;
					
		const twoPi = Math.PI * 2.0;
		let i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			let curr = randomizedAsteroidList[i].orbitalParameters.getOrbitalPosition(jd);
			let relPosition = curr.helioLongitude - jupiter.helioLongitude;
			let fPi = Math.floor(relPosition / twoPi);
			relPosition -= fPi * twoPi;
			if (relPosition > Math.PI)
				relPosition -= twoPi;
			
			let data = new GraphDatum(relPosition * 180.0 / Math.PI,randomizedAsteroidList[i].orbitalParameters.semiMajorAxis);
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

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		createDisplayBlockEq();
//		divRADec.style.visibility = 'hidden';
//		divLLS.style.visibility = 'hidden';
		outputNumMeasurements.value = this._measurements.length.toString();
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
		let max_x = 0.00001;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
					
		const twoPi = Math.PI * 2.0;
		let i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			const curr = randomizedAsteroidList[i]
			if (curr.H !== null && curr.diameter !== null)
			{
				let data = new GraphDatum(curr.H,curr.diameter);
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

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "D = (" + D_1.standard_notation + " km) M";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + "  + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "D = " + m.standard_notation + " M + " + b.standard_notation + " km";
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";
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
		let max_x = 0.00001;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
					
		const twoPi = Math.PI * 2.0;
		let i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			let curr = randomizedAsteroidList[i]
			if (curr.a !== null && curr.diameter !== null)
			{
				const data = new GraphDatum(curr.a,curr.diameter);
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

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
		let i;
		for (i = 0; i < number; i++)
		{
			let idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "D = (" + D_1.standard_notation + ") a";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + " + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				let eqnString = "D = " + m.standard_notation + " km/au a + (" + b.standard_notation + " km";
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";


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
		let max_x = 0.00001;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
					
		const twoPi = Math.PI * 2.0;
		let i;
		for (i = 0; i < randomizedAsteroidList.length; i++)
		{
			let curr = randomizedAsteroidList[i]
			let x = curr.om;
			let y = curr.i;
			if (ValidateValue(x) && ValidateValue(y))
			{
				const data = new GraphDatum(x,y);
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

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "i = (" + D_1.standard_notation + ") Ω";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + " + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "i = " + m.standard_notation + " Ω + " + b.standard_notation + "°";
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";
	}

}



class StarSpTypeColorActivity
{
	prepare()
	{
		this._title = "Measure Spectral Type and Color of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		let max_x = 0;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
					
		const twoPi = Math.PI * 2.0;

		let i;
		this._prepared = false;
		if (stars !== null && stars.length > 0)
		{
			for (i = 0; i < stars.length; i++)
			{
				let curr = stars[i]

				if (ValidateValue(curr.B) && ValidateValue(curr.V) && ValidateValue(curr.num_sp_type))
				{
					const x = curr.num_sp_type;
					const y = curr.B - curr.V;
					if (ValidateValue(x) && ValidateValue(y) && x >= 10 && x <= 60 && ValidateValue(curr.num_sp_type_subtype))
					{
						let data = new GraphDatum(x,y);
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
			this._prepared = true;
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Numeric Spectral Type",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Color Index (B - V)",this._min_y,this._max_y);

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
	constructor()
	{
		this.prepare();
	}
	measure(number)
	{
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		if (!this._prepared)
			this.prepare();
			
		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "B - V = (" + D_1.standard_notation + ") n";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + " + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "B - V = " + m.standard_notation + " n + " + b.standard_notation;
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";

	}

}

class StarColorColorActivity
{
	prepare()
	{
		this._title = "Measure B - V Color and V - R Color of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		let max_x = 0;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
					
		this._prepared = false;
		const twoPi = Math.PI * 2.0;
		let i;
		if (stars !== null && stars.length > 0)
		{
			for (i = 0; i < stars.length; i++)
			{
				let curr = stars[i]

				if (ValidateValue(curr.B) && ValidateValue(curr.V) && ValidateValue(curr.R))
				{
					const x = curr.B - curr.V;
					const y = curr.V - curr.R;
					if (ValidateValue(x) && ValidateValue(y) && x < 1.5 && y > -0.5)
					{
						const data = new GraphDatum(x,y);
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
		this._prepared = true;
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = Math.floor(min_y * 10.0) / 10.0;
		this._max_y = Math.ceil(max_y * 10.0) / 10.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Color Index (B - V)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Color Index (V - R)",this._min_y,this._max_y);

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
	constructor()
	{
		this.prepare();
	}
	
	measure(number)
	{
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		if (!this._prepared)
			this.prepare();

		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "V - R = (" + D_1.standard_notation + ") (B - V)";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + " + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "V - R = " + m.standard_notation + " (B - V) + " + b.standard_notation;
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";

	}

}


class StarRedshiftGalLongActivity
{
	prepare()
	{
		this._title = "Measure Redshift and Galactic Longitude of Stars";
		this._loglogAllowed = false;
		this._linearAnalysisAllowed = true;

		this._asteroidData = new Array();
		let max_x = 0;
		let min_x = 1000000;
		let max_y = 0;
		let min_y = 1000;
		this._prepared = false;
		const twoPi = Math.PI * 2.0;
		let i;
		if (stars !== null && stars.length > 0)
		{
			for (i = 0; i < stars.length; i++)
			{
				let curr = stars[i]

				const x = curr.gallong;
				const y = curr.rvz_redshift;
				if (ValidateValue(x) && ValidateValue(y))
				{
					const data = new GraphDatum(x,y);
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
			this._prepared = true;
		}
		this._min_x = Math.floor(min_x * 10.0) / 10.0;
		this._max_x = Math.ceil(max_x * 10.0) / 10.0;
		this._min_y = -0.0005;//Math.floor(min_y * 100000.0) / 100000.0;
		this._max_y = 0.0005;//Math.ceil(max_y * 100000.0) / 100000.0;
	
		this._axisHorizontal = new GraphAxis("xaxis","Galactic Longitude (°)",this._min_x,this._max_x);
		this._axisVertical = new GraphAxis("yaxis","Redshift",this._min_y,this._max_y);

		this._graph = new Graph("position",graphSize, graphSize,"#ffffff");
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
	constructor()
	{
		this.prepare();
	}
	
	measure(number)
	{
		let i;
		for (i = 0; i < number; i++)
		{
			const idx = this._measurements.length;
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
	clear()
	{
		this._measurements.clear();
		this._graphTrend.disable = true;
		this._linearTrendComputed = false;
		this._loglogTrendComputed = false;
	}
	graph(context)
	{
		if (!this._prepared)
			this.prepare();

		this._graph.draw(context,0,0);
		createDisplayBlockEq();
		outputNumMeasurements.value = this._measurements.length.toString();

		if (this._lls !== undefined && this._lls !== null)
		{
			if (this._lls.type == "Log-Log LLS")
			{
				const vD_1 = Math.pow(2.0,this._lls.intercept);
				const sD_1 = vD_1 * this._lls.intercept_uncertainty * Math.log(2.0);
				const D_1 = sig_figs(vD_1,sD_1);
				const Exp = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "z = (" + D_1.standard_notation + ") ℓ";
				const expString = Exp.standard_notation;
				outputLLSeq.value = eqnString + " + " + expString;
			
			}
			else
			{
				const b = sig_figs(this._lls.intercept,this._lls.intercept_uncertainty);
				const m = sig_figs(this._lls.slope,this._lls.slope_uncertainty);
				const eqnString = "z = " + m.standard_notation + " deg.⁻¹ ℓ + " + b.standard_notation;
				outputLLSeq.value = eqnString;
			}
		}
		else
			outputLLSeq.value = "";

	}

}
let starPostionActivity = new StarPositionActvity();
let asteroidNearJupiterActivity = new AsteroidNearJupiter();
let asteroidDiameterBrightnessActivity = new AsteroidDiameterBrightnessActivity();
let asteroidDiameterDistanceActivity = new AsteroidDiameterDistanceActivity();
let asteroidOrbitalParametersctivity = new AsteroidOrbitalParametersctivity();
let starSpTypeColorActivity = new StarSpTypeColorActivity();
let starRedshiftGalLongActivity = new StarRedshiftGalLongActivity();
let starColorColorActivity = new StarColorColorActivity();

let currentActivity = starPostionActivity;

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

let theContext = theCanvas.getContext("2d");

let select = document.getElementById("selectActivity");
let option = document.createElement("option");
option.text = starPostionActivity._title;

select.add(option)

option = document.createElement("option");
option.text = starColorColorActivity._title;

select.add(option)

option = document.createElement("option");
option.text = starSpTypeColorActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidDiameterBrightnessActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidNearJupiterActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidDiameterDistanceActivity._title;

select.add(option)

option = document.createElement("option");
option.text = asteroidOrbitalParametersctivity._title;

select.add(option)

option = document.createElement("option");
option.text = starRedshiftGalLongActivity._title;

select.add(option)





let g_bLogLogDisplay = false;

function OnActivitySelect()
{
	let newActivity = null;
	if (select.value == asteroidNearJupiterActivity._title)
		newActivity = asteroidNearJupiterActivity;
	else if (select.value == asteroidDiameterBrightnessActivity._title)
		newActivity = asteroidDiameterBrightnessActivity;
	else if (select.value == asteroidDiameterDistanceActivity._title)
		newActivity = asteroidDiameterDistanceActivity;
	else if (select.value == asteroidOrbitalParametersctivity._title)
		newActivity = asteroidOrbitalParametersctivity;
	else if (select.value == starSpTypeColorActivity._title)
		newActivity = starSpTypeColorActivity;
	else if (select.value == starRedshiftGalLongActivity._title)
		newActivity = starRedshiftGalLongActivity;
	else if (select.value == starColorColorActivity._title)
		newActivity = starColorColorActivity;
	else
		newActivity = starPostionActivity;
	if (newActivity != currentActivity)
		currentActivity.clear();
	currentActivity = newActivity;
	if (!currentActivity._loglogAllowed)
	{
		g_bLogLogDisplay = false;
		let btn = document.getElementById("buttonLogPlot");
		btn.innerText = "Display Log-Log Plot";
		btn.disabled = true;
	}
	else
	{
		g_bLogLogDisplay = false;
		let btn = document.getElementById("buttonLogPlot");
		btn.innerText = "Display Log-Log Plot";
		btn.disabled = false;
	}
	if (!currentActivity._linearAnalysisAllowed)
	{
		let btn = document.getElementById("buttonLinearRegression");
		btn.disabled = true;
	}
	else
	{
		let btn = document.getElementById("buttonLinearRegression");
		btn.disabled = false;
	}
	draw();
	
	
}

OnActivitySelect(); // call it right away to make sure everything set up correctly

function OnMeasureSelect()
{
	currentActivity.measure(g_currentNumMeasure);
	draw();
}
function OnAverageSelect()
{
	currentActivity.average();
	draw();
}
function OnLinearRegressionSelect()
{
	currentActivity.linearRegression(g_bLogLogDisplay);
	draw();
}
function OnLogPlotSelect()
{
	if (currentActivity._loglogAllowed)
	{
		g_bLogLogDisplay = !g_bLogLogDisplay;
	}
	let btn = document.getElementById("buttonLogPlot");
	if (g_bLogLogDisplay)
	{
		btn.innerText = "Display Linear Plot";
	}
	else
	{
		btn.innerText = "Display Log-Log Plot";
	}
	draw();
		
}
let g_currentNumMeasure = 1;
function OnMeasurmentNumberSelect()
{
	const measNum = document.getElementById("rangeMeasurementNumber");
	let measBus = document.getElementById("buttonMeasure");
	let N = 10 ** (new Number(measNum.value));
	if (N > 1)
		measBus.innerText = "Make " + N.toString() + " Measurements";
	else
		measBus.innerText = "Make " + N.toString() + " Measurement";
	g_currentNumMeasure = N;
}

//const minimumControlsHeightTop = 130;

theCanvas.height = graphSize;//window.innerHeight - 120; // 60 larger than normal (60) to accomodate drop down box
theCanvas.width = graphSize;
//theCanvas.width = theCanvas.height;


function draw(){
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

}

draw();

