// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan
// Copyright (c) 2020,2021, Brian W. Mulligan


var theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;


//theCanvas.height = window.innerHeight - 60;
//theCanvas.width = theCanvas.height;

var theContext = theCanvas.getContext("2d");


var btnCurr = new SpringButton("SlewNorth",theCanvas.width * 0.5 + 375,70,50,50,function(){latDir = 1;},function(){latDir = 0;});
btnCurr.text = "🡡";
commonUIRegister(btnCurr);

btnCurr = new SpringButton("SlewSouth",theCanvas.width * 0.5 + 375,170,50,50,function(){latDir = -1;},function(){latDir = 0;});
btnCurr.text = "🡣";
commonUIRegister(btnCurr);

var btnCurr = new SpringButton("SlewEast",theCanvas.width * 0.5 + 425,120,50,50,function(){longDir = 1;},function(){longDir = 0;});
btnCurr.text = "🡢";
commonUIRegister(btnCurr);

btnCurr = new SpringButton("SlewWest",theCanvas.width * 0.5 + 325,120,50,50,function(){longDir = -1;},function(){longDir = 0;});
btnCurr.text = "🡠";
commonUIRegister(btnCurr);

var slewButtonArray = new Array();

var slewFast = new RadioButton("Fast","Fast",theCanvas.width * 0.5 + 335,230,60,40);
var slewSlow = new RadioButton("Slow","Slow",theCanvas.width * 0.5 + 405,230,60,40);

slewButtonArray.push(slewFast);
slewButtonArray.push(slewSlow);

var radioSlew = new Radio("Slew","Fast",slewSelect,slewButtonArray);

commonUIRegister(radioSlew);

btnFindMilkyWay = new Button("Find Milky Way",theCanvas.width * 0.5 + 330,280,140,30,findHome);
btnFindMilkyWay.disabled = true;
commonUIRegister(btnFindMilkyWay);

btnCurr = new Button("Take Image",theCanvas.width * 0.5 + 330,355,140,30,takeImage);
commonUIRegister(btnCurr);

btnCurr = new Button("Take Spectrum",theCanvas.width * 0.5 + 330,410,140,30,takeSpectrum);
commonUIRegister(btnCurr);

btnCurr = new Button("Download Measurements",theCanvas.width * 0.5 + 280,465,240,30,downloadMeasurements);
commonUIRegister(btnCurr);

btnCurr = new Button("Download Dist/Vel Data",50,350,240,30,downloadAnalysis);
commonUIRegister(btnCurr);

btnCurr = new Button("Download Hubble Data",50,400,240,30,downloadHubbleAnalysis);
commonUIRegister(btnCurr);

btnReturnMilkyWay = new Button("Return to the Milky Way",theCanvas.width * 0.5 - 225,775,220,30,function(){moveHome(true);});
btnReturnMilkyWay.disabled = true;
commonUIRegister(btnReturnMilkyWay);

btnMoveHome = new Button("Move to a New Galaxy",theCanvas.width * 0.5 + 5,775,220,30,function(){moveHome(false);});
commonUIRegister(btnMoveHome);

var projection = new Mollweide(0,0);

function drawMap(context,width,height)//cx,cy,width,height)
{
	context.save();
//	context.scale(width * 0.5,height * 0.5);
//	context.translate(1.0,1.0);
	context.translate(width * 0.5,height * 0.5);
	context.fillStyle = "#0F0F0F";
//	context.fillRect(-1,-1,2,2);
//	context.fillRect(-width*0.5,-height*0.5,width,height);
	drawEllipseByCenterFill(context,0,0,width,height)
	context.strokeStyle = "#FFFFFF";
	drawEllipseByCenter(context,0,0,width,height)
	
	context.fillStyle = "#FFFFFF";
	var idxLcl;
	
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (idxLcl != currentHome)
		{
			
			var relPos = universe[idxLcl]._position.subtract(universe[currentHome]._position)
			var dist = relPos.radius;
			var long = relPos.theta * 180.0 / Math.PI;//Math.atan2(universe[idxLcl]._position.y - universe[currentHome]._position.y,universe[idxLcl]._position.x - universe[currentHome]._position.x);
			var lat = relPos.psi * 180.0 / Math.PI;//Math.asin(z / dist);
			var proj = projection.calculate(lat,long);
			
			context.fillStyle = "#FFFFFF";


			context.beginPath();
			context.arc(proj.x * width * 0.5,-proj.y * height * 0.5,1.0,0,2.0 * Math.PI);
			context.closePath();
			context.fill();


		}
	}
	
	context.strokeStyle = '#FFFF00';
	var proj = projection.calculate(viewLat * 180.0 / Math.PI,viewLong * 180.0 / Math.PI);
	var radius = 3;//telescopes[0]._FOVdegrees * 0.5 / 360.0 * width;//Math.max(telescopes[0]._FOVdegrees * 0.5 / 360.0 * width,3);
	context.beginPath();
	context.arc(proj.x * width  * 0.5,-proj.y * height  * 0.5,radius,0,2.0 * Math.PI);
	context.stroke();

	context.restore();
}

