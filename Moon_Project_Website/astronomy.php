<?php

function datetimeToJD(DateTime $i_datetime)
{
    $datetimeUTC = clone $i_datetime;
    $datetimeUTC->setTimezone(new DateTimeZone('UTC'));
    return gregoriantojd(
        intval($datetimeUTC->format('n')), 
        intval($datetimeUTC->format('j')), 
        intval($datetimeUTC->format('Y'))) +
        (floatval($datetimeUTC->format('G')) + 
        floatval($datetimeUTC->format('i')) / 60.0 + 
        floatval($datetimeUTC->format('s')) / 3600.0) / 24.0 - 0.5;
}

function riseSetHourAngle(float $i_latitude, float $i_declination)
{
    return rad2deg(acos(-tan(deg2rad($i_latitude)) * tan(deg2rad($i_declination))));
}

function normalizeAngle(float $i_angle)
{
    $ret = fmod($i_angle,360.0);
    if ($ret < 0.0)
    {
        $ret += 360.0;
    }
    return $ret;
}
function normalizeTime(float $i_time)
{
    $ret = fmod($i_time,24.0);
    if ($ret < 0.0)
    {
        $ret += 24.0;
    }
    return $ret;
}
class AstroConstants
{
    //const $J2000 = ;
    public const J1900 = 2415019.5;
    public const J1900p5 = 2415020.0;
    public const J1950 = 2433281.5;
    public const J1990 = 2447891.5;
    public const J2000 = 2451543.5;
}

