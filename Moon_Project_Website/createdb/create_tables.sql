CREATE TABLE dst_rule_set (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128) UNIQUE NOT NULL COMMENT 'The name of the rules'
);

CREATE TABLE dst_rules (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	rulesetID INT UNSIGNED, fromDate DATE NOT NULL, 
	toDate DATE COMMENT 'The date when the rule expires',
	month INT COMMENT 'The month the rule takes effect',
	onDescr VARCHAR(32) NOT NULL COMMENT 'A description or code for when the rule takes effect ', 
	atTime TIME NOT NULL COMMENT 'A time when the rule takes effect ',  
	atReference VARCHAR(1) COMMENT 'The reference time used for when the rule takes effect; u = UTC, s = standard time, g = GMT, blank indicates local zone appropriate time', 
	saveTime TIME COMMENT 'The adjustment relative to standard time that the rule imposes', 
	letterCode VARCHAR(32) COMMENT 'The letter code applied to zones using this rule when in effect (e.g. C.T = CDT during DST and CST when in standard time, so the code is D or S', 
	FOREIGN KEY (rulesetID) REFERENCES dst_rule_set(id)
);


CREATE TABLE timezones (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128) NOT NULL UNIQUE, 
	linkTo INT UNSIGNED COMMENT 'ID of the zone to which this zone links', 
	latitude FLOAT COMMENT 'An approximate latitude for this zone', 
	longitude FLOAT COMMENT 'An approximate longitude for this zone', 
	FOREIGN KEY (linkTo) REFERENCES timezones(id)
);

CREATE TABLE timezone_details (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	tzID INT UNSIGNED NOT NULL COMMENT 'The timezone to which this detail applies', 
	offset INT NOT NULL COMMENT 'The offset of the zone from UTC', 
	DSTruleID INT UNSIGNED COMMENT 'The rule set that applies to this zone', 
	format VARCHAR(16) COMMENT 'A code used to describe this zone, e.g. C%sT for U.S. central time ', 
	until DATETIME COMMENT 'The date and time on which this detail cease',  
	untilRef VARCHAR(1) COMMENT 'The time reference (u = UTC, g = GMT, s = standard time) at which the detail ceases.', 
	FOREIGN KEY (DSTruleID) REFERENCES dst_rule_set(id), 
	FOREIGN KEY (tzID) REFERENCES timezones(id)
);


CREATE TABLE countries (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	country_ar VARCHAR(512) COMMENT 'Country name in Arabic', 
	country_cn VARCHAR(512) COMMENT 'Country name in Chinese', 
	country_en VARCHAR(512) COMMENT 'Country name in English', 
	country_es VARCHAR(512) COMMENT 'Country name in Spanish', 
	country_fr VARCHAR(512) COMMENT 'Country name in French', 
	country_ru VARCHAR(512) COMMENT 'Country name in Russian', 
	ISO3166_2 CHAR(2) COMMENT 'ISO-3166 2 character country code', 
	ISO3166_3 CHAR(3) COMMENT 'ISO-3166 3 character country code', 
	ISO3166_numeric INT COMMENT 'ISO-3166 numeric country code', 
	ISO4217_Currency_3 CHAR(32) COMMENT 'ISO-4217 3 character currency code', 
	ISO4217_Currency_Country_Name VARCHAR(512) COMMENT 'ISO-4217 country name', 
	ISO4217_Currency_Name VARCHAR(512) COMMENT 'ISO-4217 currency name', 
	ISO4217_Currency_Numeric INT COMMENT 'ISO-4217 currency numeric code', 
	CLDR_Name VARCHAR(512) COMMENT 'CLDR Country Name', 
	languages VARCHAR(512) COMMENT 'Languages spoken in the country', 
	region_code INT COMMENT 'Region code for the country', 
	region_name VARCHAR(512) COMMENT 'Name of the region of the country', 
	subregion_code INT COMMENT 'Code for the sub-region of the country', 
	subregion_name VARCHAR(512) COMMENT 'Name of the sub-region of the country'
);

CREATE TABLE locations (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(128) COMMENT 'A name for the location', 
	city VARCHAR(256) NOT NULL COMMENT 'The city of the location', 
	state_province VARCHAR(64) COMMENT 'The state or province of the location', 
	postcode VARCHAR(16) COMMENT 'The postal code for the location', 
	countryID INT UNSIGNED NOT NULL  COMMENT 'The country in which the location exists', 
	latitude FLOAT NOT NULL COMMENT 'The latitude of the location', 
	longitude FLOAT NOT NULL COMMENT 'The longitude of the location', 
	timezoneID INT UNSIGNED NOT NULL COMMENT 'The timezone for the location', 
	FOREIGN KEY (countryID) REFERENCES countries(id), 
	FOREIGN KEY (timezoneID) REFERENCES timezones(id)
);
CREATE TABLE permissions (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(64) NOT NULL UNIQUE COMMENT 'A name describing the set of permissions',
	administrator TINYINT NOT NULL COMMENT 'A flag indicating that this user type has administrator permissions',
	instructor TINYINT NOT NULL COMMENT 'A flag indicating that this user type has instructor type permissions (e.g. create and manage classes)',
	researcher TINYINT NOT NULL COMMENT 'A flag indicating that this user has researcher type permissions (e.g. access user observations)'
);


