



let theCanvas = document.getElementById("theCanvas");
let theContext = theCanvas.getContext("2d");

theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

function onResize()
{
	theCanvas.height = window.innerHeight - 60;
	theCanvas.width = window.innerWidth;
}

theCanvas.onresize = onResize;
onResize();


theContext.fillTextCenter = function (text,x,y)
{
	const align = this.textAlign;
	this.textAlign = "center";
	this.fillText(text,x,y);
	this.textAlign = align;
}
theContext.fillTextRight = function (text,x,y)
{
	const align = this.textAlign;
	this.textAlign = "right";
	this.fillText(text,x,y);
	this.textAlign = align;
}


class wave_data
{
	calculate_parameters()
	{
		this._period = 1.0 / this._frequency;
		this._wavelength = this._velocity / this._frequency;
		this._angular_frequency = 2.0 * Math.PI * this._frequency;
		this._wavenumber = 1.0 / this._wavelength;
		this._angular_wavenumber = 2.0 * Math.PI / this._wavelength;
	}
	constructor(velocity,frequency,amplitude,phase)
	{
		this._direction = 1;
		if (velocity < 0)
			this._direction = -1;
		this._velocity = Math.abs(velocity);
		this._frequency = frequency;
		this.calculate_parameters();
		this._amplitude = amplitude;
		if (typeof phase !== 'undefined' && phase !== null)
			this._phase = phase % (2.0 * Math.PI);
		else
			this._phase = 0;
	}
	get direction()
	{
		return this._direction;
	}
	get velocity()
	{
		return this._velocity;
	}
	get frequency()
	{
		return this._frequency;
	}
	get period()
	{
		return this._period;
	}
	get wavelength()
	{
		return this._wavelength;
	}
	get angular_frequency()
	{
		return this._angular_frequency;
	}
	get wavenumber()
	{
		return this._wavenumber;
	}
	get angular_wavenumber()
	{
		return this._angular_wavenumber;
	}
	get amplitude()
	{
		return this._amplitude;
	}
	get phase()
	{
		return this._phase;
	}
	set direction(value)
	{
		if (value < 0)
			this._direction = -1;
		else
			this._direction = 1;
	}
	set velocity(value)
	{
		this._direction = 1;
		if (value < 0)
			this._direction = -1;
		this._velocity = Math.abs(value);
		this.calculate_parameters();
	}
	set frequency(value)
	{
		this._frequency = value;
		this.calculate_parameters();
	}
	set period(vaule)
	{
		this._frequency = 1.0 / value;
		this.calculate_parameters();
	}
	set wavelength(value)
	{
		this._frequency = this.velocity / value;
		this.calculate_parameters();
	}
	set angular_frequency(value)
	{
		this._frequency = value / (2.0 * Math.PI);
		this.calculate_parameters();
	}
	set wavenumber(value)
	{
		this._frequency = this.velocity * value;
		this.calculate_parameters();
	}
	set angular_wavenumber(value)
	{
		this._frequency = this.velocity * value / (2.0 * Math.PI);
		this.calculate_parameters();
	}
	set amplitude(value)
	{
		this._amplitude = value;
	}
	set phase(value)
	{
		this._phase = value % (2.0 * Math.PI);
	}

	y(x,t)
	{
		return this._amplitude * Math.sin(t * this._angular_frequency - this._direction * x * this._angular_wavenumber + this._phase);
	}
}