class SolarPosition
{
    public float $_meanAnomaly;
    public float $_trueAnomaly;
    public float $_eccentricAnomaly;
    public float $_solarLongitude;
    public float $_epoch;
    public float $_meanLongitudeEpoch;
    public float $_longitudePerigeeEpoch;
    public float $_eccentricityEpoch;
    public float $_distanceKm;
    public float $_angularSize;
    public function __construct(DateTime $i_datetime, bool $i_calculateEccentricAnomaly = false, bool $i_useJ1990 = false)
    {
        // calculate the longitude, mean, true, and eccentric anomaly of the Sun
        // based on `Practical Astronomy with your Calculator, 3e, Peter Duffett-Smith'
        $jd = datetimeToJD($i_datetime);
        if ($i_useJ1990)
        {
            $jdEpoch = AstroConstants::J1990;
        }
        else
        {
            $refEpoch = new DateTime($i_datetime->format('Y') . '-01-01 12:00:00',new DateTimeZone('UTC'));
            $jdEpoch = datetimeToJD($refEpoch);
        }
        $this->_epoch = $jdEpoch;//datetimeToJD($refEpoch);

        $T = ($jdEpoch - AstroConstants::J1900p5)/ 36525.0;
        $d = $jd - $jdEpoch;
        $this->_meanLongitudeEpoch = normalizeAngle(279.6966778 + (36000.76892 + 0.0003025 * $T) * $T);
        $this->_longitudePerigeeEpoch = normalizeAngle(281.2208444 + (1.719175 + 0.000452778 * $T) * $T);
        $this->_eccentricityEpoch = 0.01675104 - (0.0000418 + 0.000000126 * $T) * $T;

        $this->_meanAnomaly = normalizeAngle(360.0 / 365.242191 * $d + $this->_meanLongitudeEpoch - $this->_longitudePerigeeEpoch);
        if (!$i_calculateEccentricAnomaly)
        {
            $trueAnomaly = fmod($this->_meanAnomaly + 360.0 / M_PI * $this->_eccentricityEpoch * sin(deg2rad($this->_meanAnomaly)),360.0);
            
            $this->_eccentricAnomaly = 0;
        }
        else
        {
            $_meanAnomalyRad = deg2rad($this->_meanAnomaly);
            $_eccentricAnomaly = $_meanAnomalyRad;
            $delta = ($_eccentricAnomaly - $this->_eccentricityEpoch * sin($_eccentricAnomaly) - $_meanAnomalyRad) / (1.0 - $this->_eccentricityEpoch * cos($_eccentricAnomaly));
            while (abs($delta > 0.0000001)) // accurate to within about 6 seconds of time
            {
                $_eccentricAnomaly -= $delta;
                $delta = ($_eccentricAnomaly - $this->_eccentricityEpoch * sin($_eccentricAnomaly) - $_meanAnomalyRad) / (1.0 - $this->_eccentricityEpoch * cos($_eccentricAnomaly));
            }
            $_eccentricAnomaly -= $delta;
            $this->_eccentricAnomaly = normalizeAngle(rad2deg($_eccentricAnomaly));
            $trueAnomaly = fmod(rad2deg(2.0 * atan(sqrt((1.0 + $this->_eccentricityEpoch)/(1.0 - $this->_eccentricityEpoch))*tan($_eccentricAnomaly * 0.5))),360.0);
        }
        $this->_trueAnomaly = normalizeAngle($trueAnomaly);
        $this->_solarLongitude = normalizeAngle($this->_trueAnomaly + $this->_longitudePerigeeEpoch);
        $trueAnomalyRad = deg2rad($this->_trueAnomaly);
        $f = (1.0 + $this->_eccentricityEpoch * cos($trueAnomalyRad)) / (1.0 - $this->_eccentricityEpoch * $this->_eccentricityEpoch);
        $this->_distanceKm = 1.495985e8 / $f;
        $this->_angularSize = $f * 0.533128;
    }
}
function debugPrint(string $i_variable, float $i_value)
{
    print ($i_variable . ' = ' . sprintf("%.9f",$i_value) . PHP_EOL);
}
class MoonPosition
{
    public float $_meanLongitude;
    public float $_meanAnomaly;
    public float $_ascendingNodeMeanLongitude;
    public float $_evection;
    public float $_annualEquation;
    public float $_thirdCorrection;
    public float $_correctedAnomaly;
    public float $_equationOfCenter;
    public float $_fourthCorrection;
    public float $_correctedLongitude;
    public float $_variation;
    public float $_trueLongitude;
    public float $_correctedLongitudeNode;
    public float $_eclipticLongitude;
    public float $_eclipticLatitude;
    public float $_age;
    public float $_phase; // 0 - 1, indicating (roughly) fraction illuminated
    public float $_phaseNumber; // [0 - 8), 4 = full, 0 = new, 1 = waxing crescent
    public float $_distance;
    public float $_apparentDiameter;
    public float $_parallax;
    public function __construct(DateTime $i_datetime)
    { //@NOTE: I use round(...,6) for almost every calculcation here. This is because
        // Duffet-Smith is using a calculator and has limited precision. Using full
        // precision seems to result in errors of up to around 1 arc-minute
        $dt = clone $i_datetime;
        $dt->setTimezone(new DateTimeZone('UTC'));
        $jd = datetimeToJD($dt);
        $D = round($jd - AstroConstants::J1990,6);
        $sun = new SolarPosition($i_datetime,false,true);
        
        $this->_meanLongitude = round(normalizeAngle(13.1763966 * $D) + 318.351648,6);

        $this->_meanAnomaly = round(normalizeAngle($this->_meanLongitude - 0.1114041 * $D - 36.340410),6);

        $this->_ascendingNodeMeanLongitude = round(normalizeAngle(318.510107 - 0.0529539 * $D),6);

        $sinAnomaly = sin(deg2rad($sun->_meanAnomaly));
        $this->_evection = round(1.2739 * sin(deg2rad(2.0 * ($this->_meanLongitude - $sun->_solarLongitude) - $this->_meanAnomaly)),6);

        $this->_annualEquation = round(0.1858 * $sinAnomaly,6);
        $this->_thirdCorrection = round(0.37 * $sinAnomaly,6);
        $this->_correctedAnomaly = round(normalizeAngle($this->_meanAnomaly + $this->_evection - $this->_annualEquation - $this->_thirdCorrection),6);
        $corrAnomRad = deg2rad($this->_correctedAnomaly);
        $this->_equationOfCenter = round(6.2886 * sin($corrAnomRad),6);
        $this->_fourthCorrection = round(0.214 * sin(2.0 * $corrAnomRad),6);
        $this->_correctedLongitude = round(normalizeAngle($this->_meanLongitude + $this->_equationOfCenter + $this->_evection - $this->_annualEquation + $this->_fourthCorrection),6);
        $this->_variation = round(0.6583 * sin(2.0 * deg2rad($this->_correctedLongitude - $sun->_solarLongitude)),6);
        $this->_trueLongitude = round(normalizeAngle($this->_correctedLongitude + $this->_variation),6);
        $this->_correctedLongitudeNode = round(normalizeAngle($this->_ascendingNodeMeanLongitude - 0.16 * $sinAnomaly),6);
        $sinLN = sin(deg2rad($this->_trueLongitude - $this->_correctedLongitudeNode));
        $cosLN = cos(deg2rad($this->_trueLongitude - $this->_correctedLongitudeNode));
        $y = $sinLN * cos(deg2rad(5.145396));
        $x = $cosLN;
        $atanyx = rad2deg(atan2($y,$x));
        $this->_eclipticLatitude = round(rad2deg(asin($sinLN * sin(deg2rad(5.145396)))),6);
        $this->_eclipticLongitude = round(normalizeAngle($atanyx + $this->_correctedLongitudeNode),6);
        
        $this->_age = $this->_eclipticLongitude - $sun->_solarLongitude;
        $this->_phase = 0.5 * (1 - cos(deg2rad($this->_age)));
        $this->_phaseNumber = fmod($this->_age / 360.0 * 8.0, 8.0);
        if ($this->_phaseNumber < 0)
        {
            $this->_phaseNumber += 8.0;
        }
        $relativeDistance = (1.0 - 0.054900 * 0.054900) / (1.0 + 0.054900 * cos(deg2rad($this->_correctedAnomaly + $this->_equationOfCenter)));
        $this->_distance = 384401.0 * $relativeDistance;
        $this->_apparentDiameter = 0.5181 / $relativeDistance;
        $this->_parallax = 0.9507 / $relativeDistance;
    }
}
class GeographicPosition
{
    public float $_latitude;
    public float $_longitude;
    public float $_elevation;
    public function __construct(float $i_latitude, float $i_longitude, float $i_elevation = 0.0)
    {
        $this->_latitude = $i_latitude;
        $this->_longitude = $i_longitude;
        $this->_elevation = $i_elevation;
    }
}
class GeocentricPosition
{
    public float $_latitude;
    public float $_longitude;
    public float $_localRadius;
    public float $_radius;
    public float $_rhoSinLat;
    public float $_rhoCosLat;
    
