


class Button
{
	constructor(context, cx,ty,text, height,onDown,onUp,activeTest, square, hide, disabled)
	{
		this._context = context;
		this._ty = ty;
		this._height = height;
		this._onDown = onDown;
		this._onUp = onUp;
		this._activeTest = activeTest;
		this._text = text;
		this._square = square;
		this._hide = hide;
		this._disabled = disabled;

		this._normalBorderStyle = "#000000";
		this._activeBorderStyle = "#000000";
		this._disabledBorderStyle = "#CFCFCF";
		this._borderWidth = 2;

		this._activeStyle = "#4CAF50";
		this._disabledStyle = "#AFAFAF"
		this._normalStyle = "#AFAFAF"

		this._activeTextStyle = "#000000";
		this._normalTextStyle = "#000000";
		this._disabledTextStyle = "#CFCFCF";
		this._font = "Arial";

		if (!square)
			this.fontSize = Math.round(height * 0.75 * 10.0) / 10.0;
		else
			this.fontSize = height;

		var state = context.save();
		context.font = this.fontSize + "px Arial";
		context.fillStyle = "#000000";
		this.textSize = context.measureText(this._text).width;
		context.restore(state);

		if (!square)
			this._btnSize = this.fontSize * 1.0 + this.textSize;
		else
			this._btnSize = height;
		this._cx = cx;
		this._lx = cx - 0.5 * this._btnSize;

		this._isDown = false;
	}
	hit(x,y)
	{
		return (!this._hide && !this._disabled && x >= this._lx && x <= (this._lx + this._btnSize) && y >= this._ty && y <= (this._ty + this._height));
	}
	down()
	{
		this._isDown = true;
		this._onDown();
	}
	tryDown(x,y)
	{
		if (this.hit(x,y))
		{
			this._isDown = true;
			this._onDown();
		}
	}
	up()
	{
		this._isDown = false;
		this._onUp();
	}
	tryUp(x,y)
	{
		if (this.hit(x,y))
		{
			this._isDown = false;
			this._onUp();
		}
	}
	move(x,y)
	{
		if (this._isDown && !this.hit(x,y))
		{
			this.up();
		}
	}

	draw()
	{
		if (!this._hide)
		{
			var state = this._context.save();
			this._context.font = this.fontSize + "px " + this._font;
			this._context.textBaseline = "middle";


			this._context.translate(this._cx,this._ty + this._height * 0.5);

			this._context.fillStyle = this._normalStyle;
			if (this._activeTest())
				this._context.fillStyle = this._activeStyle;
			if (this._disabled)
				this._context.fillStyle = this._disabledStyle;

			this._context.fillRect(-this._btnSize*0.5,-this._height*0.5,this._btnSize,this._height);

			this._context.strokeStyle = this._normalBorderStyle;
			if (this._activeTest())
				this._context.strokeStyle = this._activeBorderStyle;
			if (this._disabled)
				this._context.strokeStyle = this._disabledBorderStyle;

			this._context.lineWidth = this._borderWidth;
			this._context.strokeRect(-this._btnSize*0.5,-this._height*0.5,this._btnSize,this._height);

			this._context.fillStyle = this._normalTextStyle;
			if (this._activeTest())
				this._context.fillStyle = this._activeTextStyle;
			if (this._disabled)
				this._context.fillStyle = this._disabledTextStyle;

			this._context.fillText(this._text,-this.textSize * 0.5,0);
			this._context.restore(state);
		}
	}
}

var buttons = new Array();

var cX = -1;
var cY = -1;
var update = false;
function onMouseDown(event)
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		buttons[idxLcl].tryDown(event.offsetX,event.offsetY);
	}
	cX = event.offsetX;
	cY = event.offsetY;
	update = true;
}
function onMouseMove(event)
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		buttons[idxLcl].move(event.offsetX,event.offsetY);
	}
	cX = event.offsetX;
	cY = event.offsetY;
	update = true;
}
function onMouseUp(event)
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		buttons[idxLcl].tryUp(event.offsetX,event.offsetY);
	}
	cX = event.offsetX;
	cY = event.offsetY;
	update = true;
}

function onMouseLeave(event)
{
	var idxLcl;
	for (idxLcl = 0; idxLcl < buttons.length; idxLcl++)
	{
		buttons[idxLcl].move(-1,-1);
	}
	cX = event.offsetX;
	cY = event.offsetY;
	update = true;
}
