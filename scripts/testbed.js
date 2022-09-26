

var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

var theContext = theCanvas.getContext("2d");

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;
//theCanvas.width = theCanvas.height;
function fx(x)
{
	return bessel(1,x);
}
function fxp(x)
{
	return bessel_D(1,x);
}


function airy_i(k,a,theta)
{
	const x = k * a * Math.sin(theta);
	const bx = bessel(1,x);
	const I = (Math.abs(x) > 0) ? 4.0 * bx * bx / (x * x) : 1.0;
	return I;
}

const r1 = 3.831705970207513;//newton_raphson(3.0,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);

const r4 = 13.323691936307718;//newton_raphson(13.0,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);
 // 3.6705584474589975e-14

function airy_total(lambda,a,f)
{
	const k = 2.0 * Math.PI / lambda; // 550 nm
	const theta_max = Math.asin(r4 / (k * a));
	
	const step = theta_max / 512.0;
	let theta;
	let sum = 0;
	for (theta = 0; theta <= theta_max; theta += step)
	{
		const I = airy_i(k,a,theta);
		sum += I * 2.0 * Math.PI * (f * f * (theta + 0.5 * step)) * step;
	}
	return sum;
}

let i = 0;
function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	const lambda = 550.0e-9;
	const D = 2.72;
	const a = D * 0.5; // m
	const f = 8.13; // m
	const chipsize = 13.3e-3;
	const resolution = 1024;
	const diff_arcsec = r1 * 0.5 * lambda / D * (180.0 * 3600.0 / Math.PI);
	const pixel_scale = (chipsize / resolution) / f * (180.0 * 3600.0 / Math.PI);
	const seeing = 2.0 - altitude / 4200 * 1.5; // very rought method of calculating seeing: 2" at sea level down to 0.5" at Keck (4200 m)
	
//	const theta_max = r4 / 2.0 * lambda / (2.0 * a);
	
//	console.log("s = " + airy(0.5 * chipsize,lambda,a,f))	;
	const total = airy_total(lambda,a,f);
	const I0 = 500000.0 / total;
//	console.log("s = " + airy(2.0 * chipsize,lambda,a,f))	;
		
	//console.log(newton_raphson(4.5,fx,fxp,0.0000001,0.0000001,10000));
//	const r1 = newton_raphson(3.5,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);
//	const r2 = newton_raphson(7.0,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);
//	const r3 = newton_raphson(10.1,fx,fxp,Number.EPSILON * 1000.0,Number.EPSILON * 1000.0,10000);
//	console.log(airy(r1));
//	console.log(airy(r2));
//	console.log(airy(r3));
//	console.log(airy(r4));
	
	//y = 63575.19097803338;
	
//	console.log(bessel_D(1,2));
//	console.log(bessel_D(1,2.5));
//	console.log(bessel_D(1,3));
//	console.log(bessel_D(1,3.5));
//	console.log(bessel_D(1,3.8));
//	console.log(bessel_D(1,3.83));
//	console.log(bessel_D(1,3.8317));

	
	commonUIdraw(theContext);
	i++;

//	window.setTimeout(work, 2000.0);
	window.setTimeout(work, 1.0/30.0);
}

//work();

let X = airmass(0,120,2.096);
console.log("kJ = " + 0.107 / X);
console.log("kK = " + 0.094 / X);
console.log("kL = " + 0.085 / X);
X = airmass(0,120,6660*12*2.54/100/1000.0);
console.log("kU = " + 0.514 / X);
console.log("kB = " + 0.238 / X);
console.log("kV = " + 0.152 / X);

