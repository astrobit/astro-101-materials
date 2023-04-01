

let theCanvas = document.getElementById("theCanvas");
theCanvas.height = window.innerHeight - 60;
theCanvas.width = window.innerWidth;

let theContext = theCanvas.getContext("2d");

let g_testFits = requestFITS("https://www.astronaos.com/astronomy/images/real_data/chandra_114.fits");
let g_ClickCenter = {x: null, y:null, r:null, down:false};
let g_fitsImage = null;

function setOutputText(id,value)
{
	let elem = document.getElementById(id);
	if (elem !== null)
		elem.value = value;
}


theCanvas.onmousemove = function(event)
{
	if (event.offsetX >= 0 && event.offsetX <= theCanvas.width &&
		event.offsetY >= 0 && event.offsetY <= theCanvas.height &&
		g_testFits.ready)
	{
		if (g_ClickCenter.down)
		{
			const dx = event.offsetX - g_ClickCenter.x;
			const dy = event.offsetY - g_ClickCenter.y;
			g_ClickCenter.r = Math.sqrt(dx * dx + dy * dy);
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
		if (g_ClickCenter.x !== null && g_ClickCenter.y !== null)
		{
			const radeccircCntr = g_testFits.radec(g_ClickCenter.x,g_testFits.height - g_ClickCenter.y);
			const radeccircX = g_testFits.radec(g_ClickCenter.x + g_ClickCenter.r,g_testFits.height - g_ClickCenter.y);
			const radeccircY = g_testFits.radec(g_ClickCenter.x,g_testFits.height - g_ClickCenter.y - g_ClickCenter.r);
			let ang = Math.abs(radeccircCntr.dec - radeccircY.dec);
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
			draw();
		}
	}
}
theCanvas.onmousedown = function(event)
{
	if (event.offsetX >= 0 && event.offsetX <= theCanvas.width &&
		event.offsetY >= 0 && event.offsetY <= theCanvas.height &&
		g_testFits.ready)
	{
		g_ClickCenter.x = event.offsetX;
		g_ClickCenter.y = event.offsetY;
		g_ClickCenter.r = 0
		g_ClickCenter.down = true;
		draw();
	}
}
theCanvas.onmouseup = function(event)
{
	if (g_testFits.ready && g_ClickCenter.down)
	{
		g_ClickCenter.down = false;
		draw();
	}
}

function draw()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.putImageData(g_fitsImage, 0, 0);
	
	if (g_ClickCenter.x !== null && g_ClickCenter.y !== null && g_ClickCenter.r > 0)
	{
		theContext.strokeStyle = "#FF0000"
		theContext.beginPath();
		theContext.arc(g_ClickCenter.x, g_ClickCenter.y, g_ClickCenter.r, 0, 2 * Math.PI);
		theContext.stroke();		
	}
}

function waiter()
{
	if (g_testFits.ready)
	{
		console.log("ready");
		theCanvas.height = g_testFits.height;
		theCanvas.width = g_testFits.width;
		console.log("creating image");
		g_fitsImage = g_testFits.createImage(theContext,"sqrt",true,null);
		setOutputText("obs_date",("DATE-OBS" in g_testFits.head) ? g_testFits.head["DATE-OBS"].date.toDateString() : "");
		let mjd = ("MJD-OBS" in g_testFits.head) ? g_testFits.head["MJD-OBS"].value : null;
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


		draw();
	}
	else
	{
		window.setTimeout(waiter, 1000.0);
	}		
}
waiter();
