CREATE TABLE dst_rule_set (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128) UNIQUE NOT NULL
);

CREATE TABLE dst_rules (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	rulesetID INT UNSIGNED, fromDate DATE NOT NULL, 
	toDate DATE, month INT,
	onDescr VARCHAR(32) NOT NULL, 
	atTime TIME NOT NULL, 
	atReference VARCHAR(1), 
	saveTime TIME, 
	letterCode VARCHAR(32), 
	FOREIGN KEY (rulesetID) REFERENCES dst_rule_set(id)
);


CREATE TABLE timezones (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128) NOT NULL UNIQUE, 
	linkTo INT UNSIGNED, 
	latitude FLOAT, 
	longitude FLOAT, 
	FOREIGN KEY (linkTo) REFERENCES timezones(id)
);

CREATE TABLE timezone_details (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	tzID INT UNSIGNED NOT NULL, 
	offset INT NOT NULL, 
	DSTruleID INT UNSIGNED, 
	format VARCHAR(16), 
	until DATETIME,  
	untilRef VARCHAR(1), 
	FOREIGN KEY (DSTruleID) REFERENCES dst_rule_set(id), 
	FOREIGN KEY (tzID) REFERENCES timezones(id)
);


CREATE TABLE countries (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	country_ar VARCHAR(512), 
	country_cn VARCHAR(512), 
	country_en VARCHAR(512), 
	country_es VARCHAR(512), 
	country_fr VARCHAR(512), 
	country_ru VARCHAR(512), 
	ISO3166_2 CHAR(2), 
	ISO3166_3 CHAR(3), 
	ISO3166_numeric INT, 
	ISO4217_Currency_3 CHAR(32), 
	ISO4217_Currency_Country_Name VARCHAR(512), 
	ISO4217_Currency_Name VARCHAR(512), 
	ISO4217_Currency_Numeric INT, 
	CLDR_Name VARCHAR(512), 
	languages VARCHAR(512), 
	region_code INT, 
	region_name VARCHAR(512), 
	subregion_code INT, 
	subregion_name VARCHAR(512)
);

CREATE TABLE locations (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128), 
	city VARCHAR(256) NOT NULL, 
	state_province VARCHAR(64), 
	postcode VARCHAR(16), 
	countryID INT UNSIGNED NOT NULL , 
	latitude FLOAT NOT NULL, 
	longitude FLOAT NOT NULL, 
	timezoneID INT UNSIGNED NOT NULL, 
	FOREIGN KEY (countryID) REFERENCES countries(id), 
	FOREIGN KEY (timezoneID) REFERENCES timezones(id)
);
CREATE TABLE permissions (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	administrator TINYINT NOT NULL,
	instructor TINYINT NOT NULL,
	researcher TINYINT NOT NULL
);


CREATE TABLE angle_units (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(32) NOT NULL,
	symbol VARCHAR(16),
	converstionToRadians FLOAT COMMENT 'conversion from this unit to radians; null indicates indeterminate value (used for fists)'
);

CREATE TABLE userdata (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(64) NOT NULL,
	email VARCHAR(512) NOT NULL,
	password VARCHAR(4096) NOT NULL,
	firstname VARCHAR(64) NOT NULL,
	lastname VARCHAR(64) NOT NULL,
	fistsize FLOAT,
	consentResearch TINYINT NOT NULL,
	permissionsID INT UNSIGNED NOT NULL,
	defaultLocationID INT UNSIGNED,
	timeZoneID INT UNSIGNED, 
	defaultLatitude FLOAT,
	defaultLongitude FLOAT,
	defaultMeasurementUnitsID INT UNSIGNED,
	FOREIGN KEY (permissionsID) REFERENCES permissions(id),
	FOREIGN KEY (defaultLocationID) REFERENCES locations(id),
	FOREIGN KEY (timeZoneID) REFERENCES timezones(id),
	FOREIGN KEY (defaultMeasurementUnitsID) REFERENCES angle_units(id)
);


CREATE TABLE class_roles(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(128) NOT NULL,
	description VARCHAR (1024) NOT NULL,
	viewRoster TINYINT NOT NULL,
	editRoster TINYINT NOT NULL,
	changeRoles TINYINT NOT NULL,
	viewRosterObservations TINYINT NOT NULL,
	acceptRejectRosterObservations TINYINT NOT NULL,
	deleteClass TINYINT NOT NULL
);

