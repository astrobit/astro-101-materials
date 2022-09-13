// JavaScript source code


function drawTextCenter(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "center";
	context.fillText(text,x,y);
	context.textAlign = align;
}
function drawTextRight(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "right";
	context.fillText(text,x,y);
	context.textAlign = align;
}
function drawTextLeft(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "left";
	context.fillText(text,x,y);
	context.textAlign = align;
}

function drawArrow(context,x0,y0,x1,y1,style,linewidth,tipsizelength,tipsizewidth,open)
{
	let txr,txl,tyl;
	const len = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
	
	const angle = Math.atan2((y1 - y0)/len, (x1 - x0)/len);
	let lx1, ly1;
	const effline = Math.max(0,len - tipsizelength);
	lx1 = effline * Math.cos(angle) + x0;
	ly1 = effline * Math.sin(angle) + y0;
	//console.log(x0 + " " + y1 + " " + lx1 + " " + ly1);
	
	txr = (tipsizewidth + linewidth) * 0.5 * Math.sin(angle) + lx1;
	tyr = -(tipsizewidth + linewidth) * 0.5 * Math.cos(angle) + ly1;
	//console.log(txr + " " + tyr + " " + tx + " " + ly1);
	
	txl = -(tipsizewidth + linewidth) * 0.5 * Math.sin(angle) + lx1;
	tyl = (tipsizewidth + linewidth) * 0.5 * Math.cos(angle) + ly1;
	const strokestylesave= theContext.strokeStyle;
	const fillstylesave= theContext.fillStyle;
	const linewidthsave= theContext.lineWidth;
	
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
  const kappa = 4.0 / 3.0 * (Math.sqrt(2) - 1);//.5522848,
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

function drawEllipseByCenterFill(ctx, cx, cy, w, h) {
  drawEllipseFill(ctx, cx - w/2.0, cy - h/2.0, w, h);
}

function drawEllipseFill(ctx, x, y, w, h) {
  const kappa = 4.0 / 3.0 * (Math.sqrt(2) - 1);//.5522848,
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
  ctx.fill();
}


class RGB
{
	constructor(r,g,b)
	{
		this._r = 0;
		if (r !== null && r !== undefined)
			this._r = r;
		this._g = 0;
		if (g !== null && g !== undefined)
			this._g = g;
		this._b = 0;
		if (b !== null && b !== undefined)
			this._b = b;
	}
	set style(value)
	{
		if (value !== null && value !== undefined && typeof(value) == 'string' && value.length == 7 && value.charAt(0) == "#")
		{
			this._r = parseInt("0x" + value.substring(1,3));
			this._g = parseInt("0x" + value.substring(3,5));
			this._b = parseInt("0x" + value.substring(5,7));
		}
	}
	
	set r(value)
	{
		if (value !== null && value !== undefined)
		{
			this._r = value;
			if (value < 1)
				this._r = 0;
			else if (value > 255)
				this._r = 255;
		}
	}
	set g(value)
	{
		if (value !== null && value !== undefined)
		{
			this._g = value;
			if (value < 1)
				this._g = 0;
			else if (value > 255)
				this._g = 255;
		}
	}
	set b(value)
	{
		if (value !== null && value !== undefined)
		{
			this._b = value;
			if (value < 1)
				this._b = 0;
			else if (value > 255)
				this._b = 255;
		}
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
		let sR = Math.floor(this._r).toString(16);
		if (this._r < 16) // if the value is small enough for one hex digit, add a leading zero
			sR = "0" + sR;

		let sG = Math.floor(this._g).toString(16);
		if (this._g < 16) // if the value is small enough for one hex digit, add a leading zero
			sG = "0" + sG;

		let sB = Math.floor(this._b).toString(16);
		if (this._b < 16) // if the value is small enough for one hex digit, add a leading zero
			sB = "0" + sB;
		return "#" + sR + sG + sB;
	}
	scale(value)
	{
		if (value >= 0.0)
		{
			let valueLcl = value;
			if (this._r * valueLcl > 255)
				valueLcl = 255 / this._r;
			if (this._g * valueLcl > 255)
				valueLcl = 255 / this._g;
			if (this._g * valueLcl > 255)
				valueLcl = 255 / this._g;
			this._r *= valueLcl;
			this._g *= valueLcl;
			this._b *= valueLcl;
		}
	}
	add(rgbValue)
	{
		this._r += rgbValue._r;
		if (this._r > 255)
			this._r = 255;
		this._g += rgbValue._g;
		if (this._g > 255)
			this._g = 255;
		this._b += rgbValue._b;
		if (this._b > 255)
			this._b = 255;
    }
	subtract(rgbValue) {
		this._r -= rgbValue._r;
		if (this._r > 0)
			this._r = 0;
		this._g -= rgbValue._g;
		if (this._g < 0)
			this._g = 0;
		this._b -= rgbValue._b;
		if (this._b < 0)
			this._b = 0;
	}
	copy()
	{
		return new RGB(this._r,this._g,this._b);
	}
}

class ImgData
{
	load(context,x,y,width,height)
	{
		if (context !== undefined && context !== null &&
			width !== undefined && width !== null &&
			height !== undefined && height !== null &&
			x !== undefined && x !== null &&
			y !== undefined && y !== null &&
			x >= 0 && y >= 0 &&
			width > 0 && height > 0)
		{
			this._context = context;
			this._x = Math.floor(x);
			this._y = Math.floor(y);
			this._width = Math.ceil(width);
			this._height = Math.ceil(height);
			this._imgData = context.getImageData(this._x, this._y, this._width, this._height);
		}
		else
		{
			this._context = null;
			this._x = 0;
			this._y = 0;
			this._width = 0;
			this._height = 0;
			this._imgData = null;
        }
	}
	draw(context, x, y)
	{
		if (this._imgData !== undefined && this._imgData !== null)
		{
			let ctxLcl = this._context;
			if (context !== undefined && context !== null)
				ctxLcl = context;
			let xl = this._x;
			if (x !== undefined && x !== null)
				xl = x;
			let yl = this._y;
			if (y !== undefined && y !== null)
				yl = y;
			ctxLcl.putImageData(this._imgData, xl, yl);
		}
	}
	constructor(context, x, y, width, height)
	{
		this.load(context,x,y,width,height)
    }

	getAtRelative(x, y)
	{
		if (this._imgData !== undefined && this._imgData !== null && x < this._width && y < this._height)
		{
			const xl = Math.floor(x);
			const yl = Math.floor(y);
			const idx = (yl * this._width + xl) * 4;
			const r = this._imgData.data[idx + 0];
			const g = this._imgData.data[idx + 1];
			const b = this._imgData.data[idx + 2];

			return new RGB(r, g, b);
		}
		else
			return new RGB();
	}
	getAtAbsolute(x, y)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		return this.getAtRelative(xr, yr);
	}
	setAtRelative(x, y, rgb)
	{
		if (this._imgData !== undefined && this._imgData !== null && x < this._width && y < this._height)
		{
			const xl = Math.floor(x);
			const yl = Math.floor(y);
			const idx = (yl * this._width + xl) * 4;

			this._imgData.data[idx] = rgb.r;
			this._imgData.data[idx + 1] = rgb.b;
			this._imgData.data[idx + 2] = rgb.g;
		}
	}
	setAtAbsolute(x, y,rgb)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		this.setAtRelative(xr, yr,rgb);
	}
	addAtRelative(x, y, rgb)
	{
		let clr = this.getAtRelative(x, y);
		clr.add(rgb);
		this.setAtRelative(x, y, clr);
	}
	addAtAbsolute(x, y, rgb)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		this.addAtRelative(xr, yr, rgb);
	}
}
