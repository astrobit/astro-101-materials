

let theCanvas = document.getElementById("theCanvas");
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let theContext = theCanvas.getContext("2d");

const images_list = [
'acisf00114N006_cntr_img2.fits',
'acisf00769N006_cntr_img2.fits',
'acisf00770N006_cntr_img2.fits',
'acisf00771N006_cntr_img2.fits',
'acisf00772N006_cntr_img2.fits',
'acisf00773N006_cntr_img2.fits',
'acisf01951N005_cntr_img2.fits',
'acisf01952N004_cntr_img2.fits',
'acisf01994N005_cntr_img2.fits',
'acisf01995N005_cntr_img2.fits',
'acisf01996N005_cntr_img2.fits',
'acisf01997N005_cntr_img2.fits',
'acisf01998N005_cntr_img2.fits',
'acisf01999N005_cntr_img2.fits',
'acisf02000N005_cntr_img2.fits',
'acisf02001N005_cntr_img2.fits',
'acisf02795N004_cntr_img2.fits',
'acisf02796N006_cntr_img2.fits',
'acisf02798N004_cntr_img2.fits',
'acisf03849N004_cntr_img2.fits',
'acisf04607N004_cntr_img2.fits',
'acisf04634N004_cntr_img2.fits',
'acisf04635N004_cntr_img2.fits',
'acisf04636N004_cntr_img2.fits',
'acisf04637N005_cntr_img2.fits',
'acisf04638N004_cntr_img2.fits',
'acisf04639N004_cntr_img2.fits',
'acisf05196N004_cntr_img2.fits',
'acisf05319N004_cntr_img2.fits',
'acisf05320N004_cntr_img2.fits',
'acisf07604N003_cntr_img2.fits',
'acisf07605N004_cntr_img2.fits',
'acisf07606N004_cntr_img2.fits',
'acisf07607N004_cntr_img2.fits',
'acisf07608N003_cntr_img2.fits',
'acisf07609N003_cntr_img2.fits',
'acisf07610N005_cntr_img2.fits',
'acisf07617N004_cntr_img2.fits',
'acisf07618N003_cntr_img2.fits',
'acisf07626N004_cntr_img2.fits',
'acisf07627N003_cntr_img2.fits',
'acisf07628N003_cntr_img2.fits',
'acisf07629N003_cntr_img2.fits',
'acisf07630N003_cntr_img2.fits',
'acisf07635N004_cntr_img2.fits',
'acisf07636N004_cntr_img2.fits',
'acisf07637N003_cntr_img2.fits',
'acisf07638N003_cntr_img2.fits',
'acisf07639N004_cntr_img2.fits',
'acisf07640N005_cntr_img2.fits',
'acisf07641N003_cntr_img2.fits',
'acisf07642N003_cntr_img2.fits',
'acisf07643N005_cntr_img2.fits',
'acisf07645N003_cntr_img2.fits',
'acisf07646N003_cntr_img2.fits',
'acisf07683N003_cntr_img2.fits',
'acisf08457N003_cntr_img2.fits',
'acisf08473N003_cntr_img2.fits',
'acisf08518N004_cntr_img2.fits',
'acisf08551N004_cntr_img2.fits',
'acisf08554N004_cntr_img2.fits',
'acisf09077N003_cntr_img2.fits',
'acisf09078N003_cntr_img2.fits',
'acisf09079N004_cntr_img2.fits',
'acisf09080N003_cntr_img2.fits',
'acisf09081N003_cntr_img2.fits',
'acisf09082N004_cntr_img2.fits',
'acisf09083N004_cntr_img2.fits',
'acisf09084N003_cntr_img2.fits',
'acisf09086N003_cntr_img2.fits',
'acisf09087N003_cntr_img2.fits',
'acisf09088N003_cntr_img2.fits',
'acisf09093N003_cntr_img2.fits',
'acisf09094N003_cntr_img2.fits',
'acisf09095N003_cntr_img2.fits',
'acisf09096N003_cntr_img2.fits',
'acisf09097N003_cntr_img2.fits',
'acisf09098N003_cntr_img2.fits',
'acisf09099N003_cntr_img2.fits',
'acisf09100N003_cntr_img2.fits',
'acisf09103N003_cntr_img2.fits',
'acisf09104N003_cntr_img2.fits',
'acisf09105N003_cntr_img2.fits',
'acisf09107N003_cntr_img2.fits',
'acisf09108N003_cntr_img2.fits',
'acisf09109N003_cntr_img2.fits',
'acisf09111N003_cntr_img2.fits',
'acisf09112N003_cntr_img2.fits',
'acisf09113N003_cntr_img2.fits',
'acisf09116N003_cntr_img2.fits',
'acisf09117N003_cntr_img2.fits',
'acisf09754N004_cntr_img2.fits',
'acisf09773N003_cntr_img2.fits',
'acisf09801N003_cntr_img2.fits',
'acisf09802N003_cntr_img2.fits',
'acisf09803N003_cntr_img2.fits',
'acisf09810N003_cntr_img2.fits',
'acisf09811N003_cntr_img2.fits',
'acisf09812N003_cntr_img2.fits',
'acisf09813N003_cntr_img2.fits',
'acisf09886N003_cntr_img2.fits',
'acisf09887N003_cntr_img2.fits',
'acisf10935N003_cntr_img2.fits',
'acisf10936N003_cntr_img2.fits',
'acisf12020N003_cntr_img2.fits',
'acisf13139N003_cntr_img2.fits',
'acisf13146N003_cntr_img2.fits',
'acisf13147N003_cntr_img2.fits',
'acisf13150N003_cntr_img2.fits',
'acisf13151N003_cntr_img2.fits',
'acisf13152N003_cntr_img2.fits',
'acisf13153N003_cntr_img2.fits',
'acisf13154N003_cntr_img2.fits',
'acisf13177N003_cntr_img2.fits',
'acisf13204N003_cntr_img2.fits',
'acisf13205N003_cntr_img2.fits',
'acisf13206N003_cntr_img2.fits',
'acisf13207N003_cntr_img2.fits',
'acisf13208N003_cntr_img2.fits',
'acisf13209N003_cntr_img2.fits',
'acisf13210N003_cntr_img2.fits',
'acisf13750N003_cntr_img2.fits',
'acisf13751N002_cntr_img2.fits',
'acisf13752N002_cntr_img2.fits',
'acisf13754N002_cntr_img2.fits',
'acisf13755N002_cntr_img2.fits',
'acisf13756N002_cntr_img2.fits',
'acisf13757N003_cntr_img2.fits',
'acisf14229N002_cntr_img2.fits',
'acisf14416N002_cntr_img2.fits',
'acisf14458N003_cntr_img2.fits',
'acisf14480N003_cntr_img2.fits',
'acisf14481N003_cntr_img2.fits',
'acisf14482N002_cntr_img2.fits',
'acisf14678N003_cntr_img2.fits',
'acisf14679N003_cntr_img2.fits',
'acisf14680N003_cntr_img2.fits',
'acisf14681N003_cntr_img2.fits',
'acisf14682N003_cntr_img2.fits',
'acisf14685N003_cntr_img2.fits',
'acisf16245N003_cntr_img2.fits',
'acisf16257N003_cntr_img2.fits',
'acisf16258N002_cntr_img2.fits',
'acisf16259N002_cntr_img2.fits',
'acisf16357N003_cntr_img2.fits',
'acisf16358N003_cntr_img2.fits',
'acisf16359N002_cntr_img2.fits',
'acisf16360N002_cntr_img2.fits',
'acisf16361N002_cntr_img2.fits',
'acisf16362N002_cntr_img2.fits',
'acisf16363N002_cntr_img2.fits',
'acisf16364N002_cntr_img2.fits',
'acisf16365N002_cntr_img2.fits',
'acisf18344N002_cntr_img2.fits',
'acisf19604N002_cntr_img2.fits',
'acisf19605N002_cntr_img2.fits',
'acisf19606N002_cntr_img2.fits',
'acisf19903N002_cntr_img2.fits',
'acisf23539N001_cntr_img2.fits'
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
let g_radius = null;
let g_mouseDown = false;
function clearMeasures()
{
	g_point["reference"] = {x:null, y:null};
	g_point["radius"] = {x:null, y:null};
	g_point["measure"] = {x:null, y:null};
	g_radius = null;
	
	draw();
}
function updateMeasure(extRequestDraw)
{
	let drawRequest = extRequestDraw;
	const radecRef = (g_point["reference"].x !== null && g_point["reference"].y !== null) ? g_testFits.radec(g_point["reference"].x,g_testFits.height - g_point["reference"].y) : null;
	if (g_point["reference"].x !== null && g_point["reference"].y !== null &&
		g_point["radius"].x !== null && g_point["radius"].y !== null)
	{
		const dx = g_point["reference"].x - g_point["radius"].x;
		const dy = g_point["reference"].y - g_point["radius"].y;
		g_radius = Math.sqrt(dx * dx + dy * dy);
	} // only update the radius if in radius mode
	
	const radecRadius = (g_point["reference"].x !== null && g_point["reference"].y !== null && g_radius !== null) ? g_testFits.radec(g_point["reference"].x,g_testFits.height - g_point["reference"].y - g_radius) : null;
	const radecMeasure = (g_point["measure"].x !== null && g_point["measure"].y !== null) ? g_testFits.radec(g_point["measure"].x,g_testFits.height - g_point["measure"].y) : null;

	const cosRAref = (radecRef !== null) ? Math.cos(radecRef.raRadians) : null;
	const sinRAref = (radecRef !== null) ? Math.sin(radecRef.raRadians) : null;
	const cosDecref = (radecRef !== null) ?  Math.cos(radecRef.decRadians) : null;
	const sinDecref = (radecRef !== null) ?  Math.sin(radecRef.decRadians) : null;

	if (radecRadius !== null)
	{
		const RAdispl = degreestoHMSDisplayable(radecRef.ra);
		const Decdispl = degreestoDMSDisplayable(radecRef.dec);

		setOutputText("refra",RAdispl.hr + "h " + RAdispl.min + "m " + RAdispl.sec + "s");
		setOutputText("refdec",Decdispl.deg + "° " + Decdispl.min + "' " + Decdispl.sec + "\"");
		
	}
	if (radecMeasure !== null)
	{
		const RAdispl = degreestoHMSDisplayable(radecMeasure.ra);
		const Decdispl = degreestoDMSDisplayable(radecMeasure.dec);

		setOutputText("measra",RAdispl.hr + "h " + RAdispl.min + "m " + RAdispl.sec + "s");
		setOutputText("measdec",Decdispl.deg + "° " + Decdispl.min + "' " + Decdispl.sec + "\"");
		
	}
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
		setOutputText("radiusDispl",ang.toFixed(2) + angUnit);
		drawRequest = true;
	}
	if (radecRef !== null && radecMeasure !== null)
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
		setOutputText("measureDispl",ang.toFixed(2) + angUnit);
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
			updateMeasure(true);
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
			updateMeasure(true);
		}
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
			updateMeasure(true);
			if (g_controlMode == "radius")
			{
				g_point["radius"].x = null;
				g_point["radius"].y = null;
			}
		}
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
			g_radius !== null)
		{
			theContext.strokeStyle = "#FF0000"
			theContext.beginPath();
			theContext.arc(g_point["reference"].x, g_point["reference"].y,g_radius, 0, 2 * Math.PI);
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