    public function __construct(GeographicPosition $i_position)
    {
        // (Duffet-Smith 1988)
        $latRad = deg2rad($i_position->_latitude);
        $this->_longitude = $i_position->_longitude;
        $u = atan(0.996647 * tan($latRad));
        $hprime = $i_position->_elevation / 6378140.0;
        $this->_rhoSinLat = 0.996647 * sin($u) + $hprime * sin($latRad);
        $this->_rhoCosLat = cos($u) + $hprime * cos($latRad);
        $latPrimeRad = atan2($this->_rhoSinLat,$this->_rhoCosLat);
        $this->_latitude = rad2deg($latPrimeRad);
        $this->_localRadius = $this->_rhoSinLat / sin($latPrimeRad);
        $this->_radius = $this->_localRadius + $i_position->_elevation;
    }
}

class LocalSiderealTime
{
    public float $_LST; // degrees!
    public function calculate(DateTime $i_datetime, GeographicPosition $i_position)
    {
        $tzUT = new DateTimeZone('UTC');
        $timeUT = clone $i_datetime;
        $timeUT->setTimezone($tzUT);
        $jd = datetimeToJD($timeUT);
        $S = $jd - 2451545.0;
        $T = $S / 36525.0;
        $T0 = (6.697374558 + (2400.051336 + 0.000025862 * $T) * $T) * 15.0;
        $UTh = fmod($jd + 0.5,1.0) * 360.0;
//        $GST = ($UTh + $T0);
        $this->_LST = normalizeAngle($UTh + $T0 + $i_position->_longitude);
    }
    public function getLT(DateTime $i_datetime) // yes, giving the date/time seems counterintuitive, but the approximate julian date is needed to conver sidereal time to local time
    {
        $dtthis = clone $i_datetime;
        $dtthis->setTime(0, 0);
        $jd = datetimeToJD($dtthis);
        $S = $jd - AstroConstants::J2000 - 1.5;//2451545.0;
        $T = $S / 36525.0;
        $T0 = (6.697374558 + (2400.051336 + 0.000025862 * $T) * $T);
        $T0m = normalizeAngle($T0 * 15.0);
        $delta = normalizeAngle($this->_LST - $T0m);
        $LT = $delta * 0.9972695663;
        return $LT;
    }
}
class LocalEquatorialCoordinates
{
    public float $_hourAngle;
    public float $_declination;
    public function __construct(float $i_hourAngle, float $i_declination)
    {
        $this->_hourAngle = $i_hourAngle;
        $this->_declination = $i_declination;
    }
    public function getFromEquatorial(EquatorialCoordinates $i_coordinates, LocalSiderealTime $i_lst)
    {
        $this->_declination = $i_coordinates->_declination;
        $this->_hourAngle = $i_lst->_LST - $i_coordinates->_rightAscension;
    }
    public function getFromHorizontal(HorizontalCoordinates $i_coordinates, GeographicPosition $i_location)
    {
        $latRad = deg2rad($i_location->_latitude);
        $altRad = deg2rad($i_coordinates->_altitude);
        $azRad = deg2rad($i_coordinates->_aziumth);
        $sinLat = sin($latRad);
        $cosLat = cos($latRad);
        $sinAlt = sin($altRad);
        $cosAlt = cos($altRad);
        $d = asin($sinAlt * $sinLat + $cosAlt * $cosLat * cos($azRad));
        $H = atan2(-$cosAlt * $cosLat * sin($azRad),$sinAlt - $sinLat * sin($d));
        $this->_declination = rad2deg($d);
        $this->_hourAngle = rad2deg($H);
    }
}
class ParallacticCorrection
{
    public float $_Delta;
    public float $_hourAngle;
    public float $_declination;
    public function __construct(GeocentricPosition $i_location, LocalEquatorialCoordinates $i_skyPosition, float $i_distance)
    {
        // (Duffet-Smith 1988)
        $haRad = deg2rad($i_skyPosition->_hourAngle);
        $decRad = deg2rad($i_skyPosition->_declination);
        $r = $i_distance / 6378.14;
        $Delta = atan($i_location->_rhoCosLat * sin($haRad) / ($r * cos($decRad) - $i_location->_rhoCosLat * cos($haRad)));
        $this->_Delta = rad2deg($Delta);
        $haPrime = $haRad + $Delta;
        $decPrime = atan(cos($haPrime) * ($r * sin($decRad) - $i_location->_rhoSinLat) / ($r * cos($decRad) * cos($haRad) - $i_location->_rhoCosLat));
        $this->_hourAngle = rad2deg($haPrime);
        $this->_declination = rad2deg($decPrime);
    }
}
function deg2h(float $i_degrees)
{
    return $i_degrees / 15.0;
}
function h2deg(float $i_hours)
{
    return $i_hours * 15.0;
}
function rad2h(float $i_radians)
{
    return rad2deg($i_radians) / 15.0;
}
function h2rad(float $i_hours)
{
    return deg2rad($i_hours * 15.0);
}
class HorizontalCoordinates
{
    public float $_altitude;
    public float $_aziumth;
    public function getFromLocalEquitorial(LocalEquatorialCoordinates $i_coordinates, GeographicPosition $i_location)
    {
        $latRad = deg2rad($i_location->_latitude);
        $haRad = deg2rad($i_coordinates->_hourAngle);
        $decRad = deg2rad($i_coordinates->_declination);
        $sinLat = sin($latRad);
        $cosLat = cos($latRad);
        $sinDec = sin($decRad);
        $cosDec = cos($decRad);
        $a = asin($sinDec * $sinLat + $cosDec * $cosLat * cos($haRad));
        $A = atan2(-$cosDec * $cosLat * sin($haRad),$sinDec - $sinLat * sin($a));
        $this->_altitude = rad2deg($a);
        $this->_aziumth = rad2deg($A);
    }
}

