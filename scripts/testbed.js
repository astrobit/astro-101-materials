

let theCanvas = document.getElementById("theCanvas");
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let theContext = theCanvas.getContext("2d");

const images_list = [
"acisf00114N006_cntr_img2.fits",
"acisf00194N005_cntr_img2.fits",
"acisf00198N005_cntr_img2.fits",
"acisf00207N004_cntr_img2.fits",
"acisf00208N003_cntr_img2.fits",
"acisf00209N003_cntr_img2.fits",
"acisf00210N002_cntr_img2.fits",
"acisf00211N003_cntr_img2.fits",
"acisf00212N003_cntr_img2.fits",
"acisf00213N003_cntr_img2.fits",
"acisf00214N003_cntr_img2.fits",
"acisf00215N004_cntr_img2.fits",
"acisf00216N004_cntr_img2.fits",
"acisf00217N002_cntr_img2.fits",
"acisf00218N002_cntr_img2.fits",
"acisf00219N004_cntr_img2.fits",
"acisf00220N004_cntr_img2.fits",
"acisf00221N003_cntr_img2.fits",
"acisf00222N003_cntr_img2.fits",
"acisf00223N005_cntr_img2.fits",
"acisf00224N005_cntr_img2.fits",
"acisf00225N005_cntr_img2.fits",
"acisf00226N005_cntr_img2.fits",
"acisf00227N006_cntr_img2.fits",
"acisf00228N005_cntr_img2.fits",
"acisf00229N005_cntr_img2.fits",
"acisf00230N005_cntr_img2.fits",
"acisf00231N005_cntr_img2.fits",
"acisf00232N005_cntr_img2.fits",
"acisf00233N005_cntr_img2.fits",
"acisf00234N005_cntr_img2.fits",
"acisf00235N005_cntr_img2.fits",
"acisf00236N005_cntr_img2.fits",
"acisf00237N005_cntr_img2.fits",
"acisf01435N004_cntr_img2.fits",
"acisf01436N004_cntr_img2.fits",
"acisf01437N004_cntr_img2.fits",
"acisf01438N004_cntr_img2.fits",
"acisf01439N004_cntr_img2.fits",
"acisf01440N004_cntr_img2.fits",
"acisf01444N004_cntr_img2.fits",
"acisf01445N004_cntr_img2.fits",
"acisf01446N004_cntr_img2.fits",
"acisf01447N004_cntr_img2.fits",
"acisf01512N003_cntr_img2.fits",
"acisf01545N004_cntr_img2.fits",
"acisf01546N004_cntr_img2.fits",
"acisf01547N004_cntr_img2.fits",
"acisf01548N004_cntr_img2.fits",
"acisf01952N004_cntr_img2.fits",
"acisf02869N004_cntr_img2.fits",
"acisf02870N004_cntr_img2.fits",
"acisf02876N004_cntr_img2.fits",
"acisf02877N004_cntr_img2.fits",
"acisf03696N004_cntr_img2.fits",
"acisf03697N004_cntr_img2.fits",
"acisf03703N004_cntr_img2.fits",
"acisf03704N004_cntr_img2.fits",
"acisf05155N004_cntr_img2.fits",
"acisf05156N004_cntr_img2.fits",
"acisf05162N004_cntr_img2.fits",
"acisf05163N004_cntr_img2.fits",
"acisf06067N004_cntr_img2.fits",
"acisf06068N004_cntr_img2.fits",
"acisf06081N004_cntr_img2.fits",
"acisf06082N004_cntr_img2.fits",
"acisf06690N003_cntr_img2.fits",
"acisf06737N003_cntr_img2.fits",
"acisf06738N003_cntr_img2.fits",
"acisf06744N003_cntr_img2.fits",
"acisf06745N003_cntr_img2.fits",
"acisf08368N004_cntr_img2.fits",
"acisf08369N004_cntr_img2.fits",
"acisf09698N003_cntr_img2.fits",
"acisf09699N003_cntr_img2.fits",
"acisf10642N003_cntr_img2.fits",
"acisf10643N003_cntr_img2.fits",
"acisf13783N002_cntr_img2.fits",
"acisf16946N002_cntr_img2.fits",
"acisf17639N002_cntr_img2.fits",
"acisf22426N002_cntr_img2.fits",
"acisf23248N002_cntr_img2.fits",
"acisf23257N002_cntr_img2.fits",
"acisf23258N002_cntr_img2.fits",
"acisf23259N002_cntr_img2.fits",
"acisf23260N002_cntr_img2.fits",
"acisf23261N002_cntr_img2.fits",
"acisf23262N002_cntr_img2.fits",
"acisf23263N002_cntr_img2.fits",
"acisf23264N002_cntr_img2.fits",
"acisf23265N002_cntr_img2.fits",
"acisf25027N001_cntr_img2.fits",
"acisf25624N001_cntr_img2.fits",
"acisf25625N001_cntr_img2.fits",
"acisf25626N001_cntr_img2.fits",
"acisf25627N001_cntr_img2.fits",
"acisf25628N001_cntr_img2.fits",
"acisf25629N001_cntr_img2.fits",
"acisf25630N001_cntr_img2.fits",
"acisf25631N001_cntr_img2.fits",
"acisf25632N001_cntr_img2.fits",
"acisf25633N002_cntr_img2.fits",
"acisf25636N001_cntr_img2.fits",
"acisf25637N001_cntr_img2.fits",
"acisf25638N001_cntr_img2.fits",
"acisf25639N001_cntr_img2.fits",
"acisf25640N001_cntr_img2.fits",
"acisf25641N001_cntr_img2.fits",
"acisf25642N001_cntr_img2.fits",
"acisf25643N001_cntr_img2.fits",
"acisf25644N001_cntr_img2.fits",
"acisf25645N001_cntr_img2.fits",
"acisf25646N001_cntr_img2.fits",
"acisf25647N001_cntr_img2.fits",
"acisf25648N001_cntr_img2.fits",
"acisf25649N001_cntr_img2.fits",
"acisf25650N001_cntr_img2.fits",
"acisf25651N001_cntr_img2.fits",
"acisf25652N001_cntr_img2.fits",
"acisf25653N001_cntr_img2.fits",
"acisf25654N001_cntr_img2.fits",
"acisf25655N001_cntr_img2.fits",
"acisf26248N001_cntr_img2.fits",
"acisf27274N001_cntr_img2.fits",
"acisf27275N001_cntr_img2.fits",
"acisf27276N001_cntr_img2.fits",
"acisf27277N001_cntr_img2.fits",
"acisf27278N001_cntr_img2.fits",
"acisf27279N001_cntr_img2.fits",
"acisf27280N001_cntr_img2.fits",
"acisf27281N001_cntr_img2.fits",
"acisf27282N001_cntr_img2.fits",
"acisf27283N001_cntr_img2.fits",
"acisf27284N001_cntr_img2.fits",
"acisf27285N001_cntr_img2.fits",
"acisf27286N001_cntr_img2.fits",
"acisf27287N001_cntr_img2.fits",
"acisf27288N001_cntr_img2.fits",
"acisf27289N001_cntr_img2.fits",
"acisf27290N001_cntr_img2.fits",
"acisf27291N001_cntr_img2.fits",
"acisf27292N001_cntr_img2.fits",
"acisf27293N001_cntr_img2.fits",
"acisf27294N001_cntr_img2.fits",
"acisf27295N001_cntr_img2.fits",
"acisf27296N001_cntr_img2.fits",
"acisf27297N001_cntr_img2.fits",
"acisf27298N001_cntr_img2.fits",
"acisf27299N001_cntr_img2.fits",
"acisf27300N001_cntr_img2.fits",
"acisf27301N001_cntr_img2.fits",
"acisf27302N001_cntr_img2.fits",
"acisf27303N001_cntr_img2.fits",
"acisf27304N001_cntr_img2.fits",
"acisf27305N001_cntr_img2.fits",
"acisf27306N001_cntr_img2.fits",
"acisf27307N001_cntr_img2.fits",
"acisf27308N001_cntr_img2.fits",
"acisf27309N001_cntr_img2.fits",
"acisf27310N001_cntr_img2.fits",
"acisf27311N001_cntr_img2.fits",
"acisf27312N001_cntr_img2.fits",
"acisf27313N001_cntr_img2.fits",
"acisf27314N001_cntr_img2.fits",
"acisf27315N001_cntr_img2.fits",
"acisf27316N001_cntr_img2.fits",
"acisf27317N001_cntr_img2.fits",
"acisf27318N001_cntr_img2.fits",
"acisf27319N001_cntr_img2.fits",
"acisf27320N001_cntr_img2.fits",
"acisf27321N001_cntr_img2.fits",
"acisf27337N001_cntr_img2.fits",
"acisf27338N001_cntr_img2.fits",
"acisf27339N001_cntr_img2.fits",
"chandra_114.fits",
"hrcf00171N003_cntr_img2.fits",
"hrcf00172N004_cntr_img2.fits",
"hrcf00173N004_cntr_img2.fits",
"hrcf00174N004_cntr_img2.fits",
"hrcf01038N005_cntr_img2.fits",
"hrcf01408N006_cntr_img2.fits",
"hrcf01409N004_cntr_img2.fits",
"hrcf01467N005_cntr_img2.fits",
"hrcf01505N005_cntr_img2.fits",
"hrcf01549N007_cntr_img2.fits",
"hrcf01550N006_cntr_img2.fits",
"hrcf01857N007_cntr_img2.fits",
"hrcf02871N006_cntr_img2.fits",
"hrcf02878N006_cntr_img2.fits",
"hrcf03698N006_cntr_img2.fits",
"hrcf03705N006_cntr_img2.fits",
"hrcf05157N007_cntr_img2.fits",
"hrcf05164N006_cntr_img2.fits",
"hrcf06069N006_cntr_img2.fits",
"hrcf06083N006_cntr_img2.fits",
"hrcf06739N006_cntr_img2.fits",
"hrcf06746N006_cntr_img2.fits",
"hrcf08370N007_cntr_img2.fits",
"hrcf09700N005_cntr_img2.fits",
"hrcf10228N005_cntr_img2.fits",
"hrcf10229N005_cntr_img2.fits",
"hrcf10698N005_cntr_img2.fits",
"hrcf10892N005_cntr_img2.fits",
"hrcf11955N004_cntr_img2.fits",
]


