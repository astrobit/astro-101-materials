
class LabelFormatter
{
	constructor()
	{
		this._isAngle = false; // display angles as degrees, minues, seconds
		this._showUnitsAngle = false; // if true, will display degrees symbol (°), minute symbol (') and second symbol (") as appropriate
		this._isTime = false; // display values as a time in HH:MM:SS format
		this._showUnitsTime = false; // if true, will display degrees symbol (°), minute symbol (') and second symbol (") as appropriate
		this._timeUnitsColons = true;
		
		this._angleFormat = "D.d"; // available formats: 
										// "D" for degrees with no leading zeros and no decimal;  
										// "D.d" for no leading zeros and decimal degrees, number of 'd' indicates rounding
										// "0D" for leading zeros and no decimal;  
										// "0D.d" for leading zeros and decimal degrees, number of 'd' indicates rounding;  
										// "[D] M" for minutes with no decimal and no leading 0, [D] represents desired degrees format;  
										// "[D] M.m" for minutes with decimal and no leading 0, number of 'm' indicates rounding, [D] represents desired degrees format;  
										// "[D] 0M" for minutes with no decimal and a leading 0, [D] represents desired degrees format;  
										// "[D] 0M.m" for minutes with decimal and a leading 0, number of 'm' indicates rounding, [D] represents desired degrees format;  
										// "[D] M" for minutes with no decimal and no leading 0, [D] represents desired degrees format;  
										// "[D] M.m" for minutes with decimal and no leading 0, number of 'm' indicates rounding, [D] represents desired degrees format;  
										// "[D] 0M" for minutes with no decimal and a leading 0, [D] represents desired degrees format;  
										// "[D] 0M.m" for minutes with decimal and a leading 0, number of 'm' indicates rounding, [D] represents desired degrees format;  
										// "[D] [M] S" for seconds with no decimal and no leading 0, [D] represents desired degrees format and [M] represents desired minutes format;  
										// "[D] [M] S.s" for seconds with decimal and no leading 0, number of 's' indicates rounding, [D] represents desired degrees format and [M] represents desired minutes format;  
										// "[D] [M] 0S" for seconds with no decimal and a leading 0, [D] represents desired degrees format and [M] represents desired minutes format;  
										// "[D] [M] 0S.s" for seconds with decimal and a leading 0, number of 's' indicates rounding, [D] represents desired degrees format and [M] represents desired minutes format;  
				
		this._timeFormat = "HH 0M 0S ap"; // 
										// "H" for degrees with no leading zeros and no decimal;  
										// "H.h" for no leading zeros and decimal hours, number of 'h' indicates rounding
										// "0H" for leading zeros and no decimal;  
										// "0H.H" for leading zeros and decimal hours, number of 'h' indicates rounding;  
										// "[H] M" for minutes with no decimal and no leading 0, [H] represents desired hour format;  
										// "[H] M.m" for minutes with decimal and no leading 0, number of 'm' indicates rounding, [H] represents desired hour format;  
										// "[H] 0M" for minutes with no decimal and a leading 0, [H] represents desired degrees format;  
										// "[H] 0M.m" for minutes with decimal and a leading 0, number of 'm' indicates rounding, [H] represents desired hour format;  
										// "[H] [M] S" for seconds with no decimal and no leading 0, [H] represents desired degrees format and [M] represents hour minutes format;  
										// "[H] [M] S.s" for seconds with decimal and no leading 0, number of 's' indicates rounding, [H] represents desired hour format and [M] represents desired minutes format;  
										// "[H] [M] 0S" for seconds with no decimal and a leading 0, [H] represents desired hour format and [M] represents desired minutes format;  
										// "[H] [M] 0S.s" for seconds with decimal and a leading 0, number of 's' indicates rounding, [H] represents desired hour format and [M] represents desired minutes format;  
										// "[H] [M] [S] ap" indicates that times should be shown as AM or PM, with AM or PM listed at the end; if am/pm is not used, then hours will be 24+ hour format, if am/pm is used, hours will be 1 - 12 and negative values will be adjusted
	}
	
