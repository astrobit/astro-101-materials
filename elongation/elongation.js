var theCanvas = document.getElementById("theCanvas");
var canvasElongation = document.getElementById("elongation");

var theContext = theCanvas.getContext("2d");
var contextElongation = canvasElongation.getContext("2d");

var timer = 0;
var speed = 0.25;
var pause = false;
var positions = [Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0,Math.random() * Math.PI * 2.0];
var orbitalRadii = [0.387098, 0.723332, 1.0, 1.523679, 5.2044, 9.5826, 19.2184, 30.07];
var currPosition = [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0];
var pStyle = ["#7F7F7F", "#FFA500", "#0000FF", "#FF0000", "#D2B48C", "#FFA500", "#93B8BE", "#3E66F9"];
var zoom = 100.0;

// fmod from https://gist.github.com/wteuber/6241786
//Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

// draw ellipse functions from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

function requestPause()
{
	pause = !pause;
	var button = document.getElementById("pause");
	if (!pause)
	{
		button.innerHTML = ' Pause  ';
	}
	else
	{
		button.innerHTML = 'Continue';
	}

}
function speedup()
{
	speed *= 2.0;
}
function slowdown()
{
	speed *= 0.5;
}

function zoomin()
{
	zoom *= 2.0;
}
function zoomout()
{
	zoom *= 0.5;
}

function drawEllipseByCenter(ctx, cx, cy, w, h) {
  drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
}

function drawEllipse(ctx, x, y, w, h) {
  var kappa = 4.0 / 3.0 * (Math.sqrt(2) - 1);//.5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  //ctx.closePath(); // not used correctly, see comments (use to close off open path)
  ctx.stroke();
}

class Mollweide 
{
	calculate()
	{
		var latRad = this.latitude * Math.PI / 180.0;
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
		var delLong = (this.longitude - this.centralLongitude) / 180.0;
		delLong = delLong % 2.0
		if (delLong > 1.0)
			delLong -= 2.0
		if (delLong < -1.0)
			delLong += 2.0
		this.x =  delLong * Math.cos(theta);
		this.y = Math.sin(theta);
	}
	constructor(latitude,longitude,centralLongitude)
	{
		this.latitude = latitude;
		this.longitude = longitude;
		this.centralLongitude = centralLongitude;
		this.calculate();
	}
//	set latitude(newLatitude)
//	{
//		this.latitude = newLatitude;
//		calculate();
//	}
//	set longitude(newLongitude)
//	{
//		this.longitude= newLongitude;
//		calculate();
//	}
	setCoordinates(latitude,longitude,centralLongitude)
	{
		this.latitude = latitude;
		this.longitude = longitude;
		this.centralLongitude = centralLongitude;
		this.calculate();
	}

}

function drawTextCenter(context,text,x,y)
{
	context.fillText(text,x - context.measureText(text).width * 0.5,y);
}
function drawTextRight(context,text,x,y)
{
	context.fillText(text,x - context.measureText(text).width,y);
}

