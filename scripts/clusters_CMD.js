let g_starsCluster = null;
let g_selectedCluster = null;
let	g_clusters = newClusters("OpC");
let g_clusterSelectList = new Object(); // this object stores names of clusters because the option text erases extra spaces in the id


let theCanvas = document.getElementById("theCanvas");
theCanvas.onselectstart = function () { return false; } // prevent selection of text below the canvas when you click on it

let theContext = theCanvas.getContext("2d");
theContext.willReadFrequently = true;

//const minimumControlsHeightTop = 190;
const recttop = document.getElementById("selectCluster").getBoundingClientRect();
//const rectbot = document.getElementById("recenter").getBoundingClientRect();

theCanvas.height = Math.max(window.innerHeight - 60 - recttop.bottom,400);
theCanvas.width = window.innerWidth - 40;

const viewingSize = Math.min(theCanvas.height,theCanvas.width) - 50;
const viewX = (theCanvas.width - viewingSize) * 0.5;
const viewY = (theCanvas.height - viewingSize) * 0.5;

function readify_name(name)
{
	let ret = name;
	if (name.startsWith("Cl"))
	{
		ret = name.substr(2).trim();
	}
	else if (name.startsWith("NAME"))
	{
		ret = name.substr(4).trim();
	}
	else if (name.startsWith("HIDDEN NAME")) {
		ret = name.substr(11).trim();
	}
	return ret;
}

function waitForClustersReady()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		// clear existing options
		let cluster_list = new Array();
		
		let i;
		for (i = 0; i < g_clusters._ids.length; i++)
		{
			const cluster = g_clusters.at(g_clusters._ids[i].idx);
			if (cluster.cluster.stars > 0)//&& cluster.cluster.cluster_size < (5.0 / 60.0)) // 5'
			{
				cluster_list.push({ idx: g_clusters._ids[i].idx, id: readify_name(g_clusters._ids[i].id) });
			}
		}
		cluster_list.sort(function (a, b) { return a.id.localeCompare(b.id) });
		for (i = 0; i < cluster_list.length; i++)
		{
			let option = document.createElement("option");
			option.text = cluster_list[i].id;
			g_clusterSelectList[option.text] = cluster_list[i].idx;
			select.add(option)
		}
		OnSelectCluster();
		draw();
	}
	else
		window.setTimeout(waitForClustersReady, 100.0);
}
waitForClustersReady();

function waitForStarsReady()
{
	if (g_starsCluster !== null && g_starsCluster.ready)
		draw();
	else
		window.setTimeout(waitForStarsReady, 100.0);
}

function OnSelectCluster()
{
	if (g_clusters !== null && g_clusters.ready)
	{
		let select = document.getElementById("selectCluster");
		let cluster = g_clusters.at(g_clusterSelectList[select.value]);
		g_selectedCluster = cluster;
		if (cluster !== null)
		{
			g_starsCluster = newStarSet(cluster.star_set);
		}
		else
			g_starsCluster = null;
	}
	draw();
	window.setTimeout(waitForStarsReady, 100.0);
	draw();
}

let g_MouseX = null;
let g_MouseY = null;
function OnMouseOver(event)
{
	g_MouseX = event.offsetX;
	g_MouseY = event.offsetY;
	draw();
}

function draw()
{

	// clear the canvas
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	theContext.fillStyle = "#000000";
	theContext.fillRect(0,0,theCanvas.width,theCanvas.height);

	if (g_starsCluster !== null && g_starsCluster.ready)
	{
		if (g_selectedCluster !== null)
		{
			const len = g_starsCluster.length;
			let max_x = -1000000;
			let min_x = 1000000;
			let max_y = 0;
			let min_y = 1000;
			let _measurements = new GraphDataSet("data","xaxis", "yaxis", null,1,3,"#7f7f7f",true);
			const twoPi = Math.PI * 2.0;
			let i;
			for (i = 0; i < len; i++)
			{
				const star = g_starsCluster.at(i);
				let x = star.fluxes["B"] - star.fluxes["V"];
				let y = star.fluxes["V"];
				if (g_selectedCluster.cluster.plx.count > 0)
				{
					if (star.dm !== null)
						y -= star.dm;
					else
						y += 5.0 * Math.log10(g_selectedCluster.cluster.plx.average) - 10.0; // plx_value in mas
				}
				
				if (ValidateValue(x) && ValidateValue(y))
				{
					const data = new GraphDatum(x,y);
					_measurements.add(data);
					if (data.x < min_x)
						min_x = data.x;
					if (data.x > max_x)
						max_x = data.x;
					if (data.y < min_y)
						min_y = data.y;
					if (data.y > max_y)
						max_y = data.y;
				}			
			}
			const _min_x = Math.floor(min_x * 10.0) / 10.0;
			const _max_x = Math.ceil(max_x * 10.0) / 10.0;
			const _min_y = Math.floor(min_y * 10.0) / 10.0;
			const _max_y = Math.ceil(max_y * 10.0) / 10.0;
		

			let _axisHorizontal = new GraphAxis("xaxis","B - V",_min_x,_max_x);
			let _axisVertical = new GraphAxis("yaxis",(g_selectedCluster.cluster.plx.count > 0) ? "MV" : "V",_min_y,_max_y);
			_axisVertical.invert = true;
			let _graph = new Graph("CMD",viewingSize,viewingSize,"#ffffff");
			
			
			_graph.addHorizontalAxis(_axisHorizontal);
			_graph.addVerticalAxis(_axisVertical);
			_graph.addDataSet(_measurements);

			const mouseX = _graph.getXvalue(theContext,_axisHorizontal,g_MouseX - viewX);
			const mouseY = _graph.getYvalue(theContext,_axisVertical,g_MouseY - viewY);
			_graph.addIntercept(new GraphIntercept("mousex","xaxis",null,mouseX,mouseX.toFixed(2),"#FF0000"));
			_graph.addIntercept(new GraphIntercept("mousey",null, "yaxis",mouseY,mouseY.toFixed(2),"#FF0000"));
			_graph.draw(theContext,viewX,viewY);
			
		}
	}
	else
	{
		if (g_clusters.ready)
		{
			theContext.save();
			theContext.textAlign = "center";
			theContext.fillStyle = "#FFFFFF";
			theContext.font = "20px Arial";
			theContext.fillText("Standby .. Retrieving Star Data",theCanvas.width * 0.5,theCanvas.height * 0.5);
			theContext.restore();
		}
		else
		{
			theContext.save();
			theContext.textAlign = "center";
			theContext.fillStyle = "#FFFFFF";
			theContext.font = "20px Arial";
			theContext.fillText("Standby .. Retrieving Cluster List",theCanvas.width * 0.5,theCanvas.height * 0.5);
			theContext.restore();
		}
	}

	commonUIdraw(theContext);
}

draw();

