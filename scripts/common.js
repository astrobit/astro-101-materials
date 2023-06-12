//
// Requires:
// commonGP.js
//
//
// CHANGE LOG
// 
// 2022-Sep-24
// Additions
// - this change log
// Changes
// - use ValidateValue functions from commonGP
// - fix and improve the scale function in RGB to correctly set the maximum possible brightness
// 
// 2022-Sep-27
// Changes
// - fix bug in setAtRelative function that allowed for negative x or y values that would bleed into the right side of the image
//
// 2022-Jun-12
// Changes
// - in drawEllipse, use ellipse function from the context if it is available

/////////////////////////////////////////////////////////////////////////
//
//  function drawTextCenter
//
// draw text that is centered at (x,y)
// input: context (object) - the html context in which to draw
//			text (string) - the string to draw
//			x (number) - the x-position within the context to draw
//			y (number) - the y-position within the context to draw
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawTextCenter(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "center";
	context.fillText(text,x,y);
	context.textAlign = align;
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawTextRight
//
// draw text that is right-justified, starting at (x,y)
// input: context (object) - the html context in which to draw
//			text (string) - the string to draw
//			x (number) - the x-position within the context to draw
//			y (number) - the y-position within the context to draw
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawTextRight(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "right";
	context.fillText(text,x,y);
	context.textAlign = align;
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawTextLeft
//
// draw text that is left-justified, starting at (x,y)
// input: context (object) - the html context in which to draw
//			text (string) - the string to draw
//			x (number) - the x-position within the context to draw
//			y (number) - the y-position within the context to draw
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawTextLeft(context,text,x,y)
{
	let align = context.textAlign;
	context.textAlign = "left";
	context.fillText(text,x,y);
	context.textAlign = align;
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawArrow
//
// draws an arrow with the given color, length, and line width
// input: context (object) - the html context in which to draw
//			x0 (number) - the starting x-positon of the tail of the arrow
//			y0 (number)  - the starting x-positon of the tail of the arrow
//			x1 (number) - the ending x-positon of the tip of the arrow
//			y1 (number)  - the ending x-positon of the tip of the arrow
//			style (string)  - the HTML color code (style) of the arrow
//			linewidth (number)  - the width of the line in pixels
//			tipsizelength (number)  - the length of the tip of the arrow in pixels
//			tipsizewidth (number)  - the width of the tip of the arrow in pixels
//			open (boolean)  - if true, the arrow is an outline; if false the arrow is filled.
// output: none
//
/////////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////////
//
//  function drawEllipseByCenter
//
// draw an ellipse centered at the specified location
// input: ctx (object) - the html context in which to draw
//			cx (number) - the x-position to be the center of the ellipse
//			cy (number) - the y-position to be the center of the ellipse
//			w (number) - the total width (major or minor axis) of the ellipse
//			h (number) - the total height (major or minor axis) of the ellipse
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawEllipseByCenter(ctx, cx, cy, w, h)
{
	drawEllipse(ctx, cx - w * 0.5, cy - h * 0.5, w, h);
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawEllipse
//
// from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
//
// draw an ellipse in the rectangle with upper left corner (x,y) and having width w and height h
// input: ctx (object) - the html context in which to draw
//			x (number) - the x-position of the top left corner of the rectangle containing the ellipse
//			y (number) - the y-position of the top left corner of the rectangle containing the ellipse
//			w (number) - the total width (major or minor axis) of the ellipse
//			h (number) - the total height (major or minor axis) of the ellipse
//			fill (bolean, null, or undefined) - flag to indicate if the ellipse should be filled (true) or hollow (false); default is hollow
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawEllipse(ctx, x, y, w, h, fill)
{
	if ("ellipse" in ctx)
	{
		ctx.beginPath();
		ctx.ellipse(x + 0.5 * w, y + 0.5 * h, w * 0.5, h * 0.5, 0.0, 0, 2 * Math.PI);
	}
	else
	{
		const kappa = 4.0 / 3.0 * (Math.sqrt(2) - 1);//.5522848,
			ox = (w * 0.5) * kappa, // control point offset horizontal
			oy = (h * 0.5) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w * 0.5,       // x-middle
			ym = y + h * 0.5;       // y-middle

		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		//ctx.closePath(); // not used correctly, see comments (use to close off open path)
	}
	if (ValidateBoolean(fill) && fill)
		ctx.fill();
	else
		ctx.stroke();
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawEllipseByCenterFill
//
// draw a filled ellipse centered at the specified location
// input: ctx (object) - the html context in which to draw
//			cx (number) - the x-position to be the center of the ellipse
//			cy (number) - the y-position to be the center of the ellipse
//			w (number) - the total width (major or minor axis) of the ellipse
//			h (number) - the total height (major or minor axis) of the ellipse
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawEllipseByCenterFill(ctx, cx, cy, w, h)
{
	drawEllipse(ctx, cx - w * 0.5, cy - h * 0.5, w, h,true);
}

/////////////////////////////////////////////////////////////////////////
//
//  function drawEllipseFill
//
// from https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
//
// draw a filled ellipse in the rectangle with upper left corner (x,y) and having width w and height h
// input: ctx (object) - the html context in which to draw
//			x (number) - the x-position of the top left corner of the rectangle containing the ellipse
//			y (number) - the y-position of the top left corner of the rectangle containing the ellipse
//			w (number) - the total width (major or minor axis) of the ellipse
//			h (number) - the total height (major or minor axis) of the ellipse
// output: none
//
/////////////////////////////////////////////////////////////////////////
function drawEllipseFill(ctx, x, y, w, h)
{
	drawEllipse(ctx, x, y, w, h, true);
}


/////////////////////////////////////////////////////////////////////////
//
//  class RGB
//
// a container class that holds reg, gree, blue infroatmion
// public keys:
//		none
//
/////////////////////////////////////////////////////////////////////////

class RGB
{

/////////////////////////////////////////////////////////////////////////
//
//  constructor
//
// create the RGB object and store initial rgb info
// inputs: r (number, null, or undefined) - the initial red value; default is 0
// 			g (number, null, or undefined) - the initial green value; default is 0
// 			b (number, null, or undefined) - the initial blue value; default is 0
// outputs: none
//
/////////////////////////////////////////////////////////////////////////
	constructor(r,g,b)
	{
		this._r = 0;
		if (ValidateValue(r))
			this._r = r;
		this._g = 0;
		if (ValidateValue(g))
			this._g = g;
		this._b = 0;
		if (ValidateValue(b))
			this._b = b;
	}
/////////////////////////////////////////////////////////////////////////
//
//  set style
//
// interpret an HTML style of the form #rrggbb, where rr, gg, and bb are hex values of red, green, and blue, respectively
// the internally stored r, g, and b values will be updated
// inputs: value (string) - the style string to interpret
// outputs: none (internal storage is updated)
//
/////////////////////////////////////////////////////////////////////////
	set style(value)
	{
		if (typeof(value) == 'string' && value !== null &&  value.length == 7 && value.charAt(0) == "#")
		{
			this._r = parseInt("0x" + value.substring(1,3));
			this._g = parseInt("0x" + value.substring(3,5));
			this._b = parseInt("0x" + value.substring(5,7));
		}
	}
	
/////////////////////////////////////////////////////////////////////////
//
//  set r
//
// set the internally stored red (r) value; if the value is outside
// a valid standard RGB storage (0 - 255) the values will be clamped
// inputs: value (number) - the new red (r) value
// outputs: none (internal storage is updated)
//
/////////////////////////////////////////////////////////////////////////
	set r(value)
	{
		if (ValidateValue(value))
		{
			this._r = Math.min(Math.max(value,0),255);
		}
	}

/////////////////////////////////////////////////////////////////////////
//
//  set g
//
// set the internally stored green (g) value; if the value is outside
// a valid standard RGB storage (0 - 255) the values will be clamped
// inputs: value (number) - the new green (g) value
// outputs: none (internal storage is updated)
//
/////////////////////////////////////////////////////////////////////////
	set g(value)
	{
		if (ValidateValue(value))
		{
			this._g = Math.min(Math.max(value,0),255);
		}
	}

/////////////////////////////////////////////////////////////////////////
//
//  set b
//
// set the internally stored blue (b) value; if the value is outside
// a valid standard RGB storage (0 - 255) the values will be clamped
// inputs: value (number) - the new blue (b) value
// outputs: none (internal storage is updated)
//
/////////////////////////////////////////////////////////////////////////
	set b(value)
	{
		if (ValidateValue(value))
		{
			this._b = Math.min(Math.max(value,0),255);
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  get r
//
// retrieves the current stored red (r) value
// inputs: none
// outputs: (number) the current red (r) value
//
/////////////////////////////////////////////////////////////////////////
	get r()
	{
		return this._r;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get g
//
// retrieves the current stored green (g) value
// inputs: none
// outputs: (number) the current green (g) value
//
/////////////////////////////////////////////////////////////////////////
	get g()
	{
		return this._g;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get b
//
// retrieves the current stored blue (b) value
// inputs: none
// outputs: (number) the current blue (b) value
//
/////////////////////////////////////////////////////////////////////////
	get b()
	{
		return this._b;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get style
//
// retrieves the current stored RGB value as an HTML style
// inputs: none
// outputs: (string) the HTML style corresponding to the current RGB value
//
/////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////
//
//  function scale
//
// linearly scales the internally stored RGB values by some scalar; value
// must be a non-zero, positive number. If any one component (RGB) would be larger
// than 255; the scaling is limited to ensure largest color component will 
// reach the maximum value (255), and retain the overall hue and saturation 
// inputs: value (number) - the value by which to scale the brightness of the color
// outputs: none (internal values are updated)
//
/////////////////////////////////////////////////////////////////////////
	scale(value)
	{
		if (value >= 0.0)
		{
			let valueLcl = value;
			let max = Math.max(this._r,this._g,this._b);
			if (max * value > 255)
				valueLcl = 255 / max;
			this._r *= valueLcl;
			this._g *= valueLcl;
			this._b *= valueLcl;
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  function add
//
// adds the RGB value to the current stored RGB value; e.g., R = R + r; G = G + g; B = B + b, where
// RGB are current values, and rgb are the additive values
// inputs: rgbValue (object: RGB) - and RGB object from which to add the color to the current color
// outputs: none (internal values are updated)
//
/////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////
//
//  function subtract
//
// subtract the RGB value from the current stored RGB value; e.g., R = R - r; G = G - g; B = B - b, where
// RGB are current values, and rgb are the additive values
// inputs: rgbValue (object: RGB) - and RGB object from which to add the color to the current color
// outputs: none (internal values are updated)
//
/////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////
//
//  function copy
//
// creates a new copy of this RGB object
// inputs: none
// outputs: (object: RGB) a new object containing the RGB values of this object
//
/////////////////////////////////////////////////////////////////////////
	copy()
	{
		return new RGB(this._r,this._g,this._b);
	}
}



/////////////////////////////////////////////////////////////////////////
//
//  class ImgData
//
// a container class that holds RGBA image data
// public keys:
//		none
//
/////////////////////////////////////////////////////////////////////////


class ImgData
{

/////////////////////////////////////////////////////////////////////////
//
//  function load
//
// extracts an image rectangle from a context
// input: context (object) - an HTML context from which to load the image
// 			x (number) - the x-coordinate of the top-left corner of the rectangle
// 			y (number) - the y-coordinate of the top-left corner of the rectangle
// 			width (number) - the width of the rectangle
// 			height (number) - the height of the rectangle
// output: none
//
/////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////
//
//  function draw
//
// draws an image onto a context
// input: context (object) - an HTML context from which to load the image
// 			x (number) - the x-coordinate of the top-left corner of the rectangle
// 			y (number) - the y-coordinate of the top-left corner of the rectangle
// output: none
//
/////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////
//
//  constructor
//
// extracts an image rectangle from a context
// input: context (object, undefined, or null) - an HTML context from which to load the image
// 			x (number, undefined, or null) - the x-coordinate of the top-left corner of the rectangle
// 			y (number, undefined, or null) - the y-coordinate of the top-left corner of the rectangle
// 			width (number, undefined, or null) - the width of the rectangle
// 			height (number, undefined, or null) - the height of the rectangle
// output: none
//
/////////////////////////////////////////////////////////////////////////
	constructor(context, x, y, width, height)
	{
		this.load(context,x,y,width,height)
    }

/////////////////////////////////////////////////////////////////////////
//
//  function getAtRelative
//
// gets the current RGB information of a pixel in the image
// input: x (number) - the x-coordinate of the pixel, relative to the top-left corner of the image
// 			y (number) - the y-coordinate of the pixel, relative top-left corner of the image
// output: (object: RGB) an RGB object containing the RGB value of the selected pixel; if the x,y coordinates are not valid, an empty RGB (0,0,0) is returned
//
/////////////////////////////////////////////////////////////////////////
	getAtRelative(x, y)
	{
		if (this._imgData !== undefined && this._imgData !== null && x >= 0 && x < this._width && y >= 0 && y < this._height)
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
/////////////////////////////////////////////////////////////////////////
//
//  function getAtAbsolute
//
// gets the current RGB information of a pixel in the image using the absolute context coordinates of the pixel
// input: x (number) - the x-coordinate of the pixel, relative to the origin of the context
// 			y (number) - the y-coordinate of the pixel, relative to the origin of the context
// output: (object: RGB) an RGB object containing the RGB value of the selected pixel; if the x,y coordinates are not valid, an empty RGB (0,0,0) is returned
//
/////////////////////////////////////////////////////////////////////////
	getAtAbsolute(x, y)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		return this.getAtRelative(xr, yr);
	}
/////////////////////////////////////////////////////////////////////////
//
//  function setAtRelative
//
// sets the current RGB information of a pixel in the image at the specified location in the image
// input: x (number) - the x-coordinate of the pixel, relative to the top-left corner of the image
// 			y (number) - the y-coordinate of the pixel, relative top-left corner of the image
//			rgb (object: RGB) - the rgb value to store at the given pixel in the image
// output: (none)
//
/////////////////////////////////////////////////////////////////////////
	setAtRelative(x, y, rgb)
	{
		if (this._imgData !== undefined && this._imgData !== null && x >= 0 && x < this._width && y >= 0 && y < this._height)
		{
			const xl = Math.floor(x);
			const yl = Math.floor(y);
			const idx = (yl * this._width + xl) * 4;

			this._imgData.data[idx] = rgb.r;
			this._imgData.data[idx + 1] = rgb.b;
			this._imgData.data[idx + 2] = rgb.g;
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  function setAtAbsolute
//
// sets the current RGB information of a pixel in the image using the absolute context coordinates of the pixel
// input: x (number) - the x-coordinate of the pixel, relative to the origin of the context
// 			y (number) - the y-coordinate of the pixel, relative to the origin of the context
//			rgb (object: RGB) - the rgb value to store at the given pixel in the image
// output: (none)
//
/////////////////////////////////////////////////////////////////////////
	setAtAbsolute(x, y,rgb)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		this.setAtRelative(xr, yr,rgb);
	}
/////////////////////////////////////////////////////////////////////////
//
//  function addAtRelative
//
// add the specifed RGB to the current RGB information of a pixel in the image at the specified location in the image
// input: x (number) - the x-coordinate of the pixel, relative to the top-left corner of the image
// 			y (number) - the y-coordinate of the pixel, relative top-left corner of the image
//			rgb (object: RGB) - the rgb value to store at the given pixel in the image
// output: (none)
//
/////////////////////////////////////////////////////////////////////////
	addAtRelative(x, y, rgb)
	{
		let clr = this.getAtRelative(x, y);
		clr.add(rgb);
		this.setAtRelative(x, y, clr);
	}
/////////////////////////////////////////////////////////////////////////
//
//  function addAtAbsolute
//
// add the specifed RGB to the current RGB information of a pixel in the image at the specified location in the image using the absolute context coordinates of the pixel
// input: x (number) - the x-coordinate of the pixel, relative to the origin of the context
// 			y (number) - the y-coordinate of the pixel, relative to the origin of the context
//			rgb (object: RGB) - the rgb value to store at the given pixel in the image
// output: (none)
//
/////////////////////////////////////////////////////////////////////////
	addAtAbsolute(x, y, rgb)
	{
		const xr = x - this._x;
		const yr = y - this._y;
		this.addAtRelative(xr, yr, rgb);
	}
}
