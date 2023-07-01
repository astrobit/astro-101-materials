

let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; }

let theContext = theCanvas.getContext("2d");



let g_speed = 1.0;
let g_pause = true;
let g_zoom = 1.0 / 20.0; // 1/30 arcsec




let g_basespeed = 1.0;
function requestSlower()
{
	if (g_pause)
		g_pause = false;
	else
		g_speed *= 0.5; 
}
function requestFaster()
{
	if (g_pause)
		g_pause = false;
	else
		g_speed *= 2; 
}
function requestTimeRewind()
{
	if (g_pause)
		g_pause = false;
	if (g_speed > 0)
		g_speed = -g_basespeed;
}
function requestTimeForward()
{
	if (g_pause)
		g_pause = false;
	if (g_speed < 0)
		g_speed = g_basespeed;
}


let buttonPause = document.getElementById("buttonPause");
function requestPause()
{
	g_pause = !g_pause;
	buttonPause.disable = !g_pause;
}

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
	const controlSpace = 80;
	theCanvas.height = Math.min(window.innerHeight - controlSpace, window.innerWidth - controlSpace);
	if (theCanvas.height < 200)
		theCanvas.height = 200;
	theCanvas.width = window.innerWidth;

	const displayHeight = theCanvas.height;
	const displayCenterX = theCanvas.width / 2;
	const displayCenterY = displayHeight / 2;

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



	window.setTimeout(work, 1.0/30.0);
}

work();