function clickMap(event,x,y)
{
	var pos = projection.calculateReverse(x * 2.0 - 1.0,1.0 - y * 2.0);
	var nearest = findNearestGalaxy(radians(pos.lat),radians(pos.long));
	setSlewTarget(nearest.lat,nearest.long);
}

var viewMap = new Clickable("Sky Map",theCanvas.width * 0.5 - 250,40,500,250,clickMap,drawMap);
commonUIRegister(viewMap);




function scaleColor(x,color)
{
	var ret = new RGB();
	ret.r = Math.floor((224.0 * (1.0 - color) + 32.0) * x);
	ret.g = ret.r;
	ret.b = Math.floor((128.0 * color + 128.0) * x);
	return ret;
}
function scaleColorElliptical(x,color)
{
	return new RGB(Math.floor(256.0 * x),
						Math.floor(color / 0.3 * 256.0 * x),
						Math.floor((color - 0.3) / 0.7 * 256.0 * x));
}
function scaleColorSpiral(x,color)
{
	var ret = new RGB();
	ret.b = Math.floor(256.0 * x);
	ret.r = Math.floor((color - 0.3) / 0.7 * 256.0 * x);//Math.floor(256.0 * (1.0 - color) * x);
	ret.g = ret.r;
	return ret;
}

function drawElliptical(context,size,color,x)
{
	var effSize = Math.floor(size);
	var midX = effSize * 0.5;
	var midY = effSize * 0.5;
	var imgData = context.createImageData(effSize, effSize);
	var color = scaleColorElliptical(x,color)
	var i;
	for (i = 0; i < imgData.data.length; i += 4) 
	{
		var x = ((i * 0.25) % effSize) - midX;
		var y = Math.floor((i * 0.25) / effSize) - midY;
		var r = Math.sqrt(x * x + y * y) / size * 2.0;

		imgData.data[i+0] = color.r;
		imgData.data[i+1] = color.g;
		imgData.data[i+2] = color.b;
		var alpha = Math.floor((1.0 - r) * 256.0);
		if (alpha > 255)
			alpha = 255;
		else if (alpha < 0)
			alpha = 0;
		imgData.data[i+3] = alpha;
	}
	context.drawImage(imgData, 0, 0);
}