class EquatorialCoordinates
{
    public float $_rightAscension; // degrees!
    public float $_declination;
    function getFromEcliptic(EclipticCoordinates $i_coordinates, DateTime $i_datetime)
    {
        $jd = datetimeToJD($i_datetime);
        $T = ($jd - AstroConstants::J2000 - 1.5) / 36525.0; // Epoch 2000.0
        $lambdaRad = deg2rad($i_coordinates->_longitude);
        $betaRad = deg2rad($i_coordinates->_latitude);
        $obliquity = 23.0 + 26.0/60.0 + (21.45 - (46.815 + (0.0006 - 0.00181 * $T) * $T) * $T) / 3600.0;
        $obliquityRad = deg2rad($obliquity);
        $sinLambda = sin($lambdaRad);
        $cosObliquity = cos($obliquityRad);
        $sinObliquity = sin($obliquityRad);
        $this->_rightAscension = rad2deg(atan2($sinLambda * $cosObliquity - tan($betaRad) * $sinObliquity,cos($lambdaRad)));
        $this->_declination = rad2deg(asin(sin($betaRad) * $cosObliquity + cos($betaRad) * $sinObliquity * $sinLambda));
    }
}
class EclipticCoordinates
{
    public float $_longitude;
    public float $_latitude;
    
