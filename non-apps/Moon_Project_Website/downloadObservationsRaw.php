<?php
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality
session_start();

// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] == false) 
{
    header('Location: authenticate.php');
    exit();
}
$config = parse_ini_file('../../config/moon_proj_config.ini'); 

// Try and connect to the database, if a connection has not been established yet
try
{
    $con = new PDO(
        'mysql:host='.$config['servername'].
        ';dbname='.$config['dbname'].';charset=utf8mb4',
        $config['username'],
        $config['password'],
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_PERSISTENT => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false
        )
        );
}
catch (\PDOException $e)
{
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
$userData = unserialize($_SESSION['userData']);
$userID = $userData->_id;
$observationDataCSV = '';
$myObservations = new UserObservations($userID, $con);
$anObservation = new Observation();
if (!empty($myObservations->_observations))
{
    $observationDataCSV .= 'Date/Time';
    $observationDataCSV .= ', Hour Angle (fists)';
    $observationDataCSV .= ', Phase';
    $observationDataCSV .= ', Phase Number';
    $observationDataCSV .= ', Latitude';
    $observationDataCSV .= ', Longitude';
    $observationDataCSV .= ', Time Zone';
    $observationDataCSV .= ', Is DST?';
    $observationDataCSV .= '\n';

    for ($i = 0; $i < count($myObservations->_observations); $i++)
    {
        $observationDataCSV .= $anObservation->_obsZoneDateTime;
        $observationDataCSV .= ', ' . $anObservation->_hourAngle;
        $observationDataCSV .= ', ' . $anObservation->_phase;
        $observationDataCSV .= ', ' . $anObservation->_phaseDiagram;
        $observationDataCSV .= ', ' . $anObservation->_latitude;
        $observationDataCSV .= ', ' . $anObservation->_longitude;
        $observationDataCSV .= ', ' . $anObservation->_timezoneID;
        $observationDataCSV .= ', ' . $anObservation->_isDST;
        $observationDataCSV .= '\n';
    }
}
                        /* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

header('Content-Description: File Transfer');
header('Content-Disposition: attachment; filename='.'observations.csv');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . mb_strlen($observationDataCSV));
header("Content-Type: text/csv");
echo $observationDataCSV;