function drawMapTelescopeCursor(cx,cy,width,height)
{

}
function drawTelescopeField(cx,cy,radius)
{
	inView = new Array();
	inViewDist = new Array();
	
	var telescopePixelToViewPixel = radius / telescopes[currentTelescope]._CCDresolution;

	var state = theContext.save();

	theContext.translate(cx,cy);
	// draw black background for image
	theContext.fillStyle = "#000000";
	theContext.fillRect(-radius,-radius,2.0 * radius,2.0 * radius);
	// draw white frame around view
	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(-radius - 1,-radius - 1,2.0 * radius + 2,2.0 * radius + 2);
	theContext.closePath();
	theContext.stroke();

	var imgData = theContext.getImageData(cx - radius, cy - radius, 2 * radius, 2 * radius);
	var lclList = new Array();

	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		var curr = universe[inViewList[idxLcl].idx];
		var currLcl = new Object();
		currLcl.eqDiskSize = null;
		currLcl.polDiskSize = null;
		currLcl.colorDisk = null;
		if (curr._galaxyType == 0) // elliptical
		{
			currLcl.eqSize = Math.max(curr._radiusEquatorial * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._radiusPolar * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
		}
		else
		{
			currLcl.eqSize = Math.max(curr._bulgeSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polSize = Math.max(curr._bulgeSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.eqDiskSize = Math.max(curr._diskSize * inViewList[idxLcl].pixelScale * telescopePixelToViewPixel,1);
			currLcl.polDiskSize = Math.max(curr._diskSize * inViewList[idxLcl].pixelScale * curr._cosOrientationFace * telescopePixelToViewPixel,1);
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
			currLcl.colorDisk = scaleColorSpiral(inViewList[idxLcl].bright,curr._color)
		}
		currLcl.x = inViewList[idxLcl].x * telescopePixelToViewPixel;
		currLcl.y = inViewList[idxLcl].y * telescopePixelToViewPixel;
		currLcl.bright = inViewList[idxLcl].bright;
		currLcl._cosOrientation = curr._cosOrientation;
		currLcl._sinOrientation = curr._sinOrientation;
		lclList.push(currLcl);
	}

	for (x = 0; x < 2 * radius; x++)
	{
		for (y = 0; y < 2 * radius; y++)
		{
			for (idxLcl = 0; idxLcl < lclList.length; idxLcl++)
			{
				var curr = lclList[idxLcl];

				var coordDisk = null;
				var reDisk = null;
				if (curr.eqDiskSize !== null)
				{
					coordDisk = getPointInEllipse((x - radius) - curr.x,(y - radius) - curr.y,curr.eqDiskSize,curr.polDiskSize,curr._cosOrientation,curr._sinOrientation);
					reDisk = Math.sqrt(coordDisk.xe * coordDisk.xe + coordDisk.ye * coordDisk.ye);
					if (reDisk <= 1.0)// && coordDisk.ye < 0) // point is in the ellipse
					{
						var alpha = Math.exp(-reDisk * reDisk * reDisk * reDisk * 4.5); // std. dev = 1/3
						var imgIdx = (y * 2 * radius + x) * 4;
						imgData.data[imgIdx + 0] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 0] + alpha * curr.colorDisk.r);
						imgData.data[imgIdx + 1] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 1] + alpha * curr.colorDisk.g);
						imgData.data[imgIdx + 2] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 2] + alpha * curr.colorDisk.b);
	//					imgData.data[imgIdx + 3] = imgData.data[imgIdx + 3]; // don't adjust alpha'
					}
				}

				var coord = getPointInEllipse((x - radius) - curr.x,(y - radius) - curr.y,curr.eqSize,curr.polSize,curr._cosOrientation,curr._sinOrientation);
				var re = Math.sqrt(coord.xe * coord.xe + coord.ye * coord.ye);
				if (re <= 1.0) // point is in the ellipse
				{
					var alpha = Math.exp(-re * re * 4.5); // std. dev = 1/3
					var imgIdx = (y * 2 * radius + x) * 4;
					imgData.data[imgIdx + 0] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 0] + alpha * curr.color.r);
					imgData.data[imgIdx + 1] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 1] + alpha * curr.color.g);
					imgData.data[imgIdx + 2] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 2] + alpha * curr.color.b);
//					imgData.data[imgIdx + 3] = imgData.data[imgIdx + 3]; // don't adjust alpha'
				}
			}
		}
	}
		
	theContext.putImageData(imgData,cx - radius, cy - radius);
	theContext.restore(state);
}