CREATE TABLE classes (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	ownerID INT UNSIGNED NOT NULL,
	code VARCHAR(128) NOT NULL,
	year INT UNSIGNED NOT NULL,
	term VARCHAR(64) NOT NULL,
	institution VARCHAR(256) NOT NULL,
	defaultlocationID INT UNSIGNED NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	FOREIGN KEY (ownerID) REFERENCES userdata(id),
	FOREIGN KEY (defaultlocationID) REFERENCES locations(id)
);

CREATE TABLE class_members (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	classID INT UNSIGNED NOT NULL,
	userID INT UNSIGNED NOT NULL,
	roleID INT UNSIGNED NOT NULL,
	FOREIGN KEY (classID) REFERENCES classes(id),
	FOREIGN KEY (userID) REFERENCES userdata(id),
	FOREIGN KEY (roleID) REFERENCES class_roles(id)
);



CREATE TABLE observationRawManual (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	observerID INT UNSIGNED NOT NULL COMMENT 'reference to the user data for the observer',
	obsDateZone DATE NOT NULL COMMENT 'local zone date at which observation is made',
	obsTimeZone TIME NOT NULL COMMENT 'local zone time at which observation is made',
	hourAngle FLOAT NOT NULL COMMENT 'the hour angle at which the moon was observed',
	hourAngleUnitsID INT UNSIGNED NOT NULL,
	phase FLOAT NOT NULL COMMENT 'the estimated numeric phase of the moon recorded by the observer',
	phaseDiagram INT NOT NULL COMMENT 'the estimated phase of the moon based on an image selected by the observer',
	latitude FLOAT NOT NULL COMMENT 'the latitude of the observer at the time of observation',
	longitude FLOAT NOT NULL COMMENT 'the longitude of the observer at the time of observation',
	timezoneID INT UNSIGNED NOT NULL COMMENT 'reference to the time zone in use at the observer\'s location at the moment of observation',
	isDST TINYINT NOT NULL COMMENT 'the observation was performed when the local zone was observing daylight saving time',
	suspicious TINYINT NOT NULL COMMENT 'flag for observations that are deemed suspicious for any reason',
	accepted TINYINT NOT NULL COMMENT 'flag for observations that an instructor has deemed acceptable, may be used to override suspicious flag',
	FOREIGN KEY (observerID) REFERENCES userdata(id),
	FOREIGN KEY (hourAngleUnitsID) REFERENCES angle_units(id),
	FOREIGN KEY (timezoneID) REFERENCES timezones(id)
);
	
CREATE TABLE observationRawAutomated (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	observerID INT UNSIGNED NOT NULL COMMENT 'reference to the user data for the observer',
	obsDateZone DATE NOT NULL COMMENT 'local zone date at which observation is made',
	obsTimeZone TIME NOT NULL COMMENT 'local zone time at which observation is made',
	altitude FLOAT NOT NULL COMMENT 'altitude (angle) at which the moon appears',
	altitudeUnitsID INT UNSIGNED NOT NULL,
	azimuth FLOAT NOT NULL COMMENT 'azimuth (angle) at which the moon appears',
	aziumthUnitsID INT UNSIGNED NOT NULL,
	phase FLOAT NOT NULL COMMENT 'the estimated numeric phase of the moon recorded by the observer',
	phaseDiagram INT NOT NULL COMMENT 'the estimated phase of the moon based on an image selected by the observer',
	latitude FLOAT NOT NULL COMMENT 'the latitude of the observer at the time of observation',
	longitude FLOAT NOT NULL COMMENT 'the longitude of the observer at the time of observation',
	elevation FLOAT NOT NULL COMMENT 'the elevation of the observer above sea level at the time of observation',
	timezoneID INT UNSIGNED NOT NULL COMMENT 'reference to the time zone in use at the observer\'s location at the moment of observation',
	isDST TINYINT NOT NULL COMMENT 'the observation was performed when the local zone was observing daylight saving time',
	suspicious TINYINT NOT NULL COMMENT 'flag for observations that are deemed suspicious for any reason',
	accepted TINYINT NOT NULL COMMENT 'flag for observations that an instructor has deemed acceptable, may be used to override suspicious flag',
	FOREIGN KEY (observerID) REFERENCES userdata(id),
	FOREIGN KEY (altitudeUnitsID) REFERENCES angle_units(id),
	FOREIGN KEY (aziumthUnitsID) REFERENCES angle_units(id),
	FOREIGN KEY (timezoneID) REFERENCES timezones(id)
);
