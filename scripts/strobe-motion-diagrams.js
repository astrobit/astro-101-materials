let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.width = window.innerWidth- 20;
theCanvas.height = Math.min(800,window.innerHeight - 200);

let theContext = theCanvas.getContext("2d");


const eFlat = 0;
const eUphill = 1;
const eDownhill = 2;
let g_InclineSelect = eFlat;

const kRampLength = 8.0; // m
let kSpeedFlat = 1.0; // 1 m/s
let kSpeedUphill = 3.0; // 1 m/s
let g_Scale = theCanvas.width / kRampLength; // 1 m = 100 px
let g_Ramp_Angle_Radians = 0.0;
const kBallRadius = 0.05;
const kGravity = 9.8; // m/s²
const kStrobePreiod = 0.5; // s
const kStrobeDuty = 0.12; // -
const kRampAngle = 5; // degrees

let g_localTimerOrigin = null;

const eModeFull = 0;
const eModeStrobe = 1;
const eModePersistent = 2;

function onResetTime()
{
	g_localTimerOrigin = performance.now();
}


function onSelectFlat()
{
	g_InclineSelect = eFlat;
	g_Ramp_Angle_Radians = 0.0;
	onResetTime();
}
function onSelectUphill()
{
	g_InclineSelect = eUphill;
	g_Ramp_Angle_Radians = kRampAngle * Math.PI / 180.0;
	onResetTime();
}
function onSelectDownhill()
{
	g_InclineSelect = eDownhill;
	g_Ramp_Angle_Radians = -kRampAngle * Math.PI / 180.0;
	onResetTime();
}
onSelectFlat();



const rampFlat = document.getElementById("flat");
rampFlat.addEventListener('click', onSelectFlat);

const rampUphill = document.getElementById("uphill");
rampUphill.addEventListener('click', onSelectUphill);

const rampDownhill = document.getElementById("downhill");
rampDownhill.addEventListener('click', onSelectDownhill);


let buttonShowNormal = document.getElementById("show normal");
buttonShowNormal.addEventListener('click', onShowNormal);
let buttonShowStrobe = document.getElementById("show strobe");
buttonShowStrobe.addEventListener('click', onShowStrobe);
let buttonShowStopMotion = document.getElementById("show stop-motion");
buttonShowStopMotion.addEventListener('click', onShowStopMotion);
let buttonShowAll = document.getElementById("show all");
buttonShowAll.addEventListener('click', onShowAll);

let showPositionVector = false
let showDisplacementVector = false

let showNormal = true
let showStrobe = false
let showStopMotion = false

function onTogglePositionVector()
{
    showPositionVector = !showPositionVector   
}
function onToggleDisplacementVector()
{
    showDisplacementVector = !showDisplacementVector
}

function onShowNormal()
{
    showNormal = true
    showStrobe = false
    showStopMotion = false
}

function onShowStrobe()
{
    showNormal = false
    showStrobe = true
    showStopMotion = false
}

function onShowStopMotion()
{
    showNormal = false
    showStrobe = false
    showStopMotion = true
}

function onShowAll()
{
    showNormal = true
    showStrobe = true
    showStopMotion = true
}


function drawBall(position, angle, opacity)
{
	const radius = kBallRadius * g_Scale;
	theContext.save();
		const r = Math.abs((0xcf * opacity).toFixed(0)).toString(16);
		const gb = Math.abs((0x4f * opacity).toFixed(0)).toString(16);
		theContext.translate(position.x * g_Scale,position.y * g_Scale);
		theContext.translate(-radius * Math.sin(g_Ramp_Angle_Radians), -radius * Math.cos(g_Ramp_Angle_Radians))
		//top half
		theContext.fillStyle = "#"+r+gb+gb;
		theContext.beginPath();
		theContext.arc(0,0,radius,Math.PI, 2 * Math.PI,false);
		theContext.fill();

		//bottom half
		theContext.fillStyle = "#"+r+"0000";
		theContext.beginPath();
		theContext.arc(0,0,radius,0,Math.PI,false);
		theContext.fill();
		
		//line to show rotation
		theContext.beginPath();
		theContext.moveTo(0,0);
		theContext.lineTo(radius*Math.cos(-angle), radius*Math.sin(-angle));
		theContext.strokeStyle = "#"+r+gb+gb;
		theContext.stroke();
	theContext.restore();
}