    public function getFromEquatorial(EquatorialCoordinates $i_coordinates, DateTime $i_datetime)
    {
        $jd = datetimeToJD($i_datetime);
        $T = ($jd - AstroConstants::J2000 - 1.5) / 36525.0; // Epoch 2000.0
        $alphaRad = deg2rad($i_coordinates->_rightAscension);
        $decRad = deg2rad($i_coordinates->_declination);
        $obliquity = 23.0 + 26.0/60.0 + (21.45 - (46.815 + (0.0006 - 0.00181 * $T) * $T) * $T) / 3600.0;
        $obliquityRad = deg2rad($obliquity);
        $sinAlpha = sin($alphaRad);
        $cosObliquity = cos($obliquityRad);
        $sinObliquity = sin($obliquityRad);
        $this->_longitude = rad2deg(atan2($sinAlpha * $cosObliquity + tan($decRad) * $sinObliquity,cos($alphaRad)));
        $this->_latitude = rad2deg(asin(sin($decRad) * $cosObliquity - cos($decRad) * $sinObliquity * $sinAlpha));
    }
    private function calculateAberration(DateTime $i_datetime, float &$o_deltaLat, float &$o_deltaLon)
    {
        $sun = new SolarPosition($i_datetime,true);
        $deltaLongSun = deg2rad($sun->_solarLongitude - $this->_longitude);
        $latRad = deg2rad($this->_latitude);
        $o_deltaLat = -20.49552 * cos($deltaLongSun) / cos($latRad) / 3600.0;
        $o_deltaLon = -20.49552 * sin($deltaLongSun) / sin($latRad) / 3600.0;
    }
    public function addAberration(DateTime $i_datetime)
    {
        $deltaLat = 0.0;
        $deltaLong = 0.0;
        calculateAberration($i_datetime,$deltaLat,$deltaLong);
        $this->_longitude += $deltaLong;
        $this->_latitude += $deltaLat;
    }
    public function removeAberration(DateTime $i_datetime)
    {
        $deltaLat = 0.0;
        $deltaLong = 0.0;
        calculateAberration($i_datetime,$deltaLat,$deltaLong);
        $this->_longitude -= $deltaLong;
        $this->_latitude -= $deltaLat;
    }
}

