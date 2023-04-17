

let canvas1 = document.getElementById("canvas1");
let canvas2 = document.getElementById("canvas2");
let canvas3 = document.getElementById("canvas3");

let context1 = canvas1.getContext("2d");
let context2 = canvas2.getContext("2d");
let context3 = canvas3.getContext("2d");

//canvas1.addEventListener("resize",onResize,false);
class Wave
{
	constructor(direction,pulse_period)
	{
		this.phase = 0;
		this._frequency = 0.5;
		this.amplitude = 25;
		this.direction = ValidateValue(direction) ? direction : 1;
		this._velocity = 25;
		this._wavelength = this._velocity / this._frequency;
		this.pulse_period = pulse_period;
		this.twopi = Math.PI * 2.0;
	}
	get wavelength()
	{
		return this._wavelength;
	}
	set wavelength(value)
	{
		this._frequency = this._velocity / value;
		this._wavelength = value;
	}
	get frequency()
	{
		return this._frequency;
	}
	get period()
	{
		return 1.0 / this._frequency;
	}
	get angular_frequency()
	{
		return this._frequency * this.twopi;
	}
	get wavenumber()
	{
		return 1.0 / this._wavelength;
	}
	get angular_wavenumber()
	{
		return this.twopi / this._wavelength;
	}
	get velocity()
	{
		return this._velocity;
	}
	get pulse_period()
	{
		return this._pulse_period;
	}
	get pulse_frequency()
	{
		return 1.0 / this._pulse_period;
	}

	set frequency(value)
	{
		if (ValidateValue(value))
		{
			this._wavelength = this._velocity / value;
			this._frequency = value;
		}
	}
	set velocity(value)
	{
		if (ValidateValue(value))
		{
			this._velocity = value;
			this._wavelength = this._velocity / this._frequency;
		}
	}
	set period(value)
	{
		if (ValidateValue(value))
			this.frequency = 1.0 / value;
	}
	set angular_frequency(value)
	{
		if (ValidateValue(value))
			this.frequency = value / this.twopi;
	}
	set wavenumber(value)
	{
		if (ValidateValue(value))
			this.wavelength = 1.0 / value;
	}
	set angular_wavenumber(value)
	{
		if (ValidateValue(value))
			this.wavelength = this.twopi / value;
	}
	
	get leftGoing()
	{
		return this.direction == 1;
	}
	get rightGoing()
	{
		return this.direction == -1;
	}
	set leftGoing(value)
	{
		if (ValidateBoolean(value))
		{
			this.direction = value ? 1 : -1;
		}
	}
	set rightGoing(value)
	{
		if (ValidateBoolean(value))
		{
			this.direction = value ? -1 : 1;
		}
	}


	set pulse_frequency(value)
	{
		if (ValidateValue(value))
			this._pulse_period = 1.0 / value;
		else
			this._pulse_period = null;
	}
	set pulse_period(value)
	{
		if (ValidateValue(value))
			this._pulse_period = value;
		else
			this._pulse_period = null;
	}
	
	y(x,t)
	{
		let ret;
		const angular_frequency = this.angular_frequency;
		const angular_wavenumber = this.angular_wavenumber;
		if (ValidateValue(this._pulse_period))
		{
			const tx = (((-x / (this.direction * this._velocity) + t) / this._pulse_period) % 1.0 + 1.0) % 1.0;
			if (tx > 0.9)
				ret = this.amplitude * Math.sin((tx - 0.9) * 10.0 * this.twopi);
			else
				ret = 0;
		}
		else
			ret = this.amplitude * Math.sin(t * angular_frequency - this.direction * x * angular_wavenumber + this.phase);
		return ret;
	}

}


let g_waves = [new Wave(1),new Wave(-1)];

//let g_pulse_frequency = g_velocity[0] / canvas1.width;

