<?php
session_start();

$config = parse_ini_file('../../config/moon_proj_config.ini'); 


// Try and connect to the database, if a connection has not been established yet
$con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
//$con = mysqli_connect('localhost','moonproject','7c3J0r*nO0M#0rD$s@P','moon_project');
//$con = mysqli_connect('localhost','root','yr3v0c$iDSST','moon_project');
//$con = mysqli_connect('localhost','root','colombia','moon_project');
if ( mysqli_connect_errno() ) {
	// If there is an error with the connection, stop the script and display the error.
	die ('Failed to connect to MySQL: ' . mysqli_connect_error());
}

// Now we check if the data from the login form was submitted, isset() will check if the data exists.
if ( !isset($_POST['date']) ) {
	// Could not get the data that should have been sent.
	die ('The date of the observation is required');
}

if ( !isset($_POST['time']) ) {
	// Could not get the data that should have been sent.
	die ('The time of the observation is required');
}

if ( !isset($_POST['fists']) ) {
	// Could not get the data that should have been sent.
	die ('The number of fists is required.');
}

if ( !isset($_POST['phase']) ) {
	// Could not get the data that should have been sent.
	die ('The numeric phase is required.');
}

if ( !isset($_POST['direction']) || $_POST['direction'] == 'notspecified') {
	// Could not get the data that should have been sent.
	die ('The direction must be specified.');
}

if ( !isset($_POST['phaseimage']) || $_POST['phaseimage'] == 'notspecified') {
	// Could not get the data that should have been sent.
	die ('The phase must be selected.');
}
$observationErrorList = "";
$hasFatalErrors = false;
// for now, use St. Edward's University location
$ObsLong = $_SESSION['longitude'];
$ObsLat = $_SESSION['latitude'];
// for the moment, assume US CDT
$ObsTimeRelUTC = $_SESSION['timeZone'];
$ObsObservesDST = $_SESSION['observesDST'];
//
$ObsFistSize = $_SESSION['fistsize'];
/// calculate latitude in radians
$ObsLatRad = $ObsLat * M_PI / 180.0;

//@@TODO DST for different years / countries. For now, use the USA DST
class DSTtimes
{
	public $year;
	public $jdStart;
	public $jdEnd;
	function __construct($year, $startMonth, $startDay, $endMonth, $endDay) {
		$this->year = $year;
		$this->jdStart = gregoriantojd($startMonth,$startDay,$year) - 10.0/12.0;
		$this->jdEnd = gregoriantojd($endMonth,$endDay,$year) - 11.0/12.0;
	}
}

$DSTlist = new array();
array_push($DSTlist,new DSTtimes(2020,3,8,11,1));
array_push($DSTlist,new DSTtimes(2021,3,14,11,7));
array_push($DSTlist,new DSTtimes(2022,3,13,11,6));
array_push($DSTlist,new DSTtimes(2023,3,12,11,5));
array_push($DSTlist,new DSTtimes(2024,3,10,11,3));
array_push($DSTlist,new DSTtimes(2025,3,9,11,2));
array_push($DSTlist,new DSTtimes(2026,3,8,11,1));



// test date and time to ensure that the moon was really visible

$day = substr($_POST['date'],8,2);
$month = substr($_POST['date'],5,2);
$year = substr($_POST['date'],0,4);
$hour = substr($_POST['time'],0,2);
$minute = substr($_POST['time'],3,2);

$timedecimal = intval($hour) + intval($minute) / 60.0;
//$localTimeDegrees = $timedecimalUTC * 15.0 + $ObsLong;

$jd = gregoriantojd(intval($month), intval($day), intval($year)) + $timedecimal / 24.0 - 0.5;
$ObsDSTCorrection = 0;
if ($ObsObservesDST)
{
	foreach ($DSTlist as $dst)
	{
		if ($jd >= $dst->$jdStart && $jd <= $dst->$jdEnd)
		{
			$ObsDSTCorrection = 1;
		}
		else if ($jd < $dst->$jdStart)
			break; // looking at future dates, no need to keep processing
	}
}


$ObsZone = $ObsDSTCorrection + $ObsTimeRelUTC;
$jdUTC = $jd + $ObsZone / 24.0;
$timedecimalUTC = $timedecimal + $ObsZone;
if ($timedecimalUTC < 0.0)
	$timedecimalUTC += 24.0;
else if ($timedecimalUTC >= 24.0)
	$timedecimalUTC -= 24.0;
