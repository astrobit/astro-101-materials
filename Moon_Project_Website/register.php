<?php
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality

session_start();
$_SESSION['generalerror'] = NULL;
$_SESSION['usernameerror'] = NULL;
$_SESSION['passworderror'] = NULL;
$_SESSION['passwordcheckerror'] = NULL;
$_SESSION['givennameerror'] = NULL;
$_SESSION['fistsizeerror'] = NULL;
$_SESSION['emailerror'] = NULL;
$_noerrors = true;
$requestMethod = filter_input(INPUT_SERVER,'REQUEST_METHOD',FILTER_DEFAULT);
if ($requestMethod === 'POST')
{
    // Load configuration as an array. Use the actual location of your configuration file
    $config = parse_ini_file('../../config/moon_proj_config.ini'); 

    $userName = filter_input(INPUT_POST,'username',FILTER_SANITIZE_SPECIAL_CHARS);
    $givenName = filter_input(INPUT_POST,'givenname',FILTER_SANITIZE_SPECIAL_CHARS);
    $familyName = filter_input(INPUT_POST,'familyname',FILTER_SANITIZE_SPECIAL_CHARS);
    $password = filter_input(INPUT_POST,'password',FILTER_DEFAULT);
    $passwordCheck = filter_input(INPUT_POST,'passwordcheck',FILTER_DEFAULT);
    $emailSan= filter_input(INPUT_POST,'email',FILTER_SANITIZE_EMAIL);
    $email = filter_var($emailSan,FILTER_VALIDATE_EMAIL);
    $fistSizeSan = filter_input(INPUT_POST,'fistsize',FILTER_SANITIZE_NUMBER_FLOAT);
    $fistsize = filter_var($fistSizeSan ,FILTER_VALIDATE_FLOAT,0);
    $researchConsentRaw = filter_input(INPUT_POST,'researchconsent',FILTER_SANITIZE_SPECIAL_CHARS);
    $geoIPConsentRaw = filter_input(INPUT_POST,'geoIPconsent',FILTER_SANITIZE_SPECIAL_CHARS);
    $deviceLocConsentRaw = filter_input(INPUT_POST,'deviceLocationConsent',FILTER_SANITIZE_SPECIAL_CHARS);
        
        
    $_SESSION['loggedin'] = FALSE;
    $_SESSION['name'] = $givenName;
    $_SESSION['email'] = $email;
    $_SESSION['username'] = $userName;
    $_SESSION['fistsize'] = $fistsize;

    // Try and connect to the database, if a connection has not been established yet
    $con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
    if (!isset($con) || $con === null || mysqli_connect_errno())
    {
            // If there is an error with the connection, stop the script and display the error.
        $_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem with the connection. Please try again or contact an administrator.<br></font></p><br></div>";
        $_noerrors = false;
    }
    if ($_noerrors)
    {
        $resultPermissions = $con->query('SELECT id FROM permissions WHERE name = "user"');
        if (isset($resultPermissions) && $resultPermissions != null && $resultPermissions->num_rows > 0)
        {
            $row = $resultPermissions->fetch_assoc();
            $permissionsID = $row['id'];
        }
    }
	
    if ($_noerrors && (!isset($permissionsID) || empty($permissionsID)))
    {
        $_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem retrieving user permissions. Please try again or contact an administrator.<br></font></p><br></div>";
        $_noerrors = false;
    }
    if ($_noerrors)
    {
        // Now we check if the data was submitted, isset() function will check if the data exists.
        if (!isset($username) || empty($username))
        {
                // Could not get the data that should have been sent.
            $_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A user name is required.<br></font></p><br></div>";
            $_noerrors = false;
        }
        if (!isset($password) || empty($password))
        {
                // Could not get the data that should have been sent.
            $_SESSION['passworderror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A password is required.<br></font></p><br></div>";
            $_noerrors = false;
        }
        if (!isset($passwordCheck) || empty($passwordCheck))
        {
                // Could not get the data that should have been sent.
            $_SESSION['passwordcheckerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Please re-enter your password.<br></font></p><br></div>";
            $_noerrors = false;
        }
        else if ($password != $passwordCheck)
        {
                // Could not get the data that should have been sent.
            $_SESSION['passwordcheckerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Passwords do not match.<br></font></p><br></div>";
            $_noerrors = false;
        }
        if (!isset($givenName) || empty($givenName))
        {
                // Could not get the data that should have been sent.
            $_SESSION['givennameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A given name is required.<br></font></p><br></div>";
            $_noerrors = false;
        }
        if (!isset($fistSize) || empty($fistSize))
        {
                // Could not get the data that should have been sent.
            $_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A fist size is required.<br></font></p><br></div>";
            $_noerrors = false;
        }
        else
        {
            $fistsize = floatval($fistSize);
            if ($fistsize < 3.0)
            {
                $_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Your fist size seems unusually small. Please check your entry and/or check your fist size again.<br></font></p><br></div>";
                $_noerrors = false;
            }
            elseif ($fistsize > 6.0)
            {
                $_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Your fist size seems unusually large. Please check your entry and/or check your fist size again.<br></font></p><br></div>";
                $_noerrors = false;
            }
        }
    }
    // We need to check if the account with that username exists.
    if ($_noerrors)
    {
        $stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?');
        if ($stmt != null)
        {
            // Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
            $stmt->bind_param('s', $username);
            $stmt->execute();
            $stmt->store_result();
            // Store the result so we can check if the account exists in the database.
            if ($stmt->num_rows > 0)
            {
                    // Username already exists
                $_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\"> Username " . $username . " already exists. Please choose another! <br></font></p><br></div>";
                $_noerrors = false;
            }
            $stmt->close();
        }
    }
    if ($_noerrors)
    {
        $stmt = $con->prepare('SELECT id FROM userdata WHERE email = ?');
        if ($stmt != null)
        {
            // Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();
            // Store the result so we can check if the account exists in the database.
            if ($stmt->num_rows > 0)
            {
                    // email already exists
                $_SESSION['emailerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\"> This email already has an account associated with it. To reset your passord, select <a href=\"reset_password_request.php\">this</a> link.<br></font></p><br></div>";
                $_noerrors = false;
            }
            $stmt->close();
        }
    }

    if (isset($researchConsentRaw))
    {
        $researchConsent = 1;
    }
    else
    {
        $researchConsent = 0;
    }
    if (isset($geoIPConsentRaw))
    {
        $geoIPconsent = 1;
    }
    else
    {
        $geoIPconsent = 0;
    }
    if (isset($deviceLocConsentRaw))
    {
        $deviceLocationConsent = 1;
    }
    else
    {
        $deviceLocationConsent = 0;
    }
	
    if ($_noerrors)
    {
        $password = password_hash($password, PASSWORD_DEFAULT);
        if (!isset($familyName) || empty($familyName))
        {
            $stmt = $con->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('ssissdiiiii', $username, $email, 0, $password, $givenName, $fistsize, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, 1);

            $stmt->execute();
        }
        else 
        {
            $stmt = $con->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, familyname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('ssisssdiiiii', $username, $email, 0, $password, $givenName, $familyName, $fistsize, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, 1);

        }
        $stmt->execute();
    }			

    if ($_noerrors)
    {
        $stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?');
        if ($stmt != null)
        {
            // Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
            $stmt->bind_param('s', $username);
            $stmt->execute();
            // Store the result so we can check if the account exists in the database.
            $stmt->store_result();
            if ($stmt->num_rows > 0)
            {
                $row = $stmt->fetch_assoc();
                $id = $row['id'];

                session_regenerate_id();
                $_SESSION['loggedin'] = TRUE;
                $_SESSION['id'] = $id;
                header('Location: home.php');
                exit();
            }
            else
            {
                $_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem adding the user. Please try again or contact an administrator.<br></font></p><br></div>";
                $_noerrors = false;
            }
            $stmt->close();
        }
    }
    $con->close();
}
?>


<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Register</title>
<!--		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.13.0/css/all.css">-->
        <script src="https://kit.fontawesome.com/210f2f19d7.js" crossorigin="anonymous"></script><!-- fontawesome kit -->
        <link href="style.css" rel="stylesheet" type="text/css">
    </head>
    <body>
        <div class="register">
            <h1>Register</h1>
            <?php 
                echo $_SESSION['generalerror'];
            ?>
            <form accept-charset="UTF-8" action="register.php" method="post" autocomplete="off">
                <label for="username">
                    <i class="fas fa-user-tag"></i>
                    <input type="text" name="username" placeholder="Username" id="username" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['usernameerror'];
                ?>
                <label for="fname">
                    <i class="fas fa-user"></i>
                    <input type="text" name="givenname" placeholder="Given Name" id="givenname" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['givennameerror'];
                ?>
                <label for="lname">
                    <i class="fas fa-users"></i>
                    <input type="text" name="familyname" placeholder="Family Name" id="familyname"  autocomplete="on">
                </label>
                <?php 
                    echo $_SESSION['familynameerror'];
                ?>
                <label for="password">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" placeholder="Password" id="password" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['passworderror'];
                ?>
                <label for="passwordcheck">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="passwordcheck" placeholder="Retype Password" id="passwordcheck" autocomplete="on" required>
                </label>
                <?php 
                    echo $_SESSION['passwordcheckerror'];
                ?>
                <label for="email">
                    <i class="fas fa-at"></i>
                    <input type="text" name="email" placeholder="email" id="email" required>
                </label>
                <?php 
                        echo $_SESSION['emailerror'];
                ?>
                <label for="fistsize">
                    <i class="fas fa-hand-rock"></i>
                    <input type="number" name="fistsize" placeholder="Size of your fist in degrees" id="fistsize" min="3" max="6" step="0.1" required/>
                </label>
                <?php 
                    echo $_SESSION['fistsizeerror'];
                ?>
                <div>
                <label for="researchconsent" class="checkboxprompt">
                    <i class="fas fa-flask"></i>
                    <p class="checkboxprompt">I consent to the use of my observations for research purposes.<br><i> Note: Not required for registration</i></p>
                    <input type="checkbox" name="researchconsent" id="researchconsent" value="researchconsent">
                </label>
                </div>
                <div>
                <label for="geoIPconsent" class="checkboxprompt">
                    <i class="fas fa-globe"></i>
                    <p class="checkboxprompt">I wish to use my IP to determine my location.<br><i> Note: Not required for registration</i></p>
                    <input type="checkbox" name="geoIPconsent" id="geoIPconsent" value="geoIPconsent">
                </label>
                </div>
                <div>
                <label for="deviceLocationConsent" class="checkboxprompt">
                    <i class="fas fa-satellite"></i>
                    <p class="checkboxprompt">I wish to use my device location services (e.g. GPS) to determine my location.<br><i> Note: Not required for registration</i></p>
                <input type="checkbox" name="deviceLocationConsent" id="deviceLocationConsent" value="deviceLocationConsent">
                </label>
                </div>
                <div>
                <label for="regcode">
                    <i class="fas fa-barcode"></i>
                    <input type="text" name="regcode" placeholder="Class Code (optional)" id="regcode">
                </label>
                </div>
                <input type="submit" value="Register">
            </form>
        </div>
    </body>
</html>