	format(value,step)
	{
		var absValue = Math.abs(value);
		var ret = new String();
		var log10 = Math.log10(absValue);
		var log10Step = Math.log10(step);
		var exponentStep = Math.floor(log10Step);
		
		var exponent = Math.floor(log10);
		var mantissa = Math.pow(10,log10 - exponent);
		if (this._isAngle || this._isTime)
		{
			var deg_hr_format;
			var min_format = null;
			var sec_format = null;
			var am_pm = false;
			var decimal_deg_hr = 0;
			var decimal_min = 0;
			var decimal_sec = 0;
			var lead_zero_deg_hr = false;
			var lead_zero_min = false;
			var lead_zero_sec = false;
			
			
			if (this._isAngle)
			{
				var format = this._angleFormat.split(" ");
				
				deg_hr_format = format[0];
				if (format.length > 1)
					min_format = format[1];
				if (format.length > 2)
					sec_format = format[2];

				if (deg_hr_format !== null && !(deg_hr_format.charAt(0) == 'D' || (deg_hr_format.charAt(0) == '0' && deg_hr_format.charAt(1) == 'D')))
				{
					console.log("Invalid axis label format " + deg_hr_format);
					deg_hr_format = "D";
					min_format = null;
					sec_format = null;
				}
				if (min_format !== null && min_format.length == 0)
					min_format = null;
				if (min_format !== null && !(min_format.charAt(0) == 'M' || (min_format.charAt(0) == '0' && min_format.charAt(1) == 'M')))
				{
					console.log("Invalid axis label format " + min_format);
					min_format = null;
					sec_format = null;
				}
				if (sec_format !== null && sec_format.length == 0)
					sec_format = null;
					
				if (sec_format !== null && !(sec_format.charAt(0) == 'S' || (sec_format.charAt(0) == '0' && sec_format.charAt(1) == 'S')))
				{
					console.log("Invalid axis label format " + sec_format);
					sec_format = null;
				}

			}
			else
			{
				var format = this._timeFormat.split(" ");
				
				deg_hr_format = format[0];
				if (format.length > 1)
				{
					am_pm = format[1] == 'ap';
					if (!am_pm)
						min_format = format[1];
				}
				if (format.length > 2)
				{
					am_pm = format[2] == 'ap';
					if (!am_pm)
						sec_format = format[2];
				}
				if (deg_hr_format !== null && !(deg_hr_format.charAt(0) == 'H' || (deg_hr_format.charAt(0) == '0' && deg_hr_format.charAt(1) == 'H')))
				{
					console.log("Invalid axis label format " + deg_hr_format);
					min_format = null;
					sec_format = null;
				}
				if (min_format !== null && min_format.length == 0)
					min_format = null;
				if (min_format !== null && !(min_format.charAt(0) == 'M' || (min_format.charAt(0) == '0' && min_format.charAt(1) == 'M')))
				{
					console.log("Invalid axis label format " + min_format);
					min_format = null;
					sec_format = null;
				}
				if (sec_format !== null && sec_format.length == 0)
					sec_format = null;
				if (sec_format !== null && !(sec_format.charAt(0) == 'S' || (sec_format.charAt(0) == '0' && sec_format.charAt(1) == 'S')))
				{
					console.log("Invalid axis label format " + sec_format);
					sec_format = null;
				}
					
				if (format.length > 3)
					am_pm = format[3] == 'ap';
			}
			
			if (deg_hr_format.charAt(1) == '.' || deg_hr_format.charAt(2) == '.')
			{
				var idx = 2;
				if (deg_hr_format.charAt(2) == '.')
					idx = 3;
				var i;
				for (i = 0; i < deg_hr_format.length; i++)
				{
					var curr = deg_hr_format.charAt(idx + i);
					if (curr == 'd' || curr == 'h')
						decimal_deg_hr += 1;
				}
			}
			lead_zero_deg_hr = deg_hr_format.charAt(0) == '0';
			
			if (min_format !== null && (min_format.charAt(1) == '.' || min_format.charAt(2) == '.'))
			{
				var idx = 2;
				if (min_format.charAt(2) == '.')
					idx = 3;
				var i;
				for (i = 0; i < min_format.length; i++)
				{
					var curr = min_format.charAt(idx + i);
					if (curr == 'm')
						decimal_min += 1;
				}
			}
			lead_zero_min = (min_format !== null && min_format.charAt(0) == '0');

			if (sec_format !== null && (sec_format.charAt(1) == '.' || sec_format.charAt(2) == '.'))
			{
				var idx = 2;
				if (sec_format.charAt(2) == '.')
					idx = 3;
				var i;
				for (i = 0; i < sec_format.length; i++)
				{
					var curr = sec_format.charAt(idx + i);
					if (curr == 's')
						decimal_sec += 1;
				}
			}
			lead_zero_sec = (sec_format !== null && sec_format.charAt(0) == '0');

			var degrees_hours;
			var frac_part = 0;
			var is_pm = false;
			var degrees_hours_negative = false;
			if (this._isTime && am_pm && (value < 0 || value >= 24))
			{
				var mult = Math.floor(value / 24.0);
				absValue = value - mult * 24.0;
				frac_part = absValue - Math.floor(absValue);
				if (decimal_deg_hr == 0)
					degrees_hours = Math.floor(absValue);
				else
				{
					var mult = Math.pow(10.0,decimal_deg_hr);
					degrees_hours = Math.round(absValue * mult) / mult;
				}
			}
			else
			{
				if (value < 0)
					frac_part = 1.0 - (absValue - Math.floor(absValue));
				else
					frac_part = absValue - Math.floor(absValue);
				
				if (decimal_deg_hr == 0)
				{
					degrees_hours = Math.floor(absValue);
				}
				else
				{
					var mult = Math.pow(10.0,decimal_deg_hr);
					degrees_hours = Math.round(absValue * mult) / mult;
				}
				degrees_hours_negative = value < 0;
			}
			if (degrees_hours_negative)
				ret += '-';
			is_pm = (degrees_hours >= 12)
			if (degrees_hours < 1 && am_pm)
				degrees_hours += 12;
				
			if (lead_zero_deg_hr && this._isTime && degrees_hours < 10)
				ret += '0';
			else if (lead_zero_deg_hr && this._isAngle && degrees_hours < 10)
				ret += '00';
			else if (lead_zero_deg_hr && this._isAngle && degrees_hours < 100)
				ret += '0';
			
			ret += degrees_hours.toString();

			if (this._isAngle && (this._showUnitsAngle || min_format !== null))
				ret += String.fromCharCode(0x00b0);
			else if (this._isTime && ((this._showUnitsTime && decimal_deg_hr == 0) || min_format !== null))
			{
				if (this._timeUnitsColons)
					ret += ':';
				else
					ret += 'h';
			}
			
			if (min_format !== null)
			{
				if (this._isAngle)
					ret += ' ';
				else if (this._isTime && this._showUnitsTime && !this._timeUnitsColons)
					ret += ' ';
			
				frac_part *= 60.0;
				var minutes;
				if (decimal_min == 0)
				{
					minutes = Math.floor(frac_part);
					frac_part -= minutes;
				}
				else
				{
					var mult = Math.pow(10.0,decimal_min);
					minutes = Math.round(frac_part * mult) / mult;
				}
				if (lead_zero_min && minutes < 10)
					ret += '0';
				ret += minutes.toString();
				
				if (this._isAngle)
					ret += "'";
				else if (this._isTime)
				{
					if (this._timeUnitsColons)
					{
						if (sec_format !== null)
							ret += ':';
					}
					else
						ret += 'm';
				}
			}
			else if (this._isTime && this._showUnitsTime && this._timeUnitsColons && decimal_deg_hr == 0)
				ret += '00';
		

			if (sec_format !== null)
			{
				if (this._isAngle)
					ret += ' ';
				else if (this._isTime && this._showUnitsTime && !this._timeUnitsColons)
					ret += ' ';
			
				frac_part *= 60.0;
				var seconds;
				if (decimal_sec == 0)
				{
					seconds = Math.floor(frac_part);
				}
				else
				{
					var mult = Math.pow(10.0,decimal_sec);
					seconds = Math.round(frac_part * mult) / mult;
				}
				if (lead_zero_sec && seconds < 10)
					ret += '0';
				ret += seconds.toString();
				if (this._isAngle)
					ret += "\"";
				else if (this._isTime)
				{
					if (!this._timeUnitsColons)
						ret += 's';
				}
			}
			if (am_pm)
			{
				if (is_pm)
					ret += ' PM';
				else
					ret += ' AM';
			}
		}
		else
		{
			if (step < 1)
			{
				if (absValue > 0.001)
				{
					var m10 = Math.pow(10,-exponentStep);
					ret += (Math.round(value * m10)/m10).toString();
				}
				else
				{
					var m10 = Math.pow(10,exponent - exponentStep);
					if (value < 0)
						ret += '-';
					var rounded = Math.round(mantissa * m10)/m10;
					ret += rounded.toString();
					if (rounded != 0)
					{
						ret += "×10⁻";
						ret += toSuperscript(Math.abs(exponent));
					}
				}
			}
			else
			{
				if (absValue < 1000)
				{
					ret = Math.floor(value).toString();
				}
				else
				{
					var m10 = Math.pow(10,exponent - exponentStep);
					if (value < 0)
						ret += '-';
					var rounded = Math.round(mantissa * m10)/m10;
					ret += rounded.toString();
					if (rounded != 0)
					{
						ret += "×10";
						ret += toSuperscript(Math.abs(exponent));
					}
				}
			}
		}
		return ret;
	}
}

