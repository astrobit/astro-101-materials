
let clusters = null;

let g_i = 0;

let cluster_supplemental = {data: new Array()};

//let cluster_stars = null;
//let background_stars = null;


//function waitForStarsReady()
//{
//	if (!cluster_stars.ready || background_stars == null)
//	{
//		window.setTimeout(waitForStarsReady, 333.0);
//	}
//	else
//	{
//		g_i++;
//		getNextCluster();
//	}
//}

function getNextCluster()
{
	if (g_i < clusters.length)
	{
		let cluster = clusters.at(g_i);
		let clusteravgs = cluster.cluster;
		while (clusteravgs.stars == 0 && g_i < clusters.length)
		{
			g_i++;
			cluster = clusters.at(g_i);
			clusteravgs = cluster.cluster;
		}
		if (g_i < clusters.length)
		{
			const query = "SELECT * FROM basic JOIN allfluxes ON basic.oid = allfluxes.oidref WHERE CONTAINS(POINT('ICRS', basic.ra, basic.dec), BOX('ICRS', " + clusteravgs.ra.average + ", " + clusteravgs.dec.average + ", 2.0, 2.0)) = 1 AND ra IS NOT NULL AND dec IS NOT NULL AND otype = '*..'"
			const filename = "stars_" + cluster.star_set + ".json";
	//		const dec_north = clusteravgs.dec.average > 89 ? 90.0 : clusteravgs.dec.average + 1.0;
	//		const dec_south = clusteravgs.dec.average < -89 ? -90.0 : clusteravgs.dec.average - 1.0;
	//		
	//		if (clusteravgs.ra.average < 1)
	//		{
	//			const ra_east = clusteravgs.ra.average + 1.0;
	//			const ra_west = 360.0 - clusteravgs.ra.average;
	//			query += "(basic.ra >= " + ra_west + " OR basic.ra <= " + ra_east + ") AND basic.dec >= " + dec_south + " AND basic.dec <= " + dec_north;
	//		}
	//		else if (clusteravgs.ra.average >= 359.0)
	//		{
	//			const ra_east = 360.0 - clusteravgs.ra.average;
	//			const ra_west = clusteravgs.ra.average - 1.0;
	//			query += "(basic.ra >= " + ra_west + " OR basic.ra <= " + ra_east + ") AND basic.dec >= " + dec_south + " AND basic.dec <= " + dec_north;
	//		}
	//		else
	//		{
	//			const ra_east = clusteravgs.ra.average + 1.0;
	//			const ra_west = clusteravgs.ra.average - 1.0;
	//			query += "basic.ra >= " + ra_west + " AND basic.ra <= " + ra_east + " AND basic.dec >= " + dec_south + " AND basic.dec <= " + dec_north;
	//		}
	//		
			
			//}
//			background_stars = null;
			simbadQuery(query).then(function(result){
//					background_stars = JSON.parse(result);
					download(result,filename,"json");
					g_i++;
					getNextCluster();
				},
				function(error){
					console.log("Error " + error);
					}
				);
//			cluster_stars = newStarSet(cluster.star_set);
//			waitForStarsReady();
		}
	}
//	else
//	{
//		let json_string = JSON.stringify(cluster_supplemental);
//		download(json_string,"clusters_OpC_supplemental.json","json");
//		console.log("done");
//	}
}

function waitForClustersReady()
{
	if (!clusters.ready)
	{
		window.setTimeout(waitForClustersReady, 333.0);
	}
	else
	{
		g_i = 0;
		getNextCluster();
	}
}

function submit()
{
	clusters = newClusters("OpC");
	waitForClustersReady();
	
}


	

