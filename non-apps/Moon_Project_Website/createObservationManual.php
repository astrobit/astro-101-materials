<?php
// We need to use sessions, so you should always start sessions using the 
// below code.
require_once 'errorBox.php';
require_once 'ClassInfo.php';
require_once 'UserData.php';
require_once 'getIP.php';
require_once 'ip-geolocation-api-php.php'; // ipgeolocation.io API for PHP
require_once 'Location.php';
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality
session_start();
$_SESSION['generalerror'] = '';
// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] == false) 
{
    header('Referer: createObservationManual.php');
    header('Location: authenticate.php');
    exit();
}
else
{
    $config = parse_ini_file('../../config/moon_proj_config.ini'); 

    // Try and connect to the database, if a connection has not been 
    // established yet
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
        print($e->getMessage() . ' ' . $e->getCode());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
    $userData = unserialize($_SESSION['userData']);
    $userID = $userData->_id;
    $name = $userData->_givenName;
    $userLatitude = -91.0;
    $userLongitude = -182.0;
    $userTimezone = '';
    $userDST = false;
    if ($userData->_useGeoIP)
    {
        $apiKey = $config['geoIPkey'];
        $ip = get_ip_address();

        $location = get_geolocation($apiKey, $ip, 
            'latitude,longitude,time_zone');
        if ($location !== false)
        {
            $decodedLocation = json_decode($location);

            $userLatitude = $decodedLocation->latitude;
            $userLongitude = $decodedLocation->longitude;
            $userTimezone = $decodedLocation->time_zone->name;
            $userDST = $decodedLocation->time_zone->is_dst;
        }
    }
    
    if ($userLatitude == -91.0 || $userLongitude == -182.0)
    {
        if (isset($userData->_locationLatitude) && !empty($userData->_locationLatitude) && $userData->_locationLatitude !== null &&
            isset($userData->_locationLongitude) && !empty($userData->_locationLongitude) && $userData->_locationLongitude !== null)
        {
            $userLatitude = $userData->_locationLatitude;
            $userLongitude = $userData->_locationLongitude;
        }
    }
    if (empty($userTimezone) && isset($userData->_timeZoneName) && !empty($userData->_timeZoneName) && $userData->_timeZoneName !== null)
    {
        $userTimezone = $userData->_timeZoneName;
        $tz = new DateTimeZone($userTimezone);
        $now = new DateTime('now',$tz);
        $userDST = ($now->format('I') == '1');
    }
    if ($userLatitude == -91.0 || $userLatitude == -182.0)
    {
        if (isset($userData->_locationID) && !empty($userData->_locationID) && $userData->_locationID !== -1)
        {
            $userLocation = new Location($userData->_locationID,$con);
            $userLatitude = $userLocation->_latitude;
            $userLongitude = $userLocation->_longitude;
            $userTimezone = $userLocation->_timezoneName;
            $tz = new DateTimeZone($userTimezone);
            $now = new DateTime('now',$tz);
            $userDST = ($now->format('I') == '1');
        }
    }
}
$requestMethod = filter_input(INPUT_SERVER,'REQUEST_METHOD',FILTER_DEFAULT);
if ($requestMethod === 'POST')
{
    $obsHourAngle = filter_input(INPUT_POST,'hourAngle',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
    $obsPhaseNumber = filter_input(INPUT_POST,'phase',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
    $obsDate = filter_input(INPUT_POST,'date',FILTER_SANITIZE_SPECIAL_CHARS);
    $obsTime = filter_input(INPUT_POST,'time',FILTER_SANITIZE_SPECIAL_CHARS);
    $obsPhaseSelect = filter_input(INPUT_POST,'moonphaseSelect',FILTER_SANITIZE_SPECIAL_CHARS);
    $obsLatitude = filter_input(INPUT_POST,'latitude',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
    $obsLongitude = filter_input(INPUT_POST,'longitude',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
    $obsTimezoneName = filter_input(INPUT_POST,'timezone',FILTER_SANITIZE_SPECIAL_CHARS);
    $obsIsDSTRaw = filter_input(INPUT_POST,'isDST',FILTER_SANITIZE_SPECIAL_CHARS);
    
    if (isset($obsIsDSTRaw))
    {
        $obsIsDST = 1;
    }
    else
    {
        $obsIsDST = 0;
    }
    $noError = true;
    try
    {
        $resultFists = $con->query('SELECT id FROM angle_units '
            . 'WHERE name = \'fists\'');
    }
    catch (\PDOException $e)
    {
        print($e->getMessage() . ' ' . $e->getCode());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
   
    $fistsData = $resultFists->fetch();
    if ($fistsData)
    {
        $obsHourAngleUnitsID = $fistsData['id'];
    }
    else
    {
        $noError = false;
        $_SESSION['generalerror'] = errorBox('Error retrieving ID for hour angle units.');
    }

    try
    {
        $resultTZ = $con->query("SELECT id FROM timezones WHERE name = '$obsTimezoneName'");
    }
    catch (\PDOException $e)
    {
        print($e->getMessage() . ' ' . $e->getCode());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
    $tzData = $resultTZ->fetch();
    if ($tzData)
    {
        $obsTimezoneID = $tzData['id'];
    }
    else
    {
        $noError = false;
        $_SESSION['generalerror'] = errorBox('Error retrieving ID for timezone.');
    }
    
    if ($obsPhaseSelect == 'new')
    {
        $obsPhaseSelectNumber = 0;
    }
    else if ($obsPhaseSelect == 'waxingCrescent')
    {
        $obsPhaseSelectNumber = 1;
    }
    else if ($obsPhaseSelect == 'firstQuarter')
    {
        $obsPhaseSelectNumber = 2;
    }
    else if ($obsPhaseSelect == 'waxingGibbous')
    {
        $obsPhaseSelectNumber = 3;
    }
    else if ($obsPhaseSelect == 'full')
    {
        $obsPhaseSelectNumber = 4;
    }
    else if ($obsPhaseSelect == 'waningGibbous')
    {
        $obsPhaseSelectNumber = 5;
    }
    else if ($obsPhaseSelect == 'thirdQuarter')
    {
        $obsPhaseSelectNumber = 6;
    }
    else if ($obsPhaseSelect == 'waningCrescent')
    {
        $obsPhaseSelectNumber = 7;
    }
    else
    {
        $noError = false;
        $_SESSION['generalerror'] = errorBox('Invalid Phase Selected.');
    }
    if ($noError)
    {
        try
        {
            $resFind = $con->query('SELECT id FROM observationRawManual '
                . "WHERE observerID = '$userData->_id' "
                . "AND obsDateZone = '$obsDate' "
                . "AND obsTimeZone = '$obsTime' ");
        }
        catch (\PDOException $e)
        {
            print($e->getMessage() . ' ' . $e->getCode());
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
        if ($resFind->rowCount() > 0)
        {
            $noError = false;
            $_SESSION['generalerror'] = errorBox('An observation at this date and time already exist.');
        }
    }
    if ($noError)
    {
        $tzUT = new DateTimeZone('UTC');
        $now = new DateTime('now',$tzUT);
        try
        {
            $stmt = $con->prepare('INSERT INTO observationRawManual '
                . '(observerID, entryDateTimeUT, obsDateZone, '
                . 'obsTimeZone, hourAngle, hourAngleUnitsID, phase, phaseDiagram, '
                . 'latitude, longitude, timezoneID, isDST, mostRecentEdit, '
                . 'potentialErrors, accepted) '
                . 'VALUES (:observerID, :entryDateTime, :date, :time, :hourAngle, '
                . ':hourAngleUnitsID, :phase, :phaseSelect, :latitude, :longitude, '
                . ':timezoneID, :dstFlag, 1, :suspicious, 0)');
        }
        catch (\PDOException $e)
        {
            print($e->getMessage() . ' ' . $e->getCode());
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
        $nowFmt = $now->format('Y-m-d H:i:s');
        try 
        {
            $stmt->bindParam(':observerID', $userData->_id, PDO::PARAM_INT);
            $stmt->bindParam(':entryDateTime', $nowFmt);
            $stmt->bindParam(':date', $obsDate);
            $stmt->bindParam(':time', $obsTime);
            $stmt->bindParam(':hourAngle', $obsHourAngle);
            $stmt->bindParam(':hourAngleUnitsID', $obsHourAngleUnitsID, PDO::PARAM_INT);
            $stmt->bindParam(':phase', $obsPhaseNumber);
            $stmt->bindParam(':phaseSelect', $obsPhaseSelectNumber, PDO::PARAM_INT);
            $stmt->bindParam(':latitude', $obsLatitude);
            $stmt->bindParam(':longitude', $obsLongitude);
            $stmt->bindParam(':timezoneID', $obsTimezoneID, PDO::PARAM_INT);
            $stmt->bindParam(':dstFlag', $obsIsDST);
            $suspicious = validateManualObservation(
                $userData->_fistSize,
                $obsDate,
                $obsTime,
                $obsTimezoneName,
                $obsHourAngle,
                $obsPhaseNumber,
                $obsPhaseSelectNumber,
                $obsLatitude,
                $obsLongitude,
                $obsIsDST
                );
             $stmt->bindParam(':suspicious',$one);
        }
        catch (\PDOException $e)
        {
            print($e->getMessage() . ' ' . $e->getCode());
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
        try 
        {
            if (!$stmt->execute())
            {
                $_SESSION['generalerror'] = errorBox($stmt->errorInfo() . ' ' . $stmt->errorCode());
                $noError = false;
            }
        }
        catch (\PDOException $e)
        {
            print($e->getMessage() . ' ' . $e->getCode());
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
        if ($noError)
        {
            try
            {
                $resFind = $con->query('SELECT id FROM observationRawManual '
                    . "WHERE observerID = '$userData->_id' "
                    . "AND entryDateTimeUT = '$nowFmt' ");
            }
            catch (\PDOException $e)
            {
                print($e->getMessage() . ' ' . $e->getCode());
                throw new \PDOException($e->getMessage(), (int)$e->getCode());
            }

            if ($resFind->rowCount() > 0)
            {
                $row = $resFind->fetch();
                $_SESSION['observationToEditID'] = $row['id'];
                if (($suspicious & ~ObservationValidationError::moon_suspiciously_near_phase) != 0)
                {
                    header('Location: editObservation.php');
                }
                else
                {
                    header('Location: home.php');
                }
                exit();
            }
            else
            {
                $_SESSION['generalerror'] = errorBox('Error recording observation.');
                $noError = false;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Moon Project: Record New Observation</title>
        <script src="https://kit.fontawesome.com/210f2f19d7.js" 
        crossorigin="anonymous"></script><!-- fontawesome kit -->
        <link href="style.css" rel="stylesheet" type="text/css">
        <link rel="stylesheet" 
              href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
        <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <script>
        $( function() {
          $.widget( "custom.iconselectmenu", $.ui.selectmenu, {
            _renderItem: function( ul, item ) {
              var li = $( "<li>" ),
                wrapper = $( "<div>", { text: item.label } );

              if ( item.disabled ) {
                li.addClass( "ui-state-disabled" );
              }

              $( "<span>", {
                style: item.element.attr( "data-style" ),
                "class": "ui-icon " + item.element.attr( "data-class" )
              })
                .appendTo( wrapper );

              return li.append( wrapper ).appendTo( ul );
            }
          });


          $( "#moonphaseSelect" )
            .iconselectmenu()
            .iconselectmenu( "menuWidget" )
              .addClass( "ui-menu-icons customicons" );

        } );
        </script>
        <style>
            /* select with custom icons */
             .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item-wrapper {
               padding: 0.5em 0 0.5em 3em;
             }
             .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item .ui-icon {
               height: 30px;
               width: 30px;
               top: 0.1em;
             }

            .ui-icon.new-moon{
              background: url("images/moonNew24.png") 0 0 no-repeat;
            }
            .ui-icon.waxing-crescent-moon{
              background: url("images/moonWxC24.png") 0 0 no-repeat;
            }
            .ui-icon.first-quarter-moon{
              background: url("images/moonFQ24.png") 0 0 no-repeat;
            }
            .ui-icon.waxing-gibbous-moon{
              background: url("images/moonWxG24.png") 0 0 no-repeat;
            }
            .ui-icon.full-moon{
              background: url("images/moonFull24.png") 0 0 no-repeat;
            }
            .ui-icon.waning-gibbous-moon{
              background: url("images/moonWnG24.png") 0 0 no-repeat;
            }
            .ui-icon.third-quarter-moon{
              background: url("images/moonTQ24.png") 0 0 no-repeat;
            }
            .ui-icon.waning-crescent-moon{
              background: url("images/moonWnC24.png") 0 0 no-repeat;
            }
            .option{
                 padding:5px 0;
                 font-size:xx-large;
            }
        </style>
    </head>
    <body>
        <div class="register">
            <h1>Record an Observation</h1>
            <?php 
                echo $_SESSION['generalerror'];
            ?>
            <form accept-charset="UTF-8" action="createObservationManual.php" method="post" autocomplete="off">
                <label for="date">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" name="date" placeholder="Date of Observation" id="date" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['dateerror'];
                ?>
                <label for="time">
                    <i class="fas fa-clock"></i>
                    <input type="time" name="time" placeholder="Time of Observation" id="time" autocomplete="on" step="1" required>
                </label>
                <?php 
                    echo $_SESSION['timeerror'];
                ?>
                <input type="button" name="getCurrentTime" id="getCurrentTime" onclick="fillTime();" value="Get Current Time">
                <label for="hourAngle">
                    <i class="fas fa-drafting-compass"></i>
                    <input type="number" name="hourAngle" placeholder="Fists" id="hourAngle" min="-15" max="15" step="0.25" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['hourangleerror'];
                ?>
                
                <label for="phase">
                    <i class="fas fa-moon"></i>
                    <input type="number" name="phase" placeholder="Phase Number" id="phase" min="0" max="7.75" step="0.25" autocomplete="off" required>
                </label>
                <?php 
                    echo $_SESSION['phaseerror'];
                ?>
                <label for="moonphaseSelect">
                    <i class="fas fa-moon"></i>
                    <select name="moonphaseSelect" id="moonphaseSelect">
                        <option value="default" disabled>Select the Phase</option>
                        <option value="new" data-class="new-moon">New Moon</option>
                        <option value="waxingCrescent" data-class="waxing-crescent-moon">Waxing Crescent</option>
                        <option value="firstQuarter" data-class="first-quarter-moon" >First Quarter</option>
                        <option value="waxingGibbous" data-class="waxing-gibbous-moon" >Waxing Gibbous</option>
                        <option value="full" data-class="full-moon" >Full Moon</option>
                        <option value="waningGibbous" data-class="waning-gibbous-moon" >Waning Gibbous</option>
                        <option value="thirdQuarter" data-class="third-quarter-moon" >Third Quarter</option>
                        <option value="waningCrescent" data-class="waning-crescent-moon">Waning Crescent</option>
                    </select>
                </label>
                <label for="latitude">
                    <i class="fas fa-globe"></i>
                    <input type="number" name="latitude" placeholder="Latitude" id="latitude" min="-90" max="90.0" step="0.000003" autocomplete="off">
                </label>
                <label for="longitude">
                    <i class="fas fa-globe"></i>
                    <input type="number" name="longitude" placeholder="Longitude" id="longitude" min="-180" max="180.0" step="0.000003" autocomplete="off">
                </label>
                <label for="getLocation">
                    <input type="button" name="getLocation" id="getLocation" onclick="fillLocation();" value="Get My Location">
                </label>
                <label for="timezone">
                    <i class="fas fa-hourglass"></i>
                    <select id="timezone" name="timezone" autocomplete="on">
                        <option value="default" disabled>Select Your Current Timezone</option>
                    <?php
                        $tzList = DateTimeZone::listIdentifiers();
                        foreach ($tzList as $tz)
                        {
                            echo "<option value=\"$tz\">$tz</option>".PHP_EOL;
                        }
                    ?>
                    </select>
                </label>
                <label for="isDST" class="checkboxprompt">
                    <i class="fas fa-sun"></i>
                    <p class="checkboxprompt">Daylight Saving Time<br></p>
                <input type="checkbox" name="isDST" id="isDST" value="isDST">
                </label>
                <input type="submit" value="Submit">
            </form>
        </div>
        <script>
            function roundLatLong(value, roundTo)
            {
                var roundUp = 0.5 * roundTo;
                var roundDown = -0.5 * roundTo;
                var small = value % roundTo;
                var rounded = value - small;
                if (small >= roundUp)
                {
                    rounded += roundTo;
                }
                else if (small <= roundDown)
                {
                    rounded -= roundTo;
                }
                return rounded;
            }
            <?php 
                // if the user has authorized use of the geolocation data from
                // their device, use the browser's geolocation data.
                if ($userData->_useDeviceLocation)
                {
                    
                    echo 'function fillPosition(position)'.PHP_EOL;
                    echo '{'.PHP_EOL;
                    echo '    var elemLat = document.getElementById(\'latitude\');'.PHP_EOL;
                    echo '    elemLat.value = roundLatLong(position.coords.latitude,0.000003);'.PHP_EOL;
                    echo '    var elemLong = document.getElementById(\'longitude\');'.PHP_EOL;
                    echo '    elemLong.value = roundLatLong(position.coords.longitude,0.000003);'.PHP_EOL;
                    echo '}'.PHP_EOL;
                    echo 'function fillLocation()'.PHP_EOL;
                    echo '{'.PHP_EOL;
                    echo '    if (navigator.geolocation)'.PHP_EOL;
                    echo '    {'.PHP_EOL;
                    echo '        navigator.geolocation.getCurrentPosition(fillPosition);'.PHP_EOL;
                    echo '    }'.PHP_EOL;
                    echo '}'.PHP_EOL;
                }
                else
                {
                    echo 'function fillLocation()'.PHP_EOL;
                    echo '{'.PHP_EOL;
                    echo '    var elemLat = document.getElementById(\'latitude\');'.PHP_EOL;
                    echo "    elemLat.value = roundLatLong($userLatitude,0.000003);".PHP_EOL;
                    echo '    var elemLong = document.getElementById(\'longitude\');'.PHP_EOL;
                    echo "    elemLong.value = roundLatLong($userLongitude,0.000003);".PHP_EOL;
                    echo '}'.PHP_EOL;
                }
            ?>
            var elemTZ = document.getElementById("timezone");
            elemTZ.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
            var timeNow = new Date();
            var JanOne = new Date(timeNow.getFullYear(),1,1);
            var JulOne = new Date(timeNow.getFullYear(),7,1);
            var JanOneOffset = JanOne.getTimezoneOffset();
            var JulOneOffset = JulOne.getTimezoneOffset();
            var isDSTNow = false;
            if (JanOneOffset > JulOneOffset)
            {
                isDSTNow = (timeNow.getTimezoneOffset() === JulOneOffset);
            }
            else if (JulOneOffset < JanOneOffset)
            {
                isDSTNow = (timeNow.getTimezoneOffset() === JanOneOffset);
            }
            var elemDST = document.getElementById("isDST");
            elemDST.checked = isDSTNow;
            function fillTime()
            {
                var elemDate = document.getElementById("date");
                var elemTime = document.getElementById("time");
                var now = new Date();
                elemDate.value = now.getFullYear() + "-" + (now.getMonth()+'').padStart(2,"0") + "-" + (now.getDate()+'').padStart(2,"0");
                elemTime.value = (now.getHours()+'').padStart(2,"0")+ ":" + (now.getMinutes()+'').padStart(2,"0") + ":" + (now.getSeconds()+'').padStart(2,"0");
            }
        </script>
    </body>
</html>

