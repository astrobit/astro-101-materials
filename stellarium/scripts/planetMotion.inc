//
// Author: Brian W. Mulligan
// Version: 1.0
// License: GPL v3.0
// Description: A demonstration of how a selected planet moves over the course of a year
//


include("i18n.inc");
include("save_state.inc");
include("basicDisplay.inc");
include("addLeadingZero.inc");

function PlanetMotion(planetName)
{
	var pPlanetObject = StarMgr.searchByName(planetName);
	//
	// move to "home" position, then save state of stellarium
	core.goHome();
	saveState("planetMotion-demo");
	core.setTimeRate(0); // pause time

	var color = "#aa0000";
	var mrkrColor = "#ff0000";

	// remove GUI, set desired starting position
	core.setGuiVisible(false);
	core.clear("natural");
	core.setTimezone("UTC-06:00");
	//core.setProjectionMode("ProjectionCylinder");
	core.setObserverLocation(-90, 30.2666667, 200, 0.25, "", "Earth"); // longitude, latitude, altitude, transition time, name, planet 
	core.setDate("2019-03-20T22:58:00", "utc");
	// turn on planets, turn off planet labels
	SolarSystem.setFlagPlanets(true);
	SolarSystem.setFlagLabels(false);
	// turn on cardinal points
	LandscapeMgr.setFlagCardinalsPoints(true);
	core.wait(2.0);


	var display =  Object.create(basicDisplay);
	display.textTitle = "The motion of " + planetName;
	display.display();
	core.setProjectionMode("ProjectionStereographic");
	core.selectObjectByName(planetName, true);
	//StelMovementMgr.setFlagTracking(true);
	for (panStep = 0; panStep < 128; panStep++)
	{
		StelMovementMgr.panView(0,-0.5282529869 / 128.0);
		core.wait(2.0 / 128.0);
	}
	StelMovementMgr.zoomTo(360, 3);
	StelMovementMgr.setEquatorialMount(true);
	var vView = StelMovementMgr.getViewDirectionJ2000();
	core.wait(5);
	LandscapeMgr.setFlagAtmosphere(false);
	core.wait(0.25);
	LandscapeMgr.setFlagLandscape(false);
	core.wait(0.25);
	LandscapeMgr.setFlagCardinalsPoints(false);
	core.wait(0.25);
	SolarSystem.setFlagPlanets(true);
	SolarSystem.setFlagLabels(true);

	//GridLinesMgr.setFlagAzimuthalGrid(true);
	//core.wait(5);

	var info = core.getObjectInfo(planetName);
	var az = info.azimuth;
	var alt = info.altitude;
	MarkerMgr.markerHorizon(az, alt, true, "circle", "#0000ff" , 10, false, 125);
	core.wait(0.25);
	MarkerMgr.markerHorizon(az, alt, true, "circle", "#0000ff" , 10, false, 125);
	core.wait(0.25);
	MarkerMgr.markerHorizon(az, alt, true, "circle", "#0000ff" , 10, false, 125);
	core.wait(0.25);
	//core.selectObjectByName("Kochab", true);
	//core.wait(0.50);
	//MarkerMgr.markerHorizon(az, alt, true, "circle", mrkrColor, 10);


	for (time = 0; time < 365; time = time + 7)
	{
		core.setDate("+7 days");
		core.wait(0.25);
		StelMovementMgr.setViewDirectionJ2000(vView);
		display.display();
		if ((time % 7) == 0)
		{
	//		var info = core.getObjectInfo(planetName);
	//		var az = info.azimuth;
	//		var alt = info.altitude;
			MarkerMgr.markerObject(planetName, true, "circle", mrkrColor, 10);
		}
		core.wait(0.25);
	}
	core.wait(10.0);

	MarkerMgr.deleteAllMarkers();

	SolarSystem.setFlagPlanets(true);
	SolarSystem.setFlagLabels(true);
	StarMgr.setFlagStars(false);
	//core.wait(60);
	LabelMgr.deleteAllLabels();
	MarkerMgr.deleteAllMarkers();
	//StarMgr.setFlagStars(starsOn);
	//SolarSystem.setFlagPlanets(planetsOn);
	//SolarSystem.setFlagLabels(labelsOn);
	//LandscapeMgr.setFlagCardinalsPoints(cardinalLabelsOn);
	//core.setObserverLocation(observerLocation);
	//core.setProjectionMode(projectionMode);
	core.clear("natural");
	restoreState("planetMotion-demo");
	//core.setJDay(JD);
	core.setTimeRate(1.0); // pause time
	core.goHome();
	core.setGuiVisible(true);
}