class GraphAxis
{
	_calculate_graph_parameters()
	{
		if (this._log)
		{
			var logMin = Math.log2(this._min);
			var logMax = Math.log2(this._max);
			
			var slope = 1.0 / (logMax - logMin);
			if (this._invert)
			{
				this._slope = -slope;
				this._offset = -logMax * slope;
			}
			else
			{
				this._slope = slope;
				this._offset = -logMin * slope;
			}
			var step = Math.abs(this._max / this._min);
			var logstep = Math.abs(Math.log10(step));
			
			this._suggestedMajorStep = Math.ceil(logstep / 5);
			if (logstep < 2)
				this._suggestedMinorStep = 1;
			else if (logstep < 4)
				this._suggestedMinorStep = 2;
			else if (logstep < 10)
				this._suggestedMinorStep = 5;
			else
				this._suggestedMinorStep = Math.pow(10.0,Math.ceil(logstep / 25)); // really this means increasing by decades
		}
		else
		{
			var delta = (this._max - this._min);
			var slope = 1.0 / delta;
			if (this._invert)
			{
				this._slope = - slope;
				this._offset = -this._max * slope;
			}
			else
			{
				this._slope = slope;
				this._offset = -this._min * slope;
			}
			var step = Math.abs(delta) * 0.2;
			// 1, 2, 2.5, 5
			var logstep = Math.log10(step);
			var expstep = Math.floor(logstep);
			var manstep = Math.pow(10,logstep - expstep);
			if (manstep < 1.5)
			{
				this._suggestedMajorStep = Math.pow(10,expstep);
				this._suggestedMinorStep = 2 * Math.pow(10,expstep - 1)
			}
			else if (manstep < 	2.25)
			{
				this._suggestedMajorStep = 2 * Math.pow(10,expstep);
				this._suggestedMinorStep = 5 * Math.pow(10,expstep - 1)
			}
			else if (manstep < 	3.75)
			{
				this._suggestedMajorStep = 2.5 * Math.pow(10,expstep);
				this._suggestedMinorStep = 5 * Math.pow(10,expstep - 1)
			}
			else if (manstep < 	7.5)
			{
				this._suggestedMajorStep = 5 * Math.pow(10,expstep);
				this._suggestedMinorStep = 1 * Math.pow(10,expstep - 1)
			}
			else
			{
				this._suggestedMajorStep = Math.pow(10,expstep + 1);
				this._suggestedMinorStep = 2 * Math.pow(10,expstep);
			}
		}
	}
	constructor (id,title,min,max)
	{
		this.id = id;
		this._min = min;
		this._max = max;
		this._log = false;
//		this._logBase = 10; // not currently used
		this._invert = false;

		this._labelColor = "#FFFFFF";
		this._labelFont = "14px Arial";

		this._enableMajor = true;
		this._labelMajorStep = null;
		this._tickMajorLength = 5;
		this._tickMajorWidth = 1;
		this._tickMajorLabelOffset = 10;
		this._labelMajorPrecision = 0;

		this._enableMinor = false;
		this._labelMinorStep = null;
		this._tickMinorLength = 3;
		this._tickMinorWidth = 1;
		this._tickMinorLabelOffset = 12;
		this._labelMinorPrecision = 0;

		this._title = title;
		this._titleOffset = 36;
		this._titleColor = "#FFFFFF";
		this._titleFont = "20px Arial";
		this._titleAlign = "center";
		
		this._labelFormatter = new LabelFormatter();
		this._calculate_graph_parameters();
	}
	
