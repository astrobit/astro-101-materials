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
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Moon Project: Submit New Observation</title>
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
            <h1>Add an Observation</h1>
            <?php 
                echo $_SESSION['generalerror'];
            ?>
            <form accept-charset="UTF-8" action="newobservation.php" method="post" autocomplete="off">
                <label for="date">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" name="date" placeholder="Date of Observation" id="date" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['dateerror'];
                ?>
                <label for="time">
                    <i class="fas fa-clock"></i>
                    <input type="time" name="time" placeholder="Time of Observation" id="time" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['timeerror'];
                ?>
                <label for="hourAngle">
                    <i class="fas fa-drafting-compass"></i>
                    <input type="number" name="hourAngle" placeholder="Fists" id="hourAngle" min="-15" max="15" step="0.25" autocomplete="on">
                </label>
                <?php 
                    echo $_SESSION['hourangleerror'];
                ?>
                
                <label for="phase">
                    <i class="fas fa-moon"></i>
                    <input type="number" name="phase" placeholder="Phase Number" id="phase" min="0" max="7.75" step="0.25" autocomplete="off">
                </label>
                <?php 
                    echo $_SESSION['phaseerror'];
                ?>
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
                <label for="latitude">
                    <i class="fas fa-globe"></i>
                    <input type="number" name="latitude" placeholder="Latitude" id="latitude" min="-90" max="90.0" step="0.000003" autocomplete="off" value="<?php echo (isset($userLatitude) && $userLatitude >= -90.0)?$userLatitude:'';?>">
                </label>
                <label for="longitude">
                    <i class="fas fa-globe"></i>
                    <input type="number" name="longitude" placeholder="Longitude" id="longitude" min="-180" max="180.0" step="0.000003" autocomplete="off"value="<?php echo (isset($userLongitude) && $userLongitude >= -180.0)?$userLongitude:'';?>">
                </label>
                <label for="timezone">
                    <i class="fas fa-hourglass-half"></i>
                    <input type="text" name="timezone" placeholder="Timezone" id="timezone" autocomplete="on" value="<?php echo (isset($userTimeZone))?$userTimeZone:'';?>">
                </label>
                <label for="isDST" class="checkboxprompt">
                    <i class="fas fa-sun"></i>
                    <p class="checkboxprompt">Daylight Saving Time<br></p>
                <input type="checkbox" name="isDST" id="isDST" value="isDST" <?php echo (isset($userDST) && $userDST)?checked:'';?> >
                </label>
                <input type="submit" value="Submit">
            </form>
        </div>
        <?php 
            // if the user has authorized use of the geolocation data from
            // their device, use the browser's geolocation data.
            if ($userData->_useDeviceLocation)
            {
                echo '<script>'.PHP_EOL;
                echo 'function fillPosition(position)'.PHP_EOL;
                echo '{'.PHP_EOL;
                echo '    var elemLat = document.getElementById("latitude");'.PHP_EOL;
                echo '    elemLat.value = position.coords.latitude;';
                echo '    var elemLong = document.getElementById("longitude");'.PHP_EOL;
                echo '    elemLong.value = position.coords.longitude;'.PHP_EOL;
                echo '}'.PHP_EOL;
                echo 'if (navigator.geolocation)'.PHP_EOL;
                echo '{'.PHP_EOL;
                echo '    navigator.geolocation.getCurrentPosition(fillPosition);'.PHP_EOL;
                echo '}'.PHP_EOL;
                echo 'var elemTZ = document.getElementById("timezone");'.PHP_EOL;
                echo 'elemTZ.value = Intl.DateTimeFormat().resolvedOptions().timeZone;'.PHP_EOL;
                echo 'var timeNow = new Date();'.PHP_EOL;
                echo 'var JanOne = new Date(timeNow.getFullYear(),1,1);'.PHP_EOL;
                echo 'var JulOne = new Date(timeNow.getFullYear(),7,1);'.PHP_EOL;
                echo 'var JanOneOffset = JanOne.getTimezoneOffset();'.PHP_EOL;
                echo 'var JulOneOffset = JulOne.getTimezoneOffset();'.PHP_EOL;
                echo 'var isDSTNow = false;'.PHP_EOL;
                echo 'if (JanOneOffset > JulOneOffset)'.PHP_EOL;
                echo '{'.PHP_EOL;
                echo '    isDSTNow = (timeNow.getTimezoneOffset() == JulOneOffset);'.PHP_EOL;
                echo '}'.PHP_EOL;
                echo 'else if (JulOneOffset < JanOneOffset)'.PHP_EOL;
                echo '{'.PHP_EOL;
                echo '    isDSTNow = (timeNow.getTimezoneOffset() == JanOneOffset);'.PHP_EOL;
                echo '}'.PHP_EOL;
                echo 'var elemDST = document.getElementById("isDST");'.PHP_EOL;
                echo 'elemDST.checked = isDSTNow;'.PHP_EOL;
                echo '</script>'.PHP_EOL;
            }
        ?>
    </body>
</html>