function drawArrow(x0,y0,x1,y1,style,linewidth,tipsizelength,tipsizewidth,open)
{
	var txr,txr,txl,tyl;
	var len = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
	
	var angle = Math.atan2((y1 - y0)/len, (x1 - x0)/len);
	var lx1, ly1;
	var effline = len - tipsizelength;
	if (effline < 0)
		effline = 0; 
	lx1 = effline * Math.cos(angle) + x0;
	ly1 = effline * Math.sin(angle) + y0;
	//console.log(x0 + " " + y1 + " " + lx1 + " " + ly1);
	
	txr = (tipsizewidth + linewidth) * 0.5 * Math.sin(angle) + lx1;
	tyr = -(tipsizewidth + linewidth) * 0.5 * Math.cos(angle) + ly1;
	//console.log(txr + " " + tyr + " " + tx + " " + ly1);
	
	txl = -(tipsizewidth + linewidth) * 0.5 * Math.sin(angle) + lx1;
	tyl = (tipsizewidth + linewidth) * 0.5 * Math.cos(angle) + ly1;
	var strokestylesave= theContext.strokeStyle;
	var fillstylesave= theContext.fillStyle;
	var linewidthsave= theContext.lineWidth;
	
	theContext.strokeStyle = style;
	theContext.fillStyle = style;
	theContext.lineWidth = linewidth;
	
	theContext.beginPath();
	theContext.moveTo(x0,y0);
	theContext.lineTo(lx1,ly1);
	theContext.stroke();
	theContext.lineWidth = 1;
	theContext.beginPath();
	theContext.moveTo(x1,y1);
	theContext.lineTo(txr,tyr);
	theContext.lineTo(txl,tyl);
	theContext.lineTo(x1,y1);
	if (open == true)
		theContext.stroke();
	else
		theContext.fill();

	theContext.strokeStyle = strokestylesave;
	theContext.fillStyle = fillstylesave;
	theContext.lineWidth = linewidthsave;
}
function work(){

	var stars = [{longitude:338.60527869, latitude:50.54995988, V:3.73, B:4.12},
{longitude:338.60542312, latitude:50.55005792, V:3.83, B:4.23},
{longitude:18.28442071, latitude:43.77673866, V:3.82, B:4.84},
{longitude:44.22436572, latitude:27.80815719, V:2.1, B:3.3},
{longitude:54.91022629, latitude:20.57687983, V:3.39, B:5.04},
{longitude:336.13581583, latitude:54.91121439, V:3.94, B:3.96},
{longitude:340.7955655, latitude:56.58112147, V:3.73, B:5.39},
{longitude:8.13953564, latitude:53.29092171, V:3.77, B:3.78},
{longitude:42.43847346, latitude:35.41680709, V:3.57, B:4.85},
{longitude:56.16695045, latitude:22.43082079, V:2.12, B:2.07},
{longitude:324.83801773, latitude:57.12281994, V:2.23, B:2.9},
{longitude:35.06298956, latitude:44.72136788, V:3.66, B:3.47},
{longitude:57.69056242, latitude:26.08530963, V:3.81, B:4.79},
{longitude:335.32489638, latitude:59.9049973, V:1.25, B:1.34},
{longitude:37.78137496, latitude:46.623857, V:2.23, B:3.4},
{longitude:40.24450533, latitude:47.00957006, V:3.44, B:4.02},
{longitude:63.82266218, latitude:22.15607727, V:3.8, B:4.22},
{longitude:13.95796173, latitude:61.14783918, V:3.35, B:4.9},
{longitude:17.60469433, latitude:59.54221578, V:3.75, B:4.35},
{longitude:35.11383928, latitude:51.21656203, V:2.27, B:2.61},
{longitude:43.92887175, latitude:48.81681159, V:2.39, B:2.29},
{longitude:57.91083495, latitude:34.37359023, V:3.96, B:4.71},
{longitude:329.7879924, latitude:64.28526867, V:3.98, B:5.5},
{longitude:47.92803917, latitude:46.40552446, V:2.68, B:2.81},
{longitude:58.7007199, latitude:37.48422771, V:3.79, B:5.48},
{longitude:60.02050798, latitude:34.53258763, V:2.93, B:3.63},
{longitude:62.08018575, latitude:30.12790913, V:1.79, B:2.27},
{longitude:64.80146598, latitude:27.30423522, V:3.01, B:2.89},
{longitude:316.24532143, latitude:64.41216259, V:2.87, B:2.85},
{longitude:33.23619775, latitude:62.61753955, V:3.54, B:4.6},
{longitude:54.76193219, latitude:47.55047362, V:3.37, B:3.22},
{longitude:12.7711291, latitude:68.91430371, V:2.46, B:2.68},
{longitude:4.669041, latitude:71.77999004, V:3.41, B:4.32},
{longitude:317.96250365, latitude:71.44919675, V:3.755, B:3.899},
{longitude:35.53971248, latitude:71.15437594, V:3.23, B:3.01},
{longitude:63.55685855, latitude:54.39435901, V:3.938, B:3.953},
{longitude:314.91157615, latitude:73.80031249, V:3.76, B:4.73},
{longitude:81.8577548, latitude:22.86699811, V:.08, B:.88},
{longitude:17.14056943, latitude:82.88708797, V:3.07, B:4.07},
{longitude:75.92467081, latitude:83.57061428, V:3.58, B:4.07},
{longitude:88.56743867, latitude:66.10422117, V:2.02, B:2.62},
{longitude:89.91959132, latitude:30.84824002, V:3.72, B:4.73},
{longitude:267.96908099, latitude:74.91944571, V:2.23, B:3.76},
{longitude:264.75684441, latitude:80.2797276, V:3.75, B:4.93},
{longitude:259.89045731, latitude:69.2627899, V:3.8, B:3.63},
{longitude:251.9696536, latitude:75.27518117, V:2.81, B:3.79},
{longitude:183.41028247, latitude:84.7613836, V:3.17, B:3.06},
{longitude:194.50000621, latitude:78.44034406, V:2.74, B:3.65},
{longitude:141.60636629, latitude:75.24283992, V:3.002, B:3.067},
{longitude:133.32566554, latitude:72.98960428, V:2.08, B:3.55},
{longitude:112.99672831, latitude:40.24594305, V:3.42, B:4.27},
{longitude:184.95774178, latitude:71.09330623, V:3.29, B:4.45},
{longitude:157.46201835, latitude:66.36315675, V:3.68, B:3.64},
{longitude:136.26020478, latitude:61.76412007, V:3.89, B:3.75},
{longitude:130.33648742, latitude:57.2432705, V:3.85, B:5.47},
{longitude:120.82428999, latitude:45.17111417, V:3.67, B:4},
{longitude:135.19968745, latitude:49.68224157, V:1.87, B:3.01},
{longitude:135.19969328, latitude:49.68224605, V:1.79, B:2.86},
{longitude:126.26922718, latitude:42.65455932, V:3.81, B:4.1},
{longitude:165.71096061, latitude:56.37822653, V:3.88, B:4.05},
{longitude:165.70415255, latitude:56.37961026, V:2.22, B:2.271},
{longitude:158.93706094, latitude:54.31978605, V:1.77, B:1.75},
{longitude:151.06787335, latitude:51.65804155, V:3.32, B:3.41},
{longitude:139.43676829, latitude:45.13478571, V:2.37, B:2.35},
{longitude:127.26529247, latitude:34.89818909, V:3.18, B:3.64},
{longitude:123.93757856, latitude:28.98178468, V:3.55, B:3.55},
{longitude:122.80066078, latitude:29.5775932, V:3.14, B:3.33},
{longitude:150.47956387, latitude:47.14288653, V:2.44, B:2.45},
{longitude:176.93701912, latitude:54.38812855, V:1.86, B:1.67},
{longitude:125.27591744, latitude:23.71663966, V:3.96, B:4.39},
{longitude:204.25408351, latitude:54.14986516, V:3.52, B:4.47},
{longitude:153.66229988, latitude:41.54511038, V:3.72, B:4.9},
{longitude:197.66650503, latitude:49.55072948, V:3.02, B:3.21},
{longitude:148.81476287, latitude:35.53916581, V:3.01, B:4.15},
{longitude:139.55098331, latitude:29.887074, V:3.45, B:3.48},
{longitude:44.32058351, latitude:-12.58364753, V:2.53, B:4.17},
{longitude:40.11156404, latitude:-38.50461969, V:3.7, B:5.32},
{longitude:34.61452176, latitude:-44.68928384, V:3.85, B:4.36},
{longitude:51.16387844, latitude:-9.33206991, V:3.6, B:4.49},
{longitude:51.91221338, latitude:-8.79639861, V:3.75, B:3.66},
{longitude:48.16873322, latitude:-27.71370732, V:3.73, B:4.61},
{longitude:61.14292693, latitude:12.18679353, V:3.91, B:3.91},
{longitude:61.14292738, latitude:12.18679403, V:3.83, B:3.88},
{longitude:59.41180909, latitude:4.19221573, V:3.7, B:3.59},
{longitude:50.86301311, latitude:-28.67422916, V:3.54, B:4.46},
{longitude:63.1236021, latitude:11.33596233, V:2.85, B:2.97},
{longitude:59.68026636, latitude:4.39239431, V:3.87, B:3.8},
{longitude:60.35581548, latitude:3.91987517, V:3.63, B:3.54},
{longitude:59.9922965, latitude:4.05333903, V:2.87, B:2.78},
{longitude:65.67740334, latitude:19.11707533, V:2.89, B:2.71},
{longitude:60.6346956, latitude:-7.9574049, V:3.41, B:3.29},
{longitude:59.91950895, latitude:-14.44930804, V:3.883, B:3.924},
{longitude:53.86857321, latitude:-33.19991012, V:2.94, B:4.54},
{longitude:52.5050996, latitude:-53.96263119, V:3.56, B:3.44},
{longitude:68.46508221, latitude:-2.56459503, V:3.53, B:4.54},
{longitude:65.80588082, latitude:-5.72974255, V:3.65, B:4.64},
{longitude:66.87082823, latitude:-3.96697479, V:3.76, B:4.74},
{longitude:67.95541028, latitude:-5.74246976, V:3.84, B:4.78},
{longitude:67.96204704, latitude:-5.83594032, V:3.41, B:3.6},
{longitude:54.48937934, latitude:-54.53538722, V:3.96, B:5.45},
{longitude:69.78927941, latitude:-5.46473691, V:.86, B:2.4},
{longitude:66.81536311, latitude:-25.12102484, V:3.928, B:3.737},
{longitude:65.25519935, latitude:-36.00007742, V:3.87, B:4.96},
{longitude:65.2552124, latitude:-36.00003863, V:3.89, B:5.03},
{longitude:59.88700207, latitude:-51.81482671, V:3.82, B:4.8},
{longitude:71.92494824, latitude:-15.38155717, V:3.19, B:3.63},
{longitude:72.10107609, latitude:-16.76927536, V:3.68, B:3.5},
{longitude:78.8411942, latitude:20.94708259, V:2.99, B:3.53},
{longitude:78.63321972, latitude:18.2050099, V:3.75, B:4.97},
{longitude:76.63934604, latitude:10.45717776, V:2.69, B:4.22},
{longitude:72.49110794, latitude:-20.00244829, V:3.73, B:3.54},
{longitude:79.4460227, latitude:18.28653013, V:3.18, B:3},
{longitude:75.27627017, latitude:-27.85910569, V:2.79, B:2.92},
{longitude:76.8299673, latitude:-31.12007981, V:.13, B:.1},
{longitude:75.3949034, latitude:-39.04733134, V:3.29, B:3.18},
{longitude:72.0564594, latitude:-44.96198376, V:3.18, B:4.64},
{longitude:80.94659588, latitude:-16.81331666, V:1.64, B:1.42},
{longitude:80.15782925, latitude:-25.53080341, V:3.35, B:3.18},
{longitude:77.84752719, latitude:-29.83497758, V:3.59, B:3.47},
{longitude:82.57490315, latitude:5.3878443, V:1.65, B:1.52},
{longitude:83.70690153, latitude:-13.36671393, V:3.66, B:3.48},
{longitude:83.7069084, latitude:-13.36671584, V:3.47, B:3.48},
{longitude:83.46378919, latitude:-24.50364211, V:1.69, B:1.51},
{longitude:82.36228576, latitude:-23.55029107, V:2.41, B:2.02},
{longitude:82.99771496, latitude:-29.19728261, V:2.77, B:2.53},
{longitude:81.38093892, latitude:-41.05508443, V:2.57, B:2.77},
{longitude:79.67288064, latitude:-43.9118229, V:2.84, B:3.66},
{longitude:78.69859704, latitude:-58.62506332, V:3.87, B:5.01},
{longitude:84.78464367, latitude:-2.19287503, V:3.03, B:2.84},
{longitude:84.09594254, latitude:-25.92778937, V:3.79, B:3.58},
{longitude:84.68162051, latitude:-25.29100033, V:3.73, B:3.55},
{longitude:84.68144181, latitude:-25.29034889, V:1.77, B:1.56},
{longitude:84.68144407, latitude:-25.2903477, V:1.9, B:1.79},
{longitude:86.3987401, latitude:-33.06788411, V:2.06, B:1.88},
{longitude:85.9865329, latitude:-38.21306402, V:3.525, B:3.637},
{longitude:84.84632219, latitude:-45.81545847, V:3.6, B:4.07},
{longitude:82.16982336, latitude:-57.37244705, V:2.65, B:2.53},
{longitude:89.91036845, latitude:21.51093828, V:1.9, B:1.93},
{longitude:88.28599333, latitude:15.7246248, V:3.95, B:5.09},
{longitude:89.94284064, latitude:13.77606751, V:2.62, B:2.54},
{longitude:88.75461643, latitude:-16.0242495, V:.42, B:2.27},
{longitude:88.90006315, latitude:-37.60079939, V:3.72, B:4.05},
{longitude:87.16739308, latitude:-44.29429229, V:3.85, B:4.83},
{longitude:86.41976778, latitude:-59.17675945, V:3.12, B:4.28},
{longitude:89.61145737, latitude:-66.25137722, V:3.96, B:5.1},
{longitude:93.4361243, latitude:-.885396, V:3.28, B:4.89},
{longitude:94.24903368, latitude:-29.65654956, V:3.96, B:5.27},
{longitude:97.37711376, latitude:-53.36994329, V:3, B:2.83},
{longitude:98.42282128, latitude:-56.71139796, V:3.85, B:4.73},
{longitude:95.30188719, latitude:-.81737852, V:2.87, B:4.51},
{longitude:98.28544038, latitude:-30.26263585, V:3.74, B:3.59},
{longitude:97.18764302, latitude:-41.2509768, V:1.97, B:1.73},
{longitude:99.93880852, latitude:2.07268787, V:2.98, B:4.39},
{longitude:99.10456974, latitude:-6.73980766, V:1.92, B:1.92},
{longitude:101.74140282, latitude:-42.31937317, V:3.91, B:5.011},
{longitude:107.14609194, latitude:-66.07154991, V:3.17, B:3.06},
{longitude:101.12351301, latitude:11.0328705, V:3.6, B:3.7},
{longitude:101.20910709, latitude:-10.10150835, V:3.36, B:3.79},
{longitude:108.16016008, latitude:-46.7712874, V:3.87, B:5.6},
{longitude:108.99888539, latitude:-47.24203798, V:2.6, B:3.02},
{longitude:108.56495999, latitude:-55.14491726, V:3.89, B:3.68},
{longitude:104.99020594, latitude:-2.03617061, V:3.79, B:4.58},
{longitude:111.00176264, latitude:-46.12779012, V:3.02, B:2.94},
{longitude:110.76165234, latitude:-51.35763262, V:1.5, B:1.29},
{longitude:111.55486471, latitude:-50.22327489, V:3.47, B:5.2},
{longitude:108.77875456, latitude:-5.63259145, V:3.559, B:3.674},
{longitude:113.39478684, latitude:-48.45066894, V:1.84, B:2.52},
{longitude:115.62950939, latitude:-48.55880939, V:3.82, B:3.64},
{longitude:120.21598919, latitude:-58.2436606, V:2.1, B:2.69},
{longitude:120.29841918, latitude:-58.52254071, V:2.7, B:4.32},
{longitude:108.9573592, latitude:5.76092218, V:3.79, B:4.83},
{longitude:108.51930589, latitude:-.17578065, V:3.53, B:3.87},
{longitude:112.19145759, latitude:-13.48466347, V:2.89, B:2.8},
{longitude:119.53482602, latitude:-50.60635405, V:2.45, B:2.37},
{longitude:110.24037569, latitude:10.098343, V:1.58, B:1.62},
{longitude:115.78519226, latitude:-16.01713439, V:.37, B:.79},
{longitude:119.28015006, latitude:-30.45112524, V:3.93, B:4.95},
{longitude:113.21576807, latitude:6.68672456, V:1.14, B:2.14},
{longitude:113.66583531, latitude:3.08107171, V:3.57, B:4.49},
{longitude:126.04005841, latitude:-44.93722634, V:3.3, B:4.56},
{longitude:125.88290751, latitude:-49.20955561, V:3.93, B:4.09},
{longitude:130.88368844, latitude:-57.72935516, V:3.61, B:5.34},
{longitude:135.07428868, latitude:-59.69966203, V:3.696, B:4.717},
{longitude:138.54741064, latitude:-58.34592164, V:2.25, B:1.98},
{longitude:131.38718097, latitude:-43.26804224, V:2.81, B:3.24},
{longitude:124.25703914, latitude:-10.28531458, V:3.52, B:5},
{longitude:129.85189844, latitude:-22.44730075, V:3.9, B:3.88},
{longitude:128.72199276, latitude:.07931452, V:3.94, B:5.02},
{longitude:132.34441111, latitude:-11.10206932, V:3.38, B:4.06},
{longitude:146.49782049, latitude:-48.92137415, V:3.68, B:3.5},
{longitude:146.79793347, latitude:-51.15421816, V:3.954, B:4.885},
{longitude:134.57529326, latitude:-10.96760661, V:3.1, B:4.1},
{longitude:345.49610427, latitude:-40.63376525, V:2.37, B:3.46},
{longitude:344.51996388, latitude:-41.79502959, V:3.94, B:4.11},
{longitude:317.42017663, latitude:-23.05213358, V:3.01, B:2.89},
{longitude:333.86121247, latitude:-21.13683118, V:1.16, B:1.25},
{longitude:316.93713836, latitude:-6.99282171, V:3.74, B:4.75},
{longitude:321.79088394, latitude:-2.55898967, V:3.67, B:3.98},
{longitude:340.01842714, latitude:-14.49116717, V:3.64, B:4.87},
{longitude:343.45747413, latitude:-14.78726519, V:3.98, B:5.08},
{longitude:323.54265412, latitude:-2.6033113, V:2.83, B:3.12},
{longitude:2.58455295, latitude:-20.78341761, V:2.01, B:3.02},
{longitude:17.81982192, latitude:-24.81501344, V:3.5, B:4.22},
{longitude:338.5959881, latitude:-5.66552927, V:3.98, B:5.57},
{longitude:338.87384129, latitude:-8.19230479, V:3.28, B:3.33},
{longitude:21.95107709, latitude:-20.33352392, V:3.72, B:4.86},
{longitude:38.75094445, latitude:-24.54499715, V:3.87, B:4.99},
{longitude:.91658323, latitude:-10.02164378, V:3.55, B:4.77},
{longitude:11.76826797, latitude:-16.11782241, V:3.45, B:4.61},
{longitude:16.2269066, latitude:-15.76651294, V:3.59, B:4.65},
{longitude:323.39473141, latitude:8.61336893, V:2.89, B:3.71},
{longitude:341.57616344, latitude:-.38751711, V:3.79, B:5.44},
{longitude:333.35200389, latitude:10.66033945, V:2.94, B:3.9},
{longitude:338.90924777, latitude:8.84474314, V:3.65, B:4.06},
{longitude:336.71366456, latitude:8.23407116, V:3.834, B:3.791},
{longitude:351.45286539, latitude:7.25670303, V:3.7, B:4.62},
{longitude:39.43336582, latitude:-11.99437258, V:3.47, B:3.56},
{longitude:323.11641129, latitude:20.12019559, V:3.933, B:4.446},
{longitude:336.83234606, latitude:16.33953661, V:3.55, B:3.62},
{longitude:331.88392023, latitude:22.09859628, V:2.39, B:3.91},
{longitude:346.15076023, latitude:17.67880632, V:3.41, B:3.33},
{longitude:353.48463928, latitude:19.40571684, V:2.48, B:2.44},
{longitude:9.15542807, latitude:12.60036875, V:2.84, B:2.61},
{longitude:26.81572088, latitude:5.37890899, V:3.62, B:4.6},
{longitude:353.05361319, latitude:28.7959969, V:3.93, B:5},
{longitude:33.96967077, latitude:8.48878922, V:2.65, B:2.78},
{longitude:354.38436202, latitude:29.386611, V:3.48, B:4.42},
{longitude:37.66209774, latitude:9.9667968, V:2.01, B:3.17},
{longitude:344.40686244, latitude:34.25475431, V:3.77, B:4.2},
{longitude:359.3725144, latitude:31.14048432, V:2.42, B:4.09},
{longitude:14.30718753, latitude:25.68112428, V:2.06, B:1.95},
{longitude:355.71118055, latitude:35.10788051, V:2.95, B:3.81},
{longitude:21.81232963, latitude:24.35181476, V:3.28, B:4.56},
{longitude:36.86023012, latitude:16.80215179, V:3.42, B:3.9},
{longitude:48.20319534, latitude:10.45175043, V:3.594, B:3.498},
{longitude:333.0390636, latitude:43.69343561, V:3.21, B:4.2},
{longitude:29.17390396, latitude:29.66009737, V:3.87, B:3.99},
{longitude:30.40407467, latitude:25.94475829, V:2.05, B:3.62},
{longitude:27.84753907, latitude:33.34989633, V:3.44, B:4.36},
{longitude:42.35181232, latitude:20.58254382, V:3, B:3.14},
{longitude:7.776831, latitude:43.75061456, V:3.62, B:3.53},
{longitude:130.57136389, latitude:20.10270118, V:3.92, B:3.96},
{longitude:131.84307091, latitude:17.96607274, V:3.14, B:4.69},
{longitude:147.27825491, latitude:-22.38089943, V:1.97, B:3.42},
{longitude:144.24690978, latitude:-3.75559453, V:3.52, B:4.01},
{longitude:147.64122111, latitude:-14.27573047, V:3.91, B:5.23},
{longitude:141.43049173, latitude:12.35058355, V:3.88, B:5.1},
{longitude:140.70523214, latitude:9.71713271, V:2.98, B:3.79},
{longitude:147.90530824, latitude:4.86717316, V:3.41, B:3.39},
{longitude:147.56596555, latitude:11.86655323, V:3.41, B:3.72},
{longitude:149.82915343, latitude:.46622604, V:1.4, B:1.24},
{longitude:159.36599387, latitude:-22.0130274, V:3.61, B:4.61},
{longitude:141.23611182, latitude:28.99980414, V:3.05, B:4.64},
{longitude:149.61540924, latitude:8.81625906, V:1.98, B:3.13},
{longitude:149.6153961, latitude:8.81625027, V:2.37, B:3.79},
{longitude:165.03523964, latitude:-24.67074628, V:3.81, B:5.29},
{longitude:156.3889308, latitude:.15083577, V:3.87, B:3.72},
{longitude:170.36493684, latitude:-21.7975793, V:3.11, B:4.35},
{longitude:150.87808643, latitude:24.93249145, V:3.83, B:4.87},
{longitude:161.31725461, latitude:14.33446798, V:2.53, B:2.68},
{longitude:163.42347114, latitude:9.67509441, V:3.35, B:3.33},
{longitude:156.65487516, latitude:26.16355246, V:3.49, B:4.89},
{longitude:157.34315417, latitude:24.72585653, V:3.79, B:4.38},
{longitude:176.6860846, latitude:-17.57232524, V:3.56, B:4.67},
{longitude:187.98637086, latitude:-31.59894207, V:3.54, B:4.47},
{longitude:171.61812479, latitude:12.26727704, V:2.13, B:2.22},
{longitude:177.16418869, latitude:.69439029, V:3.6, B:4.15},
{longitude:191.66440142, latitude:-19.67410712, V:2.98, B:4.32},
{longitude:184.83216637, latitude:1.36500073, V:3.9, B:3.92},
{longitude:190.72493077, latitude:-14.50141705, V:2.58, B:2.47},
{longitude:193.45115319, latitude:-12.19693713, V:2.94, B:2.89},
{longitude:190.14152652, latitude:2.78975694, V:3.44, B:3.8},
{longitude:190.14121783, latitude:2.7896179, V:3.49, B:3.85},
{longitude:190.14159332, latitude:2.78980939, V:2.74, B:3.1},
{longitude:197.36707019, latitude:-18.04544448, V:2.64, B:3.52},
{longitude:174.56903675, latitude:40.12129685, V:2.88, B:2.76},
{longitude:191.46129503, latitude:8.61288872, V:3.38, B:4.97},
{longitude:189.9410408, latitude:16.20449181, V:2.79, B:3.71},
{longitude:203.84126721, latitude:-2.05560434, V:.97, B:.74},
{longitude:207.01769419, latitude:-13.74386665, V:3, B:3.92},
{longitude:213.12770172, latitude:-26.01775233, V:2.73, B:2.76},
{longitude:202.13459865, latitude:8.63552373, V:3.38, B:3.5},
{longitude:216.47671304, latitude:-27.61718026, V:3.88, B:5.04},
{longitude:199.33798352, latitude:28.07620524, V:2.68, B:3.25},
{longitude:218.62340761, latitude:-13.05125866, V:3.28, B:4.41},
{longitude:222.30769661, latitude:-22.0817592, V:2.05, B:3.04},
{longitude:204.2351117, latitude:30.73510013, V:-.05, B:1.18},
{longitude:202.78825089, latitude:42.45070965, V:3.59, B:4.89},
{longitude:208.10840293, latitude:40.6235828, V:2.39, B:3.36},
{longitude:208.10843771, latitude:40.6235748, V:2.45, B:3.61},
{longitude:213.03878921, latitude:27.87698598, V:3.78, B:3.83},
{longitude:218.51789459, latitude:17.09944403, V:3.73, B:3.72},
{longitude:220.13153899, latitude:9.67028396, V:3.88, B:4.26},
{longitude:225.082675, latitude:.33111886, V:2.75, B:2.9},
{longitude:237.49368858, latitude:-17.18060124, V:3.546, B:5.076},
{longitude:245.7711032, latitude:-17.44718242, V:3.41, B:3.19},
{longitude:257.2370052, latitude:-19.64659196, V:3.62, B:4.99},
{longitude:257.08327201, latitude:-19.12550534, V:2.6, B:2.83},
{longitude:260.74269732, latitude:-20.18625775, V:3.33, B:3.74},
{longitude:265.59933643, latitude:-19.6478682, V:1.85, B:2.29},
{longitude:286.63603714, latitude:-18.38279393, V:3.943, B:3.841},
{longitude:267.52246924, latitude:-16.71715288, V:2.992, B:3.492},
{longitude:242.84026063, latitude:-13.18210119, V:3.946, B:3.909},
{longitude:256.24603946, latitude:-15.38514864, V:3.542, B:3.343},
{longitude:256.15538341, latitude:-15.42583511, V:2.98, B:2.82},
{longitude:264.01261038, latitude:-14.01105427, V:2.7, B:2.47},
{longitude:264.58564861, latitude:-13.79120236, V:1.62, B:1.48},
{longitude:266.46939936, latitude:-15.64708671, V:2.386, B:2.211},
{longitude:267.91783487, latitude:-13.62509603, V:3.21, B:4.38},
{longitude:273.62779507, latitude:-13.38062708, V:3.11, B:4.67},
{longitude:239.35072553, latitude:-10.02319056, V:3.642, B:3.481},
{longitude:255.3349766, latitude:-11.74118812, V:2.29, B:3.45},
{longitude:275.07858799, latitude:-11.05454628, V:1.85, B:1.82},
{longitude:230.68701077, latitude:-7.6465958, V:3.21, B:4.91},
{longitude:238.60918162, latitude:-8.50985377, V:3.589, B:4.979},
{longitude:243.14616005, latitude:-8.60152722, V:3.86, B:3.66},
{longitude:281.93801948, latitude:-7.61032722, V:3.6, B:4.5},
{longitude:242.93975773, latitude:-5.47782901, V:2.91, B:2.71},
{longitude:249.76221697, latitude:-4.57253447, V:.91, B:2.75},
{longitude:251.45681393, latitude:-6.12302185, V:2.81, B:2.56},
{longitude:271.26144332, latitude:-6.99391614, V:2.99, B:4},
{longitude:274.5809032, latitude:-6.47498333, V:2.668, B:4.069},
{longitude:284.83431371, latitude:-5.09154515, V:3.31, B:4.51},
{longitude:283.63850164, latitude:-7.18155219, V:2.585, B:2.685},
{longitude:242.57118621, latitude:-1.98850025, V:2.32, B:2.2},
{longitude:247.799524, latitude:-4.03991895, V:2.89, B:3.02},
{longitude:276.31710292, latitude:-2.13836024, V:2.81, B:3.85},
{longitude:280.1813772, latitude:-3.95671868, V:3.14, B:3.05},
{longitude:282.38536549, latitude:-3.4522153, V:2.067, B:1.923},
{longitude:243.66935187, latitude:.21816135, V:3.97, B:3.92},
{longitude:261.39483387, latitude:-1.8462464, V:3.26, B:3.03},
{longitude:284.99404359, latitude:.85735375, V:3.77, B:4.77},
{longitude:243.19002476, latitude:1.00536549, V:2.5, B:2.43},
{longitude:243.19004457, latitude:1.00530426, V:2.62, B:2.55},
{longitude:273.21349257, latitude:2.33932912, V:3.85, B:4.07},
{longitude:283.45111298, latitude:1.65855376, V:3.51, B:4.69},
{longitude:286.25178921, latitude:1.43442507, V:2.88, B:3.22},
{longitude:235.13815293, latitude:4.38366547, V:3.91, B:4.93},
{longitude:289.44999289, latitude:4.22142592, V:3.93, B:4.15},
{longitude:304.04715209, latitude:4.58628774, V:3.08, B:3.87},
{longitude:257.96965435, latitude:7.19510227, V:2.42, B:2.47},
{longitude:257.96947653, latitude:7.19481043, V:3.26, B:3.36},
{longitude:257.96958292, latitude:7.19485911, V:2.463, B:2.564},
{longitude:264.54608761, latitude:7.93196871, V:3.519, B:3.788},
{longitude:303.85839821, latitude:6.92788153, V:3.58, B:4.51},
{longitude:229.3719532, latitude:8.49384527, V:2.62, B:2.51},
{longitude:249.22938977, latitude:11.38874829, V:2.56, B:2.58},
{longitude:311.72293333, latitude:8.07848557, V:3.77, B:3.77},
{longitude:269.75318095, latitude:13.66268917, V:3.34, B:4.33},
{longitude:279.01639292, latitude:14.91742875, V:3.83, B:5.17},
{longitude:235.93949797, latitude:16.23591904, V:3.53, B:3.49},
{longitude:242.30252325, latitude:17.23875773, V:2.75, B:4.34},
{longitude:243.51042121, latitude:16.4372166, V:3.23, B:4.21},
{longitude:275.67904182, latitude:20.43275281, V:3.25, B:4.19},
{longitude:287.33208405, latitude:17.56309813, V:3.43, B:3.34},
{longitude:304.91297082, latitude:18.72548135, V:3.22, B:3.15},
{longitude:245.59437399, latitude:23.55340279, V:3.9, B:3.94},
{longitude:266.63261041, latitude:26.10843851, V:3.75, B:3.8},
{longitude:300.43316908, latitude:21.52089846, V:3.8, B:4.61},
{longitude:234.33171416, latitude:24.00447861, V:3.693, B:3.844},
{longitude:265.33685182, latitude:27.93698433, V:2.75, B:3.93},
{longitude:270.17980162, latitude:26.36798455, V:3.93, B:3.96},
{longitude:293.63721636, latitude:24.81454066, V:3.36, B:3.68},
{longitude:232.07595898, latitude:25.50583408, V:2.63, B:3.8},
{longitude:302.42289712, latitude:26.65682919, V:3.71, B:4.56},
{longitude:251.82200599, latitude:31.83355839, V:3.2, B:4.36},
{longitude:272.16025029, latitude:32.98660221, V:3.73, B:3.85},
{longitude:301.77560004, latitude:29.30111548, V:.76, B:.98},
{longitude:262.44888095, latitude:35.83247462, V:2.07, B:2.22},
{longitude:300.93808662, latitude:31.24121089, V:2.72, B:4.23},
{longitude:256.15242762, latitude:37.28350793, V:3.33, B:4.67},
{longitude:256.15245884, latitude:37.2834798, V:3.06, B:4.51},
{longitude:289.79532398, latitude:36.18312213, V:2.99, B:3},
{longitude:229.94966717, latitude:34.32456811, V:3.67, B:3.73},
{longitude:232.78246718, latitude:35.19351885, V:3.84, B:4.34},
{longitude:316.34010091, latitude:31.91604817, V:3.63, B:4.07},
{longitude:239.21562955, latitude:40.00540175, V:3.76, B:4.03},
{longitude:277.79746131, latitude:45.0460624, V:3.84, B:5.02},
{longitude:297.20202022, latitude:41.62494988, V:3.6, B:3.93},
{longitude:303.38599844, latitude:38.9105688, V:3.82, B:5.23},
{longitude:307.04227804, latitude:39.18801285, V:3.47, B:5.04},
{longitude:317.37926096, latitude:33.02046282, V:3.8, B:3.74},
{longitude:241.09250908, latitude:42.69998674, V:2.77, B:3.7},
{longitude:254.76431322, latitude:47.68295648, V:3.13, B:3.21},
{longitude:319.35019155, latitude:35.90667145, V:3.7, B:12.46},
{longitude:265.22494403, latitude:51.10111597, V:3.42, B:4.17},
{longitude:269.19571727, latitude:52.68285087, V:3.7, B:4.64},
{longitude:272.69633405, latitude:52.18137653, V:3.827, B:3.802},
{longitude:301.24999355, latitude:48.96534975, V:3.08, B:4.21},
{longitude:222.29777954, latitude:44.32167769, V:2.24, B:2.22},
{longitude:241.46129174, latitude:53.10726233, V:2.8, B:3.43},
{longitude:248.32836244, latitude:53.24577362, V:3.92, B:3.91},
{longitude:291.92088333, latitude:55.01040172, V:3.25, B:3.2},
{longitude:219.11898094, latitude:46.05232312, V:3.68, B:3.97},
{longitude:288.8823833, latitude:55.98154073, V:3.42, B:3.42},
{longitude:252.06889053, latitude:59.54817412, V:3.18, B:4.61},
{longitude:268.47708505, latitude:60.68211685, V:3.88, B:5.23},
{longitude:285.31503198, latitude:61.73020253, V:.03, B:.03},
{longitude:291.28384911, latitude:59.3689735, V:3.8, B:4.58},
{longitude:312.92537316, latitude:54.272497, V:3.88, B:4.91},
{longitude:213.16012296, latitude:48.96405902, V:3.49, B:4.44},
{longitude:238.79020193, latitude:60.28744527, V:3.5, B:4.42},
{longitude:327.7428923, latitude:49.42078472, V:2.48, B:3.52},
{longitude:128.68708675, latitude:-63.77237822, V:3.25, B:4.77},
{longitude:45.82754033, latitude:-61.7288115, V:3.86, B:4.96},
{longitude:147.34472365, latitude:-64.46268032, V:1.83, B:1.58},
{longitude:117.72232871, latitude:-72.85077703, V:2.93, B:4.13},
{longitude:104.95770976, latitude:-75.82121672, V:-.74, B:-.59},
{longitude:82.54483739, latitude:-74.42078698, V:3.86, B:4.03},
{longitude:164.73539739, latitude:-51.16310938, V:3.6, B:3.96},
{longitude:164.73514876, latitude:-51.16330639, V:3.91, B:4.25},
{longitude:161.18378514, latitude:-55.86994365, V:2.21, B:3.86},
{longitude:157.49045079, latitude:-60.13574484, V:3.91, B:3.91},
{longitude:156.5356097, latitude:-61.14491638, V:3.81, B:4.52},
{longitude:163.81446604, latitude:-59.32064987, V:3.75, B:4.95},
{longitude:150.72241958, latitude:-70.32527845, V:3.431, B:3.267},
{longitude:37.83735857, latitude:-74.58005533, V:3.28, B:3.18},
{longitude:164.72797293, latitude:-66.27563432, V:3.63, B:3.44},
{longitude:176.99261561, latitude:-48.25887819, V:3.85, B:3.9},
{longitude:168.94142412, latitude:-67.19725206, V:1.95, B:2},
{longitude:173.12039495, latitude:-72.67957059, V:1.86, B:3.13},
{longitude:144.0972643, latitude:-83.03821263, V:3.3, B:3.48},
{longitude:52.14196621, latitude:-85.04201836, V:3.76, B:4.58},
{longitude:178.88643705, latitude:-63.72165131, V:2.473, B:2.324},
{longitude:7.51881503, latitude:-78.04012288, V:3.36, B:4.27},
{longitude:1.00448173, latitude:-58.98555983, V:3.57, B:3.45},
{longitude:185.94183731, latitude:-59.95077506, V:3.45, B:3.35},
{longitude:184.20802622, latitude:-64.23865444, V:3.139, B:4.691},
{longitude:183.40847706, latitude:-67.52780802, V:3.4, B:3.25},
{longitude:185.3197884, latitude:-67.11660268, V:2.26, B:2.44},
{longitude:183.68202006, latitude:-70.13705594, V:3.8, B:3.74},
{longitude:199.40390218, latitude:-82.47804578, V:3.99, B:4.78},
{longitude:351.40615691, latitude:-76.08845402, V:3.833, B:4.968},
{longitude:356.25146798, latitude:-57.01754625, V:3.7, B:4.55},
{longitude:358.14647661, latitude:-47.58511758, V:3.41, B:4.98},
{longitude:187.38776454, latitude:-51.05938771, V:3.84, B:4.13},
{longitude:190.85104809, latitude:-69.47980668, V:3.943, B:3.774},
{longitude:200.58525077, latitude:-72.20234234, V:3.99, B:4.144},
{longitude:195.16160978, latitude:-75.58591361, V:3.759, B:4.896},
{longitude:219.84256072, latitude:-82.61869074, V:3.746, B:4.774},
{longitude:353.62559824, latitude:-52.5829303, V:3.935, B:4.918},
{longitude:190.51248737, latitude:-51.08824668, V:2.7, B:3.66},
{longitude:190.51245278, latitude:-51.08825865, V:2.69, B:3.59},
{longitude:197.06246956, latitude:-66.30994802, V:3.4, B:4.33},
{longitude:202.88052952, latitude:-67.49953917, V:2.99, B:3.25},
{longitude:225.75009136, latitude:-79.38942383, V:3.944, B:4.977},
{longitude:342.12347003, latitude:-64.24300207, V:2.84, B:3.13},
{longitude:350.44216569, latitude:-48.19996027, V:3.3, B:4.19},
{longitude:197.84244103, latitude:-59.88732734, V:3.81, B:4.111},
{longitude:200.07061261, latitude:-62.60588649, V:3.35, B:4.899},
{longitude:203.053534, latitude:-61.44739508, V:3.27, B:3.18},
{longitude:211.961555, latitude:-72.23746467, V:1.69, B:1.69},
{longitude:310.48012387, latitude:-76.75903516, V:3.26, B:4.88},
{longitude:202.43321196, latitude:-57.57578959, V:3.79, B:4.74},
{longitude:209.18485131, latitude:-62.1403636, V:2.76, B:2.54},
{longitude:217.43433081, latitude:-67.38403798, V:3.33, B:3.25},
{longitude:207.33736128, latitude:-56.95964305, V:3.9, B:4.23},
{longitude:205.1239309, latitude:-56.28883393, V:3.83, B:5.09},
{longitude:214.54070063, latitude:-56.79081229, V:3.14, B:3.1},
{longitude:312.14334453, latitude:-64.58776513, V:2.2, B:2.79},
{longitude:220.98847779, latitude:-58.50872876, V:3.65, B:3.81},
{longitude:300.97443072, latitude:-64.78716929, V:2.79, B:3.41},
{longitude:339.65035567, latitude:-41.95698067, V:3.87, B:4.89},
{longitude:207.47996212, latitude:-44.51096979, V:2.52, B:2.39},
{longitude:209.38969669, latitude:-45.58395571, V:3.96, B:3.81},
{longitude:215.66208762, latitude:-50.42110641, V:2.752, B:2.568},
{longitude:234.01562108, latitude:-58.87283678, V:3.88, B:3.73},
{longitude:216.73720151, latitude:-47.83284947, V:1.64, B:3.23},
{longitude:218.27280565, latitude:-51.21379769, V:3.59, B:5.01},
{longitude:230.15133228, latitude:-55.24480852, V:3.55, B:3.38},
{longitude:230.37149157, latitude:-56.55909183, V:2.649, B:2.484},
{longitude:236.1876967, latitude:-56.77783039, V:3.62, B:4.8},
{longitude:211.32822113, latitude:-40.12675104, V:3.86, B:3.91},
{longitude:210.72338589, latitude:-42.3892727, V:3.91, B:3.72},
{longitude:221.64370063, latitude:-48.64061116, V:1.25, B:1.02},
{longitude:254.42866415, latitude:-58.23751296, V:3.798, B:5.247},
{longitude:289.69023079, latitude:-57.78192602, V:3.728, B:4.745},
{longitude:320.44229356, latitude:-47.85171677, V:3.98, B:4.37},
{longitude:212.31517027, latitude:-40.16387056, V:2.17, B:2.16},
{longitude:262.70304113, latitude:-56.00983204, V:3.854, B:4.783},
{longitude:309.67314684, latitude:-45.40588173, V:2.82, B:4.18},
{longitude:320.73172696, latitude:-39.78954331, V:3.466, B:3.556},
{longitude:328.50548325, latitude:-36.25488643, V:3.877, B:4.877},
{longitude:249.39237586, latitude:-48.1054566, V:2.89, B:2.89},
{longitude:283.53043378, latitude:-50.88863203, V:3.94, B:3.927},
{longitude:225.55320541, latitude:-39.58796192, V:2.3, B:2.08},
{longitude:242.3613232, latitude:-46.20500027, V:3.19, B:3.43},
{longitude:292.49526924, latitude:-45.95720145, V:3.408, B:3.577},
{longitude:322.32886671, latitude:-35.43374149, V:2.11, B:3.73},
{longitude:239.47803518, latitude:-42.5967165, V:.01, B:.72},
{longitude:239.46003249, latitude:-42.60080802, V:-.1, B:.4},
{longitude:239.47643385, latitude:-42.60113772, V:1.33, B:2.21},
{longitude:260.89541673, latitude:-46.1540802, V:1.92, B:3.36},
{longitude:287.61407818, latitude:-44.70205807, V:3.56, B:4.32},
{longitude:321.60378717, latitude:-31.34911073, V:3.97, B:5},
{longitude:224.949345, latitude:-32.94530329, V:2.55, B:2.33},
{longitude:251.84046343, latitude:-41.94858181, V:2.85, B:3.14},
{longitude:254.85627267, latitude:-41.61689207, V:3.839, B:4.943},
{longitude:267.97335139, latitude:-41.31242836, V:3.581, B:4.769},
{longitude:297.7867066, latitude:-39.15950249, V:3.65, B:4.9},
{longitude:315.90826209, latitude:-32.91516855, V:1.71, B:1.58},
{longitude:221.15312561, latitude:-28.26981079, V:3.386, B:3.188},
{longitude:221.53505224, latitude:-28.98105974, V:3.43, B:3.27},
{longitude:224.34259841, latitude:-30.45445513, V:3.87, B:3.67},
{longitude:293.81828715, latitude:-36.27015023, V:1.918, B:1.791},
{longitude:223.03719671, latitude:-28.00223088, V:3.802, B:3.608},
{longitude:228.78756527, latitude:-30.19362027, V:3.529, B:3.355},
{longitude:233.50282665, latitude:-30.02807993, V:2.286, B:2.126},
{longitude:240.75670709, latitude:-32.83392398, V:3.41, B:4.33},
{longitude:258.90388118, latitude:-36.2790792, V:3.744, B:5.306},
{longitude:265.55651643, latitude:-37.35870553, V:3.62, B:3.52},
{longitude:239.47077416, latitude:-29.65677003, V:3.7, B:3.67},
{longitude:259.82362204, latitude:-33.09435731, V:3.076, B:4.701},
{longitude:264.29305136, latitude:-33.11243953, V:3.34, B:3.21},
{longitude:230.2480329, latitude:-25.51510634, V:2.31, B:2.12},
{longitude:237.6316663, latitude:-28.40627495, V:3.89, B:3.75},
{longitude:264.20565814, latitude:-32.267691, V:2.85, B:4.31},
{longitude:299.10488664, latitude:-27.75605496, V:3.11, B:4.11},
{longitude:234.79400523, latitude:-24.0336281, V:3.11, B:2.93},
{longitude:235.02479456, latitude:-25.04839436, V:2.68, B:2.46},
{longitude:240.12163804, latitude:-25.24753676, V:3.366, B:3.191},
{longitude:238.65627324, latitude:-21.4282149, V:3.19, B:2.995},
{longitude:264.93412787, latitude:-26.5633196, V:2.95, B:2.78},
{longitude:271.19004733, latitude:-26.66179207, V:3.66, B:3.58},
{longitude:241.49744738, latitude:-21.24641357, V:2.765, B:2.586},
{longitude:241.49742575, latitude:-21.24645508, V:3.48, B:3.3},
{longitude:241.49722287, latitude:-21.24647934, V:3.51, B:3.33},
{longitude:275.07366227, latitude:-22.65060965, V:3.463, B:3.299},
{longitude:301.25002263, latitude:48.9653428, V:3.2, B:4.63},
{longitude:256.78470169, latitude:53.5183815, V:1.07, B:1.05},
{longitude:328.06152114, latitude:63.600339, V:3.8, B:5.08},
{longitude:39.43337671, latitude:-11.99436785, V:3.54, B:3.617},
{longitude:34.61453186, latitude:-44.68928522, V:3.98, B:4.51},
{longitude:241.46333351, latitude:53.10674084, V:2.88, B:3.52},
{longitude:212.31489689, latitude:-40.16365205, V:2.88, B:2.91},
{longitude:224.38883626, latitude:65.82796062, V:3.87, B:3.73},
{longitude:122.8006773, latitude:29.57760377, V:3.13, B:3.36},
{longitude:104.08110888, latitude:-39.60257132, V:-1.46, B:-1.46},
{longitude:212.31517816, latitude:-40.16391447, V:2.82, B:2.84},
{longitude:205.37016862, latitude:-71.30830224, V:3.27, B:15.96},
{longitude:173.12037925, latitude:-72.67957083, V:2.01, B:3.86},
{longitude:173.12076235, latitude:-72.67954844, V:3.85, B:3.93},
{longitude:32.68176816, latitude:79.49174858, V:3.91, B:4.83},
{longitude:221.86720291, latitude:-52.88070302, V:1.28, B:1.1},
{longitude:221.86895933, latitude:-52.88035467, V:1.58, B:1.41},
{longitude:23.27578753, latitude:-53.73909232, V:3.18, B:3.33},
{longitude:345.31578641, latitude:-59.37884354, V:.46, B:.3},
{longitude:80.15783254, latitude:-25.53079294, V:3.59, B:3.42},
{longitude:80.15836413, latitude:-25.53071947, V:3.594, B:3.417}];


	var mapWidth = canvasElongation.width - 100;
	var mapHeight = canvasElongation.height - 100;
	var mapCenterX = canvasElongation.width / 2;
	var mapCenterY = canvasElongation.height / 2;

// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);


// as long as it isn't paussed, advance the timer
	if (!pause)
		timer = timer + 1.0 / 30.0 * speed;

// draw a black sqaure for the orbit area box
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);
// draw a black square for the map area box
	contextElongation.fillStyle = "#000000";
	contextElongation.fillRect(0,0,canvasElongation.width,canvasElongation.height);