let g_testFits = null;//requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");
let g_fitsImage = null;


let g_scaling = "sqrt";
let g_invert = true;
let g_color = "general";
function OnSelectScaling()
{
	let elem = document.getElementById("scaling");
	
	g_scaling = elem.value;
	updateImage();
}
function OnSelectInvert()
{
	let elem = document.getElementById("invert");
	
	g_invert = elem.checked;
	updateImage();
}
function OnSelectColorizing()
{
	let elem = document.getElementById("coloizing");
	
	g_color = elem.value;
	updateImage();
}

function setOutputText(id,value)
{
	let elem = document.getElementById(id);
	if (elem !== null)
		elem.value = value;
}

let g_controlMode = "free";
function setMode(mode)
{
	let elem = document.getElementById(g_controlMode);
	elem.style = "";
	
	g_controlMode = mode;
	elem = document.getElementById(g_controlMode);
	elem.style = "background-color:#007f00;color:white;";
}

let g_point = {reference: {x:null, y:null}, radius:{x:null, y:null}, measure: {x:null, y:null}};

let g_mouseDown = false;
function clearMeasures()
{
	g_point["reference"] = {x:null, y:null};
	g_point["radius"] = {x:null, y:null};
	g_point["measure"] = {x:null, y:null};
}
function updateMeasure(extRequestDraw)
{
	let drawRequest = extRequestDraw;
	const radecRef = (g_point["reference"].x !== null && g_point["reference"].y !== null) ? g_testFits.radec(g_point["reference"].x,g_testFits.height - g_point["reference"].y) : null;
	const radecRadius = (g_point["radius"].x !== null && g_point["radius"].y !== null) ? g_testFits.radec(g_point["radius"].x,g_testFits.height - g_point["radius"].y) : null;
	const radecMeasure = (g_point["measure"].x !== null && g_point["measure"].y !== null) ? g_testFits.radec(g_point["measure"].x,g_testFits.height - g_point["measure"].y) : null;

	const cosRAref = (radecRef !== null) ? Math.cos(radecRef.raRadians) : null;
	const sinRAref = (radecRef !== null) ? Math.sin(radecRef.raRadians) : null;
	const cosDecref = (radecRef !== null) ?  Math.cos(radecRef.decRadians) : null;
	const sinDecref = (radecRef !== null) ?  Math.sin(radecRef.decRadians) : null;


	if (radecRef !== null && radecRadius !== null)
	{
		const cosRArad = Math.cos(radecRadius.raRadians);
		const sinRArad = Math.sin(radecRadius.raRadians);
		const cosDecrad = Math.cos(radecRadius.decRadians);
		const sinDecrad = Math.sin(radecRadius.decRadians);
		
		let cosAng = cosRArad * cosDecrad * cosRAref * cosDecref + sinRArad * cosDecrad * sinRAref * cosDecref + sinDecrad * sinDecref;
		let ang = degrees(Math.acos(cosAng));
		let angUnit = "°";
		if (ang < 1.0)
		{
			ang *= 60.0;
			angUnit = "'";
			if (ang < 1.0)
			{
				ang *= 60.0;
				angUnit = "\"";
				if (ang < 1.0)
				{
					ang *= 1000.0;
					angUnit = "mas";
				}
			}
		}
		setOutputText("radius",ang.toFixed(2) + angUnit);
		drawRequest = true;
	}
	if (radecRef !== null && radecRadius !== null)
	{
		const cosRAmeas = Math.cos(radecMeasure.raRadians);
		const sinRAmeas = Math.sin(radecMeasure.raRadians);
		const cosDecmeas = Math.cos(radecMeasure.decRadians);
		const sinDecmeas = Math.sin(radecMeasure.decRadians);
		
		let cosAng = cosRAmeas * cosDecmeas * cosRAref * cosDecref + sinRAmeas * cosDecmeas * sinRAref * cosDecref + sinDecmeas * sinDecref;
		let ang = degrees(Math.acos(cosAng));
		let angUnit = "°";
		if (ang < 1.0)
		{
			ang *= 60.0;
			angUnit = "'";
			if (ang < 1.0)
			{
				ang *= 60.0;
				angUnit = "\"";
				if (ang < 1.0)
				{
					ang *= 1000.0;
					angUnit = "mas";
				}
			}
		}
		setOutputText("measure",ang.toFixed(2) + angUnit);
		drawRequest = true;
	}
	if (drawRequest)
		draw();
}
theCanvas.onmousemove = function(event)
{
	if (event.offsetX >= 0 && event.offsetX <= theCanvas.width &&
		event.offsetY >= 0 && event.offsetY <= theCanvas.height &&
		g_testFits.ready)
	{
		let requestDraw = false;
		if (g_mouseDown && g_controlMode != "free")
		{
			g_point[g_controlMode].x = event.offsetX;
			g_point[g_controlMode].y = event.offsetY;
			requestDraw = true;
		}
		const counts = g_testFits.counts(event.offsetX,g_testFits.height - event.offsetY);
		const radec = g_testFits.radec(event.offsetX,g_testFits.height - event.offsetY);
		
		const RAdispl = degreestoHMSDisplayable(radec.ra);
		const Decdispl = degreestoDMSDisplayable(radec.dec);

		setOutputText("ra",RAdispl.hr + "h " + RAdispl.min + "m " + RAdispl.sec + "s");
		setOutputText("dec",Decdispl.deg + "° " + Decdispl.min + "' " + Decdispl.sec + "\"");
		setOutputText("x",radec.x);
		setOutputText("y",radec.y);
		setOutputText("counts",counts);
		
		updateMeasure(requestDraw);
	}
}
theCanvas.onmousedown = function(event)
{
	if (event.offsetX >= 0 && event.offsetX <= theCanvas.width &&
		event.offsetY >= 0 && event.offsetY <= theCanvas.height &&
		g_testFits.ready)
	{
		g_mouseDown = true;
		if (g_controlMode != "free")
		{
			g_point[g_controlMode].x = event.offsetX;
			g_point[g_controlMode].y = event.offsetY;
		}
		updateMeasure();
	}
}
theCanvas.onmouseup = function(event)
{
	if (g_testFits.ready && g_mouseDown)
	{
		g_mouseDown = false;
		if (g_controlMode != "free")
		{
			g_point[g_controlMode].x = event.offsetX;
			g_point[g_controlMode].y = event.offsetY;
		}
		updateMeasure();
	}
}

