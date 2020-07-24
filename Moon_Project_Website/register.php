<?php
require_once 'errorBox.php';
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
    $fistSizeSan = filter_input(INPUT_POST,'fistsize',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
    $fistsize = filter_var($fistSizeSan ,FILTER_VALIDATE_FLOAT,0);
    $researchConsentRaw = filter_input(INPUT_POST,'researchconsent',FILTER_SANITIZE_SPECIAL_CHARS);
    $geoIPConsentRaw = filter_input(INPUT_POST,'geoIPconsent',FILTER_SANITIZE_SPECIAL_CHARS);
    $deviceLocConsentRaw = filter_input(INPUT_POST,'deviceLocationConsent',FILTER_SANITIZE_SPECIAL_CHARS);
        
        
    $_SESSION['loggedin'] = false;
    $_SESSION['name'] = $givenName;
    $_SESSION['email'] = $email;
    $_SESSION['username'] = $userName;
    $_SESSION['fistsize'] = $fistsize;

    // Try and connect to the database, if a connection has not been established yet
   $con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
    if (!isset($con) || $con === null || mysqli_connect_errno())
    {
            // If there is an error with the connection, stop the script and display the error.
        $_SESSION['generalerror'] = errorBox("There was a problem with the connection. Please try again or contact an administrator.");
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
        $_SESSION['generalerror'] = errorBox("There was a problem retrieving user permissions. Please try again or contact an administrator.");
        $_noerrors = false;
    }
    if ($_noerrors)
    {
        // Now we check if the data was submitted, isset() function will check if the data exists.
        if (!isset($userName) || empty($userName) || $userName === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['usernameerror'] = errorBox("A user name is required");
            $_noerrors = false;
        }
        if (!isset($password) || empty($password) || $password === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['passworderror'] = errorBox("A password is required");
            $_noerrors = false;
        }
        if (!isset($passwordCheck) || empty($passwordCheck) || $passwordCheck === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['passwordcheckerror'] = errorBox("Please re-enter your password.");
            $_noerrors = false;
        }
        else if ($password != $passwordCheck)
        {
                // Could not get the data that should have been sent.
            $_SESSION['passwordcheckerror'] = errorBox("Passwords do not match.");
            $_noerrors = false;
        }
        if (!isset($givenName) || empty($givenName) || $givenName === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['givennameerror'] = errorBox("A given name is required.");
            $_noerrors = false;
        }
        if (!isset($email) || empty($email) || $email === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['emailerror'] = errorBox("Please enter a valid email address.");
            $_noerrors = false;
        }
        if (!isset($fistsize) || empty($fistsize) || $fistsize === false)
        {
                // Could not get the data that should have been sent.
            $_SESSION['fistsizeerror'] = errorBox("A fist size is required.");
            $_noerrors = false;
        }
        else
        {
            if ($fistsize < 3.0)
            {
                $_SESSION['fistsizeerror'] = errorBox("Your fist size seems unusually small (". $fistsize . "). Please check your entry and/or check your fist size again.");
                $_noerrors = false;
            }
            else if ($fistsize > 6.0)
            {
                $_SESSION['fistsizeerror'] = errorBox("Your fist size seems unusually large (". $fistsize . "). Please check your entry and/or check your fist size again.");
                $_noerrors = false;
            }
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

    // We need to check if the account with that username exists.
    if ($_noerrors)
    {
        $stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?');
        if (isset($stmt) && $stmt != null)
        {
            // Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
            $stmt->bind_param('s', $userName);
            $stmt->execute();
            $stmt->store_result();
            // Store the result so we can check if the account exists in the database.
            if ($stmt->num_rows > 0)
            {
                    // Username already exists
                $_SESSION['usernameerror'] = errorBox("Username " . $userName . " already exists. Please choose another!");
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
                $_SESSION['emailerror'] = errorBox("This email already has an account associated with it. To reset your passord, select <a href=\"reset_password_request.php\">this</a> link");
                $_noerrors = false;
            }
            $stmt->close();
        }
    }
	
    if ($_noerrors)
    {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $con->stmt_init();
        if (isset($stmt) && $stmt != null)
        {
            $zero = 0;
            $one = 1;
            if (!isset($familyName) || empty($familyName))
            {
                if ($stmt->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'))
                {
                    if (!$stmt->bind_param('ssissdiiiii', $userName, $email, $zero, $passwordHash, $givenName, $fistsizeVal, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, $one))
                    {
                        $_SESSION['generalerror'] = errorBox("There was a accessing the database. X1 ".$stmt->error);
                        $_noerrors = false;
                    }
                }
                else
                {
                    $_SESSION['generalerror'] = errorBox("There was a accessing the database. X2 ".$stmt->error);
                    $_noerrors = false;
                }
            }
            else 
            {
                if ($stmt->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, familyname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'))
                {
                    if (!$stmt->bind_param('ssisssdiiiii', $userName, $email, $zero, $passwordHash, $givenName, $familyName, $fistsizeVal, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, $one))
                    {
                        $_SESSION['generalerror'] = errorBox("There was a accessing the database. X3 ".$stmt->error);
                        $_noerrors = false;
                    }
                }
                else
                {
                    $_SESSION['generalerror'] = errorBox("There was a accessing the database. X4 ".$stmt->error);
                    $_noerrors = false;
                }
            }
            if ($_noerrors)
            {
                if (!$stmt->execute())
                {
                    $_SESSION['generalerror'] = errorBox("There was a accessing the database. X6 ".$stmt->error);
                    $_noerrors = false;
                }
            }
            $stmt->close();
        }
        else
        {
            $_SESSION['generalerror'] = errorBox("There was a accessing the database. X5");
            $_noerrors = false;
        }
 
    }			

    if ($_noerrors)
    {
        $stmt = $con->stmt_init();
        if (isset($stmt) && $stmt != null && $stmt != false && !empty($stmt))
        {
            if ($stmt->prepare('SELECT id FROM userdata WHERE username = ?'))
            {
                // Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
                if (!$stmt->bind_param('s', $userName))
                {
                    $_SESSION['generalerror'] = errorBox("There was a accessing the database. Z1 " .$stmt->error);
                    $_noerrors = false;
                }
                if ($_noerrors)
                {
                    if (!$stmt->execute())
                    {
                        $_SESSION['generalerror'] = errorBox("There was a accessing the database. Z1 " .$stmt->error);
                        $_noerrors = false;
                    }
                }
                // Store the result so we can check if the account exists in the database.
                if ($_noerrors)
                {
                    if (!$stmt->store_result())
                    {
                        $_SESSION['generalerror'] = errorBox("There was a accessing the database. Z2 " .$stmt->error);
                        $_noerrors = false;
                    }
                    else
                    {
                        if ($stmt->bind_result($id))
                        {
                            if ($stmt->fetch())
                            {
                                session_regenerate_id();
                                $_SESSION['loggedin'] = true;
                                $_SESSION['id'] = $id;
                                header('Location: home.php');
                                exit();
                            }
                            else
                            {
                                $_SESSION['generalerror'] = errorBox("There was a problem adding the user. Please try again or contact an administrator.");
                                $_noerrors = false;
                            }
                        }
                        else
                        {
                            $_SESSION['generalerror'] = errorBox("There was a problem adding the user. Please try again or contact an administrator.".$stmt->error);
                            $_noerrors = false;
                        }
                    }
                }
            }
            else
            {
                $_SESSION['generalerror'] = errorBox("There was a problem adding the user. Please try again or contact an administrator.".$stmt->error);
                $_noerrors = false;
            }
            $stmt->close();
        }
    }
    if (isset($con) && $con != null)
    {
        $con->close();
    }
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