// set the size of the Sun based on the Zoom level
	var sunSize = 0.03 * zoom;
	if (sunSize < 3.0)
		sunSize = 3.0;
// draw the Sun
	theContext.fillStyle  = "#FFFF00";
	theContext.beginPath();
	theContext.arc(theCanvas.width / 2,theCanvas.height / 2,sunSize,0,2.0*Math.PI,true);
	theContext.closePath();
	theContext.fill();
// calculate the position of each planet
	for (pi = 0; pi < 8; pi++)
	{
		var period = Math.pow(orbitalRadii[pi],1.5);
		currPosition[pi] = (-timer / period * Math.PI + positions[pi]) % (2.0 * Math.PI);
	}
// draw the orbit and symbol for each planet
	for (pi = 0; pi < 8; pi++)
	{

		theContext.strokeStyle  = "#3F3F3F";
		theContext.beginPath();
		theContext.arc(theCanvas.width / 2,theCanvas.height / 2,zoom * orbitalRadii[pi] ,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.stroke();

		theContext.fillStyle  = pStyle[pi];
		theContext.beginPath();
		theContext.arc(theCanvas.width / 2 + zoom * orbitalRadii[pi] * Math.cos(currPosition[pi]),theCanvas.height / 2 + zoom * orbitalRadii[pi] * Math.sin(currPosition[pi]),2,0,2.0*Math.PI,true);
		theContext.closePath();
		theContext.fill();
	}
// draw the stars on the map
	var i;
	for (i = 0; i < stars.length; i++)
	{
		//if (stars[i].V < 2.0)
		//{
			var BmV = stars[i].B - stars[i].V;
			var colorStyle
			var cB = 255;
			var cG = 255;
			var cR = 255;

			if (BmV < 0.0)
			{
				cR = 127;
				cG = 127;
			}
			else if (BmV > 1.35)
			{
				cR = 255;
				cG = 0;
				cB = 0;
			}
			else if (BmV <0.65)
			{
				var Bdel = Math.round(BmV / 0.65 * 128.0) + 127;
				cR = Bdel;
				cG = Bdel;
				cB = 255;
			}
			else
			{
				var Bdel = Math.round((1.35 - BmV) / 0.70 * 255.0);
				cR = 255;
				cG = Bdel;
				cB = Bdel;
			}
			var bright = 1.0 - stars[i].V / 6.0;
			if (bright > 1.0)
				bright = 1.0;
			cR *= bright;
			cG *= bright;
			cB *= bright;

			colorStyle = "#" + Math.floor(cR).toString(16) + Math.floor(cG).toString(16) + Math.floor(cB).toString(16);
//			if (i == 100 || i == 200 || i == 300)
//			{
//				console.log(stars[i].V + " " + stars[i].B + " " + colorStyle);
//			}

			var sunLongitude = 360.0 - currPosition[2] * 180.0 / Math.PI;
			var projection = new Mollweide(stars[i].latitude,stars[i].longitude,sunLongitude);
			//console.log("here " + stars[i].latitude + " " + stars[i].longitude + " " + projection.x + " " + projection.y);
			contextElongation.fillStyle  = colorStyle;
			contextElongation.beginPath();
			contextElongation.arc(mapCenterX + projection.x * mapWidth * 0.5,mapCenterY + projection.y * mapHeight * 0.5,1,0,2.0*Math.PI,true);
			contextElongation.closePath();
			contextElongation.fill();
		//}
	}

// draw the ellipse for the map
	contextElongation.strokeStyle  = "#FFFFFF";
	drawEllipseByCenter(contextElongation,mapCenterX,mapCenterY,mapWidth,mapHeight);
// draw the ecliptic on the map
	contextElongation.strokeStyle  = "#3F3F3F";
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY );
	contextElongation.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY);
	contextElongation.stroke();