	_labelsSpaceRequired()
	{
		var fontsize = getFontSize(this._labelFont);
		var fontSizePx = 0;
		if (fontsize !== undefined && fontsize !== null)
		{
			if (fontsize.units == 'em')
				fontSizePx = fontsize.value * 16.0;
			else if (fontsize.units == 'px')
				fontSizePx = fontsize.value;
			else
				fontSizePx = 12.0;// who knows how this will  be interpreted by the renderer
		}
		var labelMaxLength;
		if (this._labelFormatter._isAngle)
		{
			labelMaxLength = this._labelFormatter._angleFormat.length * fontSizePx;
			if (this._showUnitsAngle)
				labelMaxLength += fontSizePx;
		}
		else if (this._labelFormatter._isTime)
		{
			labelMaxLength = this._labelFormatter._timeFormat.length * fontSizePx;
			if (this._showUnitsTime && !this._timeUnitsColons && this._labelFormatter._timeFormat.search("ap") == -1)
				labelMaxLength += fontSizePx;
		}
		else
		{
			labelMaxLength = Math.floor(Math.log10(this._max) + 1) * fontSizePx;
		}
//		labelMaxLength *= 0.7; // font size refers to height; width is about 0.5; 0.6 is safelt larger than nearly all fonts
		return labelMaxLength + this._tickMajorLabelOffset
	}
	drawTitle(context,dir,size,side)
	{
		var x = 0;
		if (this._titleAlign == "center")
			x = 0.5 * size;
		else if (this._titleAlign == "right")
			x = 1.0 * size;
		var offset = this._labelsSpaceRequired();
		
		context.save();
			context.fillStyle = this._titleColor;
			context.font = this._titleFont;
			context.textBaseline = "middle";
			context.textAlign = this._titleAlign;
			if (side == 1)
			{
				if (dir == 1)
				{
					context.translate(offset,-x);
					context.rotate(-Math.PI * 0.5);
				}
				else
				{
					context.translate(x,-offset);
				}
			}
			else
			{
				if (dir == 1)
				{
					context.translate(-offset,-x);
					context.rotate(-Math.PI * 0.5);
				}
				else
				{
					context.translate(x,offset);
				}
			}			
			context.fillText(this._title,0,0);
		context.restore();
	}
	
	_drawTick(context,dir,size,side,x,length)
	{
		if (dir == 1)
		{
			context.beginPath();
			if (side == 0)
			{
				context.moveTo(0,-x);
				context.lineTo(-length,-x);
			}
			else
			{
				context.moveTo(0,-x);
				context.lineTo(length,-x);
			}
			context.stroke();
		}
		else
		{
			context.beginPath();
			context.moveTo(x,0);
			if (side == 0)
			{
				context.moveTo(x,0);
				context.lineTo(x,length);
			}
			else
			{
				context.moveTo(x,0);
				context.lineTo(x,-length);
			}
			context.stroke();
		}
	}
	_drawLabel(context,dir,size,side,label,x,labelOffset)
	{
		if (dir == 1)
		{
			if (side == 0)
				context.fillText(label,-labelOffset,-x);
			else
				context.fillText(label,labelOffset,-x);
		}
		else
		{
			context.save();
				if (side == 0)
					context.translate(x,labelOffset);
				else
					context.translate(x,-labelOffset);
				if (side == 0)
					context.rotate(-Math.PI * 0.5);
				else
					context.rotate(Math.PI * 0.5);
												
				context.fillText(label,0,0);
			context.restore();
		}			
	}
	_drawTicksLabelsLinear(context,dir,size,side)
	{
		if (this._enableMajor)
		{
			var stepMajor = this._labelMajorStep;
			if (stepMajor === undefined || stepMajor === null)
			{
				stepMajor = this._suggestedMajorStep;
			}
			var stepMinor = this._labelMinorStep;
			if (stepMinor === undefined || stepMinor === null)
			{
				stepMinor = this._suggestedMinorStep;
			}
			var invStep = 1.0  / stepMajor;
			var minLabel = Math.floor(this._min * invStep) * stepMajor;
			var maxLabel = Math.ceil(this._max * invStep) * stepMajor;
			var lbl;

			for (lbl = minLabel; lbl <= maxLabel; lbl += stepMajor)
			{
				if (lbl >= this._min && lbl <= this._max)
				{
					var x = this.calculate(lbl) * size;
					var label = this._labelFormatter.format(lbl,stepMajor);
					this._drawTick(context,dir,size,side,x,this._tickMajorLength);
					this._drawLabel(context,dir,size,side,label,x,this._tickMajorLabelOffset);
				}
				if (this._enableMinor)
				{
					var i;
					for (i = stepMinor; i < stepMajor; i += stepMinor)
					{
						var lbli = lbl + i;
						if (lbli >= this._min && lbli <= this._max)
						{
							var x = this.calculate(lbli) * size;
							var label = this._labelFormatter.format(lbli,stepMinor);
							this._drawTick(context,dir,size,side,x,this._tickMinorLength);
							this._drawLabel(context,dir,size,side,label,x,this._tickMinorLabelOffset);
						}
					}
				}
			}
		}
	}
	