class wave_pulse
{
	calculate_parameters()
	{
		this._period = 1.0 / this._frequency;
		this._wavelength = this._velocity / this._frequency;
		this._angular_frequency = 2.0 * Math.PI * this._frequency;
		this._wavenumber = 1.0 / this._wavelength;
		this._angular_wavenumber = 2.0 * Math.PI / this._wavelength;
		
		this._pulse_period = 1.0 / this._pulse_frequency;
	}
	constructor(velocity,frequency,amplitude,pulse_frequency)
	{
		this._direction = 1;
		if (velocity < 0)
			this._direction = -1;
		this._velocity = Math.abs(velocity);
		this._frequency = frequency;
		this._pulse_frequency = pulse_frequency;
		this.calculate_parameters();
		this._amplitude = amplitude;
	}
	get direction()
	{
		return this._direction;
	}
	get velocity()
	{
		return this._velocity;
	}
	get frequency()
	{
		return this._frequency;
	}
	get period()
	{
		return this._period;
	}
	get wavelength()
	{
		return this._wavelength;
	}
	get angular_frequency()
	{
		return this._angular_frequency;
	}
	get wavenumber()
	{
		return this._wavenumber;
	}
	get angular_wavenumber()
	{
		return this._angular_wavenumber;
	}
	get amplitude()
	{
		return this._amplitude;
	}
	get pulse_frequency()
	{
		return this._pulse_frequency;
	}
	get pulse_period()
	{
		return this._pulse_period;
	}
	set direction(value)
	{
		if (value < 0)
			this._direction = -1;
		else
			this._direction = 1;
	}
	set velocity(value)
	{
		this._direction = 1;
		if (value < 0)
			this._direction = -1;
		this._velocity = Math.abs(value);
		this.calculate_parameters();
	}
	set frequency(value)
	{
		this._frequency = value;
		this.calculate_parameters();
	}
	set period(vaule)
	{
		this._frequency = 1.0 / value;
		this.calculate_parameters();
	}
	set wavelength(value)
	{
		this._frequency = this.velocity / value;
		this.calculate_parameters();
	}
	set angular_frequency(value)
	{
		this._frequency = value / (2.0 * Math.PI);
		this.calculate_parameters();
	}
	set wavenumber(value)
	{
		this._frequency = this.velocity * value;
		this.calculate_parameters();
	}
	set angular_wavenumber(value)
	{
		this._frequency = this.velocity * value / (2.0 * Math.PI);
		this.calculate_parameters();
	}
	set amplitude(value)
	{
		this._amplitude = value;
	}
	y(x,t)
	{
		let ret;
		const vT = this._pulse_period * this._velocity;
		let xeff = x % vT;
		let pulse_x;
		if (this._direction < 0)
		{
			pulse_x = vT - (this._velocity * t) % vT
		}
		else
		{
			pulse_x = (this._velocity * t) % vT
		}
		let delx = pulse_x - xeff;
		if (delx < 0)
			delx = vT + delx;
		if ((delx >= 0 && delx < this._wavelength) ||
			(xeff > (vT - this._wavelength + pulse_x)))
			ret = this._amplitude * Math.sin(delx * this._angular_wavenumber);
		else
			ret = 0;
		return ret;

	}
	set pulse_frequency(value)
	{
		this._pulse_frequency = value;
		this.calculate_parameters();
	}
	set pulse_period(value)
	{
		this._pulse_frequency = 1.0 / value;
		this.calculate_parameters();
	}
}


g_reflectionLength = theCanvas.width;
function onReflectionLengthChange(value)
{
	g_reflectionLength = theCanvas.width - (1.0 - value) * wave_right.wavelength;
}

let sliderReflectionLength = new Slider(theCanvas.width * 0.5,390,0.0001,1.0,1.0);
sliderReflectionLength.width = 800;
sliderReflectionLength.label = "Reflection Length";
sliderReflectionLength.labelStyle = "#00FFFF";
sliderReflectionLength.labelFont = "16px Ariel"
sliderReflectionLength.onChange = onReflectionLengthChange;
sliderReflectionLength.visible = false;
sliderReflectionLength.disabled = true;
commonUIRegister(sliderReflectionLength);


let velocity = 25	; // pixels / sec
let frequency = 0.5;
let wavelength = velocity / frequency;
let amplitude = 25;

let wave_right = new wave_data(velocity,frequency,amplitude,0);
let wave_left = new wave_data(-velocity,frequency,amplitude,0);

let pulse_frequency = velocity / theCanvas.width;

let pulse_wave_right = new wave_pulse(velocity,frequency,amplitude,pulse_frequency);
let pulse_wave_left = new wave_pulse(-velocity,frequency,amplitude,pulse_frequency);




function freqWaveRightOnChange(value)
{
	wave_right.frequency = value;
	pulse_wave_right.frequency = value;
}
function velocityWaveRightOnChange(value)
{
	wave_right.velocity = value;
	pulse_wave_right.velocity = value;
}
function amplitudeWaveRightOnChange(value)
{
	wave_right.amplitude = value;
	pulse_wave_right.amplitude = value;
}
function phaseWaveRightOnChange(value)
{
	wave_right.phase = value * Math.PI / 180.0;
	pulse_wave_right.phase = value * Math.PI / 180.0;
}
function pulseFreqWaveRightOnChange(value)
{
	pulse_wave_right.pulse_frequency = value * pulse_frequency;
}

