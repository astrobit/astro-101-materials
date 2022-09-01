
class Activity
{
	constructor (title, functionMeasure, functionAverage, functionLinearRegression, functionGraph)
	{
	}
}


class StarPositionActvity
{
	constructor()
	{
		this._RA_Center = 132.92;
		this._Dec_Center = 37.060;
		
		this._axisRA = new GraphAxis("RA","Right Ascension",this._RA_Center - 0.06,this._RA_Center + 0.06);
		this._axisRA._labelFormatter._isAngle = true;
		this._axisRA._labelFormatter._showUnitsAngle = true;
		this._axisRA._labelFormatter._angleFormat = "0D 0M 0S.ss";
		
		this._axisDec = new GraphAxis("Dec","Declination",this._Dec_Center - 0.06,this._Dec_Center + 0.06);
		this._axisDec._labelFormatter._isAngle = true;
		this._axisDec._labelFormatter._showUnitsAngle = true;
		this._axisDec._labelFormatter._angleFormat = "0D 0M 0S.ss";

		this._graph = new Graph("position",500,500,"#ffffff");
		this._graph.addHorizontalAxis(this._axisRA);
		this._graph.addVerticalAxis(this._axisDec);
		this._measurements = new GraphDataSet("positions","RA", "Dec", null,1,3,"#7f7f7f",true);
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
			var curr = new GraphDatum(random_gaussian(this._RA_Center,0.02),random_gaussian(this._Dec_Center,0.02));
			this._measurements.add(curr);
		}
//		if (this._averageRA !== null && this._averageDec !== null)
		{
			this.average();
		}
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
				context.fillText(raDMS.deg.toString() + "°" + raDMS.min.toString() + "'" + raDMS.sec.toString() + "\"",0,0);
				context.translate(0,25);
				if (this._stdErrRA !== null)
				{
					var raErrDMS = degreestoDMS(this._stdErrRA);
					context.fillText("±" + raErrDMS.sec.toString() + "\"",0,0);
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

var starPostionActivity = new StarPositionActvity();

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
option.text = "Measure Position of a Star";

select.add(option)

option = document.createElement("option");
option.text = "Measure Position of an Asteroid Near Jupiter";

select.add(option)

var g_bLogLogDisplay = false;

function OnActivitySelect()
{
}
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
	currentActivity.linearRegression();
}
function OnLogPlotSelect()
{
	if (g_bLogLogDisplay)
		g_bLogLogDisplay = false;
	else
		g_bLogLogDisplay = true;
	var btn = document.getElementById("buttonLogPlot");
	if (g_bLogLogDisplay)
	{
		btn.style.backgroundColor = '#4CFF50;';
	}
	else
	{
		btn.style.backgroundColor = '#7F7F7F';
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
		currentActivity.graph(theContext);
	theContext.restore();

	window.setTimeout(work, 1.0/30.0);
}

work();