	_drawTicksLabelsLog(context,dir,size,side)
	{
		if (this._enableMajor)
		{
			var stepMajor = this._labelMajorStep;
			if (stepMajor === undefined || stepMajor === null)
			{
				stepMajor = this._suggestedMajorStep;
			}
			var stepMinor = this._labelMinorStep;
			if (stepMinor === undefined || stepMinor === null)
			{
				stepMinor = this._suggestedMinorStep;
			}
			var invStep = 1.0  / stepMajor;
			var minLabel = Math.floor(Math.log10(this._min) * invStep) * stepMajor;
			var maxLabel = Math.ceil(Math.log10(this._max) * invStep) * stepMajor;
			var lbl;

			for (lbl = minLabel; lbl <= maxLabel; lbl += stepMajor)
			{
				var stepMajor10 = Math.pow(10.0,stepMajor);
				var lbl10 = Math.pow(10.0,lbl);
				var stepLabel = 1;
				if (lbl < 0)
					stepLabel = lbl10;
				if (lbl10 >= this._min && lbl10 <= this._max)
				{
					var x = this.calculate(lbl10) * size;
					var label = this._labelFormatter.format(lbl10,stepLabel);
					this._drawTick(context,dir,size,side,x,this._tickMajorLength);
					this._drawLabel(context,dir,size,side,label,x,this._tickMajorLabelOffset);
				}
				if (this._enableMinor)
				{
					if (stepMinor >= 10) // increment in decades
					{
						var i;
						for (i = stepMinor; i < stepMajor10; i *= stepMinor)
						{
							var lbli = lbl10 * i;
							if (lbli >= this._min && lbli <= this._max)
							{
								var x = this.calculate(lbli) * size;
								var label = this._labelFormatter.format(lbli,stepLabel);
								this._drawTick(context,dir,size,side,x,this._tickMinorLength);
								this._drawLabel(context,dir,size,side,label,x,this._tickMinorLabelOffset);
							}
						}
					}
					else
					{
						var i;
						for (i = stepMinor; i < 10; i += stepMinor)
						{
							if (i != 1)
							{
								var lbli = lbl10 * i;
								if (lbli >= this._min && lbli <= this._max)
								{
									var x = this.calculate(lbli) * size;
									var label = this._labelFormatter.format(lbli,stepLabel);
									this._drawTick(context,dir,size,side,x,this._tickMinorLength);
									this._drawLabel(context,dir,size,side,label,x,this._tickMinorLabelOffset);
								}
							}
						}
					}
				}
			}
		}
	}

	drawLabels(context,dir,size,side)
	{
		context.save();
			context.fillStyle = this._labelColor;
			context.strokeStyle = this._labelColor;
			context.font = this._labelFont;
			if (dir == 1)
			{
				context.textBaseline = "middle";
				if (side == 0)
					context.textAlign = "right";
				else
					context.textAlign = "left";
			}
			else
			{				
				context.textBaseline = "middle"; // want top for labels
				if (side == 0)
					context.textAlign = "right";
				else
					context.textAlign = "right";
			}
			if (this._log)
				this._drawTicksLabelsLog(context,dir,size,side);
			else
				this._drawTicksLabelsLinear(context,dir,size,side);
		context.restore();
	}
	
	calculate(value)
	{
		var ret;
		if (this._log)
		{
			if (value > 0)
			{
				ret = Math.log2(value) * this._slope + this._offset;
			}
		}
		else
		{
			ret = value * this._slope + this._offset;
		}
		return ret;
	}
	get max()
	{
		return this._max;
	}
	set max(value)
	{
		this._max = value;
		this._calculate_graph_parameters();
	}
	
	get min()
	{
		return this._min;
	}
	set min(value)	
	{
		this._min = value;
		this._calculate_graph_parameters();
	}

	get log()
	{
		return this._log;
	}
	set log(value)
	{
		if (value === undefined)
			this._log = true;
		else if (value === null)
			this._log = true;
		else if (typeof(value) == 'boolean')
			this._log = value;
		else if (typeof(value) == 'number')
			this._log = (value != 0);
		this._calculate_graph_parameters();
	}
	
	get linear()
	{
		return !this._log;
	}
	set linear(value)
	{
		if (value === undefined)
			this.log = false;
		else if (value === null)
			this.log = false;
		else if (typeof(value) == 'boolean')
			this.log = !value;
		else if (typeof(value) == 'number')
			this.log = (value == 0);
	}
	
	requiredSpace()
	{
		var fontsize = getFontSize(this._titleFont);
		var fontSizePx = 0;
		if (fontsize !== undefined && fontsize !== null)
		{
			if (fontsize.units == 'em')
				fontSizePx = fontsize.value * 16.0;
			else if (fontsize.units == 'px')
				fontSizePx = fontsize.value;
			else
				fontSizePx = 12.0;// who knows how this will  be interpreted by the renderer
		}
		var titleSpace = fontSizePx + 2;// + this._titleOffset;
		var labelSpace = this._labelsSpaceRequired();

		return titleSpace + labelSpace;
	
	}
	
//	get logBase()
//	{
//		return this._logBase;
//	}
//	
//	set logBase(value)
//	{
//		this._logBase = value;
//	}
	
}

class GraphDatum
{
	constructor(x,y,xerror,yerror)
	{
		this.x = x;
		this.y = y;
		this.xerror = xerror;
		this.yerror = yerror;
	}
}
class GraphDataSet
{
	constructor(id,horizontalAxisID, verticalAxisID, data, symbol, symbolSize, color, filled)
	{
		this.id = id;
		this._horizontalAxisID = horizontalAxisID;
		this._verticalAxisID = verticalAxisID;
		this._data = data;
		this._symbol = symbol;
		this._symbolSize = symbolSize;
		this._color = color;
		this._filled = filled;
		if (this._data === undefined || this._data === null)
		{
			this._data = new Array();
		}
	}
	get length()
	{
		return this._data.length;
	}
	at(index)
	{
		var ret;
		if (index < this._data.length)
		{
			ret = this._data[index];
		}
		return ret;
	}
	add(datum)
	{
		if (datum instanceof GraphDatum)
		{
			this._data.push(datum);
		}
	}
	// 2-dimensional linear fitting using least squares

