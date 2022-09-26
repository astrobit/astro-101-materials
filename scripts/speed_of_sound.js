

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

let theContext = theCanvas.getContext("2d");


const minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let g_muted = true;
let g_volume = 0.75;
let g_curr_Sound = null;

let g_sounds = new Object();
g_sounds["128 Hz"] = document.getElementById("128audio");
g_sounds["128 Hz"].frequency = 128;
g_sounds["256 Hz"] = document.getElementById("256audio");
g_sounds["256 Hz"].frequency = 256;
g_sounds["512 Hz"] = document.getElementById("512audio");
g_sounds["512 Hz"].frequency = 512;
g_sounds["1024 Hz"] = document.getElementById("1024audio");
g_sounds["1024 Hz"].frequency = 1024;
g_sounds["2048 Hz"] = document.getElementById("2048audio");
g_sounds["2048 Hz"].frequency = 2048;
g_sounds["4096 Hz"] = document.getElementById("4096audio");
g_sounds["4096 Hz"].frequency = 4096;
g_sounds["8192 Hz"] = document.getElementById("8192audio");
g_sounds["8192 Hz"].frequency = 8192;


function onMuteSelect()
{
	g_muted = !g_muted;
	if (!g_muted && g_curr_Sound !== null)
	{
		g_curr_Sound.volume = g_volume;
		g_curr_Sound.play();
		g_curr_Sound.muted = false;
		buttonMute.insideStyle = "#7F7F7F";
	}
	else
	{
		buttonMute.insideStyle = "#FF7F00";
		g_curr_Sound.volume = 0;
		g_curr_Sound.muted = true;
		g_curr_Sound.pause();
	}
}


const freqButtonsY = theCanvas.height - 150;
const volumeControlY = theCanvas.height - 100;

function volumeControl(value)
{
	g_curr_Sound.volume = g_volume * value;
}
let sliderVolume = new Slider(theCanvas.width / 2,volumeControlY + 50,0.0,0.5,0.1);
sliderVolume.width = 400;
sliderVolume.label = "Volume";
sliderVolume.labelStyle = "#FFFFFF";
sliderVolume.onChange = volumeControl;
commonUIRegister(sliderVolume);

let buttonMute = new Button ("Mute",theCanvas.width / 2 + 40.0,volumeControlY,60,30,onMuteSelect)
buttonMute.insideStyle = "#FF7F00";
commonUIRegister(buttonMute);

function selectFrequency(frequency)
{
	g_curr_Sound.volume = 0;
	g_curr_Sound.pause();
	g_curr_Sound = g_sounds[frequency];
	if (g_curr_Sound !== null)
	{
		if (!g_muted)
		{
			g_curr_Sound.volume = g_volume * sliderVolume.value;
			g_curr_Sound.muted = false;
			g_curr_Sound.play();
		}
		else
		{
			g_curr_Sound.volume = 0;
			g_curr_Sound.muted = true;
			g_curr_Sound.pause();
		}
	}
}

let freqButtonsConst = new Array();