let sliderPulseFreqA = new Slider(theCanvas.width * 0.5 + 375,150,0.01,10,1.0);
sliderPulseFreqA.label = "Pulse Frequency";
sliderPulseFreqA.labelStyle = "#00FF00";
sliderPulseFreqA.labelFont = "16px Ariel"
sliderPulseFreqA.onChange = pulseFreqWaveRightOnChange;
sliderPulseFreqA.visible = false;
sliderPulseFreqA.disabled = true;
commonUIRegister(sliderPulseFreqA);

let sliderFreqA = new Slider(theCanvas.width * 0.5 - 375,150,0.5,2,0.5);
sliderFreqA.label = "Frequency";
sliderFreqA.labelStyle = "#00FF00";
sliderFreqA.labelFont = "16px Ariel"
sliderFreqA.onChange = freqWaveRightOnChange;
commonUIRegister(sliderFreqA);
let sliderVelocityA = new Slider(theCanvas.width * 0.5 - 125,150,1,1000,25);
sliderVelocityA.label = "Velocity";
sliderVelocityA.labelStyle = "#00FF00";140
sliderVelocityA.labelFont = "16px Ariel"
sliderVelocityA.onChange = velocityWaveRightOnChange;
commonUIRegister(sliderVelocityA);
let sliderAmplitudeA = new Slider(theCanvas.width * 0.5 + 125,150,0,50,25);
sliderAmplitudeA.label = "Amplitude";
sliderAmplitudeA.labelStyle = "#00FF00";
sliderAmplitudeA.labelFont = "16px Ariel"
sliderAmplitudeA.onChange = amplitudeWaveRightOnChange;
commonUIRegister(sliderAmplitudeA);
let sliderPhaseA = new Slider(theCanvas.width * 0.5 + 375,150,0,359,0);
sliderPhaseA.label = "Phase";
sliderPhaseA.labelStyle = "#00FF00";
sliderPhaseA.labelFont = "16px Ariel"
sliderPhaseA.onChange = phaseWaveRightOnChange;
commonUIRegister(sliderPhaseA);


function freqWaveLeftOnChange(value)
{
	wave_left.frequency = value;
	pulse_wave_left.frequency = value;
}
function velocityWaveLeftOnChange(value)
{
	wave_left.velocity = -value;
	pulse_wave_left.velocity = -value;
}
function amplitudeWaveLeftOnChange(value)
{
	wave_left.amplitude = value;
	pulse_wave_left.amplitude = value;
}
function phaseWaveLeftOnChange(value)
{
	wave_left.phase = value * Math.PI / 180.0;
	pulse_wave_left.phase = value * Math.PI / 180.0;
}
function pulseFreqWaveLeftOnChange(value)
{
	pulse_wave_left.pulse_frequency = value * pulse_frequency;
}


let sliderPulseFreqB = new Slider(theCanvas.width * 0.5 + 375,390,0.01,10,1.0);
sliderPulseFreqB.label = "Pulse Frequency";
sliderPulseFreqB.labelStyle = "#0000FF";
sliderPulseFreqB.labelFont = "16px Ariel"
sliderPulseFreqB.onChange = pulseFreqWaveLeftOnChange;
sliderPulseFreqB.visible = false;
sliderPulseFreqB.disabled = true;
commonUIRegister(sliderPulseFreqB);

let sliderFreqB = new Slider(theCanvas.width * 0.5 - 375,390,0.5,2,0.5);
sliderFreqB.label = "Frequency";
sliderFreqB.labelStyle = "#0000FF";
sliderFreqB.labelFont = "16px Ariel"
sliderFreqB.onChange = freqWaveLeftOnChange;
commonUIRegister(sliderFreqB);
let sliderVelocityB = new Slider(theCanvas.width * 0.5 - 125,390,1,1000,25);
sliderVelocityB.label = "Velocity";
sliderVelocityB.labelStyle = "#0000FF";
sliderVelocityB.labelFont = "16px Ariel"
sliderVelocityB.onChange = velocityWaveLeftOnChange;
commonUIRegister(sliderVelocityB);
let sliderAmplitudeB = new Slider(theCanvas.width * 0.5 + 125,390,0,50,25);
sliderAmplitudeB.label = "Amplitude";
sliderAmplitudeB.labelStyle = "#0000FF";
sliderAmplitudeB.labelFont = "16px Ariel"
sliderAmplitudeB.onChange = amplitudeWaveLeftOnChange;
commonUIRegister(sliderAmplitudeB);
let sliderPhaseB = new Slider(theCanvas.width * 0.5 + 375,390,0,390,0);
sliderPhaseB.label = "Phase";
sliderPhaseB.labelStyle = "#0000FF";
sliderPhaseB.labelFont = "16px Ariel"
sliderPhaseB.onChange = phaseWaveLeftOnChange;
commonUIRegister(sliderPhaseB);