	LinearLeastSquare(loglog)
	{
		if (this._data.length > 1)
		{
			var sY = 0;
			var sX = 0;
			var sX2 = 0;
			var sXY = 0;
			var sOy = 0;
			var idxLcl;
			var count = 0;
			for (idxLcl = 0; idxLcl < this._data.length; idxLcl++)
			{
				if (this._data[idxLcl].x !== null && this._data[idxLcl].y !== null)
				{
					var xl = this._data[idxLcl].x;
					var yl = this._data[idxLcl].y;
					var process = true;
					if (loglog !== undefined && loglog)
					{
						process = (this._data[idxLcl].x > 0 && this._data[idxLcl].y > 0);
						xl = Math.log2(this._data[idxLcl].x);
						yl = Math.log2(this._data[idxLcl].y);
					}
					if (process)
					{
						sY += yl;
						sX += xl;
						sX2 += xl * xl;
						sXY += xl * yl;
						count++;
					}
				}
			}
			var invN = 1.0 / count;
			var invDelta = 1.0 / (count * sX2 - sX * sX);
			var _m = (count * sXY - sX * sY) * invDelta;
			var _b = (sX2 * sY - sX * sXY) * invDelta;
			var _om;
			var _ob;
			var _oy;
			if (count > 2)
			{
				for (idxLcl = 0; idxLcl < count; idxLcl++)
				{
					if (this._data[idxLcl].x !== null && this._data[idxLcl].y !== null)
					{
						var xl = this._data[idxLcl].x;
						var yl = this._data[idxLcl].y;
						var process = true;
						if (loglog !== undefined && loglog)
						{
							process = (this._data[idxLcl].x > 0 && this._data[idxLcl].y > 0);
							xl = Math.log2(this._data[idxLcl].x);
							yl = Math.log2(this._data[idxLcl].y);
						}
						if (process)
						{
							var err = yl - _b - _m * xl;
							sOy += err * err;
						}
					}
				}
				_oy = Math.sqrt(sOy / (count - 2.0));
				_ob = Math.sqrt(sX2 * invDelta) * _oy;
				_om = Math.sqrt(count * invDelta) * _oy;
			}
			else
			{
				_oy = 0;
				_ob = 0;
				_om = 0;
			}
		}
		var type = "Linear LLS";
		if (loglog)
			type = "Log-Log LLS";
		return {type: type, slope: _m, slope_uncertainty: _om, intercept: _b, intercept_uncertainty: _ob, S: _oy, DOF: count - 2};
	}
	LogLogLinearLeastSquare()
	{
		return this.LinearLeastSquare(true);
	}	
}
class GraphTrend
{

