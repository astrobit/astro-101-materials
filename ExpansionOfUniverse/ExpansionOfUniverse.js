// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020,2021, Brian W. Mulligan

class RGB
{
	constructor()
	{
		this._r = 0;
		this._g = 0;
		this._b = 0;
	}
	set r(value)
	{
		this._r = value;
		if (value < 1)
			this._r = 0;
		else if (value > 255)
			this._r = 255;
	}
	set g(value)
	{
		this._g = value;
		if (value < 1)
			this._g = 0;
		else if (value > 255)
			this._g = 255;
	}
	set b(value)
	{
		this._b = value;
		if (value < 1)
			this._b = 0;
		else if (value > 255)
			this._b = 255;
	}
	get r()
	{
		return this._r;
	}
	get g()
	{
		return this._g;
	}
	get b()
	{
		return this._b;
	}
	get style()
	{
		// create an HTML color style based on RGB values
		var sR = Math.floor(this._r).toString(16);
		if (this._r < 16) // if the value is small enough for one hex digit, add a leading zero
			sR = "0" + sR;

		var sG = Math.floor(this._g).toString(16);
		if (this._g < 16) // if the value is small enough for one hex digit, add a leading zero
			sG = "0" + sG;

		var sB = Math.floor(this._b).toString(16);
		if (this._b < 16) // if the value is small enough for one hex digit, add a leading zero
			sB = "0" + sB;
		return "#" + sR + sG + sB;
	}
}
function fixColorHex(color)
{
	out = color.toString(16);
	if (out.length < 2)
		out = '0' + out;
	return out;
}
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
	var ret = new RGB();
	ret.r = Math.floor(256.0 * x);
	ret.g = Math.floor(color / 0.3 * 256.0 * x);
	ret.b = Math.floor((color - 0.3) / 0.7 * 256.0 * x);
	return ret;
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



function drawMap(cx,cy,width,height)
{
	var state = theContext.save();

	theContext.translate(cx,cy);
	theContext.scale(width * 0.5,height * 0.5);
	theContext.fillRect(-1,-1,2,2);

	theContext.fillStyle = "#FFFFFF";
	var idxLcl;
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (idxLcl != currentHome)
		{
			var relPos = universe[idxLcl]._position.subtract(universe[currentHome]._position)
			var dist = relPos.radius;
			var long = relPos.theta;//Math.atan2(universe[idxLcl]._position.y - universe[currentHome]._position.y,universe[idxLcl]._position.x - universe[currentHome]._position.x);
			var lat = relPos.psi;//Math.asin(z / dist);
			var mx = ((long / Math.PI * 0.5 + 0.5) % 1.0) * 2.0 - 1.0;
			var my = -lat / Math.PI * 2.0;

			var flux = universe[idxLcl]._luminosity * Math.pow(dist * 2.06265e11,-2);
			var Mv = -2.5 * Math.log10(flux) - 26.75;
			var angSize = universe[idxLcl]._luminosity / 2.0e10 * 0.03 / dist
			var size = angSize / (2.0 * Math.PI) * 100.0;

			var bright = (22.0 - Mv) / 3.0;
			theContext.fillStyle = scaleColor(bright,universe[idxLcl]._color).style;


//			console.log(mx + ' ' + my + ' ' + flux + ' ' + Mv);
			theContext.beginPath();
			theContext.arc(mx,my,size,0,2.0 * Math.PI);
			theContext.closePath();
			theContext.fill();

//			theContext
		}
	}

	theContext.restore(state);
}
function drawMapTelescopeCursor(cx,cy,width,height)
{
	theContext.strokeStyle = '#FFFF00';
	var mx = ((viewLong / Math.PI * 0.5 + 0.5) % 1.0)* width + cx - 0.5 * width;
	var my = (1.0 - viewLat / Math.PI * 2.0) * height * 0.5 + cy - 0.5 * height;
	theContext.beginPath();
	theContext.arc(mx,my,3,0,2.0 * Math.PI);
	theContext.stroke();

}
function drawTelescopeField(cx,cy,radius)
{
	inView = new Array();
	inViewDist = new Array();

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
			currLcl.eqSize = curr._radiusEquatorial * inViewList[idxLcl].pixelScale;
			currLcl.polSize = curr._radiusPolar * inViewList[idxLcl].pixelScale;
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
		}
		else
		{
			currLcl.eqSize = curr._bulgeSize * inViewList[idxLcl].pixelScale;
			currLcl.polSize = curr._bulgeSize * inViewList[idxLcl].pixelScale;
			currLcl.eqDiskSize = curr._diskSize * inViewList[idxLcl].pixelScale;
			currLcl.polDiskSize = curr._diskSize * inViewList[idxLcl].pixelScale * curr._cosOrientationFace;
			currLcl.color = scaleColorElliptical(inViewList[idxLcl].bright,curr._color)
			currLcl.colorDisk = scaleColorSpiral(inViewList[idxLcl].bright,curr._color)
		}
		currLcl.x = inViewList[idxLcl].x;
		currLcl.y = inViewList[idxLcl].y;
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

