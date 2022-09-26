
let clusters = null;

let g_i = 0;

let cluster_supplemental = {data: new Array()};

let cluster_stars = null;
function getNextCluster()
{
	if (g_i < clusters.length)
	{
		const cluster = clusters.at(g_i);
//		const query = "SELECT * FROM h_link JOIN basic ON basic.oid = h_link.child JOIN allfluxes ON h_link.child = allfluxes.oidref WHERE h_link.parent = " + object.oid;
		
		if (cluster_stars === null)
		{
			cluster_stars = newStarSet(cluster.star_set);	
			window.setTimeout(getNextCluster, 333.0);
		}
		else if (cluster_stars.failed)
		{
			g_i++;
			let supplemental = new Object();
			supplemental.main_id = cluster.main_id;
			supplemental.plx = new Averager()
			supplemental.pmra = new Averager()
			supplemental.pmdec = new Averager()
			supplemental.rvz_radvel = new Averager()
			supplemental.ra = {average: NaN, stdevp: NaN, stdevs: NaN, sterrp: NaN, sterrs: NaN, count: 0};
			supplemental.dec = {average: NaN, stdevp: NaN, stdevs: NaN, sterrp: NaN, sterrs: NaN, count: 0};
			supplemental.cluster_size = 0;
			supplemental.stars = 0;
				
			cluster_supplemental.data.push(supplemental);
			cluster_stars = null;

			getNextCluster();
		}
		else if (!cluster_stars.ready)
		{
			window.setTimeout(getNextCluster, 333.0);
		}
		else
		{
			let j;
			let avg_radec = new SphereAngularAverager();
			
			var avg_plx = new Averager();
			var avg_pm_ra = new Averager();
			var avg_pm_dec = new Averager();
			var avg_rad_vel = new Averager();
			
			for (j = 0; j < cluster_stars._data.length; j++)
			{
				const star = cluster_stars._data.at(j);
				avg_radec.add(star.ra,star.dec);
				avg_plx.add(star.plx_value);
				avg_pm_ra.add(star.pmra);
				avg_pm_dec.add(star.pmdec);
				avg_rad_vel.add(star.rvz_radvel);
			}
			avg_radec._calc_statistics();
			avg_plx._calc_statistics();
			avg_pm_ra._calc_statistics();
			avg_pm_dec._calc_statistics();
			avg_rad_vel._calc_statistics();
			
			
			let supplemental = new Object();
			supplemental.main_id = cluster.main_id;
			supplemental.plx = avg_plx
			supplemental.pmra = avg_pm_ra
			supplemental.pmdec = avg_pm_dec
			supplemental.rvz_radvel = avg_rad_vel
			supplemental.ra = avg_radec.theta;
			if (supplemental.ra.average < 0)
				supplemental.ra.average += 360.0;
			supplemental.dec = avg_radec.psi;

			const ra_rad = radians(avg_radec.theta.average);
			const dec_rad = radians(avg_radec.psi.average);
			const cos_dec = Math.cos(dec_rad);
			const cx = Math.cos(ra_rad) * cos_dec;
			const cy = Math.sin(ra_rad) * cos_dec;
			const cz = Math.sin(dec_rad);
					
			supplemental.cluster_size = 0;
			for (j = 0; j < cluster_stars._data.length; j++)
			{
				const star = cluster_stars._data.at(j);
				const sra_rad = radians(star.ra);
				const sdec_rad = radians(star.dec);
				const scos_dec = Math.cos(sdec_rad);
				
				const sx = Math.cos(sra_rad) * scos_dec;
				const sy = Math.sin(sra_rad) * scos_dec;
				const sz = Math.sin(sdec_rad);
				const adb = cx * sx + cy * sy + cz * sz;
				const angle = degrees(Math.abs(Math.acos(adb)));
				if (angle > supplemental.cluster_size)
					supplemental.cluster_size = angle;
			}
			
			supplemental.stars = cluster_stars._data.length;
			
			cluster_supplemental.data.push(supplemental);
			cluster_stars = null;
			//
			g_i++;
			getNextCluster();
		}
//		simbadQuery(query).then(function(result){
//				const jsoncluster = JSON.parse(result);
//				if (jsoncluster.data.length > 0)
//					download(result,filename,"json");
//				g_i++;
//				getNextCluster();
//			},
//			function(error){
//				console.log("Error " + error);
//				}
//			);
	}
	else
	{
		let json_string = JSON.stringify(cluster_supplemental);
		download(json_string,"clusters_OpC_supplemental.json","json");
//		console.log("done");
	}
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


	

