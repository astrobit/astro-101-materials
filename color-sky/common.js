// JavaScript source code


function drawTextCenter(context,text,x,y)
{
	context.save();
	context.textAlign = "center";
	context.fillText(text,x,y);
	context.restore();
}
function drawTextRight(context,text,x,y)
{
	context.save();
	context.textAlign = "right";
	context.fillText(text,x,y);
	context.restore();
}

function drawArrow(context,x0,y0,x1,y1,style,linewidth,tipsizelength,tipsizewidth,open)
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
	
	context.strokeStyle = style;
	context.fillStyle = style;
	context.lineWidth = linewidth;
	
	context.beginPath();
	context.moveTo(x0,y0);
	context.lineTo(lx1,ly1);
	context.stroke();
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(txr,tyr);
	context.lineTo(txl,tyl);
	context.lineTo(x1,y1);
	if (open == true)
		context.stroke();
	else
		context.fill();

	context.strokeStyle = strokestylesave;
	context.fillStyle = fillstylesave;
	context.lineWidth = linewidthsave;
}

// fmod from https://gist.github.com/wteuber/6241786
//Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

// draw ellipse functions from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas


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

function UBVRItoRGB(U,B,V,R,I)
{
	var colorIndex = null;
	if (B !== null && V !== null)
	{
		colorIndex = B - V;
		colorBlue = 0.0;
		colorRed = 1.35;
		colorYel = 0.65;
	}
	else if (V !== null && R !== null)
	{
		colorIndex = V - R;
		colorBlue = 0.0;
		colorRed = 1.20;
		colorYel = 0.55;
	}
	else if (U !== null && B !== null)
	{
		colorIndex = U - B;
		colorBlue = 0.0;
		colorRed = 1.10;
		colorYel = 0.15;
	}
	else if (R !== null && I !== null)
	{
		colorIndex = R - I;
		colorBlue = 0.0;
		colorRed = 0.8;
		colorYel = 0.35;
	}

	var cB = 255;
	var cG = 255;
	var cR = 255;
	if (colorIndex !== null)		
	{
		cB = 255;
		cG = 255;
		cR = 255;

		if (colorIndex < colorBlue)
		{
			cR = 127;
			cG = 127;
		}
		else if (colorIndex > colorRed)
		{
			cR = 255;
			cG = 0;
			cB = 0;
		}
		else if (colorIndex < colorYel)
		{
			var Bdel = Math.round(colorIndex / colorYel * 128.0) + 127;
			cR = Bdel;
			cG = Bdel;
			cB = 255;
		}
		else
		{
			var Bdel = Math.round((colorRed - colorIndex) / (colorRed - colorYel) * 255.0);
			cR = 255;
			cG = Bdel;
			cB = Bdel;
		}
	}
	var brightBasis = null;
	if (V !== null)
		brightBasis = V;
	else if (R !== null)
		brightBasis = R;
	else if (B !== null)
		brightBasis = B;
	else if (U !== null)
		brightBasis = U;
	else if (I !== null)
		brightBasis = I;
	else
		brightBasis = 6.0;

	var bright = 0;
	if (brightBasis != null)
	{
		bright = 1.0 - brightBasis / 6.0;//Math.pow(10.0,-brightBasis/5*1.2);
		if (bright > 1.0)
			bright = 1.0;
		cR *= bright;
		cG *= bright;
		cB *= bright;
	}
	return {r:Math.round(cR), g:Math.round(cG), b:Math.round(cB), bright:bright};
}