let g_sliderFrequency = [document.getElementById("frequency1"),document.getElementById("frequency2")];
let g_sliderVelocity = [document.getElementById("velocity1")];//,document.getElementById("velocity2")];
let g_sliderAmplitude = [document.getElementById("amplitude1"),document.getElementById("amplitude2")];
let g_sliderPhaseLength = [document.getElementById("phaseLength1"),document.getElementById("phaseLength2")];
let g_sliderLabelFrequency = [document.getElementById("labelfrequency1"),document.getElementById("labelfrequency2")];
let g_sliderLabelVelocity = [document.getElementById("labelvelocity1")];//,document.getElementById("velocity2")];
let g_sliderLabelAmplitude = [document.getElementById("labelamplitude1"),document.getElementById("labelamplitude2")];
let g_sliderLabelPhaseLength = [document.getElementById("labelphaseLength1"),document.getElementById("labelphaseLength2")];
let g_outputFrequency = [document.getElementById("outputfrequency1"),document.getElementById("outputfrequency2")];
let g_outputVelocity = [document.getElementById("outputvelocity1")];//,document.getElementById("velocity2")];
let g_outputAmplitude = [document.getElementById("outputamplitude1"),document.getElementById("outputamplitude2")];
let g_outputPhaseLength = [document.getElementById("outputphaseLength1"),document.getElementById("outputphaseLength2")];

let g_blockFrequency = [document.getElementById("frequency1block"),document.getElementById("frequency2block")];
let g_blockVelocity = [document.getElementById("velocity1block")];//,document.getElementById("frequency1block")];
let g_blockAmplitude = [document.getElementById("amplitude1block"),document.getElementById("amplitude2block")];
let g_blockPhaseLength = [document.getElementById("phaseLength1block"),document.getElementById("phaseLength2block")];

let g_reflectionLength = window.innerWidth;

// initialize outputs
g_outputFrequency[0].value = g_sliderFrequency[0].value + " Hz";
g_outputFrequency[1].value = g_sliderFrequency[1].value + " Hz";
g_outputAmplitude[0].value = g_sliderAmplitude[0].value + " px";
g_outputAmplitude[1].value = g_sliderAmplitude[1].value + " px";
g_outputPhaseLength[0].value = g_sliderPhaseLength[0].value + "°";
g_outputPhaseLength[1].value = g_sliderPhaseLength[1].value + "°";
g_outputVelocity[0].value = g_sliderVelocity[0].value + " px/s";


function updatePhaseLengthOutput()
{
	if (g_radioMode[2].checked) // reflection mode
		g_outputPhaseLength[0].value = g_reflectionLength.toFixed(1) + " px";
	else
	{
		g_outputPhaseLength[0].value = g_sliderPhaseLength[0].value + "°";
		g_outputPhaseLength[1].value = g_sliderPhaseLength[1].value + "°";
	}
}
function onReflectionLengthChange(which)
{
	if (!g_radioMode[2].checked)
	{
		const value = Number(g_sliderPhaseLength[which].value);
		g_waves[which].phase = radians(value);
		updatePhaseLengthOutput();
	}
}

g_sliderPhaseLength[0].addEventListener("input",function(){onReflectionLengthChange(0)},false);
g_sliderPhaseLength[1].addEventListener("input",function(){onReflectionLengthChange(1)},false);

function onFrequencyChange(which)
{
	if (g_radioPattern[1].checked)
		g_waves[which].pulse_frequency = Number(g_sliderFrequency[which].value);
		
	g_waves[which].frequency = Number(g_sliderFrequency[which].value);
	g_outputFrequency[which].value = g_sliderFrequency[which].value + " Hz";
}
g_sliderFrequency[0].addEventListener("input",function(){onFrequencyChange(0)},false);
g_sliderFrequency[1].addEventListener("input",function(){onFrequencyChange(1)},false);

function onVelocityChange(which)
{
	g_waves[0].velocity = Number(g_sliderVelocity[which].value);
	g_waves[1].velocity = Number(g_sliderVelocity[which].value);
	g_outputVelocity[0].value = g_sliderVelocity[which].value + " px/s";
}
g_sliderVelocity[0].addEventListener("input",function(){onVelocityChange(0)},false);
//g_sliderVelocity[1].addEventListener("input",function(){onVelocityChange(1)},false);

function onAmplitudeChange(which)
{
	g_waves[which].amplitude = Number(g_sliderAmplitude[which].value);
	g_outputAmplitude[which].value = g_sliderAmplitude[which].value + " px";
}
g_sliderAmplitude[0].addEventListener("input",function(){onAmplitudeChange(0)},false);
g_sliderAmplitude[1].addEventListener("input",function(){onAmplitudeChange(1)},false);