function draw()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	if (g_testFits != null && g_testFits.ready && g_fitsImage != null)
	{
		theContext.putImageData(g_fitsImage, 0, 0);
		if (g_point["reference"].x !== null && g_point["reference"].y !== null &&
			g_point["measure"].x !== null && g_point["measure"].y !== null)
		{
			theContext.strokeStyle = "#FF00FF"
			theContext.beginPath();
			theContext.moveTo(g_point["reference"].x,g_point["reference"].y);
			theContext.lineTo(g_point["measure"].x,g_point["measure"].y);
			theContext.stroke();		
		}
		if (g_point["reference"].x !== null && g_point["reference"].y !== null)
		{
			theContext.strokeStyle = "#FF0000"
			theContext.beginPath();
			theContext.moveTo(g_point["reference"].x - 5,g_point["reference"].y);
			theContext.lineTo(g_point["reference"].x + 5,g_point["reference"].y);
			theContext.stroke();		
			theContext.beginPath();
			theContext.moveTo(g_point["reference"].x,g_point["reference"].y - 5);
			theContext.lineTo(g_point["reference"].x,g_point["reference"].y + 5);
			theContext.stroke();		
		}
		if (g_point["measure"].x !== null && g_point["measure"].y !== null)
		{
			theContext.strokeStyle = "#0000FF"
			theContext.beginPath();
			theContext.moveTo(g_point["measure"].x - 5,g_point["measure"].y);
			theContext.lineTo(g_point["measure"].x + 5,g_point["measure"].y);
			theContext.stroke();		
			theContext.beginPath();
			theContext.moveTo(g_point["measure"].x,g_point["measure"].y - 5);
			theContext.lineTo(g_point["measure"].x,g_point["measure"].y + 5);
			theContext.stroke();		
		}
		
		if (g_point["reference"].x !== null && g_point["reference"].y !== null &&
			g_point["radius"].x !== null && g_point["radius"].y !== null)
		{
			const dx = (g_point["reference"].x - g_point["radius"].x);
			const dy = (g_point["reference"].y - g_point["radius"].y);
			let r = Math.sqrt(dx * dx + dy * dy);
			theContext.strokeStyle = "#FF0000"
			theContext.beginPath();
			theContext.arc(g_point["reference"].x, g_point["reference"].y,r, 0, 2 * Math.PI);
			theContext.stroke();		
		}
	}
	else
	{
		theCanvas.height = 50;
		theCanvas.width = 100;
		theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
		theContext.fillStyle = "#FFFF00"
		theContext.font = "20px Arial";
		theContext.fillText("Standby...", 10, 40);	
	}
}

