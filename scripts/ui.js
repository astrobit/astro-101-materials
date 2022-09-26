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
		let i;
		for (i = 0; i < this.radioButtonArray.length; i++)
		{
			this.radioButtonArray[i].selected = (this.radioButtonArray[i].value == initalValue);
		}
		this.value = initalValue;
	}

	draw(context)
	{
		let i;
		for (i = 0; i < this.radioButtonArray.length; i++)
		{
			this.radioButtonArray[i].draw(context);
		}
	}
	onClick(event)
	{
		if (!this.disabled)
		{
			let found = -1;
			let i;
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
		let i;
		let ret = false;
		for (i = 0; i < this.radioButtonArray.length && !ret; i++)
		{
			ret = this.radioButtonArray[i].test(event);
		}
		return ret;
	}
	setState(value)
	{
		let found = null;
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
			const x = (event.offsetX - this.x) / this.width;
			const y = (event.offsetY - this.y) / this.height;
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
		this.disableSliderStyle = "#3F3F3F";
		this.cursorStyle = "#00007F";
		this.disableCursorStyle = "#1F1F3F"
		this.onChange = null;
		this.drawer = null;
		this.hasMouse = false;
		this.calculateSlope();
		this.label = null;
		this.labelStyle = "#000000";
		this.disablelabelStyle = "#7F7F7F";
		this.labelFont = "16px Ariel"
		this.labelPosition = "center-above";
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
		if (this.visible)
		{
			context.save();
			context.translate(this.x,this.y);
			if (this.drawer !== null)
				this.drawer();
			else
			{
				if (typeof this.label !== 'undefined' && this.label !== null)
				{
					if (this.disabled)
						context.fillStyle = this.disableLabelStyle;
					else
						context.fillStyle = this.labelStyle;
					
					const fontSize = this.labelFont.search("px");
					let size;
					if (this.labelFont.charAt(fontSize - 2) < '0' ||  this.labelFont.charAt(fontSize - 2) > '9')
					{
						size = parseInt(this.labelFont.substring(fontSize - 1,fontSize));
					}
					else
					{
						if (this.labelFont.charAt(fontSize - 3) < '0' ||  this.labelFont.charAt(fontSize - 3) > '9')
							size = parseInt(this.labelFont.substring(fontSize - 2,fontSize));
						else
							size = parseInt(this.labelFont.substring(fontSize - 3,fontSize));
					}
					let x = 0;
					let y = 0;
					const positionDash = this.labelPosition.search("-");
					const positionHorizontal = this.labelPosition.substring(0,positionDash);
					const positionVertical = this.labelPosition.substring(positionDash + 1);
					
					
					if (positionVertical == "middle")
						y = 0;
					else if (positionVertical == "above")
					{
						if (this.vertical)
							y = -this.cursorSize - 2;
						else
							y = -this.height * 0.5 - this.cursorSize - 2;
					}
					else // below
					{
						if (this.vertical)
							y = this.cursorSize + 2 + size;
						else
							y = this.height * 0.5 + this.cursorSize + size;
					}
					if (positionHorizontal == "center")
					{
						x = 0;
						context.font = this.labelFont
						drawTextCenter(context,this.label,x,y);
					}
					else if (positionHorizontal == "left")
					{
						if (this.vertical)
							x = -this.cursorSize - 2;
						else
							x = -this.width * 0.5 - this.cursorSize - 2;
						drawTextRight(context,this.label,x,y);
					}
					else // right
					{
						if (this.vertical)
							x = this.cursorSize + 2;
						else
							x = this.width * 0.5 + this.cursorSize + 2;
						context.fillText(this.label,x,y);
					}
					
				}
				if (this.disabled)
					context.fillStyle = this.disableSliderStyle;
				else
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
				
				let cursorX;
				let cursorY;
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
				
				if (this.disabled)
					context.fillStyle = this.disableCursorStyle;
				else
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
	}
	onMouseDown(event)
	{
		let acted = false;
		if (!this.disabled && this.visible && this.test(event))
		{
			let cursorPos = this._value * this._slope + this._offset;
			let relX;
			let relY;
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
				const r = relX * relX + relY * relY - this.cursorSize * this.cursorSize;
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
		let acted = false;
		if (this.hasMouse)
		{
			this.hasMouse = false;
			acted = true;
		}
		return acted;
	}
	onMouseMove(event)
	{
		let acted = false;
		if (this.hasMouse)
		{
			let relPos;
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
		let acted = false;
		if (!this.disabled && this.visible && this.test(event))
		{
			let rel;
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
		const relX = (event.offsetY - this.y) / this.height;;
		const relY = (event.offsetX - this.x) / this.width;
		
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


let commonUIContainer = new CommonUIContainer()
let commonUITutorialContainer = new CommonUIContainer()
let commonUIhasMouse = null;

function commonUIRegister(uiObject)
{
	const otype = uiObject instanceof Tutorial;
	let idx;
	if (otype)
	{
		idx = commonUITutorialContainer.registry.length;
		commonUITutorialContainer.registry.push(uiObject);
	}
	else
	{
		idx = commonUIContainer.registry.length;
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
	let i;
	let tutorialActive = false;
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
	let i;
	let tutorialActive = false;
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
	let i;
	let tutorialActive = false;
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
	let i;
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
