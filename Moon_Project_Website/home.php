<?php
// We need to use sessions, so you should always start sessions using the below code.
require_once 'errorBox.php';
require_once 'ClassInfo.php';
require_once 'UserData.php';
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality
session_start();

// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] == false) 
{
    header('Location: authenticate.php');
    exit();
}
else
{
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
    $userData = new UserData();
    $userData->deserializeSession();
    $userID = $userData->_id;
    $name = $userData->_givenName;
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Home Page</title>
        <link href="style.css" rel="stylesheet" type="text/css">
        <script src="https://kit.fontawesome.com/210f2f19d7.js" crossorigin="anonymous"></script><!-- fontawesome kit -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.css" />
    </head>
    <body class="loggedin">
        <nav class="navtop">
            <div>
                <h1>Moon Observing Project</h1>
                <a href="home.php"><i class="fas fa-home"></i>Home</a>
                <a href="profile.php"><i class="fas fa-user-circle"></i>Profile</a>
                <a href="logout.php"><i class="fas fa-sign-out-alt"></i>Logout</a>
            </div>
        </nav>
        <div class="content">
            <h2>Home Page</h2>
            <p>Welcome back, <?= $name ?>!</p>
            <div>
                <?php 
                    include_once 'UserClasses.php';
                    $myClasses = new UserClasses($userID, $con);
                    echo '<h3> Current classes </h3>';
                    $aClass = new ClassInfo();
                    if (!empty($myClasses->_currentClasses))
                    {
                        echo '<h3> Upcoming classes </h3></br>';
                        echo '<table class="tableClassList" name="tableUpcomingClasses">';
                        for ($i = 0; $i < count($myClasses->_currentClasses); $i++)
                        {
                            $aClass = $myClasses->_currentClasses[$i];
                            echo "<tr>";
                            echo "<td>";
                            echo htmlentities($aClass->_description, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_start, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_end, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "</tr>";
                        }
                        echo '</table>';
                    }
                    else
                    {
                        echo '<p>No Current Classes</p>';
                    }
                    echo '<h3> Upcoming Classes</h3>';
                    if (!empty($myClasses->_upcomingClasses))
                    {
                        echo '<table class="tableClassList" name="tableUpcomingClasses">';
                        for ($i = 0; $i < count($myClasses->_upcomingClasses); $i++)
                        {
                            $aClass = $myClasses->_upcomingClasses[$i];
                            echo "<tr>";
                            echo "<td>";
                            echo htmlentities($aClass->_description, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_start, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_end, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "</tr>";
                        }
                        echo '</table>';
                    }
                    else
                    {
                        echo '<p>No Upcoming Classes</p>';
                    }
                    echo '<h3> Prior classes </h3>';
                    if (!empty($myClasses->_previousClasses))
                    {
                        echo '<table class="tableClassList" name="tableUpcomingClasses">';
                        for ($i = 0; $i < count($myClasses->_previousClasses); $i++)
                        {
                            $aClass = $myClasses->_previousClasses[$i];
                            echo "<tr>";
                            echo "<td>";
                            echo htmlentities($aClass->_description, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_start, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($aClass->_end, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "</tr>";
                        }
                        echo '</table>';
                    }
                    else
                    {
                        echo '<p>No Previous Classes</p>';
                    }
                    if ($userData->_permissions == UserPermissions::instructor ||
                        $userData->_permissions == UserPermissions::instructor_researcher ||
                        $userData->_permissions == UserPermissions::administrator)
                    {
                        echo '<a href="createClass.php"><button class="btn btn-default btn-lg">Create a New Class<br></button></a>';
                    }
                ?>
            </div>
            <div>
                <?php 
                    include_once 'UserObservations.php';
                    echo '<h2> My Observations </h2>';
                    $myObservations = new UserObservations($userID, $con);
                    $anObservation = new Observation();
                    if (!empty($myObservations->_observations))
                    {
                        echo '<table class="tableObservations" name="tableObservations">';
                        for ($i = 0; $i < count($myObservations->_observations); $i++)
                        {
                            $anObservation = $myObservations->_observations[$i];
                            echo "<tr>";
                            echo "<td>";
                            echo $anObservation->_obsZoneDateTime;
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_hourAngle, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_phase, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            switch ($anObservation->_phaseDiagram)
                            {
                            case 0:
                            default:
                                echo '<img src="images/moonNew.png" alt="New Moon">';
                                break;
                            case 1:
                                echo '<img src="images/moonWxC.png" alt="Waxing Crescent">';
                                break;
                            case 2:
                                echo '<img src="images/moonFQ.png" alt="First Quarter">';
                                break;
                            case 3:
                                echo '<img src="images/moonWxG.png" alt="Waxing Gibbous">';
                                break;
                            case 4:
                                echo '<img src="images/moonFull.png" alt="Full Moon">';
                                break;
                            case 5:
                                echo '<img src="images/moonWnG.png" alt="Waning Gibbous">';
                                break;
                            case 6:
                                echo '<img src="images/moonTQ.png" alt="Third Quarter">';
                                break;
                            case 7:
                                echo '<img src="images/moonWnC.png" alt="Waning Crescent">';
                                break;
                            }
                            echo htmlentities($anObservation->_phase, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_latitude, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_longitude, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_timezoneID, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_isDST, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "<td>";
                            echo htmlentities($anObservation->_accepted, ENT_QUOTES, 'UTF-8');
                            echo "</td>";
                            echo "</tr>";
                        }
                        echo '</table>';
                    }
                    else
                    {
                        echo '<p>No Observations Recorded</p>';
                    }
                    echo '<a href="createObservationManual.php"><button class="btn btn-default btn-lg">Record An Obseration<br></button></a>';
                    echo '<a href="downloadObservationsRaw.php"><button class="btn btn-default btn-lg">Download Raw Observation Data<br></button></a>';
                    echo '<a href="downloadObservationsCalc.php"><button class="btn btn-default btn-lg">Download Computed Observation Data<br></button></a>';
                ?>
            </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.js"></script>
        <script type="text/javascript">
            function custom_template(obj)
            {
                var data = $(obj.element).data();
                var text = $(obj.element).text();
                if(data && data['img_src'])
                {
                    img_src = data['img_src'];
                    template = $("<div><img src=\"" + img_src + "\" style=\"width:100%;\"/><p style=\"font-weight: 700;font-size:14pt;text-align:center;\">" + text + "</p></div>");
                    return template;
                }
            }
            function hideDiv(whichDiv)
            {
                document.getElementById(whichDiv).style.visibility='hidden';
            }
            var options = {
                    'templateSelection': custom_template;
                    'templateResult': custom_template;
            };
            $('#phaseimage').select2(options);
            $('.select2-container--default .select2-selection--single').css({'height': '100px'});

        </script>
    </body>
</html>