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
    header('Referer: editObservationManual.php');
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
}
$requestMethod = filter_input(INPUT_SERVER,'REQUEST_METHOD',FILTER_DEFAULT);
$ObsID = filter_input(INPUT_SESSION,'observationToEditID',FILTER_SANITIZE_NUMBER_INT);
$stmt = $con->query('SELECT '
    . 'observerID, obsDateZone, editOfID, '
    . 'obsTimeZone, hourAngle, hourAngleUnitsID, phase, phaseDiagram, '
    . 'latitude, longitude, timezoneID, isDST, mostRecentEdit, '
    . 'potentialErrors '
    . 'FROM observationRawManual '
    . "WHERE id = $ObsID AND observerID = $userID");
if ($stmt->rowCount() > 0)
{
    $row = $stmt->fetch();
    if (array_key_exists('editOfID',$row))
    {
        $obsOrigID = $row['editOfID'];
    }
    else
    {
        $obsOrigID = $ObsID;
    }
    $obsDate = $row['obsDateZone'];
    $obsTime = $row['obsTimeZone'];
    $obsHourAngle = $row['hourAngle'];
    $obsPhase = $row['phase'];
    $obsPhaseImage = $row['phaseDiagram'];
    $obsLatitude = $row['latitude'];
    $obsLongitude = $row['longitude'];
    $obsTZID = $row['timezoneID'];
    $obsIsDST = $row['isDST'];
    $obsErrorCodes = $row['potentialErrors'];
    try
    {
        $resultTZ = $con->query("SELECT name FROM timezones WHERE id = $obsTZID");
    }
    catch (\PDOException $e)
    {
        print($e->getMessage() . ' ' . $e->getCode());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
    $tzData = $resultTZ->fetch();
    if ($tzData)
    {
        $obsTimezoneName = $tzData['name'];
    }
    else
    {
        $noError = false;
        $_SESSION['generalerror'] = errorBox('Error retrieving ID for timezone.');
    }

    switch ($obsPhaseImage)
    {
    case 0:
    default:
        $obsPhaseSelect = 'new';
        break;
    case 1:
        $obsPhaseSelect = 'waxingCrescent';
        break;
    case 2:
        $obsPhaseSelect = 'firstQuarter';
        break;
    case 3:
        $obsPhaseSelect = 'waxingGibbous';
        break;
    case 4:
        $obsPhaseSelect = 'full';
        break;
    case 5:
        $obsPhaseSelect = 'waningGibbous';
        break;
    case 6:
        $obsPhaseSelect = 'thirdQuarter';
        break;
    case 7:
        $obsPhaseSelect = 'waningCrescent';
        break;
    }

    if ($obsErrorCodes != 0)
    {
        if ($obsErrorCodes & ObservationValidationError::dst_flag_mismatch)
        {
            $_SESSION['generalerror'] .= errorBox('DST flag does not match expected value.');
        }
        if ($obsErrorCodes & ObservationValidationError::future_datetime)
        {
            $_SESSION['generalerror'] .= errorBox('The selected date or time is in the future.');
        }
        if ($obsErrorCodes & ObservationValidationError::hour_angle_below_horizon)
        {
            $_SESSION['generalerror'] .= errorBox('The provided hour angle (# of fists) is so large that the moon would be below the horizon. Check your fist size and your measurement.');
        }
        if ($obsErrorCodes & ObservationValidationError::large_hourangle_mismatch)
        {
            $_SESSION['generalerror'] .= errorBox('The provided hour angle (# of fists) doesn\'t match the expected value for the moon. Recheck your measurement and make sure you are measuring correctly.');
        }
        if ($obsErrorCodes & ObservationValidationError::moon_not_visible)
        {
            $_SESSION['generalerror'] .= errorBox('The moon is not visible in the location you recorded at this date and time.');
        }
        if ($obsErrorCodes & ObservationValidationError::moon_too_new_to_see)
        {
            $_SESSION['generalerror'] .= errorBox('The moon is so new as to be impossible to see at this date and time. You may ignore this if the observation was during an eclipse.');
        }
        if ($obsErrorCodes & ObservationValidationError::phase_disagree)
        {
            $_SESSION['generalerror'] .= errorBox('The phase number you recorded and the image you selected don\'t agree.');
        }
        if ($obsErrorCodes & ObservationValidationError::true_phase_disagree)
        {
            $_SESSION['generalerror'] .= errorBox('The recorded phase is significantly different than the expected phase on the given time and date. Check to ensure that you correctly selected waxing/waning or first/third quarter.');
        }
    }
}
else
{
    header('Location: home.php');
    exit;
}

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
    { //@@TODO: how to check for duplicate times when editing
/*        try
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
            $row = $resFind->fetch();
            if ($row['id'] != $ObsID)
            $noError = false;
            $_SESSION['generalerror'] = errorBox('An observation at this date and time already exist.');
        }*/
    }
    if ($noError)
    {
        $tzUT = new DateTimeZone('UTC');
        $now = new DateTime('now',$tzUT);
        try
        {
            $stmt = $con->prepare('INSERT INTO observationRawManual '
                . '(observerID, entryDateTimeUT, editOfID, obsDateZone, '
                . 'obsTimeZone, hourAngle, hourAngleUnitsID, phase, phaseDiagram, '
                . 'latitude, longitude, timezoneID, isDST, mostRecentEdit, '
                . 'potentialErrors, accepted) '
                . 'VALUES (:observerID, :entryDateTime, :editID, :date, :time, :hourAngle, '
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
            $stmt->bindParam(':editID', $obsOrigID);
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
        <title>Moon Project: Edit an Observation</title>
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
            <h1>Edit an Observation</h1>
            <?php 
                echo $_SESSION['generalerror'];
            ?>
            <form accept-charset="UTF-8" action="editObservation.php" method="post" autocomplete="off">
                <label for="date">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" name="date" placeholder="Date of Observation" id="date" autocomplete="on"value="<?php echo htmlspecialchars($obsDate);?>" value=required>
                </label>
                <?php 
                    echo $_SESSION['dateerror'];
                ?>
                <label for="time">
                    <i class="fas fa-clock"></i>
                    <input type="time" name="time" placeholder="Time of Observation" id="time" autocomplete="on" step="1" value=""<?php echo htmlspecialchars($obsTime);?>" required>
                </label>
                <?php 
                    echo $_SESSION['timeerror'];
                ?>
                <label for="hourAngle">
                    <i class="fas fa-drafting-compass"></i>
                    <input type="number" name="hourAngle" placeholder="Fists" id="hourAngle" min="-15" max="15" step="0.25" autocomplete="on" value=""<?php echo htmlspecialchars($obsHourAngle);?>" required>
                </label>
                <?php 
                    echo $_SESSION['hourangleerror'];
                ?>
                
                <label for="phase">
                    <i class="fas fa-moon"></i>
                    <input type="number" name="phase" placeholder="Phase Number" id="phase" min="0" max="7.75" step="0.25" autocomplete="off" value="<?php echo htmlspecialchars($obsPhase);?>" required>
                </label>
                <?php 
                    echo $_SESSION['phaseerror'];
                ?>
                <label for="moonphaseSelect">
                    <i class="fas fa-moon"></i>
                    <select name="moonphaseSelect" id="moonphaseSelect" value="<?php echo htmlspecialchars($obsPhaseSelect); ?>">
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
                    <input type="number" name="latitude" placeholder="Latitude" id="latitude" min="-90" max="90.0" step="0.000003" value="<?php echo htmlspecialchars($obsLatitude);?>" autocomplete="off">
                </label>
                <label for="longitude">
                    <i class="fas fa-globe"></i>
                    <input type="number" name="longitude" placeholder="Longitude" id="longitude" min="-180" max="180.0" step="0.000003" value="<?php echo htmlspecialchars($obsLongitude);?>" autocomplete="off">
                </label>
                <label for="timezone">
                    <i class="fas fa-hourglass"></i>
                    <select id="timezone" name="timezone" autocomplete="on" value="<?php echo htmlspecialchars($obsTimezoneName);?>" >
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
                <input type="checkbox" name="isDST" id="isDST" value="isDST" <?php echo $obsIsDST?'checked':''; ?> >
                </label>
                <input type="submit" value="Submit">
            </form>
        </div>
    </body>
</html>