function updateImage()
{
	g_fitsImage= null;
	if (g_testFits != null && g_testFits.ready)
		g_fitsImage = g_testFits.createImage(theContext,g_scaling,g_invert,(g_color == "general") ? null : g_color);
	draw();
}
function waiter()
{
	if (g_testFits.ready)
	{
//		console.log("ready");
		theCanvas.height = g_testFits.height;
		theCanvas.width = g_testFits.width;
//		console.log("creating image");
		setOutputText("obs_date",("DATE-OBS" in g_testFits.head) ? g_testFits.head["DATE-OBS"].date.toDateString() : "");
		let mjd = ("MJD_OBS" in g_testFits.head) ? g_testFits.head.MJD_OBS.value : null;
		if (mjd == null && ("DATE-OBS" in g_testFits.head))
			mjd = (g_testFits.head["DATE-OBS"].date.getTime() / 86400000.0 + 40587.00000).toFixed(5);
		else
			mjd = "";
		setOutputText("obs_mjd",mjd);
		setOutputText("target",("OBJECT" in g_testFits.head) ? g_testFits.head.OBJECT.value : "---");
		setOutputText("observer",("OBSERVER" in g_testFits.head) ? g_testFits.head.OBSERVER.value : "---");
		setOutputText("telescope",("TELESCOP" in g_testFits.head) ? g_testFits.head.TELESCOP.value : "---");
		setOutputText("instrument",("INSTRUME" in g_testFits.head) ? g_testFits.head.INSTRUME.value : "---");
		setOutputText("exptime",("EXPTIME" in g_testFits.head) ? g_testFits.head.EXPTIME.value + " s" : "---");
		setOutputText("filter",("FILTER" in g_testFits.head) ? g_testFits.head.FILTER.value : "---");

		updateImage();
	}
	else
	{
		theCanvas.height = 50;
		theCanvas.width = 100;
		theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
		theContext.fillStyle = "#FFFF00"
		theContext.font = "20px Arial";
		theContext.fillText("Standby...", 10, 40);	
		window.setTimeout(waiter, 1000.0);
	}		
}

function onSelectImage()
{
	let elem = document.getElementById("image");
	g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/" + elem.value);
	waiter();
}

function populateImageSelect()
{
	let elem = document.getElementById("image");
	for (let i = 0; i < images_list.length; i++)
	{
		let option = document.createElement("option");
		option.value = images_list[i];
		option.text = images_list[i];
		elem.add(option)
	}
	onSelectImage();
}
populateImageSelect();

