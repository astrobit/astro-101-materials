
var canvasGlobal = document.getElementById("canvas");
var contestGlobal = canvasGlobal.getContext("2d");

function draw(){
// draw a black square for the map area box
	contestGlobal.fillStyle = "#000000";
	contestGlobal.fillRect(0,0,canvasGlobal.width,canvasGlobal.height);


	commonUIdraw(contestGlobal);
}