function calculateRefractionTrue(float $i_trueAltitude, float $i_pressure = 101325.0, float $i_temperature_C = 15.0)
{
    $n = $i_pressure / 101325.0 * 283.0 / ($i_temperature_C + 273.15);
    return $n * 1.02 / tan(deg2rad($i_trueAltitude + 10.3 / ($i_trueAltitude + 5.11)));
}
function calculateRefractionApparent(float $i_apparentAltitude, float $i_pressure = 101325.0, float $i_temperature_C = 15.0)
{
    $n = $i_pressure / 101325.0 * 283.0 / ($i_temperature_C + 273.15);
    return $n / tan(deg2rad($i_apparentAltitude + 7.31 / ($i_apparentAltitude + 4.4)));
}
class TimeHMS
{
    public int $_h;
    public int $_m;
    public float $_s;
    public function setFromDecimalHour(float $i_decimalHour)
    {
        $hLcl = fmod($i_decimalHour, 24.0);
        if ($hLcl < 0)
        {
            $hLcl += 24.0;
        }
        $this->_h = intval(floor($hLcl));
        $this->_m = intval(floor(fmod($hLcl,1.0) * 60.0));
        $this->_s = fmod($hLcl,1.0 / 60.0) * 3600.0;
    }
    public function setFromDecimalDegrees(float $i_decimalDegrees)
    {
        $hLcl = fmod($i_decimalDegrees,360.0) / 15.0;
        if ($hLcl < 0)
        {
            $hLcl += 24.0;
        }
        $this->_h = intval(floor($hLcl));
        $this->_m = intval(floor(fmod($hLcl,1.0) * 60.0));
        $this->_s = fmod($hLcl,1.0 / 60.0) * 3600.0;
    }
    public function __toString()
    {
        return $this->_h . 'h ' . $this->_m . 'm ' . $this->_s . 's';
    }
}
class AngleDMS
{
    public int $_d;
    public int $_m;
    public float $_s;
    public function setFromDecimalDegrees(float $i_decimalDegrees)
    {
        $dLcl = fmod($i_decimalDegrees, 360.0);
        if ($dLcl < 0)
        {
            $dLcl += 360.0;
        }
        $this->_d = intval(floor($dLcl));
        $this->_m = intval(floor(fmod($dLcl, 1.0) * 60.0));
        $this->_s = fmod($dLcl, 1.0 / 60.0) * 3600.0;
    }
    public function __toString()
    {
        return $this->_d . '° ' . $this->_m . '\' ' . $this->_s . '\"';
    }
}
class MoonRiseSet
{
    public DateTime $_rise;
    public DateTime $_set;
    public function calculate(GeographicPosition $i_location, DateTime $i_date)
    {
        $expected = new MoonRiseSet();
        $expected->calculateInternal($i_location,$i_date);
        $this->_rise = $expected->_rise;
        $this->_set = $expected->_set;
        if ($this->_rise->format('d') != $i_date->format('d'))
        {
            $nextday = clone $i_date;
            $nextday->add(new DateInterval('P1D'));
            $next = new MoonRiseSet();
            $next->calculateInternal($i_location,$nextday);
            if ($next->_rise->format('d') == $i_date->format('d'))
            {
                $this->_rise = $next->_rise;
            }
            else
            {
                unset($this->_rise);
            }
        }
        if ($this->_set->format('d') != $i_date->format('d'))
        {
            print ('expected set ' . $this->_set->format('Y-m-d H:i:s') . PHP_EOL);
            $prevday = clone $i_date;
            $prevday->sub(new DateInterval('P1D'));
            $prev = new MoonRiseSet();
            $prev->calculateInternal($i_location,$prevday);
            if ($prev->_set->format('d') == $i_date->format('d'))
            {
                $this->_set = $prev->_set;
            }
            else
            {
                $nextday = clone $i_date;
                $nextday->add(new DateInterval('P1D'));
                $next = new MoonRiseSet();
                $next->calculateInternal($i_location,$nextday);
                if ($next->_set->format('d') == $i_date->format('d'))
                {
                    $this->_set = $next->_set;
                }
                unset($this->_set);
            }
        }
    }
    