function drawCurrentTargetInfo(cx,ty,size)
{
	var state = theContext.save();

	theContext.translate(cx - 75,ty + size);
	theContext.fillStyle = "#7F7F7F";
	theContext.font = size + "px Arial";
	theContext.fillText("Galaxy",-180,0);
	theContext.fillText("V",0,0);
	theContext.fillText("z",150,0);
	theContext.fillText("D (Mpc)",240,0);
	theContext.fillStyle = "#FFFFFF";
	theContext.strokeStyle = "#7F7F7F";
	theContext.beginPath();
	theContext.moveTo(-180,size * 0.125);
	theContext.lineTo(330,size * 0.125);
	theContext.stroke();
	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		var curr = universe[inViewList[idxLcl].idx];
		var relPos = curr._position.subtract(universe[currentHome]._position);
		var id = curr._id;
		var dist = relPos.r;
		theContext.fillText(id,-180,(idxLcl + 1.25) * size);
		var measData = curr.getMeasurementSet(currentHome);
		if (typeof measData !== 'undefined')
		{
			if (measData._Mv_u > 0)
			{
				var Mv = sig_figs(measData._Mv,measData._Mv_u);
				theContext.fillText(Mv.value.toFixed(Mv.rounding) + '±' + Mv.uncertainty.toFixed(Mv.rounding),0,(idxLcl + 1.25) * size);
			}
			if (measData._redshift_u > 0)
			{
				theContext.fillText(measData._redshift.toFixed(3),150,(idxLcl + 1.25) * size);
			}
			if (measData._dist_u > 0)
			{
				var dist = sig_figs(measData._dist,measData._dist_u);
				theContext.fillText(dist.value.toFixed(dist.rounding) + '±' + dist.uncertainty.toFixed(dist.rounding),240,(idxLcl + 1.25) * size);
			}
		}
	}
	theContext.restore(state);
}
function drawCurrentHome(cx,ty,size)
{
	var state = theContext.save();
	theContext.fillStyle = "#7F7F7F";
	theContext.font = size + "px Arial";

	theContext.translate(cx,ty);
	var homeString = "Home Galaxy: " + universe[currentHome]._id;
	theContext.fillText(homeString,-0.5 * theContext.measureText(homeString).width,0);
	theContext.restore(state);
}

function drawHubble(cx,ty,width,height)
{
	var state = theContext.save();

	theContext.translate(cx - width * 0.5 + 60,ty + height - 50 + 10);
	var gh = height - 60;
	var gw = width - 80;
	theContext.strokeStyle = '#FFFFFF';
	theContext.beginPath();
	theContext.moveTo(0,-gh);
	theContext.lineTo(0,0);
	theContext.lineTo(gw,0);
	theContext.stroke();

	theContext.textBaseline = "middle";
	theContext.font = "16px Arial";
	var idxLcl;
	for (idxLcl = 0; idxLcl < 6; idxLcl++)
	{
		var y = -gh / 5.0 * idxLcl;
		theContext.strokeStyle = '#FFFFFF';
		theContext.fillStyle = '#FFFFFF';
		theContext.beginPath();
		theContext.moveTo(0,y);
		theContext.lineTo(-10,y);
		theContext.stroke();
		var text = (idxLcl * 25.0).toFixed(0);
		theContext.fillText(text,-15 - theContext.measureText(text).width,y);
	}
	var stateX = theContext.save();
	theContext.translate(-50,-0.5 * gh);
	theContext.rotate(-Math.PI * 0.5);
	var text = "Velocity (1000 km/s)"
	theContext.fillText(text, -theContext.measureText(text).width * 0.5,0);

	theContext.restore(stateX);

	theContext.textBaseline = "top";
	for (idxLcl = 0; idxLcl < 16; idxLcl+=2)
	{
		var x = gw / 15.0 * idxLcl;
		theContext.strokeStyle = '#FFFFFF';
		theContext.fillStyle = '#FFFFFF';
		theContext.beginPath();
		theContext.moveTo(x,0);
		theContext.lineTo(x,10);
		theContext.stroke();
		var text = (idxLcl * 1.0).toFixed(0);
		theContext.fillText(text,x - theContext.measureText(text).width * 0.5,10);
	}
	var text = "Distance (100 Mpc)"
	theContext.fillText(text,0.5 * gw - theContext.measureText(text).width * 0.5,25);


	if (hubbleLaw.measH0u > 0)
	{
		theContext.strokeStyle = "#0000FF"
		theContext.beginPath();
		if (hubbleLaw.measIntercept >= 0)
			theContext.moveTo(0,-hubbleLaw.measIntercept  / 125000.0 * gh );
		else
			theContext.moveTo(-hubbleLaw.measIntercept / hubbleLaw.measH0 / 1500.0 * gw,0 );
		theContext.lineTo(gw,-(1500.0 * hubbleLaw.measH0 + hubbleLaw.measIntercept) / 125000.0 * gh);
		theContext.stroke();
	}

	theContext.fillStyle = '#FF0000';
	for (idxLcl = 0; idxLcl < listMeasurements.length; idxLcl++)
	{
		if (listMeasurements[idxLcl]._fromGalaxy == currentHome && listMeasurements[idxLcl]._dist_u > 0 && listMeasurements[idxLcl]._redshift_u > 0)
		{
			var v = listMeasurements[idxLcl]._redshift * 299792.458;
			var x = listMeasurements[idxLcl]._dist / 1500.0 * gw;
			var y = -v / 125000.0 * gh;
			theContext.beginPath();
			theContext.arc(x,y,2,0,2.0 * Math.PI);
			theContext.fill();
		}
	}

	theContext.restore(state);
}