let g_radioMode = [document.getElementById("leftright"),document.getElementById("rightright"),document.getElementById("reflection")];

function onModeSelect()
{
	if (g_radioMode[1].checked)
	{
		g_waves[0].direction = 1;
		g_waves[1].direction = 1;
	}
	else // if (g_radioMode[0].checked)
	{
		g_waves[0].direction = 1;
		g_waves[1].direction = -1;
	}
	
	if (g_radioMode[2].checked)
	{
		g_waves[0].phase = 0;
		// reflection mode: disable wave 2 controls and change wave 1 controls to reflction mode
		g_blockFrequency[1].style.display = "none";
//		g_blockVelocity[1].style.display = "none";
		g_blockAmplitude[1].style.display = "none";
		g_blockPhaseLength[1].style.display = "none";
		g_sliderLabelPhaseLength[0].innerText = "Length";
		g_blockPhaseLength[0].style.display = "table-cell"; // wave 1 length nedds to be displayed
	}
	else
	{
		g_waves[0].phase = radians(Number(g_sliderPhaseLength[0].value));
		// normal modes: display controls for wave 2
		if (g_radioPattern[1].checked) // if pulse mode, no phase display
		{
			g_blockFrequency[1].style.display = "none";
	//		g_blockVelocity[1].style.display = "none";
			g_blockAmplitude[1].style.display = "none";
			g_blockPhaseLength[0].style.display = "none";
			g_blockPhaseLength[1].style.display = "none";
		}
		else
		{
			g_blockFrequency[1].style.display = "table-cell";
	//		g_blockVelocity[1].style.display = "none";
			g_blockAmplitude[1].style.display = "table-cell";
			g_blockPhaseLength[0].style.display = "table-cell";
			g_blockPhaseLength[1].style.display = "table-cell";
		}
		g_sliderLabelPhaseLength[0].innerText = "Phase";

	}
	updatePhaseLengthOutput();
}
g_radioMode[0].addEventListener("change",onModeSelect,false);
g_radioMode[1].addEventListener("change",onModeSelect,false);
g_radioMode[2].addEventListener("change",onModeSelect,false);

let g_radioPattern = [document.getElementById("waves"),document.getElementById("pulse")];

function onPatternSelect()
{
	if (g_radioPattern[1].checked)
	{
		g_waves[0].pulse_frequency = Number(g_sliderFrequency[0].value);
		g_waves[1].pulse_frequency = Number(g_sliderFrequency[1].value);
		g_waves[0].frequency = Number(g_sliderFrequency[0].value);
		g_waves[1].frequency = Number(g_sliderFrequency[1].value);


		g_blockFrequency[1].style.display = "none";
//		g_blockVelocity[1].style.display = "none";
		g_blockAmplitude[1].style.display = "none";
		g_blockPhaseLength[1].style.display = "none";
		if (g_radioMode[2].checked)
				g_blockPhaseLength[0].style.display = "table-cell";
		else
			g_blockPhaseLength[0].style.display = "none";
	}
	else
	{
		g_waves[0].pulse_period = null;
		g_waves[1].pulse_period = null;
		g_waves[0].frequency = Number(g_sliderFrequency[0].value);
		g_waves[1].frequency = Number(g_sliderFrequency[1].value);

		if (g_radioMode[2].checked)
		{
			g_blockFrequency[1].style.display = "none";
	//		g_blockVelocity[1].style.display = "none";
			g_blockAmplitude[1].style.display = "none";
			g_blockPhaseLength[1].style.display = "none";
		}
		else
		{
			g_blockFrequency[1].style.display = "table-cell";
	//		g_blockVelocity[1].style.display = "none";
			g_blockAmplitude[1].style.display = "table-cell";
			g_blockPhaseLength[1].style.display = "table-cell";
		}
		g_blockPhaseLength[0].style.display = "table-cell";
	}
}
g_radioPattern[0].addEventListener("change",onPatternSelect,false);
g_radioPattern[1].addEventListener("change",onPatternSelect,false);

let g_buttonPausePlay = document.getElementById("pauseplay");

