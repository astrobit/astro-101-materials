// JavaScript source code


class Button
{
	constructor(name,x,y,width,height,onClicker)
	{
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.depth = 0;
		this.drawer = null;
		this.onClicker = onClicker;
		if (typeof onClicker === 'undefined' || onClicker === null)
		{
			console.log("Warning: Button " + name + " was instantiated without an onclick action.")
		}
		this.visible = true;
		this.disabled = false;
		this.text = null;
		this.alt = null;
		this.autofocus = null;
		this.insideStyle = "#7F7F7F";
		this.borderStyle = "#FFFFFF";
		this.insideTransparency = 1.0;
		this.borderTransparency = 1.0;
		this.textStyle = "#FFFFFF";
		this.textFont = "10px Ariel";
	}

	draw(context)
	{
		context.save();
//		context.translate(this.x,this.y);
//		context.scale(this.width,this.height);
		if (this.drawer !== null)
			this.drawer();
		else
		{
			context.globalAlpha = this.insideTransparency;
			context.fillStyle  = this.insideStyle;
			context.fillRect(this.x,this.y,this.width,this.height);

			context.globalAlpha = this.borderTransparency;
			context.strokeStyle = this.borderColor;
			context.beginPath();
			context.rect(this.x,this.y,this.width,this.height);
			context.stroke();

			if (this.text !== null || this.name !== null)
			{
				context.fillStyle  = this.textStyle;
				context.font = this.textFont;
				if (this.text !== null)
					drawTextCenter(context,this.text,this.x + this.width / 2,this.y + this.height / 2 + 3);
				else
					drawTextCenter(context,this.name,this.x + this.width / 2,this.y + this.height / 2 + 3);
			}
		}
		context.restore();
	}
	onClick(event)
	{
		if (!this.disabled)
		{
			this.onClicker(event);
		}
	}
//	mouseOver(event)
//	{
//		this.mouseOverInternal(event);
//	}
	test(event)
	{
		return (this.visible && this.x <= event.offsetX && (this.x + this.width) >= event.offsetX && this.y <= event.offsetY && (this.y + this.height) >= event.offsetY)
	}
}


class RadioButton
{
	constructor(name,value,x,y,width,height)
	{
		this.name = name;
		this.value = value;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.depth = 0;
		this.drawer = null;
		this.selected = false;
		this.visible = true;
		this.disabled = false;
		this.text = null;
		this.alt = null;
		this.autofocus = null;
		this.insideStyle = "#7F7F7F";
		this.insideStyleSelected = "#007F00";
		this.borderStyle = "#FFFFFF";
		this.insideTransparency = 1.0;
		this.borderTransparency = 1.0;
		this.textStyle = "#FFFFFF";
		this.textFont = "10px Ariel";
	}

	draw(context)
	{
		context.save();
//		context.translate(this.x,this.y);
//		context.scale(this.width,this.height);
		if (this.drawer !== null)
			this.drawer();
		else
		{
			context.globalAlpha = this.insideTransparency;
			if (!this.selected)
				context.fillStyle  = this.insideStyle;
			else
				context.fillStyle  = this.insideStyleSelected;
			context.fillRect(this.x,this.y,this.width,this.height);

			context.globalAlpha = this.borderTransparency;
			context.strokeStyle = this.borderColor;
			context.beginPath();
			context.rect(this.x,this.y,this.width,this.height);
			context.stroke();

			if (this.text !== null || this.name !== null)
			{
				context.fillStyle  = this.textStyle;
				context.font = this.textFont;
				if (this.text !== null)
					drawTextCenter(context,this.text,this.x + this.width / 2,this.y + this.height / 2 + 3);
				else
					drawTextCenter(context,this.name,this.x + this.width / 2,this.y + this.height / 2 + 3);
			}
		}
		context.restore();
	}
	test(event)
	{
		return (this.visible && this.x <= event.offsetX && (this.x + this.width) >= event.offsetX && this.y <= event.offsetY && (this.y + this.height) >= event.offsetY)
	}
}


class Radio
{
	constructor(name,initalValue,onClicker,radioButtonArray)
	{
		this.name = name;
		this.drawer = null;
		this.onClicker = onClicker;
		if (typeof onClicker === 'undefined' || onClicker === null)
		{
			console.log("Warning: Radio " + name + " was instantiated without an onclick action.")
		}
		this.visible = true;
		this.disabled = false;
		this.radioButtonArray = radioButtonArray;
		var i;
		for (i = 0; i < this.radioButtonArray.length; i++)
		{
			this.radioButtonArray[i].selected = (this.radioButtonArray[i].value == initalValue);
		}
		this.value = initalValue;
	}