$LocalTime = $timedecimalUTC + $ObsLong / 15.0;
if ($LocalTime < 0.0)
	$LocalTime += 24.0;
else if ($LocalTime >= 24.0)
	$LocalTime -= 24.0;

$jdVE2000 = gregoriantojd(3, 20, 2000) + (7.0 + 35.0 / 60.0) / 24.0 - 0.5;
$jdNewMoonMar2020 = gregoriantojd(3, 24, 2020) + (9.0 + 29.0 / 60.0) / 24.0 - 0.5;




// calculate expected RA of Moon and Sun on date
// RA and Dec of mean Sun on date. @@TODO Does not account for ellipticity of Earth's orbit
$eclipLongSun = fmod(($jdUTC - $jdVE2000) / 365.2421896698,1.0);
if ($eclipLongSun < 0)
	$eclipLongSun += 1.0;
$eclipLongSunRad = $eclipLongSun * 2.0 * M_PI;
$eclipXSun = cos($eclipLongSunRad);
$eclipYSun = sin($eclipLongSunRad);
$eclipZSun = 0;
$oblquity = 23.43663;
$oblquityRad = $oblquity * M_PI / 180.0;
$cosObliq = cos($oblquityRad);
$sinObliq = sin($oblquityRad);
$equXSun = $eclipXSun;
$equYSun = $cosObliq * $eclipYSun;
$equZSun = $sinObliq * $eclipYSun;


$RASun = atan2($equYSun,$equXSun) * 180.0 / M_PI;
$DecSun = asin($equZSun) * 180.0 / M_PI;


// expected phase angle of the Moon
$expElongationMoon = fmod(($jdUTC - $jdNewMoonMar2020) / 29.530587981 * 360.0,360.0);
if ($expElongationMoon < 0)
	$expElongationMoon += 360.0;

// test phase to ensure that it matches the selected image and that is is approximately consistent with expected values
$userAng = floatval($_POST['phase']) * 45.0;
switch ($_POST['phaseimage']) {
	case 'new':
		$userAngPhaseDiagram = 0.0;
		$userPhaseImage = 0;
		break;
	case 'waxingcrescent':
		$userAngPhaseDiagram = 45.0;
		$userPhaseImage = 1;
		break;
	case 'firstquarter':
		$userAngPhaseDiagram = 90.0;
		$userPhaseImage = 2;
		break;
	case 'waxinggibbous':
		$userAngPhaseDiagram = 135.0;
		$userPhaseImage = 3;
		break;
	case 'full':
		$userAngPhaseDiagram = 180.0;
		$userPhaseImage = 4;
		break;
	case 'waninggibbous':
		$userAngPhaseDiagram = 225.0;
		$userPhaseImage = 5;
		break;
	case 'thirdquarter':
		$userAngPhaseDiagram = 270.0;
		$userPhaseImage = 6;
		break;
	case 'waningcrescent':
		$userAngPhaseDiagram = 315.0;
		$userPhaseImage = 7;
		break;
	default:
		$observationErrorList = $observationErrorList . "<p>- You must select a phase image.</p><br>"
		break;
	}
	
if ($userAngPhaseDiagram < 45 && $userAng > 315)
{
	$userAng -= 360.0;
}
else if ($userAngPhaseDiagram > 315 && $userAng < 45)
{
	$userAngPhaseDiagram -= 360.0;
}

if (abs($userAngPhaseDiagram - $userAng) > 67.5)
{
	// mismatch in the user selected phase and phase diagram
	$observationErrorList = $observationErrorList . "<p>- The phase number you have selected does not match the picture you selected.</p><br>"
}
if ($userAng < 45 && $expElongationMoon > 315)
{
	$userAng += 360.0;
}
else if ($userAng > 315 && $expElongationMoon < 45)
{
	$userAng -= 360.0;
}
if (abs($expElongationMoon - $userAng) > 67.5)
{
	// mismatch in the user selected phase and the expected phase
	$observationErrorList = $observationErrorList . "<p>- The phase number differs significantly from the expected phase.</p><br>"
}

// estimate rise and set times based on solar RA and expected phase

$eclipLongMoon = fmod($eclipLongSun + $expElongationMoon,360.0);
$eclipLongMoonRad = $eclipLongMoon * 2.0 * M_PI;
// Note: The obliquity of the orbit of the moon is not accounted for here, so there will be an error of up to 5 degrees
$eclipXMoon = cos($eclipLongMoonRad);
$eclipYMoon = sin($eclipLongMoonRad);
$eclipZMoon = 0; 
$equXMoon = $eclipXMoon;
$equYMoon = $cosObliq * $eclipYMoon;
$equZMoon = $sinObliq * $eclipYMoon;