/*				if (eqDiskSize !== null)
				{
					if (reDisk <= 1.0 && coordDisk.ye > 0) // point is in the ellipse
					{
						var alpha = Math.exp(-reDisk * 9); // std. dev = 1/3
						var imgIdx = (y * 2 * radius + x) * 4;
						imgData.data[imgIdx + 0] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 0] + alpha * colorDisk.r);
						imgData.data[imgIdx + 1] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 1] + alpha * colorDisk.g);
						imgData.data[imgIdx + 2] = Math.floor((1.0 - alpha) * imgData.data[imgIdx + 2] + alpha * colorDisk.b);
	//					imgData.data[imgIdx + 3] = imgData.data[imgIdx + 3]; // don't adjust alpha'
					}
				}*/
			}
		}
	}
		
//		theContext.restore(lclSave);

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
	theContext.fillStyle = "#1F1F1F";
	theContext.strokeStyle = "#1F1F1F";
	theContext.beginPath();
	theContext.moveTo(-180,size * 0.125);
	theContext.lineTo(330,size * 0.125);
	theContext.stroke();
	var idxLcl;
	for (idxLcl = 0; idxLcl < inViewList.length; idxLcl++)
	{
		var curr = universe[inViewList[idxLcl].idx]
		var id = curr._id;
		var x = curr._position.x - universe[currentHome]._position.x;
		var y = curr._position.y - universe[currentHome]._position.y;
		var z = curr._position.z - universe[currentHome]._position.z;
		var dist = Math.sqrt(x * x + y * y + z * z);
		theContext.fillText(id,-180,(idxLcl + 1.25) * size);
		if (curr._Mv_u != -1)
		{
			theContext.fillText(curr._Mv.toFixed(3) + '±' + curr._Mv_u.toFixed(3),0,(idxLcl + 1.25) * size);
		}
		if (curr._redshift_u != -1)
		{
			theContext.fillText(curr._redshift.toFixed(3),150,(idxLcl + 1.25) * size);
		}
		if (curr._dist_u != -1)
			theContext.fillText(curr._dist.toFixed(0) + '±' + curr._dist_u.toFixed(0),240,(idxLcl + 1.25) * size);
	}
	theContext.restore(state);
}
function drawCurrentHome(cx,ty,size)
{
	var state = theContext.save();
	theContext.fillStyle = "#1F1F1F";
	theContext.font = size + "px Arial";

	theContext.translate(cx,ty);
	var homeString = "Home Galaxy: " + universe[currentHome]._id;
	theContext.fillText(homeString,-0.5 * theContext.measureText(homeString).width,0);
	theContext.restore(state);
}