	constructor(id,horizontalAxisID, verticalAxisID, type, m,b, color )
	{
		this.id = id;
		this._horizontalAxisID = horizontalAxisID;
		this._verticalAxisID = verticalAxisID;
		if (type == "linear")
		{
			this._m = m;
			this._b = b;
		}
		else
		{
			this._exponent = m;
			this._coefficent = b;
		}
		this._color = color;
		this._type = type;
	}
	y(x)
	{
		var ret = null;
		if (this._type == "linear")
		{
			ret = this._m * x + this._b;
		}
		else
		{
			ret = this._coefficent * Math.pow(x,this._exponent);
		}
		return ret;
	}
	x(y)
	{
		var ret = null;
		if (this._type == "linear")
		{
			ret = (y - this._b) / this._m;
		}
		else
		{
			ret = Math.pow(y / this._coefficent, 1.0 / this._exponent);
		}
		return ret;
	}
	
}
class Graph
{
	constructor (id,height,width,color)
	{
		this._id = id;
		this.height = height;
		this.width = width;
		this.color = color;
		this._axisHorizontal = new Array();
		this._axisVertical = new Array();
		this._data = new Array();
		this._trends = new Array();
		this._colorMax = 6;
		this._paletteSelect = 0;
		this._paletteMax = 6;
		this._invertPalette = true;
	
		this._symbolMax = 5; // square, circle, triangle up, triangle down, diamond	
	}
	findAxisByID(id)
	{
		var ret = null;
		var i = 0;
		for (i = 0; ret === null && i < this._axisHorizontal.length; i++)
		{
			if (this._axisHorizontal[i].id == id)
				ret = this._axisHorizontal[i];
		}
		for (i = 0; ret === null && i < this._axisVertical.length; i++)
		{
			if (this._axisVertical[i].id == id)
				ret = this._axisVertical[i];
		}
		return ret;
	}
	findDataByID(id)
	{
		var ret = null;
		var i = 0;
		for (i = 0; ret === null && i < this._data.length; i++)
		{
			if (this._data[i].id == id)
				ret = this._data[i];
		}
		return ret;
	}
	addHorizontalAxis(axis)
	{
		if (axis instanceof GraphAxis)
		{
			var currAxis = this.findAxisByID(axis.id);
			if (currAxis !== null)
			{
				console.log("new GraphAxis " + axis.id + " added to Graph " + this._id + ", but axis with that ID already exists.");
			}
			else
			{
				this._axisHorizontal.push(axis);
				if (this._axisHorizontal.length > 2)
				{
					console.log("new GraphAxis " + axis.id + " added to Graph " + this._id + ", but this graph already has 2 or more horizontal axes.");
				}
			}
		}
	}
	addVerticalAxis(axis)
	{
		if (axis instanceof GraphAxis)
		{
			var currAxis = this.findAxisByID(axis.id);
			if (currAxis !== null)
			{
				console.log("new GraphAxis " + axis.id + " added to Graph " + this._id + ", but axis with that ID already exists.");
			}
			else
			{
				this._axisVertical.push(axis);
				if (this._axisVertical.length > 2)
				{
					console.log("new GraphAxis " + axis.id + " added to Graph " + this._id + ", but this graph already has 2 or more vertical axes.");
				}
			}
		}
	}
	addDataSet(data)
	{
		if (data instanceof GraphDataSet)
		{
			var currAxis = this.findDataByID(data.id);
			if (currAxis !== null)
			{
				console.log("new GraphDataSet " + data.id + " added to Graph " + this._id + ", but data with that ID already exists.");
			}
			else
				this._data.push(data);
		}
	}
	addTrend(trend)
	{
		if (trend instanceof GraphTrend)
		{
//			var currAxis = this.findDataByID(data.id);
//			if (currAxis !== null)
//			{
//				console.log("new GraphDataSet " + data.id + " added to Graph " + this._id + ", but data with that ID already exists.");
//			}
//			else
				this._trends.push(trend);
		}
	}
	_colorSelect(color)
	{
		var ret = 0;
		if (this._invertPalette)
		{
			color = this._colorMax - color;
		}
		
		switch (this._paletteSelect)
		{
		default:
		case 0:
			switch (color)
			{
			default:
			case 0:
				ret = "#8c510a";
				break;
			case 1:
				ret = "#bf812d";
				break;
			case 2:
				ret = "#dfc27d";
				break;
			case 3:
				ret = "#f6e8c3";
				break;
			case 4:
				ret = "#80cdc1";
				break;
			case 5:
				ret = "#35978f";
				break;
			case 6:
				ret = "#01665e";
				break;
			}
			break;	
		case 1:
			switch (color)
			{
			default:
			case 0:
				ret = "#c51b7d";
				break;
			case 1:
				ret = "#de77ae";
				break;
			case 2:
				ret = "#f1b6da";
				break;
			case 3:
				ret = "#e6f5d0";
				break;
			case 4:
				ret = "#b8e186";
				break;
			case 5:
				ret = "#7fbc41";
				break;
			case 6:
				ret = "#4d9221";
				break;
			}
			break;	
		case 2:
			switch (color)
			{
			default:
			case 0:
				ret = "#762a83";
				break;
			case 1:
				ret = "#9970ab";
				break;
			case 2:
				ret = "#c2a5cf";
				break;
			case 3:
				ret = "#e7d4e8";
				break;
			case 4:
				ret = "#a6dba0";
				break;
			case 5:
				ret = "#5aae61";
				break;
			case 6:
				ret = "#1b7837";
				break;
			}
			break;	
		case 3:
			switch (color)
			{
			default:
			case 0:
				ret = "#b35806";
				break;
			case 1:
				ret = "#e08214";
				break;
			case 2:
				ret = "#fdb863";
				break;
			case 3:
				ret = "#fee0b6";
				break;
			case 4:
				ret = "#b2abd2";
				break;
			case 5:
				ret = "#58073ac";
				break;
			case 6:
				ret = "#542788";
				break;
			}
			break;	
		case 4:
			switch (color)
			{
			default:
			case 0:
				ret = "#b2812b";
				break;
			case 1:
				ret = "#d6604d";
				break;
			case 2:
				ret = "#f4a582";
				break;
			case 3:
				ret = "#d1e5f0";
				break;
			case 4:
				ret = "#92c5de";
				break;
			case 5:
				ret = "#4393c3";
				break;
			case 6:
				ret = "#2166ac";
				break;
			}
			break;	
		case 5:
			switch (color)
			{
			default:
			case 0:
				ret = "#d73027";
				break;
			case 1:
				ret = "#f46343";
				break;
			case 2:
				ret = "#fdae61";
				break;
			case 3:
				ret = "#fee090";
				break;
			case 4:
				ret = "#abd9e9";
				break;
			case 5:
				ret = "#74add1";
				break;
			case 6:
				ret = "#4575b4";
				break;
			}
			break;	
		}
		return ret;
		
	}
	_drawSymbol(context,x,y,symbol,symbolFilled,symbolSize)
	{
		context.save();
			context.translate(x,y);
			context.beginPath();		
			switch (symbol)
			{
			default:
			case 0:
				context.rect(-symbolSize*0.5,-symbolSize*0.5,symbolSize,symbolSize);
				break;
			case 1:
				context.arc(0,0,symbolSize*0.5,0,Math.PI * 2.0);
				context.closePath();
				break;
			case 2:
				context.moveTo(-symbolSize * 0.5,-symbolSize * 0.5);
				context.lineTo(symbolSize * 0.5,-symbolSize * 0.5);
				context.lineTo(0,symbolSize * 0.5);
				context.closePath();
				break;
			case 3:
				context.moveTo(0,-symbolSize * 0.5);
				context.lineTo(symbolSize * 0.5,0);
				context.lineTo(0,symbolSize * 0.5);
				context.lineTo(-symbolSize * 0.5,0);
				context.closePath()
				break;
			case 4:
				context.moveTo(-symbolSize * 0.5,symbolSize * 0.5);
				context.lineTo(symbolSize * 0.5,symbolSize * 0.5);
				context.lineTo(0,-symbolSize * 0.5);
				context.closePath();
				break;
			}
			if (symbolFilled)
				context.fill();
			else
				context.stroke();
		context.restore();
	}
	