// draw the Sun on the map
	contextElongation.fillStyle  = "#FFFF00";
	contextElongation.beginPath();
	contextElongation.arc(mapCenterX,mapCenterY,1,0,2.0*Math.PI,true);
	contextElongation.closePath();
	contextElongation.fill();
// draw the elongation reference on the map
	contextElongation.font = "10px Ariel";

	contextElongation.strokeStyle = "#7F7F7F"
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY);
	contextElongation.lineTo(mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"-180",mapCenterX - mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);

	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
	contextElongation.lineTo(mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"-90",mapCenterX - mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	drawTextCenter(contextElongation,"0",mapCenterX,mapCenterY + mapHeight * 0.5 + 10);
	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 * Math.sqrt(0.75));
	contextElongation.lineTo(mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"+90",mapCenterX + mapWidth * 0.25,mapCenterY + mapHeight * 0.5 + 10);

	contextElongation.beginPath();
	contextElongation.moveTo(mapCenterX + mapWidth * 0.5,mapCenterY);
	contextElongation.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5);
	contextElongation.stroke();
	drawTextCenter(contextElongation,"+180",mapCenterX + mapWidth * 0.5,mapCenterY + mapHeight * 0.5 + 10);
// determine which planet is currently selected
	var selectedElongation = 1; // Venus

	var radios = document.getElementById("mercury");
	var selectedPlanet = "Venus";
	if (radios.checked === true)
	{
		selectedElongation  = 0;
		selectedPlanet = "Mercury"
	}
	radios = document.getElementById("mars");
	if (radios.checked === true)
	{
		selectedElongation  = 3;
		selectedPlanet = "Mars"
	}
	radios = document.getElementById("jupiter");
	if (radios.checked === true)
	{
		selectedElongation  = 4;
		selectedPlanet = "Jupiter"
	}
	radios = document.getElementById("saturn");
	if (radios.checked === true)
	{
		selectedElongation  = 5;
		selectedPlanet = "Saturn"
	}
	radios = document.getElementById("uranus");
	if (radios.checked === true)
	{
		selectedElongation  = 6;
		selectedPlanet = "Uranus"
	}
	radios = document.getElementById("neptune");
	if (radios.checked === true)
	{
		selectedElongation  = 7;
		selectedPlanet = "Neptune"
	}
