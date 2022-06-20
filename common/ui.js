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
		this.disabledInsideStyle = "#7F7F7F";
		this.borderStyle = "#FFFFFF";
		this.insideTransparency = 1.0;
		this.insideTransparencyDisabled = 0.25;
		this.borderTransparency = 1.0;
		this.borderTransparencyDisabled = 0.25;
		this.textStyle = "#FFFFFF";
		this.disabledTextStyle  = "#7F7F7F";
		this.textFont = "18px Arial";
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
			if (this.disabled)
				context.globalAlpha = this.insideTransparencyDisabled;
			else
				context.globalAlpha = this.insideTransparency;
			if (this.disabled)
				context.fillStyle  = this.disabledInsideStyle;
			else
				context.fillStyle  = this.insideStyle;
			context.fillRect(this.x,this.y,this.width,this.height);

			if (this.disabled)
				context.globalAlpha = this.borderTransparencyDisabled;
			else
				context.globalAlpha = this.borderTransparency;
			context.strokeStyle = this.borderStyle;
			context.beginPath();
			context.rect(this.x,this.y,this.width,this.height);
			context.stroke();

			if (this.text !== null || this.name !== null)
			{
				context.globalAlpha = 1.0;
				if (this.disabled)
					context.fillStyle  = this.disabledTextStyle;
				else
					context.fillStyle  = this.textStyle;
				context.font = this.textFont;
				context.textBaseline = "middle";
				if (this.text !== null)
					drawTextCenter(context,this.text,this.x + this.width / 2,this.y + this.height / 2 );
				else
					drawTextCenter(context,this.name,this.x + this.width / 2,this.y + this.height / 2);
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

class SpringButton
{
	constructor(name,x,y,width,height,onMouseDown,onMouseUp)
	{
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.depth = 0;
		this.drawer = null;
		this.onMouseDown = onMouseDown;
		if (typeof onMouseDown === 'undefined' || onMouseDown === null)
		{
			console.log("Warning: Button " + name + " was instantiated without an onMouseDown action.")
		}
		this.onMouseUp = onMouseUp;
		if (typeof onMouseUp === 'undefined' || onMouseUp === null)
		{
			console.log("Warning: SpringButton " + name + " was instantiated without an onMouseUp action.")
		}
		this.visible = true;
		this._disabled = false;
		this.text = null;
		this.alt = null;
		this.autofocus = null;
		this.insideStyle = "#7F7F7F";
		this.disabledInsideStyle = "#7F7F7F";
		this.borderStyle = "#FFFFFF";
		this.insideTransparency = 1.0;
		this.insideTransparencyDisabled = 0.25;
		this.borderTransparency = 1.0;
		this.borderTransparencyDisabled = 0.25;
		this.textStyle = "#FFFFFF";
		this.disabledTextStyle  = "#7F7F7F";
		this.textFont = "18px Arial";
		this.pushed = 0;
		this.pushedInsideStyle = "#FFFF00";
		this.pushedTextStyle = "#FFFFFF";
	}
	get disabled() { return this._disabled;}
	set disabled(value) {this._disabled = value; if (value) { this.pushed = false;}}
	
	draw(context)
	{
		context.save();
//		context.translate(this.x,this.y);
//		context.scale(this.width,this.height);
		if (this.drawer !== null)
			this.drawer();
		else
		{
			if (this.disabled)
				context.globalAlpha = this.insideTransparencyDisabled;
			else
				context.globalAlpha = this.insideTransparency;
			if (this._disabled)
				context.fillStyle  = this.disabledInsideStyle;
			else if (this.pushed)
				context.fillStyle  = this.pushedInsideStyle;
			else
				context.fillStyle  = this.insideStyle;
			context.fillRect(this.x,this.y,this.width,this.height);

			if (this.disabled)
				context.globalAlpha = this.borderTransparencyDisabled;
			else
				context.globalAlpha = this.borderTransparency;
			context.strokeStyle = this.borderStyle;
			context.beginPath();
			context.rect(this.x,this.y,this.width,this.height);
			context.stroke();

			if (this.text !== null || this.name !== null)
			{
				context.globalAlpha = 1.0;
				if (this._disabled)
					context.fillStyle  = this.disabledTextStyle;
				else if (this.pushed)
					context.fillStyle  = this.pushedTextStyle;
				else
					context.fillStyle  = this.textStyle;
				context.font = this.textFont;
				context.textBaseline = "middle";
				if (this.text !== null)
					drawTextCenter(context,this.text,this.x + this.width / 2,this.y + this.height / 2 );
				else
					drawTextCenter(context,this.name,this.x + this.width / 2,this.y + this.height / 2);
			}
		}
		context.restore();
	}
	onMouseDown(event)
	{
		if (!this._disabled)
		{
			this.pushed = 1;
			this.onMouseDown(event);
		}
	}
	onMouseUp(event)
	{
		if (!this._disabled)
		{
			this.pushed = 0;
			this.onMouseUp(event);
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
		this.disabledInsideStyle = "#7F7F7F";
		this.insideStyleSelected = "#007F00";
		this.borderStyle = "#FFFFFF";
		this.insideTransparency = 1.0;
		this.insideTransparencyDisabled = 0.25;
		this.borderTransparency = 1.0;
		this.borderTransparencyDisabled = 0.25;
		this.textStyle = "#FFFFFF";
		this.disabledTextStyle  = "#7F7F7F";
		this.textFont = "18px Arial";
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
			if (this.disabled)
				context.globalAlpha = this.insideTransparencyDisabled;
			else
				context.globalAlpha = this.insideTransparency;
			
			if (this.selected)
				context.fillStyle  = this.insideStyleSelected;
			else if (this.disabled)
				context.fillStyle = this.disabledInsideStyle;
			else
				context.fillStyle  = this.insideStyle;
			context.fillRect(this.x,this.y,this.width,this.height);

			if (this.disabled)
				context.globalAlpha = this.borderTransparencyDisabled;
			else
				context.globalAlpha = this.borderTransparency;
			
			context.strokeStyle = this.borderStyle;
			context.beginPath();
			context.rect(this.x,this.y,this.width,this.height);
			context.stroke();

			if (this.text !== null || this.name !== null)
			{
				context.fillStyle  = this.textStyle;
				context.font = this.textFont;
				context.textBaseline = "middle";
				if (this.text !== null)
					drawTextCenter(context,this.text,this.x + this.width / 2,this.y + this.height / 2);
				else
					drawTextCenter(context,this.name,this.x + this.width / 2,this.y + this.height / 2);
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
	setState(value)
	{
		var found = null;
		for (i = 0; i < this.radioButtonArray.length; i++)
		{
			if (value == this.radioButtonArray[i].value)
				found = i;
		}
		if (found !== null)
		{
			this.onClicker(this.radioButtonArray[found].value);
			for (i = 0; i < this.radioButtonArray.length; i++)
			{
				this.radioButtonArray[i].selected = (i == found);
			}
		}
	}
}

class Clickable
{
	constructor(name,x,y,width,height,onClicker,drawer)
	{
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.depth = 0;
		this.drawer = drawer;
		this.visible = true;
		this.disabled = false;
		this.onClicker = onClicker;
		if (typeof onClicker === 'undefined' || onClicker === null)
		{
			console.log("Warning: Clickable " + name + " was instantiated without an onClicker action.")
		}
		if (typeof drawer === 'undefined' || drawer === null)
		{
			console.log("Warning: Clickable " + name + " was instantiated without an drawer action.")
		}
	}
	onClick(event)
	{
		if (this.onClicker !== null)
		{
			var x = (event.offsetX - this.x) / this.width;
			var y = (event.offsetY - this.y) / this.height;
			this.onClicker(event,x,y);
		}
	}
	draw(context)
	{
		if (typeof this.drawer !== undefined && this.drawer !== null)
		{
			context.save();
			context.translate(this.x,this.y);
			this.drawer(context,this.width,this.height);
			context.restore();
		}
	}
	test(event)
	{
		return (this.visible && this.x <= event.offsetX && (this.x + this.width) >= event.offsetX && this.y <= event.offsetY && (this.y + this.height) >= event.offsetY)
	}
}

	

class Slider
{
	constructor(x,y,min,max,value)
	{
		this.x = x;
		this.y = y;
		if (typeof vertical !== 'undefined' && vertical !== null && vertical)
		{
			this.width = 25;
			this.height = 200;
			this.cursorSize = this.width / 2 + 2;
		}
		else
		{
			this.width = 200;
			this.height = 25;
			this.cursorSize = this.height / 2 + 2;
		}
		this.depth = 0;
		this.visible = true;
		this.disabled = false;
		this._value = value;
		this._min = min;
		this._max = max;
		this.roundCursor = true;
		this.sliderStyle = "#7F7F7F";
		this.cursorStyle = "#00007F";
		this.onChange = null;
		this.drawer = null;
		this.hasMouse = false;
		this.calculateSlope();
	}
	calculateSlope()
	{
		this._slope = 1.0 / (this._max - this._min);
		this._offset = -this._min * this._slope - 0.5;
	}
	get value()
	{
		return this._value;
	}
	get min()
	{
		return this._min;
	}
	get max()
	{
		return this._max;
	}
	set value(val)
	{
		this._value = val;
	}
	set min(value)
	{
		this._min = value;
		this.calculateSlope();
	}
	set max(value)
	{
		this._max = value;
		this.calculateSlope();
	}

	draw(context)
	{
		context.save();
		context.translate(this.x,this.y);
		if (this.drawer !== null)
			this.drawer();
		else
		{
			context.fillStyle = this.sliderStyle;
			context.beginPath();
			context.moveTo(-this.width * 0.5,-this.height * 0.5);
			if (this.vertical)
			{
				if (this.roundCursor)
					context.arc(0,-this.height * 0.5,this.width * 0.5,Math.PI,0);
				else
					context.lineTo(this.width * 0.5,-this.height * 0.5);
				context.lineTo(this.width * 0.5, this.height * 0.5);
				if (this.roundCursor)
					context.arc(0,this.height * 0.5,this.width * 0.5,0,-Math.PI);
				else
					context.lineTo(-this.width * 0.5,this.height * 0.5);
			}
			else
			{
				context.lineTo(this.width * 0.5,-this.height * 0.5);
				if (this.roundCursor)
					context.arc(this.width * 0.5,0,this.height * 0.5,-0.5 * Math.PI,0.5 * Math.PI);
				else
					context.lineTo(this.width * 0.5,this.height * 0.5);
				context.lineTo(-this.width * 0.5,this.height * 0.5);
				if (this.roundCursor)
					context.arc(-this.width * 0.5,0,this.height * 0.5,0.5 * Math.PI,1.5 * Math.PI);
				else
					context.lineTo(-this.width * 0.5,-this.height * 0.5);
			}
			context.closePath();
			context.fill();
			
			var cursorX;
			var cursorY;
			if (this.vertical)
			{
				cursorX = 0;
				cursorY = this.height * (this._value * this._slope + this._offset);
			}
			else
			{
				cursorX = this.width * (this._value * this._slope + this._offset);
				cursorY = 0;
			}
			
			context.fillStyle = this.cursorStyle;
			context.beginPath();
			if (this.roundCursor)
			{
				context.moveTo(cursorX + this.cursorSize,cursorY);
				context.arc(cursorX,cursorY,this.cursorSize,0,2.0 * Math.PI);
			}
			else
			{
				context.moveTo(cursorX + this.cursorSize,cursorY + this.cursorRadius);
				context.lineTo(cursorX + this.cursorSize,cursorY - this.cursorRadius);
				context.lineTo(cursorX - this.cursorSize,cursorY - this.cursorRadius);
				context.lineTo(cursorX - this.cursorSize,cursorY + this.cursorRadius);
			}
			context.closePath();
			context.fill();
		}
		context.restore();
	}
	onMouseDown(event)
	{
		var acted = false;
		if (!this.disabled && this.visible && this.test(event))
		{
			var cursorPos = this._value * this._slope + this._offset;
			var relX;
			var relY;
			if (this.vertical)
			{
				cursorPos *= this.height;
				relX = this.x - event.offsetX;
				relY = this.y + cursorPos - event.offsetY;
			}
			else
			{
				cursorPos *= this.width;
				relX = this.x + cursorPos - event.offsetX;
				relY = this.y - event.offsetY;
			}
			if (this.roundCursor)
			{
				var r = relX * relX + relY * relY - this.cursorSize * this.cursorSize;
				if (r < 0)
					this.hasMouse = true;				
			}
			else
			{
				if (Math.abs(relX) < this.cursorSize &&
					Math.abs(relY) < this.cursorSize)
					this.hasMouse = true;				
			}
			if (this.hasMouse)
				acted = true;
		}
		return acted;
	}
	onMouseUp(event)
	{
		var acted = false;
		if (this.hasMouse)
		{
			this.hasMouse = false;
			acted = true;
		}
		return acted;
	}
	onMouseMove(event)
	{
		var acted = false;
		if (this.hasMouse)
		{
			var relPos;
			if (this.vertical)
			{
				relPos = (event.offsetY - this.y) / this.height + 0.5;
			}
			else
			{
				relPos = (event.offsetX - this.x) / this.width + 0.5;
			}
			if (relPos < 0.0)
				relPos = 0.0;
			if (relPos > 1.0)
				relPos = 1.0;
			this._value = relPos / this._slope + this._min;
			if (this.onChange !== null)
				this.onChange(this._value);
			acted = true;
		}
		return acted;
	}
	onPageHide(event)
	{
		if (this.hasMouse)
			this.hasMouse = false;
	}
	
	onClick(event)
	{
		var acted = false;
		if (!this.disabled && this.visible && this.test(event))
		{
			var rel;
			if (this.vertical)
				rel = (event.offsetY - this.y) / this.height;
			else
				rel = (event.offsetX - this.x) / this.width;
			if (rel <= 0.5 && rel <= 0.5)
			{
				this.value = (this.max - this.min) * (rel + 0.5)  + this.min;
				acted = true;
			}
			if (this.onChange !== null)
				this.onChange(this._value);
		}
		return acted;
	}
	test(event)
	{
		var relX;
		var relY;
		relX = (event.offsetY - this.y) / this.height;
		relY = (event.offsetX - this.x) / this.width;
		
		return (this.visible && (-0.5 <= relX && relX <= 0.5 && -0.5 <= relY && relY <= 0.5));
	}
}


class CommonUIContainer
{
	constructor()
	{
		this.registry = new Array();
		this.userOnClick = null;
		this.userOnMouseDown = null;
		this.userOnMouseUp = null;
	}
}


var commonUIContainer = new CommonUIContainer()
var commonUITutorialContainer = new CommonUIContainer()
var commonUIhasMouse = null;

function commonUIRegister(uiObject)
{
	var otype = uiObject instanceof Tutorial;
	if (otype)
	{
		var idx = commonUITutorialContainer.registry.length;
		commonUITutorialContainer.registry.push(uiObject);
	}
	else
	{
		var idx = commonUIContainer.registry.length;
		commonUIContainer.registry.push(uiObject);
	}
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

function commonUIRegisterOnMouseDown(onMouseDown)
{
	commonUIContainer.userOnMouseDown = onMouseDown;
}
function commonUIResetOnMouseDown()
{
	commonUIContainer.userOnMouseDown = null;
}

function commonUIRegisterOnMouseUp(onMouseUp)
{
	commonUIContainer.userOnMouseUp = onMouseUp;
}
function commonUIResetOnMouseUp()
{
	commonUIContainer.userOnMouseUp = null;
}

function commonUIOnClick(event)
{
	var i;
	var tutorialActive = false;
	for (i = 0; i < commonUITutorialContainer.registry.length && !tutorialActive; i++)
	{
		if ("onClick" in commonUITutorialContainer.registry[i] && commonUITutorialContainer.registry[i].active)
		{
			tutorialActive = commonUITutorialContainer.registry[i].standardUIDisable;
			commonUITutorialContainer.registry[i].onClick(event);
		}
	}
	if (!tutorialActive)
	{
		for (i = 0; i < commonUIContainer.registry.length; i++)
		{
			if ("onClick" in commonUIContainer.registry[i] && commonUIContainer.registry[i].test(event))
			{
				commonUIContainer.registry[i].onClick(event);
			}
		}
		if (commonUIContainer.userOnClick !== null)
			commonUIContainer.userOnClick(event);
	}
}

function commonUIOnMouseDown(event)
{
	var i;
	var tutorialActive = false;
	for (i = 0; i < commonUITutorialContainer.registry.length && !tutorialActive; i++)
	{
		if ("onMouseDown" in commonUITutorialContainer.registry[i] && commonUITutorialContainer.registry[i].active)
		{
			tutorialActive = commonUITutorialContainer.registry[i].standardUIDisable;
			commonUITutorialContainer.registry[i].onMouseDown(event);
			if (commonUITutorialContainer.registry[i].hasMouse)
					commonUIhasMouse = commonUITutorialContainer.registry[i]; 
		}
	}
	if (!tutorialActive)
	{
		for (i = 0; i < commonUIContainer.registry.length; i++)
		{
			if ("onMouseDown" in commonUIContainer.registry[i] && commonUIContainer.registry[i].test(event))
			{
				commonUIContainer.registry[i].onMouseDown(event);
				if (commonUIContainer.registry[i].hasMouse)
						commonUIhasMouse = commonUIContainer.registry[i]; 
			}
		}
		if (commonUIContainer.userOnMouseDown !== null)
			commonUIContainer.userOnMouseDown(event);
	}
}


function commonUIOnMouseUp(event)
{
	var i;
	var tutorialActive = false;
	for (i = 0; i < commonUITutorialContainer.registry.length && !tutorialActive; i++)
	{
		if ("onMouseUp" in commonUITutorialContainer.registry[i] && commonUITutorialContainer.registry[i].active)
		{
			tutorialActive = commonUITutorialContainer.registry[i].standardUIDisable;
			commonUITutorialContainer.registry[i].onMouseUp(event);
		}
	}
	if (!tutorialActive)
	{
		for (i = 0; i < commonUIContainer.registry.length; i++)
		{
			if ("onMouseUp" in commonUIContainer.registry[i])
			{
				commonUIContainer.registry[i].onMouseUp(event);
			}
		}
		if (commonUIContainer.userOnMouseUp !== null)
			commonUIContainer.userOnMouseUp(event);
	}
	if (commonUIhasMouse !== null && !commonUIhasMouse.hasMouse)
		commonUIhasMouse = null;
	
}

function commonUIOnMouseMove(event)
{
	if (commonUIhasMouse !== null && commonUIhasMouse.hasMouse && "onMouseMove" in commonUIhasMouse)
	{
		commonUIhasMouse.onMouseMove(event);
	}
}

function commonUIOnMouseLeave(event)
{
}

function commonUIdraw(context)
{
	// check for active tutorials
	var i;
	for (i = 0; i < commonUIContainer.registry.length; i++)
	{
		if ("draw" in commonUIContainer.registry[i])
			commonUIContainer.registry[i].draw(context);
	}
	for (i = 0; i < commonUITutorialContainer.registry.length; i++)
	{
		if ("draw" in commonUITutorialContainer.registry[i] && commonUITutorialContainer.registry[i].active)
			commonUITutorialContainer.registry[i].draw(context);
	}
}