let g_timestep = 1.0 / 30.0;
let g_timer = 0.0;
const g_slewSpeed = 0.01;

let g_pause = false;
function onPausePlay()
{
	g_pause = !g_pause;
	if (g_pause)
	{
		g_buttonPausePlay.value = "Resume"
		g_buttonStep.disabled = false;
	}
	else
	{
		g_buttonPausePlay.value = "Pause"
		g_buttonStep.disabled = true;
	}
}
g_buttonPausePlay.addEventListener("click",onPausePlay,false);

let g_buttonStep = document.getElementById("step");

function onStep()
{
	if (g_pause)
		g_timer += g_timestep;
}
g_buttonStep.addEventListener("click",onStep,false);

function draw()
{
	if (!g_pause)
		g_timer += g_timestep;

	if (g_radioMode[2].checked)
	{
		const value = Number(g_sliderPhaseLength[0].value);
		g_reflectionLength = canvas1.width - (1.0 - value / 360.0) * g_waves[0].wavelength;
		updatePhaseLengthOutput();
	}
		
	canvas1.width = window.innerWidth;
	canvas2.width = window.innerWidth;
	canvas3.width = window.innerWidth;


	// calculate waves and sum
	let x;
	let waves = [new Array(), new Array(), new Array()];
	const startX = -canvas1.width * 0.5;
	const endX = g_radioMode[2].checked ? (-canvas1.width * 0.5 + g_reflectionLength) : (canvas1.width * 0.5);
	for (x = startX; x <= endX; x++)
	{
		const w1 = g_waves[0].y(x,g_timer);
		const w2x = g_radioMode[2].checked ? (endX + g_reflectionLength - x) : x;
		const w2 = g_waves[g_radioMode[2].checked ? 0 : 1].y(w2x,g_timer);
		waves[0].push(w1);
		waves[1].push(w2);
		waves[2].push(w1 + w2);
	}
	
	
	// draw wave 1
	context1.clearRect(0, 0, canvas1.width, canvas1.height);
	context1.fillStyle = '#000000';
	context1.fillRect(0, 0, canvas1.width, canvas1.height);

	context1.save();
		context1.translate(0,canvas1.height * 0.5);
		context1.strokeStyle = "#00FF00";
		context1.beginPath();
		context1.moveTo(0,waves[0][0]);
		for (x = 1; x < waves[0].length; x++)
		{
			context1.lineTo(x,waves[0][x]);
		}
		context1.stroke();
		context1.strokeStyle = "#0000FF";
		context1.beginPath();
		context1.moveTo(0,0);
		context1.lineTo(canvas1.width,0);
		context1.stroke();
	context1.restore();

	// draw wave 2
	context2.clearRect(0, 0, canvas2.width, canvas2.height);
	context2.fillStyle = '#000000';
	context2.fillRect(0, 0, canvas2.width, canvas2.height);

	context2.save();
		context2.translate(0,canvas2.height * 0.5);
		context2.strokeStyle = "#FF0000";
		context2.beginPath();
		context2.moveTo(0,waves[1][0]);
		for (x = 1; x < waves[1].length; x++)
		{
			context2.lineTo(x,waves[1][x]);
		}
		context2.stroke();
		context2.strokeStyle = "#0000FF";
		context2.beginPath();
		context2.moveTo(0,0);
		context2.lineTo(canvas2.width,0);
		context2.stroke();
	context2.restore();

	// draw combined wave
	context3.clearRect(0, 0, canvas3.width, canvas3.height);
	context3.fillStyle = '#000000';
	context3.fillRect(0, 0, canvas3.width, canvas3.height);

	context3.save();
		context3.translate(0,canvas3.height * 0.5);
		context3.strokeStyle = "#FFFF00";
		context3.beginPath();
		context3.moveTo(0,waves[2][0]);
		for (x = 1; x < waves[2].length; x++)
		{
			context3.lineTo(x,waves[2][x]);
		}
		context3.stroke();
		context3.strokeStyle = "#0000FF";
		context3.beginPath();
		context3.moveTo(0,0);
		context3.lineTo(canvas3.width,0);
		context3.stroke();
	context3.restore();

	window.setTimeout(draw, 1.0/30.0);
}

draw();

