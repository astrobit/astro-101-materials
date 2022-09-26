var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");

var wsmall = 550 - theCanvas.width / 2;
if (wsmall < 0)
	wsmall = 0;
var wavelength = 550;

function onClick(event)
{
	if(event.offsetY <= 50)
	{
		wavelength = wsmall + event.offsetX;
	}

}
function onMouseMove(event)
{
	if(event.offsetY <= 50 && event.which == 1)
	{
		wavelength = wsmall + event.offsetX;
	}

}

function wavelengthToRGB(wavelengthNM)
{
	// The polynomials and scaling factors based on Styles & Burch (1959) color matching functions, as reported in Stockman & Sharpe (2000). 
	// I don't know exactly what lamps they used, so these aren't perfect; they seem to do poorly in the indigo range, where the green and blue lamps created excess red.
	// It may be more appropriate to use the Stockman & Sharpe (2000) response functions. @@TODO

	// These polynomials genreate the required red, green, and blue components to match light of the specified wavelength. The r1 and r2 reflect the need for some red response
	// in the red range (roughly 500 - 700 nm) and the blue range (around 425 nm).
	var RGB = {r: 0, g:0, b:0};
	if (wavelengthNM >= 390 && wavelengthNM <= 830)
	{
		var r1 = Math.exp(((-1.98476620815128E-05 * wavelengthNM + 0.021460490362093) * wavelengthNM + -7.48315048398823) * wavelengthNM + 823.968168053177) * 0.961968086752371;
		var r2 = Math.exp(((1.38439840604385E-06 * wavelengthNM + -0.003035890448805) * wavelengthNM + 2.14250618260049) * wavelengthNM + -491.61375649017) * 0.987337980832077;
		var g = Math.exp(((-1.17753432638858E-06 * wavelengthNM + 0.001359271050577) * wavelengthNM + -0.434152297723757) * wavelengthNM + 23.8555811501429) * 0.694967476241808;
		var b = Math.exp(((1.85377093204006E-06 * wavelengthNM + -0.003734366707438) * wavelengthNM + 2.23579982988818) * wavelengthNM + -418.674248712431) * 0.859408873471326;
		if(r1 > 1)
			r1 = 1.0;
		if (r2 > 1)
			r2 = 1.0;
		if (g > 1.0)
			g = 1.0;
		if (b > 1.0)
			b = 1.0;

		// translate from the range (0 - 1] - [0 - 255]
		RGB.r = Math.round((r1 + r2) * 255);
		RGB.g = Math.round(g*255);
		RGB.b = Math.round(b*255);
	}
	return RGB;
}
function RGBtoColor(rgb)
{
	// create an HTML color style based on RGB values
	var sR = Math.floor(rgb.r).toString(16);
	if (rgb.r < 16) // if the value is small enough for one hex digit, add a leading zero
		sR = "0" + sR;

	var sG = Math.floor(rgb.g).toString(16);
	if (rgb.g < 16) // if the value is small enough for one hex digit, add a leading zero
		sG = "0" + sG;

	var sB = Math.floor(rgb.b).toString(16);
	if (rgb.b < 16) // if the value is small enough for one hex digit, add a leading zero
		sB = "0" + sB;
	return "#" + sR + sG + sB;
}
function work()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);

	var i;
	for (i = 0; i < theCanvas.width; i++)
	{
		theContext.fillStyle = RGBtoColor(wavelengthToRGB(i + wsmall));
		theContext.fillRect(i, 0, i + 1, 50);
	}


// clear the canvas
	var rgb = wavelengthToRGB(wavelength)
	theContext.fillStyle = RGBtoColor(rgb);
	theContext.fillRect(0, 50, theCanvas.width, theCanvas.height - 50);

	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(wavelength - wsmall - 1,0,2,50);
	theContext.stroke();

//	theContext.moveTo(0,60);
//	the


	theContext.font = "20px Ariel";
	theContext.fillStyle = "#7F7F7F";
	theContext.fillText("Wavelength = " + wavelength.toString() + "nm",50,450)

	theContext.fillStyle = "#7F7F7F";
	theContext.fillText(rgb.r.toString(),50,500)
	theContext.fillText(rgb.g.toString(),100,500)
	theContext.fillText(rgb.b.toString(),150,500)

	window.setTimeout(work, 1000.0/30.0);
}

work();

//draw();