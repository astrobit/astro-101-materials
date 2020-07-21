INSERT INTO userdata (username, email, firstname, lastname, password, fistsize, consentResearch, permissionsID, defaultLocationID, timeZoneID, defaultLatitude, defaultLongitude, defaultMeasurementUnitsID)
SELECT "bwmulligan", "bwmulligan@astronaos.com", "Brian", "Mulligan", "xyz", 12, 1, permissions.id, locations.id, timezones.id, 30.040015, -97.804680, angle_units.id 
FROM permissions, locations, timezones, angle_units 
WHERE permissions.name = "administrator" AND  locations.postcode = "78610"  AND timezones.name = "America/Chicago" AND angle_units.name = "fists"; 

INSERT INTO userdata (username, email, firstname, lastname, password, fistsize, consentResearch, permissionsID, defaultLocationID, timeZoneID, defaultLatitude, defaultLongitude, defaultMeasurementUnitsID)
SELECT "mpadmin", "mpdmin@astronaos.com", "Moon Project", "Administrator", "xyz", 12, 1, permissions.id, locations.id, timezones.id, 30.040015, -97.804680, angle_units.id 
FROM permissions, locations, timezones, angle_units 
WHERE permissions.name = "administrator" AND  locations.postcode = "78610"  AND timezones.name = "America/Chicago" AND angle_units.name = "fists"; 

