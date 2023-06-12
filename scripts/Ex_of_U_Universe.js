
"use strict";

let __g_galaxyCount = 0;
const Galaxy =
{
	__type: "Galaxy-Namespace",
	__MAX_PECULIAR_VELOCITY: 1400,
	resetGalaxyCount: function() { __g_galaxyCount = 0;},
	generateInstance: function(universeSize, luminosiftyFunctionInstance) {
		let ret = new Object();
		ret.__type = "Galaxy";
		ret._myIdx = __g_galaxyCount;
		__g_galaxyCount++;
		ret._position = LinAlg.generateRandomVector(universeSize);
		ret._luminosity = GalaxyLuminosityFunction.random(luminosiftyFunctionInstance);

		ret._velocityPeculiarUnit = LinAlg.generateRandomUnitVector();
		const thisPerculairVelocity = Math.random() * Galaxy.__MAX_PECULIAR_VELOCITY;
		ret._velocityPeculiar = LinAlg.scaleGenerate(ret._velocityPeculiarUnit,thisPerculairVelocity);

		ret._orientationVector = LinAlg.generateRandomUnitVector();
		const orienation = LinAlg.realizeCoordinates(ret._orientationVector);

		ret._orientation = orienation.theta; // for now
		ret._cosOrientation = Math.cos(ret._orientation);
		ret._sinOrientation = Math.sin(ret._orientation);
		ret._galaxyType = Math.floor(Math.random() + 0.5); // 0 or 1
		ret._sizeBasis = ret._luminosity / 2.0e10 * 0.03; // Mpc?

		if (ret._galaxyType == 0) // elliptical
		{
			ret._bulgeSize = null;
			ret._diskSize = null;
			ret._orientationFace = 0;
			ret._cosOrientationFace = 1;
			ret._sinOrientationFace = 0;
			ret._radiusEquatorial = ret._sizeBasis;
			ret._radiusPolar = ret._sizeBasis * (Math.random() * 0.25 + 0.75);
		}
		else
		{
			ret._bulgeSize = ret._sizeBasis * (Math.random() * 0.25 + 0.05);
			ret._radiusEquatorial = ret._bulgeSize;
			ret._radiusPolar = ret._bulgeSize;
			ret._diskSize = ret._sizeBasis;
			ret._orientationFace = orienation.phi;
			ret._cosOrientationFace = Math.cos(ret._orientationFace);
			ret._sinOrientationFace = Math.sin(ret._orientationFace);
		}

		//ret._faceon = Math.random() * 0.75 + 0.25;
		ret._color = Math.random();
		ret._catalogNum = ret._myIdx + 1;
		ret._id = 'NSiGC ' + ret._catalogNum;
//		Object.freeze(ret); // make the object
		return ret;
	},
}
Object.freeze(Galaxy);