	draw(context)
	{
		var i;
		for (i = 0; i < this.radioButtonArray.length; i++)
		{
			this.radioButtonArray[i].draw(context);
		}
	}
	onClick(event)
	{
		if (!this.disabled)
		{
			var found = -1;
			var i;
			for (i = 0; i < this.radioButtonArray.length && found == -1; i++)
			{
				if (this.radioButtonArray[i].test(event))
				{
					found = i;
				}
			}
			if (found != -1)
			{
				for (i = 0; i < this.radioButtonArray.length; i++)
				{
					this.radioButtonArray[i].selected = (i == found);
				}
				this.onClicker(this.radioButtonArray[found].value);
			}
		}
	}
	test(event)
	{
		var i;
		var ret = false;
		for (i = 0; i < this.radioButtonArray.length && !ret; i++)
		{
			ret = this.radioButtonArray[i].test(event);
		}
		return ret;
	}
}

class Slider
{
	constructor(x,y,width,height,depth,visible,disabled,value,min,max,drawer,vertical)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.drawer = drawer;
		this.visible = visible;
		this.disabled = disabled;
		this.value = value;
		this.min = min;
		this.max = max;
		this.roundCursor = false;
		this.vertical = false;
	}

	draw(context)
	{
		context.save();
		context.translate(this.x,this.y);
		context.scale(this.width,this.height)
		if (this.drawer !== null && typeof this.drawer !== 'undefined')
			this.drawer();
		else
		{
			if (this.baseColor !== null)
			{
				context.fillColor = baseColor;
			}
			else
			{
				context.fillColor = "#bfbfbf";
			}
			if (this.roundCursor)
			{
				context.beginPath();
				if (this.vertical)
				{
					context.moveTo(this.x,this.y + this.cursorRadius);
					context.lineTo(this.x,this.y+ this.height- this.cursorRadius);
					context.arc(this.x + this.width / 2,this.y + this.height - this.cursorRadius ,Math.PI,Math.PI * 2.0)
					context.lineTo(this.x + this.width,this.y + this.cursorRadius);
					context.arc(this.x + this.width/2,this.y + this.cursorRadius,0,Math.PI)
				}
				else
				{
					context.moveTo(this.x + this.cursorRadius,this.y);
					context.lineTo(this.x + this.width - this.cursorRadius,this.y);
					context.arc(this.x + this.width - this.cursorRadius,this.y + this.height / 2,Math.PI * 0.5,-Math.PI * 0.5)
					context.lineTo(this.x + this.cursorRadius,this.y + this.height);
					context.arc(this.x + this.cursorRadius,this.y + this.height / 2,Math.PI * 1.5,Math.PI * 0.5)
				}
				context.closePath();
				context.stroke();
			}
			else
			{
			
			}
		}
		context.restore();
	}
	onClick(event)
	{
		var acted = false;
		if (test(event) && !this.disabled)
		{
			var rel;
			if (this.vertical)
				rel = (event.offsetY - this.y) / this.height;
			else
				rel = (event.offsetX - this.x) / this.width;
			if (rel >= 0.0 && rel <= 1.0)
			{
				this.value = (this.max - this.min) * rel  + this.min;
				acted = true;
			}
		}
		return acted;
	}
	test(event)
	{
		return (this.visible && this.x <= event.offsetX && (this.x + this.width) >= event.offsetX && this.y <= event.offsetY && (this.y + this.height) >= event.offsetY)
	}
}


class CommonUIContainer
{
	constructor()
	{
		this.registry = new Array();
		this.userOnClick = null;
	}
}


var commonUIContainer = new CommonUIContainer()

function commonUIRegister(uiObject)
{
	var idx = commonUIContainer.registry.length;
	commonUIContainer.registry.push(uiObject);
	return idx;
}
function commonUIRegisterOnClick(onClick)
{
	commonUIContainer.userOnClick = onClick;
}
function commonUIResetOnClick()
{
	commonUIContainer.userOnClick = null;
}

function commonUIOnClick(event)
{
	var i;
	for (i = 0; i < commonUIContainer.registry.length; i++)
	{
		if (commonUIContainer.registry[i].test(event))
		{
			commonUIContainer.registry[i].onClick(event);
		}
	}
	if (commonUIContainer.userOnClick != null)
		commonUIContainer.userOnClick(event);
}

function commonUIdraw(context)
{
	var i;
	for (i = 0; i < commonUIContainer.registry.length; i++)
	{
		commonUIContainer.registry[i].draw(context);
	}
}