$RAMoon = atan2($equYMoon,$equXMoon) * 180.0 / M_PI;
$DecMoonRad = asin($equZMoon);

$HAMoonSet = acos(-tan($DecMoonRad) * tan($ObsLatRad)) * 12.0 / M_PI;
$UTCMoonRiseLocal = 12.0 - $expElongationMoon/15.0 - $ObsLong / 15.0 - $HAMoonSet;
if ($UTCMoonRiseLocal < 0.0)
	$UTCMoonRiseLocal = fmod($UTCMoonRiseLocal,24.0) + 24.0;
	
$UTCMoonSetLocal = 12.0 - $expElongationMoon/ 15.0 - $ObsLong / 15.0 + $HAMoonSet;
if ($UTCMoonSetLocal < 0.0)
	$UTCMoonSetLocal = fmod($UTCMoonSetLocal,24.0) + 24.0;
if ($UTCMoonSetLocal >= 24.0)
	$UTCMoonSetLocal -= 24.0;
	
if ($UTCMoonSetLocal < $UTCMoonRiseLocal && $timedecimalUTC > ($UTCMoonSetLocal + 1.0) && $timedecimalUTC < ($UTCMoonRiseLocal - 1.0))
{
	// Moon is probably not visible
	$observationErrorList = $observationErrorList . "<p>- The Moon is not visible in your location at the time you have selected.</p><br>"
}
else if ($UTCMoonSetLocal > $UTCMoonRiseLocal && $timedecimalUTC > $UTCMoonSetLocal || $timedecimalUTC < $UTCMoonRiseLocal)
{
	$observationErrorList = $observationErrorList . "<p>- The Moon is not visible in your location at the time you have selected.</p><br>"
}

// test direction to ensure that it is approximately consistent with expected values
$ExpectedHA = fmod($LocalTime - $expElongationMoon / 15.0,24.0);
if ($ExpectedHA > 12.0)
	$ExpectedHA -= 24.0;
else if ($ExpectedHA < -12.0)
	$ExpectedHA += 24.0;

$MeasuredHA = floatval($_POST['fists']) * $ObsFistSize / 15.0;
if ($MeasuredHA > 12.0)
{
	// Measured HA is more than 12h, incorrect fist size or incorrect measurement
	$observationErrorList = $observationErrorList . "<p>- The number of fists combined with your fist size result in an hour angle greater than +/- 12h.</p><br>"
}

if ($_POST['direction'] == 'left')
	$MeasuredHA *= -1.0;
	
if (abs($MeasuredHA - $ExpectedHA) > 2)
{
	// Significant difference between expected and measured HA
	$observationErrorList = $observationErrorList . "<p>- There was a large difference between the observed position and the expected position for the given date, time, and location of your observation.</p><br>"
}

// test observation date and time and phase to see if they correspond to likely published values
//header('Location: home.php');
if ($hasFatalErrors)
{
	$_SESSION['observation_errors'] = "<div id='observationErrors' style='z-layer:1;background-color:#FFFFFF;height:300px;width:300px;top:150px;left:150px;position:absolute;visibility:hidden;' onclick='hideDiv(\"observationErrors\")'><h2> The observations were not accepted for the following reasons:</h2>" . $observationErrorList . "</div>";
}
else
{
	if ($stmt = $con->prepare('INSERT INTO observationsManual (date,time,observerID,fists,phase,phaseimage,observerLatitude,observerLongitude,observerZone,observerDST) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')) {
			
		$dateInsert = $year . '-' . $month . '-' . $day;
		$timeInsert = $hour . ":" . $minute . ":00";
		
		$fistsValInsert = floatval($_POST['fists']);
		if ($_POST['direction'] == 'left')
			$fistsValInsert *= -1.0;
		$fistsInsert = strval($fistsValInsert);
		
		if ($stmt->bind_param('sssssssss', $dateInsert, $timeInsert, $_SESSION['id'], $fistsInsert, $_POST['phase'], $userPhaseImage, strval($ObsLat), strval($ObsLong), strval($ObsTimeRelUTC), strval($ObsDSTCorrection)) )
//			if ($stmt->bind_param('ss', $_POST['username'], $password) )
		{
//				echo 'Error state (bind) ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
//				print_r($stmt->error_list);
			echo ' execute insert ';
			if ($stmt->execute() )
}
?>

