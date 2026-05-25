

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.width = window.innerWidth- 20;
theCanvas.height = window.innerHeight - 200;

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
const kStrobeDuty = 0.04; // -
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



function onTogglePositionVector()
{
}
function onToggleDisplacementVector()
{
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

	theContext.fillStyle = '#ffffff';
	if (mode == eModeStrobe)
		theContext.fillText("Strobe", rampLengthPixels * 0.5, -160);
	else if (mode == eModePersistent)
		theContext.fillText("Stop-Motion", rampLengthPixels * 0.5, -160);
	else //if (mode == eStrobe)
		theContext.fillText("Normal", rampLengthPixels * 0.5, -160);
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
	}
}


function work(){
	if (g_localTimerOrigin ==  null)
		onResetTime();

	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.font = "18px Arial";
	const timer = (performance.now() - g_localTimerOrigin) * 0.001;
//	const offsetX = kRampLength * g_Scale * 0.2;
	theContext.resetTransform();
	theContext.save();
		theContext.translate(0,	200);
		drawBallandRamp(timer,eModeFull);
		theContext.translate(0,	200);
		drawBallandRamp(timer,eModeStrobe);
		theContext.translate(0,	200);
		drawBallandRamp(timer,eModePersistent);
	theContext.restore();

	theContext.fillStyle = '#ffffff';
	const timerString = timer.toFixed(2);
	theContext.fillText(timerString + " s",20,20);

	window.setTimeout(work, 1.0/30.0);
}

work();