// determine the relative orbital phase angles between the planet and Earth
	var phi = (currPosition[selectedElongation] - currPosition[2]) % (Math.PI * 2.0);
// determine the elongation of the selected planet
	var elongation = -Math.atan2(orbitalRadii[selectedElongation] * Math.sin(phi),1.0 - orbitalRadii[selectedElongation] * Math.cos(phi)) * 180.0 / Math.PI;
	var projection = new Mollweide(0.0,elongation,0.0);
// draw the selected planet on the map
	contextElongation.fillStyle  = pStyle[selectedElongation];
	contextElongation.beginPath();
	contextElongation.arc(projection.x * mapWidth * 0.5 + mapCenterX,projection.y * mapHeight * 0.5 + mapCenterY,2,0,2.0*Math.PI,true);
	contextElongation.closePath();
	contextElongation.fill();
// draw planet information on the map
	contextElongation.fillStyle = "#FFFF00"
	contextElongation.font = "15px Ariel";
	drawTextRight(contextElongation,"Planet: ",mapCenterX - 150,mapCenterY + mapHeight * 0.5 + 35);
	contextElongation.fillText(selectedPlanet,mapCenterX - 150,mapCenterY + mapHeight * 0.5 + 35);
	drawTextCenter(contextElongation,"Elongation: " + Math.round(elongation).toString(),mapCenterX + 10,mapCenterY + mapHeight * 0.5 + 35);
	var timerReadable = Math.round(timer * 10.0) / 10.0
	contextElongation.fillText("Time: " + timerReadable.toString() + " years",mapCenterX + 150,mapCenterY + mapHeight * 0.5 + 35);



// draw the lines onto the overhead view to demonstrate the elongation
	theContext.strokeStyle = "#FFFF00"
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2,theCanvas.height / 2);
	theContext.lineTo(theCanvas.width / 2 + zoom * orbitalRadii[2] * Math.cos(currPosition[2]),theCanvas.height / 2 + zoom * orbitalRadii[2] * Math.sin(currPosition[2]));
	theContext.lineTo(theCanvas.width / 2 + zoom * orbitalRadii[selectedElongation] * Math.cos(currPosition[selectedElongation]),theCanvas.height / 2 + zoom * orbitalRadii[selectedElongation] * Math.sin(currPosition[selectedElongation]));
	theContext.stroke();


	
	window.setTimeout(work, 1000.0/30.0);
}

work();