let g_Type = "wave";
function typeSelect(value)
{
	g_Type = value;
	if (g_Type == "wave")
	{
		sliderPhaseA.visible = true;
		sliderPhaseA.disabled = false;
		sliderPulseFreqA.visible = false;
		sliderPulseFreqA.disabled = true;
		if (g_Motion == "dual")
		{
			sliderPhaseB.visible = true;
			sliderPhaseB.disabled = false;
			sliderPulseFreqB.visible = false;
			sliderPulseFreqB.disabled = true;
		}
	}
	else
	{
		sliderPhaseA.visible = false;
		sliderPhaseA.disabled = true;
		sliderPulseFreqA.visible = true;
		sliderPulseFreqA.disabled = false;
		if (g_Motion == "dual")
		{
			sliderPhaseB.visible = false;
			sliderPhaseB.disabled = true;
			sliderPulseFreqB.visible = true;
			sliderPulseFreqB.disabled = false;
		}
	}
}

let rbtnTypeArray = new Array();
let rbtnWaves = new RadioButton("Waves","wave",theCanvas.width * 0.5 - 105,20,100,30);
rbtnTypeArray.push(rbtnWaves);
let rbtnPulses = new RadioButton("Pulses","pulse",theCanvas.width * 0.5 + 5,20,100,30);
rbtnTypeArray.push(rbtnPulses);
let radioType = new Radio("Type","wave",typeSelect,rbtnTypeArray);
commonUIRegister(radioType);

let g_Motion = "dual";
function motionSelect(value)
{
	g_Motion = value;
	if (value == "dual")
	{
		sliderReflectionLength.visible = false;
		sliderReflectionLength.disabled = true;
		g_reflectionLength = theCanvas.width;
		if (g_Type == "wave")
		{
			sliderPulseFreqB.visible = false;
			sliderPulseFreqB.disabled = true;
			sliderPhaseB.visible = true;
			sliderPhaseB.disabled = false;
		}
		else
		{
			sliderPulseFreqB.visible = true;
			sliderPulseFreqB.disabled = false;
			sliderPhaseB.visible = false;
			sliderPhaseB.disabled = true;
		}
		sliderFreqB.visible = true;
		sliderFreqB.disabled = false;
		sliderVelocityB.visible = true;
		sliderVelocityB.disabled = false;
		sliderAmplitudeB.visible = true;
		sliderAmplitudeB.disabled = false;
	}
	else
	{
		sliderReflectionLength.visible = true;
		sliderReflectionLength.disabled = false;
		
		sliderPulseFreqB.visible = false;
		sliderPulseFreqB.disabled = true;
		sliderFreqB.visible = false;
		sliderFreqB.disabled = true;
		sliderVelocityB.visible = false;
		sliderVelocityB.disabled = true;
		sliderAmplitudeB.visible = false;
		sliderAmplitudeB.disabled = true;
		sliderPhaseB.visible = false;
		sliderPhaseB.disabled = true;
		
		g_reflectionLength = theCanvas.width * sliderReflectionLength.value;
	}
}

let rbtnMotionArray = new Array();
let rbtnLeftRight = new RadioButton("Left & Right","dual",theCanvas.width * 0.5 - 105,60,100,30);
rbtnMotionArray.push(rbtnLeftRight);
let rbtnReflect = new RadioButton("Reflection","reflect",theCanvas.width * 0.5 + 5,60,100,30);
rbtnMotionArray.push(rbtnReflect);
let radioMotion = new Radio("Motion","dual",motionSelect,rbtnMotionArray);
commonUIRegister(radioMotion);

let g_timestep = 1.0 / 30.0;
let g_timer = 0.0;
const g_slewSpeed = 0.01;

let g_pause = false;
function pause()
{
	g_pause = !g_pause;
	if (g_pause)
		btnPause.text = "Resume"
	else
		btnPause.text = "Pause"
}
let btnPause = new Button("Pause",theCanvas.width * 0.5 + 150,20,80,30,pause);
commonUIRegister(btnPause);

function step()
{
	if (g_pause)
		g_timer += g_timestep;
}
let btnStep = new Button("Step",theCanvas.width * 0.5 + 240,20,60,30,step);
commonUIRegister(btnStep);