function calculateBallPosition(timer)
{
	const cosRamp = Math.cos(g_Ramp_Angle_Radians);
	const sinRamp = Math.sin(g_Ramp_Angle_Radians);
	const rampLengthPixels = kRampLength * g_Scale;
	
	let InitialVelocity = (g_InclineSelect == eDownhill) ? 0.0 : ((g_InclineSelect == eFlat) ? kSpeedFlat : kSpeedUphill);

	const acceleration = -kGravity * Math.sin(g_Ramp_Angle_Radians); // acceleration in direction of motion
	const ballPosition = (0.5 * acceleration * timer + InitialVelocity) * timer;
	const ballAngle = ballPosition / (2.0 * Math.PI * kBallRadius);
	
	return {'acceleration': acceleration, 'position': ballPosition, 'angle': ballAngle};
}

function drawBallandRamp(timer, mode)
{
	let displayOn = true;
	const rampLengthPixels = kRampLength * g_Scale;
	
	theContext.textBaseline = "middle";
	theContext.textAlign = "center";

	theContext.fillStyle = '#7f7f7f';
	

	if (mode == eModeStrobe)
	{
		let kStrobeCurrDuty = (timer % kStrobePreiod) / kStrobePreiod;
		const kHalfDuty = 0.5 * kStrobeDuty;
		displayOn = kStrobeCurrDuty > (1.0 - kHalfDuty) || kStrobeCurrDuty < kHalfDuty;
	}
	if (displayOn)
	{
		const cosRamp = Math.cos(g_Ramp_Angle_Radians);
		const sinRamp = Math.sin(g_Ramp_Angle_Radians);
		
		
		
		if (g_InclineSelect == eFlat)
		{
			theContext.fillRect(0, 0, rampLengthPixels, 20);
		}
		else if (g_InclineSelect == eUphill)
		{
			theContext.fillStyle = '#7f7f7f';
			theContext.beginPath();
			theContext.moveTo(0,0);
			theContext.lineTo(rampLengthPixels * cosRamp, -rampLengthPixels * sinRamp);
			theContext.lineTo(rampLengthPixels * cosRamp, 0);
			theContext.closePath();
			theContext.fill();
		}
		else // if (g_InclineSelect == eDownhill)
		{
			theContext.beginPath();
			theContext.moveTo(0,0);
			theContext.lineTo(rampLengthPixels * cosRamp, -rampLengthPixels * sinRamp);
			theContext.lineTo(0, -rampLengthPixels * sinRamp);
			theContext.closePath();
			theContext.fill();
		}
		if (mode == eModePersistent)
		{
			for (pseudoTimer = 0.0; pseudoTimer < timer; pseudoTimer += kStrobePreiod)
			{
				const pos = calculateBallPosition(pseudoTimer);
				drawBall({'x': pos.position * cosRamp, 'y': -pos.position * sinRamp},pos.ballAngle,0.5);
			}
		}
		else
		{
			const pos = calculateBallPosition(timer);
			drawBall({'x': pos.position * cosRamp, 'y': -pos.position * sinRamp},pos.ballAngle,1);
		}
		
		if (showPositionVector && (mode == eModeFull || mode == eModePersistent))
		{
			const offset = -60
			let pos = calculateBallPosition(timer);
			if (mode == eModePersistent)
			{
			    let pseudoTimer = timer - (timer % kStrobePreiod)
//			    for (pseudoTimer = 0.0; pseudoTimer < timer; pseudoTimer += kStrobePreiod)
//			    {
			    pos = calculateBallPosition(pseudoTimer);
			}
			let oldWidth = theContext.lineWidth
			let oldStyle = theContext.strokeStyle
			theContext.lineWidth = 4;
			theContext.strokeStyle = "#0000FF"
			theContext.beginPath();
			theContext.moveTo(0, offset);
			theContext.lineTo(pos.position * cosRamp * g_Scale, -pos.position * sinRamp * g_Scale + offset);
			theContext.stroke();
			theContext.moveTo(pos.position * cosRamp * g_Scale - 10, -pos.position * sinRamp * g_Scale - 10 + offset);
			theContext.lineTo(pos.position * cosRamp * g_Scale, -pos.position * sinRamp * g_Scale + offset);
			theContext.lineTo(pos.position * cosRamp * g_Scale - 10, -pos.position * sinRamp * g_Scale + 10 + offset);
			theContext.stroke();

			theContext.lineWidth = oldWidth
			theContext.strokeStyle = oldStyle
		}
		//@@TODO: finish displacement vectors
		if (showDisplacementVector && mode == eModePersistent)
		{
			let oldWidth = theContext.lineWidth
			let oldStyle = theContext.strokeStyle

		    let pseudoTimer1 = timer - kStrobePreiod - (timer % kStrobePreiod)
		    let pseudoTimer2 = timer - (timer % kStrobePreiod)
			let pos1 = calculateBallPosition(pseudoTimer1);
			let pos2 = calculateBallPosition(pseudoTimer2);
			const offset = -35

			theContext.lineWidth = 4;
			theContext.strokeStyle = "#007F00"
			theContext.beginPath();
			theContext.moveTo(pos1.position * cosRamp * g_Scale, -pos1.position * sinRamp * g_Scale + offset);
			theContext.lineTo(pos2.position * cosRamp * g_Scale, -pos2.position * sinRamp * g_Scale + offset);
			theContext.stroke();
			let sign = 1
			if (pos2.position < pos1.position)
			    sign = -1
		    theContext.moveTo(pos2.position * cosRamp * g_Scale - 10 * sign, -pos2.position * sinRamp * g_Scale - 10 + offset);
		    theContext.lineTo(pos2.position * cosRamp * g_Scale, -pos2.position * sinRamp * g_Scale + offset);
		    theContext.lineTo(pos2.position * cosRamp * g_Scale - 10 * sign, -pos2.position * sinRamp * g_Scale + 10 + offset);
			theContext.stroke();

			theContext.lineWidth = oldWidth
			theContext.strokeStyle = oldStyle
		}
	}
	theContext.fillStyle = '#000000';
	if (mode == eModeStrobe)
    {
        if (!displayOn)
        	theContext.fillStyle = '#ffffff';
		theContext.fillText("Strobe", 50, 10);
    }
	else if (mode == eModePersistent)
		theContext.fillText("Stop-Motion", 50, 10);
	else //if (mode == eStrobe)
		theContext.fillText("Normal", 50, 10);
}


function work(){
	if (g_localTimerOrigin ==  null)
		onResetTime();

	let timer = (performance.now() - g_localTimerOrigin) * 0.001;
	if (timer > 10.0)
	{
		onResetTime();
	    timer = 0.0
	}

	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.font = "18px Arial";
//	const offsetX = kRampLength * g_Scale * 0.2;
	theContext.resetTransform();
	theContext.save();
	    if (showNormal)
	    {
		    theContext.translate(0,	200);
		    drawBallandRamp(timer,eModeFull);
		}
	    if (showStrobe)
	    {
		    theContext.translate(0,	200);
		    drawBallandRamp(timer,eModeStrobe);
		}
	    if (showStopMotion)
	    {
		    theContext.translate(0,	200);
		    drawBallandRamp(timer,eModePersistent);
		}
	theContext.restore();

	theContext.fillStyle = '#ffffff';
	const timerString = timer.toFixed(2);
	theContext.fillText(timerString + " s",20,20);

	window.setTimeout(work, 1.0/30.0);
}

work();