CREATE TABLE angle_units (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(32) NOT NULL UNIQUE COMMENT 'The (long) name of the unit',
	symbol VARCHAR(16) COMMENT 'The symbol to use for the unit, e.g. ° for degrees',
	converstionToRadians FLOAT COMMENT 'Conversion from this unit to radians; null indicates indeterminate value (used for fists)'
);


CREATE TABLE userdata (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(64) NOT NULL UNIQUE,
	email VARCHAR(512) NOT NULL UNIQUE COMMENT 'The users email address',
	emailVerified TINYINT NOT NULL COMMENT 'A flag to indicate that the users email has been verified',
	password VARCHAR(4096) NOT NULL COMMENT 'The users password, stored in an encrypted manor',
	firstname VARCHAR(64) NOT NULL COMMENT 'The users first name',
	lastname VARCHAR(64) NOT NULL COMMENT 'The users last name',
	fistsize FLOAT COMMENT 'The angular size of the users fist, in degrees',
	consentResearch TINYINT NOT NULL COMMENT 'Authorize use of submitted observations for research purposes',
	permissionsID INT UNSIGNED NOT NULL COMMENT 'The type of user permissions that this user has (e.g. user, administrator, instructor, etc.)',
	allowUseGeoIP TINYINT NOT NULL COMMENT 'Authorize use of GeoIP to determine location',
	allowUseDevice TINYINT NOT NULL COMMENT 'Authorize use of device capabilities (e.g. GPS) to determine location',
	preferDefaultLocationOverClass TINYINT NOT NULL 'prefer use of default location over class location',
	defaultTimeZoneID INT UNSIGNED COMMENT 'A user selected default time zone', 
	defaultLocationID INT UNSIGNED COMMENT 'A user selected default location',
	defaultLatitude FLOAT COMMENT 'A user entered latitude for their default location',
	defaultLongitude FLOAT COMMENT 'A user entered longitude for their default location',
	defaultMeasurementUnitsID INT UNSIGNED COMMENT 'Default angular units used for measurements',
	FOREIGN KEY (permissionsID) REFERENCES permissions(id),
	FOREIGN KEY (defaultLocationID) REFERENCES locations(id),
	FOREIGN KEY (timeZoneID) REFERENCES timezones(id),
	FOREIGN KEY (defaultMeasurementUnitsID) REFERENCES angle_units(id)
);


CREATE TABLE class_roles(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(128) NOT NULL UNIQUE COMMENT 'A name for the role',
	description VARCHAR (1024) NOT NULL COMMENT 'A description for the role',
	viewRoster TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to view class rosters',
	editRoster TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to edit class rosters',
	changeRoles TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to change class members roles',
	viewRosterObservations TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to view observations of members of the class',
	acceptRejectRosterObservations TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to accept or reject suspicious observations',
	deleteClass TINYINT NOT NULL COMMENT 'Flag to indicate the role has the ability to delete the class'
);

CREATE TABLE classes (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	ownerID INT UNSIGNED NOT NULL COMMENT 'userdata ID of the owner/creator of the class',
	code VARCHAR(128) NOT NULL UNIQUE COMMENT 'Class registration code',
	description VARCHAR(128) COMMENT 'A description of the class',
	year INT UNSIGNED NOT NULL COMMENT 'The year the class occurs',
	term VARCHAR(64) NOT NULL COMMENT 'The term in which the class occurs',
	institution VARCHAR(256) NOT NULL COMMENT 'The institution holding the class',
	defaultlocationID INT UNSIGNED NOT NULL COMMENT 'A default location for members of the class',
	start DATE NOT NULL COMMENT 'The date on which the class starts',
	end DATE NOT NULL COMMENT 'The date on which the class ends',
	FOREIGN KEY (ownerID) REFERENCES userdata(id),
	FOREIGN KEY (defaultlocationID) REFERENCES locations(id)
);

CREATE TABLE class_members (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	classID INT UNSIGNED NOT NULL COMMENT 'The class ID for the class',
	userID INT UNSIGNED NOT NULL COMMENT 'The userdata ID of the member',
	roleID INT UNSIGNED NOT NULL COMMENT 'The class_role ID of the member',
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
	hourAngleUnitsID INT UNSIGNED NOT NULL COMMENT 'The angle_units ID for the units for hour angle',
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
	altitudeUnitsID INT UNSIGNED NOT NULL COMMENT 'The angle_units ID for the units for altitude',
	azimuth FLOAT NOT NULL COMMENT 'azimuth (angle) at which the moon appears',
	aziumthUnitsID INT UNSIGNED NOT NULL COMMENT 'The angle_units ID for the units for azimuth',
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