function drawHubble(cx,ty,width,height)
{
	var state = theContext.save();

	theContext.translate(cx - width * 0.5 + 50,ty + height - 50 + 10);
	var gh = height - 60;
	var gw = width - 70;
	theContext.strokeStyle = '#000000';
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
		theContext.strokeStyle = '#000000';
		theContext.fillStyle = '#1F1F1F';
		theContext.beginPath();
		theContext.moveTo(0,y);
		theContext.lineTo(-10,y);
		theContext.stroke();
		var text = (idxLcl * 25.0).toFixed(0);
		theContext.fillText(text,-15 - theContext.measureText(text).width,y);
	}
	var stateX = theContext.save();
	theContext.translate(-40,-0.5 * gh);
	theContext.rotate(-Math.PI * 0.5);
	var text = "Velocity (1000 km/s)"
	theContext.fillText(text, -theContext.measureText(text).width * 0.5,0);

	theContext.restore(stateX);

	theContext.textBaseline = "top";
	for (idxLcl = 0; idxLcl < 16; idxLcl++)
	{
		var x = gw / 15.0 * idxLcl;
		theContext.strokeStyle = '#000000';
		theContext.fillStyle = '#1F1F1F';
		theContext.beginPath();
		theContext.moveTo(x,0);
		theContext.lineTo(x,10);
		theContext.stroke();
		var text = (idxLcl * 1.0).toFixed(0);
		theContext.fillText(text,x - theContext.measureText(text).width * 0.5,10);
	}
	var text = "Distance (100 Mpc)"
	theContext.fillText(text,0.5 * gw - theContext.measureText(text).width * 0.5,25);

	theContext.fillStyle = '#0000FF';
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (universe[idxLcl]._dist_u != -1 && universe[idxLcl]._redshift_u != -1)
		{
			var v = universe[idxLcl]._redshift * 299792.458;
			var x = universe[idxLcl]._dist / 1500.0 * gw;
			var y = -v / 125000.0 * gh;
			theContext.beginPath();
			theContext.arc(x,y,2,0,2.0 * Math.PI);
			theContext.fill();
		}
	}

	if (measH0u != -1)
	{
		theContext.strokeStyle = "#FF0000"
		theContext.beginPath();
		theContext.moveTo(0,0);//measIntercept  / 125000.0 * gh );
		theContext.lineTo(gw,-1500.0 * measH0 / 125000.0 * gh);
		theContext.stroke();
	}

	theContext.restore(state);
}


function draw()
{

	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.lineWidth = 2;
	theContext.strokeStyle = "#000000";
	theContext.fillStyle = "#1F1F1F";

	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	var text = "Map of the Sky"
	theContext.fillText(text,(theCanvas.width - theContext.measureText(text).width) * 0.5,24);
	theContext.font = "14px Arial";
	var text = "Yellow circle shows where the telescope is pointing."
	theContext.fillText(text,(theCanvas.width - theContext.measureText(text).width) * 0.5,38);

	drawMap(theCanvas.width * 0.5,170,500,250);
	drawMapTelescopeCursor(theCanvas.width * 0.5,170,500,250);


	theContext.fillStyle = "#1F1F1F";
	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	var text = "Telescope View";
	theContext.fillText(text,(theCanvas.width - theContext.measureText(text).width) * 0.5,324);

	drawTelescopeField(theCanvas.width * 0.5,454,125);
	drawCurrentTargetInfo(theCanvas.width * 0.5,579,18);
	drawCurrentHome(theCanvas.width * 0.5,770,18);
	drawHubble(175,0,350,250);
	theContext.fillStyle = "#FF0000";
	if (measH0u != -1)
	{
		var x = 0;
		var width = 0;
		var text = ' = ' + measH0.toFixed(1) + '±';
		if (measH0u != -2) 
			text += measH0u.toFixed(1) + ' km/s/Mpc';
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

	theContext.fillStyle = "#1F1F1F";
	theContext.textBaseline = "bottom";
	theContext.font = "24px Arial";
	var text = "Telescope Controls";
	theContext.fillText(text,theCanvas.width * 0.5 + 375 - theContext.measureText(text).width * 0.5,24);

	var idxLcl;
	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		buttons[idxLcl].draw();
	}

//	theContext.fillStyle = "#1F1F1F";
//	theContext.font = "18px Arial";
//	theContext.fillText(cX + ' ' + cY,0,680);

}


draw();