function work()
{
	if (!g_pause)
		g_timer += g_timestep;


	let x;
	
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.font = "18px Arial";

	if (g_Motion == "reflect")
	{
		const L = g_reflectionLength / wave_right.wavelength;
		theContext.fillStyle = "#00FFFF";
		const Lr = Math.round(L * 1000.0) / 1000.0;
		let Ls = Lr.toString();
		if (Ls.indexOf(".") == -1)
			Ls += '.';
		let addCnt = 0;
		while (addCnt < 3 && Ls.charAt(Ls.length - 4) != '.')
		{
			Ls += '0';
			addCnt++;
		}
		Ls += 'λ';
		theContext.fillText(Ls,theCanvas.width * 0.5 + 500,370);
	}

	let horizOffset = 0;
	if (g_Motion != "dual")
		horizOffset = (theCanvas.width - g_reflectionLength) * 0.5;

	if (g_Type == "wave")
	{
				
		// continuous right-going wave
		theContext.save();
		theContext.translate(horizOffset,260);
		theContext.strokeStyle = "#00FF00";
		theContext.beginPath();
		theContext.moveTo(0,wave_right.y(0,g_timer));
		for (x = 1; x <= g_reflectionLength; x++)
		{
			theContext.lineTo(x,wave_right.y(x,g_timer));
		}
		theContext.stroke();
		theContext.restore();
		
		// continuous left-going wave
		theContext.save();
		theContext.translate(horizOffset,510);
		theContext.strokeStyle = "#0000FF";

		theContext.beginPath();
		if (g_Motion == "dual")
		{
			theContext.moveTo(0,wave_left.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,wave_left.y(x,g_timer));
			}
		}
		else // reflection
		{
			theContext.moveTo(0,wave_right.y(2*g_reflectionLength,g_timer));
			for (x = 1; x < g_reflectionLength; x++)
			{
				theContext.lineTo(x,wave_right.y(2 * g_reflectionLength - x,g_timer));
			}
		}
		theContext.stroke();
		theContext.restore();


		// right + left continuous waves
		theContext.save();
		theContext.translate(horizOffset,720);
		theContext.strokeStyle = "#00FFFF";
		theContext.beginPath();
		if (g_Motion == "dual")
		{
			theContext.moveTo(0,wave_left.y(0,g_timer) + wave_right.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,wave_left.y(x,g_timer) + wave_right.y(x,g_timer));
			}
			theContext.stroke();
			theContext.restore();
		}
		else // reflection
		{
			theContext.moveTo(0,wave_right.y(g_reflectionLength * 2,g_timer) + wave_right.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,wave_right.y(2 * g_reflectionLength - x,g_timer) + wave_right.y(x,g_timer));
			}
			theContext.stroke();
			theContext.restore();
		}
	}
	else
	{
		
		// right-going pulse
		theContext.save();
		theContext.strokeStyle = "#00FF00";
		theContext.translate(horizOffset,260);
		theContext.beginPath();
		theContext.moveTo(0,pulse_wave_right.y(0,g_timer));
		for (x = 1; x <= g_reflectionLength; x++)
		{
			theContext.lineTo(x,pulse_wave_right.y(x,g_timer));
		}
		theContext.stroke();
		theContext.restore();


		// left-going pulse
		theContext.save();
		theContext.translate(horizOffset,510);
		theContext.strokeStyle = "#0000FF";
		theContext.beginPath();
		if (g_Motion == "dual")
		{
			theContext.moveTo(0,pulse_wave_left.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,pulse_wave_left.y(x,g_timer));
			}
		}
		else
		{
			theContext.moveTo(g_reflectionLength,pulse_wave_right.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(g_reflectionLength - x,pulse_wave_right.y(x,g_timer));
			}
		}
		theContext.stroke();
		theContext.restore();

		// combined pulse
		theContext.save();
		theContext.translate(horizOffset,720);
		theContext.strokeStyle = "#00FFFF";
		theContext.beginPath();
		if (g_Motion == "dual")
		{
			theContext.moveTo(0,pulse_wave_right.y(0,g_timer) + pulse_wave_left.y(0,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,pulse_wave_left.y(x,g_timer) + pulse_wave_right.y(x,g_timer));
			}
		}
		else
		{
			theContext.moveTo(0,pulse_wave_right.y(0,g_timer) + pulse_wave_right.y(g_reflectionLength,g_timer));
			for (x = 1; x <= g_reflectionLength; x++)
			{
				theContext.lineTo(x,pulse_wave_right.y(x,g_timer) + pulse_wave_right.y(g_reflectionLength - x,g_timer));
			}
		}
		theContext.stroke();
		theContext.restore();
	}
		
	commonUIdraw(theContext);


	window.setTimeout(work, 1.0/30.0);
}

work();

