

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

let theContext = theCanvas.getContext("2d");


const minimumControlsHeightTop = 130;

theCanvas.height = 700;
theCanvas.width = window.innerWidth;

let g_muted = true;
let g_volume = 1.0;


let ctxtAudio = null;
try {
	ctxtAudio = new AudioContext();
}
catch (e) {
	alert('Web Audio API is not supported in this browser');
}
let g_oscillatorNode = ctxtAudio.createOscillator();
let g_gainCtx = ctxtAudio.createGain();
g_gainCtx.gain.value = 0;
g_gainCtx.connect(ctxtAudio.destination);

g_oscillatorNode.frequency.value = 1024;
g_oscillatorNode.type = "sine";
g_oscillatorNode.connect(g_gainCtx);
let g_OscillatorStarted = false;



function onMuteSelect()
{
	g_muted = !g_muted;
	if (!g_muted)
	{
		buttonMute.insideStyle = "#7F7F7F";
		if (g_OscillatorStarted)
			ctxtAudio.resume();
        else
			g_oscillatorNode.start();
		g_OscillatorStarted = true;
	}
	else
	{
		buttonMute.insideStyle = "#FF7F00";
		if (g_OscillatorStarted)
			ctxtAudio.suspend();
	}
}


const freqButtonsY = 650;
const volumeControlY = 550;

