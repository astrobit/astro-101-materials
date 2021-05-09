// Galaxy Rotation simulation for introductory astronomy
// written by Brian W. Mulligan, except randn_bm function 
// Copyright (c) 2020, Brian W. Mulligan


function scaleColor(x,color)
{
	var rg = Math.round((224.0 * (1.0 - color) + 31.0) * x);
	if (rg > 255.0)
		rg = 255.0;
	else if (rg < 0.0)
		rg = 0.0;
	var b = Math.round((128.0 * color + 127.0) * x);
	if (b > 255.0)
		b = 255.0;
	else if (b < 0.0)
		b = 0.0;

	var rgOut = rg.toString(16);
	return '#' + rgOut + rgOut + b.toString(16);
}


var inView;
var inViewDist;


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
			var x = universe[idxLcl]._x - universe[currentHome]._x;
			var y = universe[idxLcl]._y - universe[currentHome]._y;
			var z = universe[idxLcl]._z - universe[currentHome]._z;
			var dist = Math.sqrt(x * x + y * y + z * z);
			var long = Math.atan2(universe[idxLcl]._y - universe[currentHome]._y,universe[idxLcl]._x - universe[currentHome]._x);
			var lat = Math.asin(z / dist);
			var mx = ((long / Math.PI * 0.5 + 0.5) % 1.0) * 2.0 - 1.0;
			var my = -lat / Math.PI * 2.0;

			var flux = universe[idxLcl]._luminosity * Math.pow(dist * 2.06265e11,-2);
			var Mv = -2.5 * Math.log10(flux) - 26.75;
			var angSize = universe[idxLcl]._luminosity / 2.0e10 * 0.03 / dist
			var size = angSize / (2.0 * Math.PI) * 100.0;

			var bright = (22.0 - Mv) / 3.0;
			theContext.fillStyle = scaleColor(bright,universe[idxLcl]._color);


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
	theContext.scale(radius,radius);
	theContext.fillStyle = "#000000";
	theContext.beginPath();
	theContext.arc(0,0,1,0,2.0 * Math.PI);
	theContext.closePath();
	theContext.fill();
	theContext.clip();
	var idxLcl;
	for (idxLcl = 0; idxLcl < universe.length; idxLcl++)
	{
		if (idxLcl != currentHome)
		{
			var x = universe[idxLcl]._x - universe[currentHome]._x;
			var y = universe[idxLcl]._y - universe[currentHome]._y;
			var z = universe[idxLcl]._z - universe[currentHome]._z;
			var dist = Math.sqrt(x * x + y * y + z * z);
			var long = Math.atan2(universe[idxLcl]._y - universe[currentHome]._y,universe[idxLcl]._x - universe[currentHome]._x);
			var lat = Math.asin(z / dist);

			var dl = long - viewLong;
			if (dl >= Math.PI)
				dl = -2.0 * Math.PI + dl;
			else if (dl <= -Math.PI)
				dl = 2.0 * Math.PI + dl;
			var mx = (((dl / Math.PI * 0.5 + 0.5) % 1.0) * 2.0 - 1.0) * 100.0;
			var my = (-(lat - viewLat) / Math.PI * 2.0) * 100.0;

			var mr = Math.sqrt(mx * mx + my * my);
			if (mr < 1.5)
			{
				var flux = universe[idxLcl]._luminosity * Math.pow(dist * 2.06265e11,-2);
				var Mv = -2.5 * Math.log10(flux) - 26.75;


				var angSize = universe[idxLcl]._luminosity / 2.0e10 * 0.03 / dist
				var size = angSize * telescopes[0]._magnification / radius;

				var bright = (20.0 - Mv) / 3.0;
				theContext.fillStyle = scaleColor(bright,universe[idxLcl]._color);
				var lclSave = theContext.save();
				theContext.translate(mx,my);
				theContext.rotate(universe[idxLcl]._orientation);
				theContext.scale(1.0,universe[idxLcl]._faceon);
				theContext.scale(size,size);
				theContext.beginPath();
				theContext.arc(0,0,1.0,0,2.0 * Math.PI);
				theContext.closePath();
				theContext.fill();
				theContext.restore(lclSave);

				inView.push(idxLcl);
				inViewDist.push(mr);
			}
		}
	}
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
	for (idxLcl = 0; idxLcl < inView.length; idxLcl++)
	{
		var id = universe[inView[idxLcl]]._id;
		var x = universe[inView[idxLcl]]._x - universe[currentHome]._x;
		var y = universe[inView[idxLcl]]._y - universe[currentHome]._y;
		var z = universe[inView[idxLcl]]._z - universe[currentHome]._z;
		var dist = Math.sqrt(x * x + y * y + z * z);
		theContext.fillText(id,-180,(idxLcl + 1.25) * size);
		if (universe[inView[idxLcl]]._Mv_u != -1)
		{
			theContext.fillText(universe[inView[idxLcl]]._Mv.toFixed(3) + '±' + universe[inView[idxLcl]]._Mv_u.toFixed(3),0,(idxLcl + 1.25) * size);
		}
		if (universe[inView[idxLcl]]._redshift_u != -1)
		{
			theContext.fillText(universe[inView[idxLcl]]._redshift.toFixed(3),150,(idxLcl + 1.25) * size);
		}
		if (universe[inView[idxLcl]]._dist_u != -1)
			theContext.fillText(universe[inView[idxLcl]]._dist.toFixed(0) + '±' + universe[inView[idxLcl]]._dist_u.toFixed(0),240,(idxLcl + 1.25) * size);
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