    private function calculateInternal(GeographicPosition $i_location, DateTime $i_date)
    {
        $dateUTC = clone $i_date;
        $dateUTC->setTimezone(new DateTimeZone('UTC'));
        $dateOnly = $i_date->format('Y-m-d');
        
        $midnight = new DateTime($dateOnly . ' 00:00:00',new DateTimeZone('UTC'));
        $noon = new DateTime($dateOnly . ' 12:00:00',new DateTimeZone('UTC'));
        
        $moonMidnight = new MoonPosition($midnight);
        $moonMidnightEq = new EquatorialCoordinates();
        $moonMidnightEll = new EclipticCoordinates();
        $moonMidnightEll->_latitude = $moonMidnight->_eclipticLatitude;
        $moonMidnightEll->_longitude = $moonMidnight->_eclipticLongitude;
        $moonMidnightEq->getFromEcliptic($moonMidnightEll, $midnight);
        

        $moonNoon = new MoonPosition($noon);
        $moonNoonEq = new EquatorialCoordinates();
        $moonNoonEll = new EclipticCoordinates();
        $moonNoonEll->_latitude = $moonNoon->_eclipticLatitude;
        $moonNoonEll->_longitude = $moonNoon->_eclipticLongitude;
        $moonNoonEq->getFromEcliptic($moonNoonEll, $noon);
        
        $rsHAMidnight = riseSetHourAngle($i_location->_latitude, $moonMidnightEq->_declination);
        $rsHANoon = riseSetHourAngle($i_location->_latitude, $moonNoonEq->_declination);
        $LSTmidnightRise = $moonMidnightEq->_rightAscension - $rsHAMidnight;
        $LSTmidnightSet = $moonMidnightEq->_rightAscension + $rsHAMidnight;
        $LSTnoonRise = $moonNoonEq->_rightAscension - $rsHANoon;
        $LSTnoonSet = $moonNoonEq->_rightAscension + $rsHANoon;

        $GSTmidnightRise = $LSTmidnightRise - $i_location->_longitude;
        $GSTmidnightSet = $LSTmidnightSet - $i_location->_longitude;
        $GSTnoonRise = $LSTnoonRise - $i_location->_longitude;
        $GSTnoonSet = $LSTnoonSet - $i_location->_longitude;

        $DayUTC = new DateTime($dateOnly . ' 00:00:00',new DateTimeZone('UTC'));
        $T00 = new LocalSiderealTime();
        $pmeq = new GeographicPosition(0.0,0.0,0.0);
        $T00->calculate($DayUTC, $pmeq);
        if ($GSTmidnightRise < $T00->_LST)
        {
            $GSTmidnightRise += 360.0;
            $GSTnoonRise += 360.0;
        }
        if ($GSTmidnightSet < $T00->_LST)
        {
            $GSTmidnightSet += 360.0;
            $GSTnoonSet += 360.0;
        }

        $GSTrise = (180.45 * $GSTmidnightRise - $T00->_LST * ($GSTnoonRise - $GSTmidnightRise)) / (180.45 - $GSTnoonRise + $GSTmidnightRise);
        $GSTset = (180.45 * $GSTmidnightSet - $T00->_LST * ($GSTnoonSet - $GSTmidnightSet)) / (180.45 - $GSTnoonSet + $GSTmidnightSet);

        $deltaPrime = 0.5 * ($moonMidnightEq->_declination + $moonNoonEq->_declination);
        $parallax = 0.5 * ($moonMidnight->_parallax + $moonNoon->_parallax);
        $angDiameter = 0.5 * ($moonMidnight->_apparentDiameter + $moonNoon->_apparentDiameter);
        $xdeg = -$parallax + $angDiameter * 0.5 + 34.0/60.0;
        $x = deg2rad($xdeg);
        $Psi = acos(sin(deg2rad($i_location->_latitude))/cos(deg2rad($deltaPrime)));
        $y = asin(sin($x) / sin($Psi));
        //$DeltaA = asin(tan($x)/tan($Psi));
        $deltaT = 240 * rad2deg($y) / cos(deg2rad($deltaPrime)) * 15.0 / 3600.0; // degrees
        $GSTrise -= $deltaT;
        $GSTset += $deltaT;
        $GSTriseLST = new LocalSiderealTime();
        $GSTsetLST = new LocalSiderealTime();
        $GSTriseLST->_LST = $GSTrise;
        $GSTsetLST->_LST = $GSTset;

        $UTrise = new TimeHMS;
        $UTriseD = $GSTriseLST->getLT($i_date);
        $UTrise->setFromDecimalDegrees($UTriseD);
        $UTset = new TimeHMS;
        $UTsetD = $GSTsetLST->getLT($i_date);
        $UTset->setFromDecimalDegrees($UTsetD);

        $this->_rise = clone $dateUTC;
        $this->_set = clone $dateUTC;
        // set UT of rise and set
        $this->_rise->setTime($UTrise->_h, $UTrise->_m, intval($UTrise->_s));
        $this->_set->setTime($UTset->_h, $UTset->_m, intval($UTset->_s));
        // convert to desired timezone
        $this->_rise->setTimezone($i_date->getTimezone());
        $this->_set->setTimezone($i_date->getTimezone());
        
    }
}