function draw()
{

	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.lineWidth = 2;
	theContext.strokeStyle = "#000000";
	theContext.fillStyle = "#FFFFFF";

	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	var text = "Map of the Sky"
	theContext.fillText(text,(theCanvas.width - theContext.measureText(text).width) * 0.5,24);
	theContext.font = "14px Arial";
	text = "Yellow circle shows where the telescope is pointing."
	theContext.fillText(text,(theCanvas.width - theContext.measureText(text).width) * 0.5,38);

//	drawMap(theCanvas.width * 0.5,170,500,250);
	drawMapTelescopeCursor(theCanvas.width * 0.5,170,500,250);


	theContext.fillStyle = "#FFFFFF";
	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	drawTextCenter(theContext,"Telescope View",theCanvas.width * 0.5,324);

	drawTelescopeField(theCanvas.width * 0.5,454,125);
	drawCurrentTargetInfo(theCanvas.width * 0.5,579,18);
	drawCurrentHome(theCanvas.width * 0.5,770,18);
	drawHubble(175,0,350,250);
	theContext.fillStyle = "#FF0000";
	if (hubbleLaw.measH0u > 0)
	{
		var x = 0;
		var width = 0;
		var H0sf = sig_figs(hubbleLaw.measH0,hubbleLaw.measH0u);
		var text = ' = ' + H0sf.value.toFixed(H0sf.rounding) + '±';
		if (hubbleLaw.measH0u > 0) 
			text += H0sf.uncertainty.toFixed(H0sf.rounding) + ' km/s/Mpc';
		else
			text += '∞ km/s/Mpc';

		theContext.font = "24px Arial";
		width += theContext.measureText("H").width;
		theContext.font = "18px Arial";
		width += theContext.measureText("0").width;
		theContext.font = "24px Arial";
		width += theContext.measureText(text).width;

		x = 175 - width * 0.5;
		theContext.font = "24px Arial";
		theContext.fillText("H",x,300);
		x += theContext.measureText("H").width;
		theContext.font = "18px Arial";
		theContext.fillText("0",x,309);
		x += theContext.measureText("0").width;
		theContext.font = "24px Arial";
		theContext.fillText(text,x,300);
	}

	theContext.fillStyle = "#7F7F7F";
	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	drawTextCenter(theContext,"Telescope Controls",theCanvas.width * 0.5 + 375 + 25,24);

	var decD = degreestoDMSDisplayable(degrees(viewLat));
	var raD = degreestoDMSDisplayable(degrees(viewLong));
	theContext.fillStyle = "#FFFFFF";
	theContext.font = "14px Arial";
	text = decD.deg + String.fromCharCode(0x00b0) + " " + decD.min + "\' " + decD.sec + "\"";
	drawTextCenter(theContext,"Dec",theCanvas.width * 0.5 + 375 + 25 + 50,40);
	drawTextCenter(theContext,text,theCanvas.width * 0.5 + 375 + 25 + 50,56);
	text = raD.deg + String.fromCharCode(0x00b0) + " " + raD.min + "\' " + raD.sec + "\"";
	drawTextCenter(theContext,"RA",theCanvas.width * 0.5 + 375 + 25 - 50,40);
	drawTextCenter(theContext,text,theCanvas.width * 0.5 + 375 + 25 - 50,56);

	commonUIdraw(theContext);
	
	
	// debug: 
/*	theContext.fillText(viewLat * 180.0 / Math.PI,theCanvas.width - 100, 30);
	theContext.fillText(viewLong * 180.0 / Math.PI,theCanvas.width - 50, 30);*/
}


draw();