	draw (context,x,y)
	{
		var i;
		var axisHorizontalSpace = 0;
		var axisVerticalSpace = 0;
		var xOffsetGraph = 0;
		var yOffsetGraph = 0;
		// first find out how big the axis titles and labels are
		for (i = 0; i < 2 && i < this._axisHorizontal.length; i++)
		{
			var neededSpace = this._axisHorizontal[i].requiredSpace();
			axisVerticalSpace += neededSpace;
			if (i == 0)
				yOffsetGraph = neededSpace;
			
		}

		for (i = 0; i < 2 && i < this._axisVertical.length; i++)
		{
			var neededSpace = this._axisVertical[i].requiredSpace();
			axisHorizontalSpace += neededSpace;
			if (i == 0)
				xOffsetGraph = neededSpace;
		}
		var graphWidth = this.width - axisHorizontalSpace - 4;
		var graphHeight = this.height - axisVerticalSpace - 4;
		context.save();
			context.translate(x,y);
			context.strokeStyle = "#000000";
			context.rect(0, 0, this.width, this.height);
			context.stroke();
			context.clip();
			context.translate(xOffsetGraph,this.height - yOffsetGraph);
			context.strokeStyle = this.color;
			if (this._axisHorizontal.length > 0)
			{
				this._axisHorizontal[0].drawTitle(context,0,graphWidth,0);
				this._axisHorizontal[0].drawLabels(context,0,graphWidth,0);
			}
			if (this._axisHorizontal.length > 1)
			{
				context.save();
					context.translate(0,-graphHeight);
					this._axisHorizontal[1].drawTitle(context,0,graphWidth,1);
					this._axisHorizontal[1].drawLabels(context,0,graphWidth,1);
				context.restore();
			}
			if (this._axisVertical.length > 0)
			{
				this._axisVertical[0].drawTitle(context,1,graphHeight,0);
				this._axisVertical[0].drawLabels(context,1,graphHeight,0);
			}
			if (this._axisVertical.length > 1)
			{
				context.save();
					context.translate(graphWidth,0);
					this._axisVertical[1].drawTitle(context,1,graphHeight,1);
					this._axisVertical[1].drawLabels(context,1,graphHeight,1);
				context.restore();
			}
		context.restore();
			
		context.save();
			context.translate(x + xOffsetGraph,y + this.height - yOffsetGraph);
			context.strokeStyle = this.color;
			context.rect(0, -graphHeight, graphWidth, graphHeight);
			context.stroke();
			context.clip();
			var symbol = 0;
			var symbolFilled = true;
			var symbolSize = 10;
			var colorSelect = 0;
			for (i = 0; i < this._data.length; i++)
			{
				var currData = this._data[i];
				var currHorizontalAxis = this.findAxisByID(currData._horizontalAxisID);
				var currVerticalAxis = this.findAxisByID(currData._verticalAxisID);
				if (currHorizontalAxis !== null && currVerticalAxis !== null)
				{
					var j;
					if (currData._color !== undefined && currData._color !== null)
					{
						context.strokeStyle = currData._color;
						context.fillStyle = currData._color;
					}
					else
					{
						context.strokeStyle = this._colorSelect(colorSelect);
						context.fillStyle = this._colorSelect(colorSelect);
					}
					
					if (currData._symbol !== undefined && currData._symbol !== null)
					{
						symbol = currData._symbol;
					}
					if (currData._symbol !== undefined && currData._symbol !== null)
					{
						symbolFilled = currData._filled;
					}
					if (currData._symbolSize !== undefined && currData._symbolSize !== null)
						symbolSize = currData._symbolSize;
					for (j = 0; j < currData._data.length; j++)
					{
						if (currData._data[j].x !== undefined && currData._data[j].x !== null && currData._data[j].y !== undefined && currData._data[j].y !== null)
						{
							var x = currHorizontalAxis.calculate(currData._data[j].x) * graphWidth;
							var y = -currVerticalAxis.calculate(currData._data[j].y) * graphHeight;
							this._drawSymbol(context,x,y,symbol,symbolFilled,symbolSize);
							//@@TODO: error bars
						}
					}
					symbol++;
					colorSelect = symbol;
					if (symbol >= this._symbolMax)
					{
						symbol = 0;
						colorSelect = 0;
						symbolFilled = !symbolFilled;
					}
					symbolSize = 6;
				}
				colorSelect = 0;
				for (i = 0; i < this._trends.length; i++)
				{
					var currData = this._trends[i];
					var currHorizontalAxis = this.findAxisByID(currData._horizontalAxisID);
					var currVerticalAxis = this.findAxisByID(currData._verticalAxisID);
					if (currData._type == "exponential" && currHorizontalAxis.log && currVerticalAxis.log ||
						currData._type == "linear" && !currHorizontalAxis.log && !currVerticalAxis.log)
					{
						var y_minx = currData.y(currHorizontalAxis._min);
						var y_maxx = currData.y(currHorizontalAxis._max);
						var x_miny = currData.x(currVerticalAxis._min);
						var x_maxy = currData.x(currVerticalAxis._max);
						var x0;
						var x1;
						var y0;
						var y1;
						if (y_minx >= currVerticalAxis._min && y_minx <= currVerticalAxis._max)
						{
							x0 = currHorizontalAxis._min;
							y0 = y_minx;
						}
						else
						{
							if (x_miny < x_maxy)
							{
								x0 = x_miny;
								y0 = currVerticalAxis._min;
							}
							else
							{
								x0 = x_maxy;
								y0 = currVerticalAxis._max;
							}
						}
						
						if (y_maxx >= currVerticalAxis._min && y_maxx <= currVerticalAxis._max)
						{
							x1 = currHorizontalAxis._max;
							y1 = y_maxx;
						}
						else
						{
							if (x_miny > x_maxy)
							{
								x1 = x_miny;
								y1 = currVerticalAxis._min;
							}
							else
							{
								x1 = x_maxy;
								y1 = currVerticalAxis._max;
							}
						}
						if (currData._color !== undefined && currData._color !== null)
						{
							context.strokeStyle = currData._color;
						}
						else
						{
							context.strokeStyle = this._colorSelect(colorSelect);
							colorSelect++;
						}
						var gx0 = currHorizontalAxis.calculate(x0) * graphWidth;
						var gx1 = currHorizontalAxis.calculate(x1) * graphWidth;
						var gy0 = currVerticalAxis.calculate(y0) * graphHeight;
						var gy1 = currVerticalAxis.calculate(y1) * graphHeight;
						context.beginPath();
						context.moveTo(gx0,-gy0);
						context.lineTo(gx1,-gy1);
						context.stroke();
					}
				}
			}
			
		context.restore();
	}
}