let __g_universe_db = null;
let __g_universe_instance = null;
let __g_universeStorageReady = false;
let __g_universeReady = false;
let __g_universeReadyCallback = null;
let __g_universe_Last_Change = null;
let __g_universe_Last_Save = null;
let __g_universe_Last_Displayable_Change = null;
let __g_universe_Last_Displayable_Request = null;
const Universe =
{
	__type: "Universe-Namespace",
	__DB_NAME: "universe-indexeddb",
	__DB_VERSION: 1,
	__DB_STORE_NAME: "universe",	
	__DB_UNIVERSE_ID: "The Universe",
	__NUM_GALAXIES: 2000, // number of galaxies
	__UNIVERSE_SIZE: 2000, // size of cube in Mpc
	_markChange: function()
	{
		__g_universe_Last_Change = Date.now();
		__g_universe_Last_Displayable_Change = Date.now();
	},
	_markDisplayableChange: function()
	{
		__g_universe_Last_Displayable_Change = Date.now();
	},
	hasUpdate: function()
	{
		let ret = __g_universe_Last_Displayable_Request == null || __g_universe_Last_Displayable_Change == null || __g_universe_Last_Displayable_Request < __g_universe_Last_Displayable_Change;
		__g_universe_Last_Displayable_Request = Date.now();
		return ret;
	},
	_saveMonitor: function()
	{
		let now = Date.now();
		if (__g_universe_Last_Change !== null && __g_universe_Last_Save !== null &&
			(((__g_universe_Last_Change - __g_universe_Last_Save) > 5000) ||
			(((now - __g_universe_Last_Change) > 1000) && (__g_universe_Last_Change > __g_universe_Last_Save))))
		{
			Universe.save();
		}		
		window.setTimeout(Universe._saveMonitor, 1000.0);
	},
	getCurrentHome: function()
	{
		return __g_universe_instance.currentHome;
	},
	regenerateUniverse: function()
	{
		let ret = new Object();
		ret.__type = "Universe";
		Galaxy.resetGalaxyCount();
		ret.id = Universe.__DB_UNIVERSE_ID;

		ret.H0 = (Math.random() - 0.5) * 2.0 + 72.0; // the value of the Hubble constant in this universe
		ret.currentHome = 0;
		ret.galaxies = new Array();
		// clear all measurements
		ret.LF = GalaxyLuminosityFunction.generateInstance(2e10,-0.47,1,60);

		ret.measurementsImagesCount = 0;
		ret.measurementsImages = new Object();
		ret.measurementsSpectraCount = 0;
		ret.measurementsSpectra = new Object();


		ret.galaxyAnalyses = new Object();
		ret.hubbleAnalyses = new Object();

		let debug = false;
		let home = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
		let pos = LinAlg.realizeCoordinates(home._position);
		pos.x = 0;
		pos.y = 0;
		pos.z = 0;
		home._luminosity = 1.2e10;
		home._sizeBasis = home._luminosity / 2.0e10 * 0.03;
		home._galaxyType = 1;
		home._bulgeSize = home._sizeBasis * (Math.random() * 0.25 + 0.05);
		home._diskSize = home._sizeBasis;
		let orientation = LinAlg.realizeCoordinates(home._orientationVector);
		orientation.x = 0;
		orientation.y = 0;
		orientation.z = 1;
		home._orientationFace = 0;
		home._cosOrientationFace = 1;
		home._sinOrientationFace = 0;
		home._id = 'Milky Way';
		ret.galaxies.push(home);
		
		if (debug) {
			let tempX = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempX);
			pos.x = 100;
			pos.y = 0;
			pos.z = 0;
			tempX._id = 'Test x';
			ret.galaxies.push(tempX);

			let tempMX = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempMX);
			pos.x = -100;
			pos.y = 0;
			pos.z = 0;
			tempMX._id = 'Test -x';
			ret.galaxies.push(tempMX);

			let tempZ = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempZ);
			pos.x = 0;
			pos.y = 0;
			pos.z = 100;
			tempZ._id = 'Test Z';
			ret.galaxies.push(tempZ);

			let tempMZ = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempMZ);
			pos.x = 0;
			pos.y = 0;
			pos.z = -100;
			tempMZ._id = 'Test -Z';
			ret.galaxies.push(tempMZ);

			let tempY = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempY);
			pos.x = 0;
			pos.y = 100;
			pos.z = 0;
			tempY._id = 'Test Y';
			ret.galaxies.push(tempY);

			let tempMY = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
			pos = LinAlg.realizeCoordinates(tempMY);
			pos.x = 0;
			pos.y = -100;
			pos.z = 0;
			tempMY._id = 'Test -Y';
			ret.galaxies.push(tempMY);
		}
		else
		{
			let idxLcl;
			// start at 1 since the Milky way is the first in the list.
			for (idxLcl = 1; idxLcl < Universe.__NUM_GALAXIES; idxLcl++)
			{
				let galaxy = Galaxy.generateInstance(Universe.__UNIVERSE_SIZE,ret.LF);
				ret.galaxies.push(galaxy);
			}
		}

		__g_universe_instance = ret;
		Universe._markChange();
	},
	initialize: function()
	{
		Universe.regenerateUniverse();
		
		let promise = new Promise(function (onsuccess,onerror)
		{
			let request = indexedDB.open(Universe.__DB_NAME,Universe.__DB_VERSION);
			request.onsuccess = function(event)
			{
				__g_universe_db = this.result;
				onsuccess();
			}
			request.onerror = function(event)
			{
				console.error("openDb:", event.target.errorCode);
				onerror();
			}
			request.onupgradeneeded = function(event)
			{
				const db = event.target.result;
				db.onerror = (event) => {
					console.error(event.target.errorCode);
				};
				let store = db.createObjectStore(Universe.__DB_STORE_NAME, { keyPath: 'id'});
				console.log("openDb updated");
			}
		})
		Universe._saveMonitor();
		return promise;
	},
	save: function()
	{
		return new Promise(function (onsuccess, onerror)
		{
			if (__g_universe_db !== null)
			{
				let names = __g_universe_db.objectStoreNames;
				
				let tx = __g_universe_db.transaction(Universe.__DB_STORE_NAME, "readwrite");
				let store = tx.objectStore(Universe.__DB_STORE_NAME);
				let ptx = store.put(__g_universe_instance);
				ptx.onsuccess = function() {onsuccess();}
				ptx.onerror = function() {onerror();}
				__g_universe_Last_Save = Date.now();
				
			}
		})
	},
	load: function()
	{
		return new Promise(function(onsuccess,onerror)
		{
			if (__g_universe_db !== null)
			{
				let tx = __g_universe_db.transaction(Universe.__DB_STORE_NAME, "readonly");
				let store = tx.objectStore(Universe.__DB_STORE_NAME);
				let ptx = store.get(Universe.__DB_UNIVERSE_ID);
				ptx.onsuccess = function(event)
				{
					if (typeof event.target.result  == "object" && "galaxies" in event.target.result)
					{
						Object.assign(__g_universe_instance,event.target.result);
						__g_galaxyCount = __g_universe_instance.galaxies.length;
						onsuccess();
					}
					else
						onerror();
				__g_universe_Last_Save = Date.now();
				__g_universe_Last_Change = Date.now();
				__g_universe_Last_Displayable_Change = __g_universe_Last_Change;
				}
				ptx.onerror = function() {onerror();}
			}
		})
	},
	isUniverseReady: function() {return __g_universeReady;},
	getGalaxyCount: function()
	{
		return __g_universeReady ? __g_universe_instance.galaxies.length : 0;
	},
	getGalaxy: function(index) 
	{
		return (index >= 0 && index < __g_universe_instance.galaxies.length) ? __g_universe_instance.galaxies[index] : null;
	},
	isHomeMilkyWay: function()
	{
		return __g_universe_instance.currentHome == 0;
	},
	getHomeGalaxyIndex: function()
	{
		return __g_universe_instance.currentHome;
	},
	setUniverseReadyCallback: function(universeReadyCallback)
	{
		if (__g_universeReady)
		{
			universeReadyCallback();
		}
	},
	_DeleteStorage: function()
	{
		let request = indexedDB.deleteDatabase(Universe.__DB_NAME);
		request.onsuccess = function()
		{
			console.log("Universe storage deleted");
		}
		request.onerror = function(event)
		{
			console.error("universe storage delete error: ", event.target.errorCode);
		}
	},
	generateImage: function (homeGalaxy,targetGalaxy,pFlux, pFlux_u,flux, flux_u, dist, dist_u)
	{
		let ret = new Object();
		ret._homeGalaxy = homeGalaxy;
		ret._targetGalaxy = targetGalaxy;
		ret.pFlux = initializeVariable(pFlux,0);
		ret.pFlux_u = initializeVariable(pFlux_u,0);
		ret._flux = initializeVariable(flux,0);
		ret._flux_u = initializeVariable(flux_u,0);
		ret._dist = initializeVariable(dist,0);
		ret._dist_u = initializeVariable(dist_u,0);
		Object.seal(ret);
		return ret;
	},
	generateSpectrum: function(homeGalaxy,targetGalaxy,rv, rv_u, vrot, vrot_u)
	{
		let ret = new Object();
		ret._homeGalaxy = homeGalaxy;
		ret._targetGalaxy = targetGalaxy;
		ret._rv = initializeVariable(rv,0);
		ret._rv_u = initializeVariable(rv_u,0);
		ret._vrot = initializeVariable(vrot,0);
		ret._vrot_u = initializeVariable(vrot_u,0);
		Object.seal(ret);
		return ret;
	},
	generateGalaxyAnalysis: function(homeGalaxy,targetGalaxy)
	{
		let ret = new Object();
		ret.homeGalaxy = homeGalaxy;
		ret.targetGalaxy = targetGalaxy;
		ret._Mv = 0;
		ret._Mv_u = 0;
		ret._dist = 0;
		ret._dist_u = 0;
		ret._redshift = 0;
		ret._redshift_u = 0;
		ret._radialVelocity = 0;
		ret._radialVelocity_u = 0;
		ret._imagesCount = 0;
		ret._spectraCount =0;
		Object.seal(ret);
		return ret;
	},
	getHubbleAnalysis: function(fromGalaxy)
	{
		let ret = null;
		ret = new Object();
		ret.fromGalaxy = fromGalaxy;
		if (fromGalaxy in __g_universe_instance.hubbleAnalyses)
		{
			const lls = clone(__g_universe_instance.hubbleAnalyses[fromGalaxy].lls);
			ret.lls = lls;
			ret.H0 = LLS.slope(lls);
			ret.H0_u = LLS.slope_uncertainty(lls);
			ret.v0 = LLS.intercept(lls);
			ret.v0_u = LLS.intercept_uncertainty(lls);
			ret.data = clone(__g_universe_instance.hubbleAnalyses[fromGalaxy].datainstance);
			if (ret._measurementsCount == 2)
				ret.displayable = "(" + ret.H0.toFixed(0) + " ± ∞) km/s/Mpc";
			else
			{
				const readout = sig_figs(ret.H0,ret.H0_u);
				ret.displayable = readout.standard_notation + " km/s/Mpc";
			}
			if (ret._measurementsCount == 2)
				ret.displayableV0 = "(" + ret.v0.toFixed(0) + " ± ∞) km/s";
			else
			{
				const readout = sig_figs(ret.v0,ret.v0_u);
				ret.displayableV0 = readout.standard_notation + " km/s";
			}
		}
		else
		{
			ret.lls = null;
			ret.H0 = 0;		
			ret.H0_u = 0;		
			ret.v0 = 0;		
			ret.v0_u = 0;
			ret.data = null;
			ret.displayable = "---";
			ret.displayableV0 = "---";
		}
		return ret;
	},
	performMeasurementAnalysis: function (targetGalaxyIdx)
	{
		let ret = null;
		let pFlux = WeightedAverager.generateInstance();
		let flux = WeightedAverager.generateInstance();
		let dist = WeightedAverager.generateInstance();
		let rv = WeightedAverager.generateInstance();
		let vrot = WeightedAverager.generateInstance();
		const homeGalaxyIdx = __g_universe_instance.currentHome;
		if (homeGalaxyIdx in __g_universe_instance.measurementsImages && targetGalaxyIdx in __g_universe_instance.measurementsImages[homeGalaxyIdx])
		{
			const listMeasurements = __g_universe_instance.measurementsImages[homeGalaxyIdx][targetGalaxyIdx];
			for (let i = 0; i < listMeasurements.length; i++)
			{
				if (listMeasurements[i].pFlux > 0 && listMeasurements[i].pFlux_u > 0)
				{
					WeightedAverager.add(pFlux,listMeasurements[i].pFlux,listMeasurements[i].pFlux_u);
				}
				if (listMeasurements[i]._flux > 0 && listMeasurements[i]._flux_u > 0)
				{
					WeightedAverager.add(flux,listMeasurements[i]._flux,listMeasurements[i]._flux_u);
				}
				if (listMeasurements[i]._dist > 0 && listMeasurements[i]._dist_u > 0)
				{
					WeightedAverager.add(dist,listMeasurements[i]._dist,listMeasurements[i]._dist_u);
				}
			}
		}
		if (homeGalaxyIdx in __g_universe_instance.measurementsSpectra && targetGalaxyIdx in __g_universe_instance.measurementsSpectra[homeGalaxyIdx])
		{
			const listMeasurementsSpectra = __g_universe_instance.measurementsSpectra[homeGalaxyIdx][targetGalaxyIdx];
			for (let i = 0; i < listMeasurementsSpectra.length; i++)
			{
				if (listMeasurementsSpectra[i]._rv > 0 && listMeasurementsSpectra[i]._rv_u > 0)
				{
					WeightedAverager.add(rv,listMeasurementsSpectra[i]._rv,listMeasurementsSpectra[i]._rv_u);
				}
				if (listMeasurementsSpectra[i]._vrot > 0 && listMeasurementsSpectra[i]._vrot_u > 0)
				{
					WeightedAverager.add(vrot,listMeasurementsSpectra[i]._vrot,listMeasurementsSpectra[i]._vrot_u);
				}
			}
		}
		if (WeightedAverager.count(flux) > 0 || WeightedAverager.count(dist) > 0 || WeightedAverager.count(rv) > 0 || WeightedAverager.count(vrot) > 0)
		{
		// Tully-Fisher Distance
		//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
			if (WeightedAverager.count(flux) > 0 && WeightedAverager.count(vrot) > 0) 
			{
				const lum_tf =  4.0e10 * Math.pow(WeightedAverager.average(vrot) / 200.0,4.0);
				const lum_tf_u = 4.0 * lum_tf * WeightedAverager.sterrs(vrot) / WeightedAverager.average(vrot);
				const dist_tf = Math.sqrt(lum_tf / (WeightedAverager.average(flux) / Phys.kLuminositySolar) * 0.25 / Math.PI) / (1.0e6 * Phys.kParsec);
				const ul = 0.5 * lum_tf_u / lum_tf;
				const uf = 0.5 * WeightedAverager.sterrs(flux) / WeightedAverager.average(flux);
				const dist_tf_u = dist_tf * Math.sqrt(ul * ul + uf * uf);
				WeightedAverager.add(dist,dist_tf,dist_tf_u);
			}
			
			ret = Universe.generateGalaxyAnalysis(homeGalaxyIdx,targetGalaxyIdx);
			if (WeightedAverager.count(flux) > 0)
			{
				// solar flux
				const fluxSun = Phys.kLuminositySolar / (1.49597870700e13 * 1.49597870700e13 * 4.0 * Math.PI);
				ret._Mv = -2.5 * Math.log10(WeightedAverager.average(flux) / fluxSun) - 26.75;
				ret._Mv_u = 2.5 * WeightedAverager.sterrs(flux) / WeightedAverager.average(flux) / Math.log(10.0);
			}
			else
			{
				ret._Mv = -1;
				ret._Mv_u = -1;
			}
			if (WeightedAverager.count(dist) > 0)
			{
				ret._dist = WeightedAverager.average(dist);
				ret._dist_u = WeightedAverager.sterrs(dist);
			}
			else
			{
				ret._dist = -1;
				ret._dist_u = -1;
			}
			if (WeightedAverager.count(rv) > 0)
			{
				ret._redshift = WeightedAverager.average(rv) / (Phys.kSpeedOfLight * 1e-5);
				ret._redshift_u = WeightedAverager.sterrs(rv) / (Phys.kSpeedOfLight * 1e-5)
				ret._radialVelocity = WeightedAverager.average(rv);
				ret._radialVelocity_u = WeightedAverager.sterrs(rv);
			}
			else
			{
				ret._redshift = -1;
				ret._redshift_u = -1;
				ret._radialVelocity = -1;
				ret._radialVelocity_u = -1;
			}
			ret._imagesCount = WeightedAverager.count(flux);
			ret._spectraCount = WeightedAverager.count(rv);
			
			if (!(homeGalaxyIdx in __g_universe_instance.galaxyAnalyses))
			{
				__g_universe_instance.galaxyAnalyses[homeGalaxyIdx] = new Object();
			}
			
			__g_universe_instance.galaxyAnalyses[homeGalaxyIdx][targetGalaxyIdx] = ret;
			
			let llsData = LLSdatasetContainer.generateInstance();
			for (let tgtIdx in __g_universe_instance.galaxyAnalyses[homeGalaxyIdx])
			{
				const tgt = __g_universe_instance.galaxyAnalyses[homeGalaxyIdx][tgtIdx];
				if (tgt._dist_u != -1 && tgt._radialVelocity_u != -1)
				{
					LLSdatasetContainer.add(llsData,tgt._dist,tgt._radialVelocity);
				}
			}
			let lls = LLSdatasetContainer.performLLS(llsData);
			__g_universe_instance.hubbleAnalyses[homeGalaxyIdx] = {datainstance: llsData, lls: LLSdatasetContainer.performLLS(llsData)};
		}
	},
	getGalaxyViewCoordinates: function (targetGalaxy)
	{
		let relPosInst = LinAlg.subtractGenerate(__g_universe_instance.galaxies[targetGalaxy]._position,__g_universe_instance.galaxies[__g_universe_instance.currentHome]._position);
		let relPos = LinAlg.realizeCoordinates(relPosInst);
		if (relPos.x > Universe.__UNIVERSE_SIZE)
			relPos.x -= (2.0 * Universe.__UNIVERSE_SIZE);
		if (relPos.x < -Universe.__UNIVERSE_SIZE)
			relPos.x += (2.0 * Universe.__UNIVERSE_SIZE);
		if (relPos.y > Universe.__UNIVERSE_SIZE)
			relPos.y -= (2.0 * Universe.__UNIVERSE_SIZE);
		if (relPos.y < -Universe.__UNIVERSE_SIZE)
			relPos.y += (2.0 * Universe.__UNIVERSE_SIZE);
		if (relPos.z > Universe.__UNIVERSE_SIZE)
			relPos.z -= (2.0 * Universe.__UNIVERSE_SIZE);
		if (relPos.z < -Universe.__UNIVERSE_SIZE)
			relPos.z += (2.0 * Universe.__UNIVERSE_SIZE);
		return relPos;
	},
	takeGalaxyImage: function(targetGalaxyidx,SN,aperture)
	{
		const homeGalaxy = Universe.getGalaxy(__g_universe_instance.currentHome);
		const homeGalaxyidx = __g_universe_instance.currentHome;
		const targetGalaxy = Universe.getGalaxy(targetGalaxyidx);
		const relPos = Universe.getGalaxyViewCoordinates(targetGalaxyidx);
		const dist = relPos.r;
		const collectingArea = Math.PI * aperture * aperture * 0.25;
		const greenPhotonEnergy = Phys.kPlanck * Phys.kSpeedOfLight / (550.0e-7);
		const flux = targetGalaxy._luminosity * Phys.kLuminositySolar * Math.pow(dist * 1.0e6 * Phys.kParsec,-2.0) * 0.25 / Math.PI; // erg/s/cm^2
		const intFlux = flux * collectingArea; // erg/s
		const photonFlux = intFlux / greenPhotonEnergy; // photons / s
		const exposure = SN * SN / photonFlux; // s
		const photoxFluxExpsoure = exposure * photonFlux; // photons
		const measPhotonFlux = random_gaussian(photoxFluxExpsoure,Math.sqrt(photoxFluxExpsoure)); // photons
		const measPhotonFlux_err = Math.sqrt(measPhotonFlux); // photons
		const measFlux = measPhotonFlux * greenPhotonEnergy / exposure / collectingArea; // erg/s/cm^2
		const measFlux_err = measPhotonFlux_err * greenPhotonEnergy / exposure / collectingArea; // erg / s / cm^2
		
		let measDist = 0;
		let measDist_err = -1;
		if (dist < 35.0)
		{
			measDist = dist * (1.0 + random_gaussian(0,1.0 / SN)); // Mpc
			measDist_err = measDist / SN; // Mpc
		}
		let measurement = Universe.generateImage(__g_universe_instance.currentHome,targetGalaxyidx,measPhotonFlux, measPhotonFlux_err, measFlux,measFlux_err,measDist,measDist_err)
		if (!(homeGalaxyidx in __g_universe_instance.measurementsImages))
			__g_universe_instance.measurementsImages[__g_universe_instance.currentHome] = new Object();
		if (!(targetGalaxyidx in __g_universe_instance.measurementsImages[__g_universe_instance.currentHome]))
			__g_universe_instance.measurementsImages[__g_universe_instance.currentHome][targetGalaxyidx] = new Array();
			
		__g_universe_instance.measurementsImages[__g_universe_instance.currentHome][targetGalaxyidx].push(measurement);
		__g_universe_instance.measurementsImagesCount++;
		Universe.performMeasurementAnalysis(targetGalaxyidx);
		Universe._markChange();
	},
 	takeGalaxySpectrum: function(targetGalaxyidx,resolution)
	{
		const homeGalaxy = Universe.getGalaxy(__g_universe_instance.currentHome);
		const homeGalaxyidx = __g_universe_instance.currentHome;
		const targetGalaxy = Universe.getGalaxy(targetGalaxyidx);
		const relPos = Universe.getGalaxyViewCoordinates(targetGalaxyidx);
		const dist = relPos.r;
		const scalar = 1.0 / relPos.r;
		const ux = relPos.x * scalar;
		const uy = relPos.y * scalar;
		const uz = relPos.z * scalar;

		const vpecV = LinAlg.realizeCoordinates(targetGalaxy._velocityPeculiar);
		const vx = vpecV.x;
		const vy = vpecV.y;
		const vz = vpecV.z;

		const rv_Hubble = __g_universe_instance.H0 * dist;
		const rv_pec = (vx * ux + vy * uy + vz * uz);
		const rv = rv_Hubble + rv_pec;
		const measRv = random_gaussian(rv,resolution);

		const beta = measRv / (Phys.kSpeedOfLight * 1.0e-5); 
		const redshift = Math.sqrt((1 + beta) / (1 - beta)) - 1;
		
	// Tully-Fisher
	//L = 4e10 * Math.pow(v / 200.0,4.0); // solar luminosities, v in km/s
		const vrot = Math.pow(targetGalaxy._luminosity / 4.0e10,0.25) * 200.0;
		const measVrot = random_gaussian(vrot,resolution);

		let measurement = Universe.generateSpectrum(homeGalaxyidx,targetGalaxyidx,measRv,resolution,measVrot,resolution);

		if (!(homeGalaxyidx in __g_universe_instance.measurementsSpectra))
			__g_universe_instance.measurementsSpectra[homeGalaxyidx] = new Object();
		if (!(targetGalaxyidx in __g_universe_instance.measurementsSpectra[homeGalaxyidx]))
			__g_universe_instance.measurementsSpectra[homeGalaxyidx][targetGalaxyidx] = new Array();

		__g_universe_instance.measurementsSpectra[homeGalaxyidx][targetGalaxyidx].push(measurement);
		__g_universe_instance.measurementsSpectraCount++;
		Universe.performMeasurementAnalysis(targetGalaxyidx);
		Universe._markChange();
	},
	pickRandomHomeGalaxy: function()
	{
		__g_universe_instance.currentHome = Math.floor(Math.random() * __g_universe_instance.galaxies.length);
		Universe._markChange();
	},
	selectHomeGalaxy: function(index)
	{
		if (index >= 0 && index < __g_universe_instance.galaxies.length)
		{
			__g_universe_instance.currentHome = index;
			Universe._markChange();
		}
	},
	getGalaxyAnalysisResults: function(targetGalaxy)
	{
		return (__g_universe_instance.currentHome in __g_universe_instance.galaxyAnalyses && targetGalaxy in __g_universe_instance.galaxyAnalyses[__g_universe_instance.currentHome]) ? clone(__g_universe_instance.galaxyAnalyses[__g_universe_instance.currentHome][targetGalaxy]) : null;
	},
	getMeasurementsCSV: function()
	{
		let idxLcl;
		let data = 'Galaxy, From Galaxy, Flux (erg/s/au^2), Flux Uncertainty (erg/s/au^2), Cepheid Distance (Mpc), Cepheid Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), Rotational Velocity (km/s), Rotational Velocity Uncertainty (km/s)\n';
		for (let homeGalaxy in __g_universe_instance.measurementsImages)
		{
			for (let targetGalaxy in __g_universe_instance.measurementsImages[homeGalaxy])
			{
				for (let i in __g_universe_instance.measurementsImages[homeGalaxy][targetGalaxy])
				{
					const flux = sig_figs(__g_universe_instance.measurementsImages[homeGalaxy][targetGalaxy][i]._flux,__g_universe_instance.measurementsImages[homeGalaxy][targetGalaxy][i]._flux_u);
					const dist = sig_figs(__g_universe_instance.measurementsImages[homeGalaxy][targetGalaxy][i]._dist,__g_universe_instance.measurementsImages[homeGalaxy][targetGalaxy][i]._dist_u);
					const radVel = sig_figs(0,0);
					const rotVel  = sig_figs(0,0);
					data += __g_universe_instance.galaxies[homeGalaxy]._id + ', ' + __g_universe_instance.galaxies[targetGalaxy]._id
					+ ', ' + flux.value_string
					+ ', ' + flux.uncertainty_string
					+ ', ' + dist.value_string
					+ ', ' + dist.uncertainty_string
					+ ', ' + radVel.value_string
					+ ', ' + radVel.uncertainty_string
					+ ', ' + rotVel.value_string
					+ ', ' + rotVel.uncertainty_string
					+ '\n';
				}
			}
		}
		for (let homeGalaxy in __g_universe_instance.measurementsSpectra)
		{
			for (let targetGalaxy in __g_universe_instance.measurementsSpectra[homeGalaxy])
			{
				for (let i in __g_universe_instance.measurementsSpectra[homeGalaxy][targetGalaxy])
				{
					const flux = sig_figs(0,0);
					const dist = sig_figs(0,0);
					const radVel = sig_figs(__g_universe_instance.measurementsSpectra[homeGalaxy][targetGalaxy][i]._rv,__g_universe_instance.measurementsSpectra[homeGalaxy][targetGalaxy][i]._rv_u);
					const rotVel = sig_figs(__g_universe_instance.measurementsSpectra[homeGalaxy][targetGalaxy][i]._vrot,__g_universe_instance.measurementsSpectra[homeGalaxy][targetGalaxy][i]._vrot_u);

					data += __g_universe_instance.galaxies[homeGalaxy]._id + ', ' + __g_universe_instance.galaxies[targetGalaxy]._id
					+ ', ' + flux.value_string
					+ ', ' + flux.uncertainty_string
					+ ', ' + dist.value_string
					+ ', ' + dist.uncertainty_string
					+ ', ' + radVel.value_string
					+ ', ' + radVel.uncertainty_string
					+ ', ' + rotVel.value_string
					+ ', ' + rotVel.uncertainty_string
					+ '\n';
				}
			}
		}
		return data;
	},
	getAnalysisCSV: function()
	{
		let idxLcl;
		let data = 'Galaxy, From Galaxy, Distance (Mpc), Distance Uncertainty (Mpc), Radial Velocity (km/s), Radial Velocity Uncertainty (km/s), V Magnitude, V Magnitude Uncertainty, Redshift, Redshift Uncertainty\n';
		for (let homeGalaxy in __g_universe_instance.galaxyAnalyses)
		{
			for (let targetGalaxy in __g_universe_instance.galaxyAnalyses[homeGalaxy])
			{
				const set = __g_universe_instance.galaxyAnalyses[homeGalaxy][targetGalaxy];
				const dist = sig_figs(set._dist,set._dist_u);
				const radVel = sig_figs(set._radialVelocity,set._radialVelocity_u);
				const Mv = sig_figs(set._Mv,set._Mv_u);
				const redshift = sig_figs(set._redshift,set._redshift_u);

				data += __g_universe_instance.galaxies[homeGalaxy]._id
				+ ', ' + __g_universe_instance.galaxies[targetGalaxy]._id
				+ ', ' + dist.value_string
				+ ', ' + dist.uncertainty_string
				+ ', ' + radVel.value_string
				+ ', ' + radVel.uncertainty_string
				+ ', ' + Mv.value_string
				+ ', ' + Mv.uncertainty_string
				+ ', ' + redshift.value_string
				+ ', ' + redshift.uncertainty_string
				+ '\n';
			}
		}
		return data;
	},
	getHubbleAnalysisCSV: function()
	{
		let idxLcl;
		let data = 'From Galaxy, H0 (km/s/Mpc), H0 Uncertainty (km/s/Mpc)\n';
		for (let homeGalaxy in __g_universe_instance.galaxyAnalyses)
		{
			const law = Universe.getHubbleAnalysis(homeGalaxy);
			const H0sf = sig_figs(law.H0,law.H0_u);
			const H0intsf = sig_figs(law.v0,law.v0_u);	

			data +=
				__g_universe_instance.galaxies[homeGalaxy]._id
				+ ', ' + H0sf.value_string
				+ ', ' + H0sf.uncertainty_string
				+ '\n';
		}
		return data;
	},
	findNearestGalaxy: function (lat,long)
	{
		let bestIdx = -1;
		let bestDist = 0;
		let relPosBest;
		let idxLcl;
		const cosLat = Math.cos(lat);
		const lookPos = LinAlg.generateVector(Math.cos(long) * cosLat,Math.sin(long) * cosLat,Math.sin(lat));
		for (let target in __g_universe_instance.galaxies)
		{
			if (target != __g_universe_instance.currentHome)
			{
				const relPos = Universe.getGalaxyViewCoordinates(target);
				const dot = LinAlg.dot(relPos.instance,lookPos) / relPos.r;
				if (dot > bestDist)
				{
					bestDist = dot;
					bestIdx = target;
					relPosBest = relPos;
				}
			}
		}
		return {long: relPosBest.theta, lat: relPosBest.phi, index: bestIdx};
	},
	getGalaxiesInView: function(viewMatrix, fieldOfView, scaling)
	{
		let inViewList = new Array();

		for (let idxLcl in __g_universe_instance.galaxies)
		{
			if (idxLcl != __g_universe_instance.currentHome)
			{
				const relPos = Universe.getGalaxyViewCoordinates(idxLcl);
				LinAlg.scale(relPos.instance,1.0 / relPos.r);
				const viewPos = LinAlg.realizeCoordinates(LinAlg.dot(viewMatrix,relPos.instance)); // transform relative position into view coordinates
				const angSize = __g_universe_instance.galaxies[idxLcl]._sizeBasis / relPos.r; // radians
				const maxAngle = fieldOfView + angSize;
				if ((Math.abs(viewPos.theta) < maxAngle || Math.abs(viewPos.theta) > (2.0 * Math.PI - maxAngle)) &&
					Math.abs(viewPos.phi) < maxAngle) // needs to be in front of telescope
				{
					const angSizePx = angSize * scaling; // pixels
					const x = viewPos.theta * scaling; // pixels
					const y = viewPos.phi * scaling; // pixels

					let viewGalaxy = {}
					let inView = true;
						viewGalaxy.idx = idxLcl;
						viewGalaxy.x = x;
						viewGalaxy.y = y;
						const flux = __g_universe_instance.galaxies[idxLcl]._luminosity * Math.pow(relPos.r * 2.06265e11,-2);
						const Mv = -2.5 * Math.log10(flux) - 26.75;

						viewGalaxy.pixelScale = angSizePx;
						viewGalaxy.bright = (20.0 - Mv) / 3.0;
						inViewList.push(viewGalaxy);
				}
			}
		}
		return inViewList;
	}
	
};
Object.freeze(Universe);


