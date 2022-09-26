

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }
theCanvas.onmousedown = commonUIOnMouseDown;
theCanvas.onmouseup = commonUIOnMouseUp;
theCanvas.onclick = commonUIOnClick;
theCanvas.onmousemove = commonUIOnMouseMove;
theCanvas.onmouseleave = commonUIOnMouseLeave;

let theContext = theCanvas.getContext("2d");


let minimumControlsHeightTop = 130;

theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;
//theCanvas.width = theCanvas.height;

const modelButtonsY = theCanvas.height - 30;
const buttonsControlsY = modelButtonsY - 30;
//let buttonsZoomY = buttonsControlsY - 30;

const buttonsTimeY = buttonsControlsY - 50;
const dateDisplayTopY = buttonsTimeY - 25.0;
const dateDisplayY = dateDisplayTopY + 20.0;
const displayBottomY = dateDisplayTopY - 5.0;
const displayHeight = Math.min(Math.max(10,displayBottomY),theCanvas.width);
const displayCenterX = theCanvas.width / 2;
const displayCenterY = displayBottomY - displayHeight / 2;


const g_basespeed = 1.0;
let g_speed = 1.0;
let g_pause = true;
let g_zoom = 1.0 / 20.0; // 1/30 arcsec

function speedup(event)
{
	g_speed *= 2.0;
}
function slowdown(event)
{
	g_speed *= 0.5;
}

function zoomin(event)
{
	g_zoom *= 2.0;
}
function zoomout(event)
{
	g_zoom *= 0.5;
}




const times = String.fromCharCode(0x00d7)
const pauseButtonText = '| |'
const playButtonText = String.fromCharCode(0x25b6);
const reverseButtonText = String.fromCharCode(0x25c0);

const timesMTwoFiftySix = reverseButtonText + '256'
const timesMSixtyFour = reverseButtonText + '64'
const timesMSixteen = reverseButtonText + '16'
const timesMFour = reverseButtonText + '4'
const timesMOne = reverseButtonText + '1'
const timesOne = playButtonText + '1'
const timesFour = playButtonText + '4'
const timesSixteen = playButtonText + '16'
const timesSixtyFour = playButtonText + '64'
const timesTwoFiftySix = playButtonText + '256'
function selectSpeed(value)
{
	switch (value)
	{
	case timesMTwoFiftySix:
		g_speed = -256.0 * g_basespeed;
		break;
	case timesMSixtyFour:
		g_speed = -64.0 * g_basespeed;
		break;
	case timesMSixteen:
		g_speed = -16.0 * g_basespeed;
		break;
	case timesMFour:
		g_speed = -2.0 * g_basespeed;
		break;
	case timesMOne:
		g_speed = -1.0 * g_basespeed;
		break;
	case timesOne:
	default:
		g_speed = 1.0 * g_basespeed;
		break;
	case timesFour:
		g_speed = 4.0 * g_basespeed;
		break;
	case timesSixteen:
		g_speed = 16.0 * g_basespeed;
		break;
	case timesSixtyFour:
		g_speed = 64.0 * g_basespeed;
		break;
	case timesTwoFiftySix:
		g_speed = 256.0 * g_basespeed;
		break;
	}
}

let speedButtons = new Array();
speedButtons.push(new RadioButton(timesMTwoFiftySix,timesMTwoFiftySix ,theCanvas.width / 2 - 230,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixtyFour,timesMSixtyFour     ,theCanvas.width / 2 - 190,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMSixteen,timesMSixteen         ,theCanvas.width / 2 - 150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMFour,timesMFour               ,theCanvas.width / 2 - 110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesMOne,timesMOne                 ,theCanvas.width / 2 -  70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesOne,timesOne                   ,theCanvas.width / 2 +  30,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesFour,timesFour                 ,theCanvas.width / 2 +  70,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixteen,timesSixteen           ,theCanvas.width / 2 + 110,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesSixtyFour,timesSixtyFour       ,theCanvas.width / 2 + 150,buttonsTimeY,40,40));
speedButtons.push(new RadioButton(timesTwoFiftySix,timesTwoFiftySix   ,theCanvas.width / 2 + 190,buttonsTimeY,40,40));
commonUIRegister(new Radio("Speed",timesOne,selectSpeed,speedButtons));

