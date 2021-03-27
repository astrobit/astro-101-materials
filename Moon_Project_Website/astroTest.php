<?php
require_once 'astronomy.php';

$epoch2000 = new DateTime('2000-01-01 12:00:00');
$jd2000 = datetimeToJD($epoch2000);
print('2000.0 = ' . $jd2000 . PHP_EOL);

print('HArise -59@30 = ' . riseSetHourAngle(30.0,-59.0).PHP_EOL);
print('HArise -5@30 = ' . riseSetHourAngle(30.0,-5.0).PHP_EOL);
print('HArise 0@30 = ' . riseSetHourAngle(30.0,0.0).PHP_EOL);
print('HArise 5@30 = ' . riseSetHourAngle(30.0,5.0).PHP_EOL);
print('HArise 59@30 = ' . riseSetHourAngle(30.0,59.0).PHP_EOL);

$sun1 = new SolarPosition(new DateTime('1980-07-27 00:00:00',new DateTimeZone('UTC')));
print('Sun 1 = ' . $sun1->_solarLongitude . PHP_EOL);
$sun2 = new SolarPosition(new DateTime('1988-07-27 00:00:00',new DateTimeZone('UTC')),true);
print('Sun 2 = ' . $sun2->_solarLongitude . PHP_EOL);

$eq = new EquatorialCoordinates();
$ell = new EclipticCoordinates();
$ell->_longitude = 139.686111;
$ell->_latitude = 4.875278;
$eq->getFromEcliptic($ell, new DateTime('1980-01-25 00:00:00',new DateTimeZone('UTC')));
debugPrint('alpha',$eq->_rightAscension);
debugPrint('delta',$eq->_declination);

$LST = new LocalSiderealTime();
$LST->_LST = (4.0 + 40.0/60.0 + 5.23/3600.0)*15.0;
$UT = $LST->getLT(new DateTime('1980-04-22 12:00:00',new DateTimeZone('UTC')));
debugPrint('UT', $UT/15.0);

$moon = new MoonPosition(new DateTime('1979-02-26 16:00:50',new DateTimeZone('UTC')));
print('Moon = ' . $moon->_eclipticLongitude . ' ' . $moon->_eclipticLatitude. PHP_EOL);

/*
$moon2 = new MoonPosition(new DateTime('1979-09-06 00:00:00',new DateTimeZone('UTC')));
debugPrint("moon2 theta", $moon2->_apparentDiameter);
debugPrint("moon2 dist",$moon2->_distance);
debugPrint("moon2 plx",$moon2->_parallax);
*/
$locationM3 = new GeographicPosition(42.0+22.0/60.0,-(71.0 + 3.0/60.0));
$moon3 = new MoonRiseSet();
$moon3->calculate($locationM3,new DateTime('1986-03-06 12:00:00',new DateTimeZone('America/New_York')));
print ("rise:" . $moon3->_rise->format('Y-m-d H:i:s') . PHP_EOL);
print ("set:" . $moon3->_set->format('Y-m-d H:i:s') . PHP_EOL);
/*
$moonPhase = new MoonPosition(new DateTime('1979-02-26 16:00:00',new DateTimeZone('UTC')));
debugPrint('F',$moonPhase->_phase);
*/
/*
$locationKyle = new GeographicPosition(29.9891,-97.8772);
$moonKyle = new MoonRiseSet();
$dateStart = new DateTime('2020-08-07 12:00:00',new DateTimeZone('America/Chicago'));
for ($i = 0; $i < 30; $i++)
{
    $moonKyle->calculate($locationKyle,$dateStart);
    $dateStart->add(new DateInterval('P1D'));
    if (isset($moonKyle->_rise))
    {
        print ("rise:" . $moonKyle->_rise->format('Y-m-d H:i:s') . PHP_EOL);
    }
    if (isset($moonKyle->_set))
    {
        print ("set:" . $moonKyle->_set->format('Y-m-d H:i:s') . PHP_EOL);
    }
}*/
