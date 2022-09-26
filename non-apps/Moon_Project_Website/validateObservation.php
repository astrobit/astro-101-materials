<?php
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality
require_once 'ip-geolocation-api-php.php';
require_once 'astronomy.php';

class ObservationValidationError
{
    public const future_datetime = 0x1;
    public const moon_not_visible = 0x2;
    public const phase_disagree = 0x4;
    public const hour_angle_below_horizon = 0x08;
    public const moon_too_new_to_see = 0x10;
    public const moon_suspiciously_near_phase = 0x20;
    public const true_phase_disagree = 0x40;
    public const dst_flag_mismatch = 0x80;
    public const large_hourangle_mismatch = 0x100;
}
require_once 'astronomy.php';


function validateManualObservation(
    float $i_userFistSize,
    string $i_date,
    string $i_time,
    string $i_timezone,
    string $i_hourAngle,
    float $i_phase,
    float $i_phaseSelected,
    float $i_latitude,
    float $i_longitude,
    bool $i_dst
    )
{
    $ret = 0;
    $tzUser = new DateTimeZone($i_timezone);
    $now = new DateTime('now',$tzUser);
    $obsDateTime = new DateTime($i_date . ' ' . $i_time,$tzUser);
    if ($obsDateTime > $now)
    {
        $ret |= ObservationValidationError::future_datetime;
    }
    $obsHourAngleDeg = $i_hourAngle * $i_userFistSize;
    $config = parse_ini_file('../../config/moon_proj_config.ini'); 
    $apiKey = $config['geoIPkey'];
    // retreive astronomy information for the specified location
    $moonInfo = get_astronomy($apiKey,$i_latitude,$i_longitude,$i_date);
    if (isset($moonInfo) && !empty($moonInfo) && $moonInfo !== null && $moonInfo !== false)
    {
        $moonInfoDec = json_decode($moonInfo);
        // make sure the moon was visible when the observation supposedly occurred.
        if (isset($moonInfoDec->moonrise))
        {
            $moonRise = new DateTime($i_date . ' ' . $moonInfoDec->moonrise,$tzUser);
        }
        if (isset($moonInfoDec->moonset))
        {
            $moonSet = new DateTime($i_date . ' ' . $moonInfoDec->moonset,$tzUser);
        }
        if (isset($moonInfoDec->moonrise) && isset($moonInfoDec->moonset))
        {
            if ($moonSet < $moonRise)
            {
                if ($obsDateTime > $moonSet && $obsDateTime < $moonRise)
                {
//                    echo 'between moonset and rise' . PHP_EOL;
                    $ret |= ObservationValidationError::moon_not_visible;
                }
            }
            else
            {
                if ($obsDateTime > $moonSet || $obsDateTime < $moonRise)
                {
//                    echo 'before rise or after set' . PHP_EOL;
                    $ret |= ObservationValidationError::moon_not_visible;
                }
            }
        }
        else if (isset($moonInfoDec->moonrise))
        {
            if ($obsDateTime < $moonRise)
            {
//                    echo 'before rise ' . PHP_EOL;
                    $ret |= ObservationValidationError::moon_not_visible;
            }
        }
        else if (isset($moonInfoDec->moonset))
        {
            if ($obsDateTime > $moonSet)
            {
//                    echo 'after set ' . PHP_EOL;
                    $ret |= ObservationValidationError::moon_not_visible;
            }
        }
    }
    // check that the numeric phase and the selected phase diagram agree
    $phaseDiff = $i_phase - $i_phaseSelected;
    if ($phaseDiff > 4.0)
    {
        $phaseDiff -= 8.0;
    }
    else if ($phaseDiff < -4.0)
    {
        $phaseDiff += 8.0;
    }
    if (abs($phaseDiff) > 0.75)
    {
//                    echo 'phase diff' . $phaseDiff . PHP_EOL;
        $ret |= ObservationValidationError::phase_disagree;
    }

    $riseSetHA = riseSetHourAngle($i_latitude,0.0);
    if (abs($obsHourAngleDeg) > abs($riseSetHA))
    {
//                    echo 'HA' . $obsHourAngleDeg . ' ' . $riseSetHA . PHP_EOL;
        $ret |= ObservationValidationError::hour_angle_below_horizon;
    }
    
    $moon = new MoonPosition($obsDateTime);
    if ($moon->_phaseNumber < 0.17 || $moon->_phaseNumber > 7.83)
    {
//                    echo 'new' . $moon->_phaseNumber . PHP_EOL;
        $ret |= ObservationValidationError::moon_too_new_to_see;
    }
    $mphDelta = fmod($moon->_phaseNumber, 1.0);
    if ($mphDelta < 0.002 || $mphDelta > 0.998)
    {
//                    echo 'near phase' . $moon->_phaseNumber . PHP_EOL;
        $ret |= ObservationValidationError::moon_suspiciously_near_phase;
    }
    // check that the numeric phase and the selected phase diagram agree
    $phaseDiffTrue = $i_phase - $moon->_phaseNumber;
    if ($phaseDiffTrue > 4.0)
    {
        $phaseDiffTrue -= 8.0;
    }
    else if ($phaseDiffTrue < -4.0)
    {
        $phaseDiffTrue += 8.0;
    }
    if (abs($phaseDiffTrue) > 0.75)
    {
//                    echo 'true phase disagree' . $phaseDiffTrue . ' ' . $moon->_phaseNumber . ' ' . $i_phase . PHP_EOL;
        $ret |= ObservationValidationError::true_phase_disagree;
    }
    
    $location = new GeographicPosition($i_latitude,$i_longitude);
    $moonCoordEcliptic = new EclipticCoordinates();
    $moonCoordEcliptic->_latitude = $moon->_eclipticLatitude;
    $moonCoordEcliptic->_longitude = $moon->_eclipticLongitude;
    $moonCoordEq = new EquatorialCoordinates();
    $moonCoordEq->getFromEcliptic($moonCoordEcliptic, $obsDateTime);
    $moonCoordLcl = new LocalEquatorialCoordinates(0,0);
    $LST = new LocalSiderealTime();
    $LST->calculate($obsDateTime, $location);
    $moonCoordLcl->getFromEquatorial($moonCoordEq, $LST);
    
    $hadiff = normalizeAngle($moonCoordLcl->_hourAngle - $obsHourAngleDeg) - 180.0;
    
    if (abs($hadiff) > 20.0 && abs($hadiff) < 160.0)
    {
//                    echo 'HA disagree' . $moonCoordLcl->_hourAngle . ' ' . $obsHourAngleDeg . ' ' . $hadiff . PHP_EOL;
        $ret |= ObservationValidationError::large_hourangle_mismatch;
    }
    
    $janOne = clone $obsDateTime;
    $janOne->setDate($obsDateTime->format('Y'), 1, 1);
    $julOne = clone $obsDateTime;
    $julOne->setDate($obsDateTime->format('Y'), 7, 1);
    $janOneOffset = $janOne->getOffset();
    $julOneOffset = $julOne->getOffset();
    $isDST = false;
    
    if ($janOneOffset < $julOneOffset)
    {
        $isDST = ($obsDateTime->getOffset() === $julOneOffset);
    }
    else if ($julOneOffset < $janOneOffset)
    {
        $isDST = ($obsDateTime->getOffset() === $janOneOffset);
    }
    if ($isDST != $i_dst)
    {
//                    echo 'DST mismatch ' . $isDST . ' blah ' . $i_dst . PHP_EOL;
        $ret |= ObservationValidationError::dst_flag_mismatch;
    }
    
    return $ret;
}