/*
function requestAdvanceDay(event)
{
	g_timer += 1.0;
}
function requestAdvanceWeek(event)
{
	g_timer += 7.0;
}
function requestAdvanceMonth(event)
{
	g_timer += 30.0;
}
function requestAdvanceYear(event)
{
	g_timer += 365.0;
}

let advanceDay = new Button("+1d",theCanvas.width / 2 + 250,buttonsTimeY,40,40,requestAdvanceDay);
commonUIRegister(advanceDay);
let advanceWeek = new Button("+7d",theCanvas.width / 2 + 290,buttonsTimeY,40,40,requestAdvanceWeek);
commonUIRegister(advanceWeek);
let advanceMonth = new Button("+30d",theCanvas.width / 2 + 330,buttonsTimeY,40,40,requestAdvanceMonth);
commonUIRegister(advanceMonth);
let advanceYear = new Button("+1y",theCanvas.width / 2 + 370,buttonsTimeY,40,40,requestAdvanceYear);
commonUIRegister(advanceYear);

function requestBackDay(event)
{
	g_timer -= 1.0;
}
function requestBackWeek(event)
{
	g_timer -= 7.0;
}
function requestBackMonth(event)
{
	g_timer -= 30.0;
}
function requestBackYear(event)
{
	g_timer -= 365.0;
}

let backDay = new Button("-1d",theCanvas.width / 2 - 290,buttonsTimeY,40,40,requestBackDay);
commonUIRegister(backDay);
let backWeek = new Button("-7d",theCanvas.width / 2 - 330,buttonsTimeY,40,40,requestBackWeek);
commonUIRegister(backWeek);
let backMonth = new Button("-30d",theCanvas.width / 2 - 370,buttonsTimeY,40,40,requestBackMonth);
commonUIRegister(backMonth);
let backYear = new Button("-1y",theCanvas.width / 2 - 410,buttonsTimeY,40,40,requestBackYear);
commonUIRegister(backYear);
*/

function requestPause(event)
{
	g_pause = !g_pause;
	if (!g_pause)
	{
		playButton.text = pauseButtonText;
	}
	else
	{
		playButton.text = playButtonText
	}
}

let playButton = new Button("Pause",theCanvas.width / 2 - 20,buttonsTimeY,40,40,requestPause);
if (g_pause)
	playButton.text = playButtonText;
else
	playButton.text = pauseButtonText;
playButton.textFont = "24px Arial";
commonUIRegister(playButton);

/*

let zoomAdjust = 0;
function requestZoomInStart(event)
{
	zoomAdjust = 1;
}

function requestZoomInEnd(event)
{
	zoomAdjust = 0;
}

let zoomIn = new SpringButton("+",displayCenterX + displayHeight * 0.5 + 115,displayCenterY - 200,40,40, requestZoomInStart, requestZoomInEnd);
commonUIRegister(zoomIn);

function requestZoomOutStart(event)
{
	zoomAdjust = -1;
}

function requestZoomOutEnd(event)
{
	zoomAdjust = 0;
}

let zoomOut = new SpringButton("-",displayCenterX + displayHeight * 0.5 + 25,displayCenterY - 200,40,40, requestZoomOutStart, requestZoomOutEnd);
commonUIRegister(zoomOut);
*/
let g_timer = 0.0;//2456083.27000; //2451545.0;

class Star
{
	constructor()
	{
		this.r = Math.random();
		this.theta = Math.random() * Math.PI * 2.0;
	}
}

let stars = new Array();

// create general disk stars
let idxLcl = 0;
for (idxLcl = 0; idxLcl < 400; idxLcl++)
{
	let star = new Star();
	stars.push(star);
}
// create spriral arms
let arm = 0;
for (arm = 0; arm < 4; arm++)
{
	let offset = arm * Math.PI * 0.5;
	for (idxLcl = 0; idxLcl < 200; idxLcl++)
	{
		let star = new Star();
		star.r = Math.random() * 0.9 + 0.1;
		star.theta = (star.r * 3.0 * Math.PI) % (2.0 * Math.PI) + offset + (Math.random() - 0.5) * 0.3;
		stars.push(star);
	}
}



let standbyTimer = 0;

function work(){
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.beginPath();
	theContext.fillStyle = '#000000';
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	if (!g_pause)
		g_timer = g_timer + 1.0 / 30.0 * g_speed;
//	if (zoomAdjust != 0)
//	{
//		if (zoomAdjust > 0)
//			g_zoom *= 1.05;
//		else
//			g_zoom *= 0.95;
//	}


	theContext.save();
	theContext.strokeStyle = "#FFFFFF";
	theContext.beginPath();
	theContext.rect(displayCenterX - displayHeight / 2,displayCenterY - displayHeight / 2,displayHeight,displayHeight);
	theContext.stroke();
	theContext.clip();
	
	for (idxLcl = 0; idxLcl < stars.length; idxLcl++)
	{
		const angvel = 2.0 * Math.PI / stars[idxLcl].r * 0.01;
		const theta = stars[idxLcl].theta + angvel * g_timer;
		const size = 3.0;
		const starColor = UBVRItoRGB(null,0.656,0.0,null,null,0.0,1.0);
		let layer = 0;
		const x = stars[idxLcl].r * Math.cos(theta) * displayHeight * 0.5 + displayCenterX;
		const y = stars[idxLcl].r * Math.sin(theta) * displayHeight * 0.5 + displayCenterY;
		for (layer = 0; layer < size; layer += 0.5)
		{
			let clrLcl = starColor.copy();
			clrLcl.scale(layer / size);
			theContext.fillStyle = clrLcl.style;
			theContext.beginPath();
			theContext.arc(x,y,size - layer,0,2.0*Math.PI);
			theContext.fill(); // Draw it
		}
	}
	theContext.restore();



	commonUIdraw(theContext);


	window.setTimeout(work, 1.0/30.0);
}

work();