freqButtonsConst.push(new RadioButton("128 Hz","128 Hz",theCanvas.width / 2 - 310,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("256 Hz","256 Hz",theCanvas.width / 2 - 220,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("512 Hz","512 Hz",theCanvas.width / 2 - 130,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("1024 Hz","1024 Hz",theCanvas.width / 2 - 40,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("2048 Hz","2048 Hz",theCanvas.width / 2 + 50,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("4096 Hz","4096 Hz",theCanvas.width / 2 + 140,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("8192 Hz","8192 Hz",theCanvas.width / 2 + 230,freqButtonsY,80,25));

let radioCoord = new Radio("Frequency","1024 Hz",selectFrequency,freqButtonsConst);
commonUIRegister(radioCoord);


let g_length = 0.0;
const g_temperature = 293.15;
const g_speed_of_sound = Math.sqrt(1.4*1.380649e-23*g_temperature/(28.9647/1000/6.02214076e23));
let g_slew = 0;

function onRightSelect()
{
	g_slew = 1;
}
function onRightRelease()
{
	g_slew = 0;
}

const controlButtonsY = theCanvas.height / 2 - 110;
const lengthDisplayY = theCanvas.height / 2 - 130;
let buttonRight = new SpringButton("Right",theCanvas.width / 2 + 5,controlButtonsY,60,30,onRightSelect,onRightRelease)
commonUIRegister(buttonRight);

function onLeftSelect()
{
	g_slew = -1;
}
function onLeftRelease()
{
	g_slew = 0;
}

let buttonLeft = new SpringButton("Left",theCanvas.width / 2 - 65,controlButtonsY,60,30,onLeftSelect,onLeftRelease)
commonUIRegister(buttonLeft);

function onResetSelect()
{
	g_length = 0;
}

let buttonReset = new Button("Reset",theCanvas.width / 2 - 135,controlButtonsY,60,30,onResetSelect)
commonUIRegister(buttonReset);

g_curr_Sound = g_sounds["1024 Hz"];
g_curr_Sound.volume = g_volume * sliderVolume.value;

let halfHeight = theCanvas.height / 2;

const g_timestep = 1.0 / 30.0;
const g_slewSpeed = 0.01;
function work(){

	g_length = g_length + g_slew * g_slewSpeed;
	if (g_length < 0)
		g_length = 0;
	if (g_length > 150.0)
		g_length = 150.0;
		
	const wavelength = g_speed_of_sound / g_curr_Sound.frequency;
	const fracWavelength = g_length / 100.0 / wavelength;
	
	const amplitude = (fracWavelength % 0.5 - 0.25) / 0.25;
	const intensity = 1.0 - amplitude * amplitude;
	const eff_Volume = (intensity * 0.9 + 0.1);
	g_curr_Sound.volume = eff_Volume * g_volume * sliderVolume.value;

	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.font = "18px Arial";

	// Draw the current tube length
	let lengthDisplay = (Math.round(g_length * 10.0) / 10.0).toString();
	if (lengthDisplay.charAt(lengthDisplay.length - 2) != '.')
		lengthDisplay = lengthDisplay + ".0"
	lengthDisplay += ' cm';
	theContext.fillStyle = '#FFFFFF';
	drawTextRight(theContext,"Length: ",theCanvas.width / 2 - 270.0 + 270.0 * g_length / 150.0 / 2.0 - 30 - 2,lengthDisplayY);
	theContext.fillText(lengthDisplay,theCanvas.width / 2 - 270.0 + 270.0 * g_length / 150.0 / 2.0 - 30 + 2,lengthDisplayY);
	theContext.strokeStyle = '#FFFFFF';
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2 - 300.0,theCanvas.height / 2 - 160);
	theContext.lineTo(theCanvas.width / 2 - 300.0,theCanvas.height / 2 - 150);
	theContext.stroke();
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2 - 300.0 + 270.0 * g_length / 150.0,theCanvas.height / 2 - 160);
	theContext.lineTo(theCanvas.width / 2 - 300.0 + 270.0 * g_length / 150.0,theCanvas.height / 2 - 150);
	theContext.stroke();
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2 - 300.0,theCanvas.height / 2 - 155);
	theContext.lineTo(theCanvas.width / 2 - 300.0 + 270.0 * g_length / 150.0,theCanvas.height / 2 - 155);
	theContext.stroke();
	
	// draw the tube and plunger
	theContext.fillStyle = "#7F7FFF";
	theContext.fillRect(theCanvas.width / 2 - 300,theCanvas.height / 2 - 240,600,80);
	theContext.fillStyle = "#0F0FaF";
	theContext.fillRect(theCanvas.width / 2 - 270.0 + 270.0 * g_length / 150.0 - 30,theCanvas.height / 2 - 240,30,80);

	theContext.fillStyle = "#3F3FaF";
	theContext.fillRect(theCanvas.width / 2 - 270.0 + 270.0 * g_length / 150.0,theCanvas.height / 2 - 210,630,20);
	
	theContext.fillStyle = "#7F7F7F";
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2 - 310,theCanvas.height / 2 - 240);
	theContext.lineTo(theCanvas.width / 2 - 310,theCanvas.height / 2 - 160);
	theContext.lineTo(theCanvas.width / 2 - 330,theCanvas.height / 2 - 190);
	theContext.lineTo(theCanvas.width / 2 - 350,theCanvas.height / 2 - 190);
	theContext.lineTo(theCanvas.width / 2 - 350,theCanvas.height / 2 - 210);
	theContext.lineTo(theCanvas.width / 2 - 330,theCanvas.height / 2 - 210);
	theContext.closePath();
	theContext.fill();


	// draw the sound meter
	theContext.save();
	theContext.translate(0,80);
	theContext.fillStyle = "#3F3F3F";
	theContext.fillRect(theCanvas.width / 2 - 100,theCanvas.height / 2 - 120,200,220);
	theContext.fillStyle = "#FFFFFF";
	theContext.fillRect(theCanvas.width / 2 - 80,theCanvas.height / 2 - 100,160,100);

	theContext.strokeStyle = "#FFFFFF";
	drawTextCenter(theContext,"Sound Meter",theCanvas.width / 2,theCanvas.height / 2 + 80);

	theContext.strokeStyle = "#000000";
	theContext.beginPath();
	let angle;
	for (angle = -45; angle <= 45; angle += 5)
	{
		let angleRad = angle * Math.PI / 180.0;
		theContext.moveTo(theCanvas.width / 2 + 62.0 * Math.sin(angleRad),theCanvas.height / 2 - 62.0 * Math.cos(angleRad));
		theContext.lineTo(theCanvas.width / 2 + 70.0 * Math.sin(angleRad),theCanvas.height / 2 - 70.0 * Math.cos(angleRad));
		theContext.stroke();
	}
	theContext.fillStyle = "#000000";
	theContext.font = "10px Arial";
	for (angle = -45; angle <= 45; angle += 15)
	{
		let angleRad = angle * Math.PI / 180.0;
		theContext.moveTo(theCanvas.width / 2 + 70.0 * Math.sin(angleRad),theCanvas.height / 2 - 70.0 * Math.cos(angleRad));
		theContext.lineTo(theCanvas.width / 2 + 78.0 * Math.sin(angleRad),theCanvas.height / 2 - 78.0 * Math.cos(angleRad));
		theContext.stroke();
		const strength = (angle + 45.0) / 90.0;
		let strengthDisplay = (Math.round(strength * 10.0) / 10.0).toString();
		if (strengthDisplay.charAt(strengthDisplay.length - 2) != '.')
			strengthDisplay = strengthDisplay + ".0"
		
		drawTextCenter(theContext,strengthDisplay,theCanvas.width / 2 + 78.0 * Math.sin(angleRad),theCanvas.height / 2 - 78.0 * Math.cos(angleRad) - 3);
	}
	


	theContext.strokeStyle = "#000000";
	theContext.beginPath();
	theContext.moveTo(theCanvas.width / 2,theCanvas.height / 2);
	angle = (-45 + 90.0 * eff_Volume) * Math.PI / 180.0;
	theContext.lineTo(theCanvas.width / 2 + 60.0 * Math.sin(angle),theCanvas.height / 2 - 60.0 * Math.cos(angle));
	theContext.stroke();
	theContext.restore();
	
	commonUIdraw(theContext);


	window.setTimeout(work, 1.0/30.0);
}

work();