function volumeControl(value)
{
//	g_VolumeMaster = g_volume * value;
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

let g_Frequency = 1024.0;
function selectFrequency(frequency)
{
	g_Frequency = parseFloat(frequency);
	g_oscillatorNode.frequency.value = frequency;
}

let freqButtonsConst = new Array();

freqButtonsConst.push(new RadioButton("128 Hz","128",theCanvas.width / 2 - 310,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("256 Hz","256",theCanvas.width / 2 - 220,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("512 Hz","512",theCanvas.width / 2 - 130,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("1024 Hz","1024",theCanvas.width / 2 - 40,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("2048 Hz","2048",theCanvas.width / 2 + 50,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("4096 Hz","4096",theCanvas.width / 2 + 140,freqButtonsY,80,25));
freqButtonsConst.push(new RadioButton("8192 Hz","8192",theCanvas.width / 2 + 230,freqButtonsY,80,25));

let radioCoord = new Radio("Frequency","1024",selectFrequency,freqButtonsConst);
commonUIRegister(radioCoord);


let g_length = 0.0;
const g_temperature = 293.15;
const g_speed_of_sound = Math.sqrt(1.4*1.380649e-23*g_temperature/(28.9647/1000/6.02214076e23));
let g_slew = 0;

function onRightSelect()
{
	g_slew = 1;
}
function onRightSelectFast() {
	g_slew = 10;
}
function onRightRelease()
{
	g_slew = 0;
}
let sizeTubePixels = Math.max(theCanvas.width - 200, 100);
let originX = theCanvas.width / 2;
let originY = theCanvas.height / 2;


const controlButtonsY = 200;
const lengthDisplayY = 60;
let buttonRight = new SpringButton("Right",theCanvas.width / 2 + 5,controlButtonsY,60,30,onRightSelect,onRightRelease)
let buttonRightFast = new SpringButton("Right Fast", theCanvas.width / 2 + 75, controlButtonsY, 120, 30, onRightSelectFast, onRightRelease)
commonUIRegister(buttonRight);
commonUIRegister(buttonRightFast);

function onLeftSelect()
{
	g_slew = -1;
}
function onLeftSelectFast() {
	g_slew = -10;
}
function onLeftRelease()
{
	g_slew = 0;
}

let buttonLeft = new SpringButton("Left",theCanvas.width / 2 - 65,controlButtonsY,60,30,onLeftSelect,onLeftRelease)
let buttonLeftFast = new SpringButton("Left Fast", theCanvas.width / 2 - 195, controlButtonsY, 120, 30, onLeftSelectFast, onLeftRelease)
commonUIRegister(buttonLeft);
commonUIRegister(buttonLeftFast);

function onResetSelect()
{
	g_length = 0;
}

let buttonReset = new Button("Reset",theCanvas.width / 2 - 30,controlButtonsY - 40,60,30,onResetSelect)
commonUIRegister(buttonReset);

let halfHeight = theCanvas.height / 2;


const g_timestep = 1.0 / 30.0;
const g_slewSpeed = 0.01;
const g_lengthMax = 500.0;
function work(){

	g_length = g_length + g_slew * g_slewSpeed;
	if (g_length < 0)
		g_length = 0;
	if (g_length > g_lengthMax)
		g_length = g_lengthMax;
		
	const wavelength = g_speed_of_sound / g_Frequency;
	const fracWavelength = g_length / 100.0 / wavelength;
	
	const amplitude = (fracWavelength % 0.5 - 0.25) / 0.25;
	const intensity = 1.0 - amplitude * amplitude;
	const eff_Volume = (intensity * 0.999 + 0.001);
	g_gainCtx.gain.value = eff_Volume * g_volume * sliderVolume.value;

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

	theContext.strokeStyle = '#FFFFFF';
	theContext.save();
	theContext.translate(originX - sizeTubePixels / 2, 70);

		const plungerX = g_length / g_lengthMax * sizeTubePixels;
		drawTextCenter(theContext, "Length: " + lengthDisplay, plungerX / 2, lengthDisplayY);
		// length indicator
		theContext.beginPath();
		theContext.moveTo(0, 40);
		theContext.lineTo(0, 50);
		theContext.stroke();
		theContext.beginPath();
		theContext.moveTo(0, 45);
		theContext.lineTo(plungerX, 45);
		theContext.stroke();
		theContext.beginPath();
		theContext.moveTo(plungerX, 40);
		theContext.lineTo(plungerX, 50);
		theContext.stroke();
	
		// draw the tube and plunger
			// tube
		theContext.fillStyle = "#7F7FFF";
		theContext.fillRect(0, -40, sizeTubePixels, 80);
			// plunger
		theContext.fillStyle = "#0F0FaF";
		theContext.fillRect(plungerX,-40,30,80);
			// plunger rod
		theContext.fillStyle = "#3F3FaF";
	theContext.fillRect(plungerX + 30, -10, sizeTubePixels, 20);

		// draw the speaker
		theContext.fillStyle = "#7F7F7F";
		theContext.beginPath();
		theContext.moveTo(-50,-15);
		theContext.lineTo(-50,15);
		theContext.lineTo(-30,15);
		theContext.lineTo(-10,40);
		theContext.lineTo(-10,-40);
		theContext.lineTo(-30,-15);
		theContext.closePath();
		theContext.fill();

	theContext.restore();


	// draw the sound meter
	theContext.save();
	theContext.translate(originX,400);
	theContext.fillStyle = "#3F3F3F";
	theContext.fillRect(-100,-120,200,220);
	theContext.fillStyle = "#FFFFFF";
	theContext.fillRect(-80,-100,160,100);

	theContext.strokeStyle = "#FFFFFF";
	drawTextCenter(theContext,"Sound Meter",0,80);

	theContext.strokeStyle = "#000000";
	theContext.beginPath();
	let angle;
	for (angle = -45; angle <= 45; angle += 5)
	{
		let angleRad = angle * Math.PI / 180.0;
		theContext.moveTo(62.0 * Math.sin(angleRad),-62.0 * Math.cos(angleRad));
		theContext.lineTo(70.0 * Math.sin(angleRad),-70.0 * Math.cos(angleRad));
		theContext.stroke();
	}
	theContext.fillStyle = "#000000";
	theContext.font = "10px Arial";
	for (angle = -45; angle <= 45; angle += 15)
	{
		let angleRad = angle * Math.PI / 180.0;
		theContext.moveTo(70.0 * Math.sin(angleRad),-70.0 * Math.cos(angleRad));
		theContext.lineTo(78.0 * Math.sin(angleRad),-78.0 * Math.cos(angleRad));
		theContext.stroke();
		const strength = (angle + 45.0) / 90.0;
		let strengthDisplay = (Math.round(strength * 10.0) / 10.0).toString();
		if (strengthDisplay.charAt(strengthDisplay.length - 2) != '.')
			strengthDisplay = strengthDisplay + ".0"
		
		drawTextCenter(theContext,strengthDisplay,78.0 * Math.sin(angleRad),-78.0 * Math.cos(angleRad) - 3);
	}
	


	theContext.strokeStyle = "#000000";
	theContext.beginPath();
	theContext.moveTo(0,0);
	angle = (-45 + 90.0 * eff_Volume) * Math.PI / 180.0;
	theContext.lineTo(60.0 * Math.sin(angle),-60.0 * Math.cos(angle));
	theContext.stroke();
	theContext.restore();
	
	commonUIdraw(theContext);

	window.setTimeout(work, 1.0/30.0);
}

work();

