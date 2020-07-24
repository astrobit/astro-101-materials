<?php
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality

// We need to use sessions, so you should always start sessions using the below code.
session_start();
// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin'])) 
{
    header('Location: authenticate.html');
    exit();
}
$_SESSION['generalerror'] = NULL;
$_noerrors = true;
// Load configuration as an array. Use the actual location of your configuration file
$config = parse_ini_file('../../config/moon_proj_config.ini'); 
// Try and connect to the database, if a connection has not been established yet
$con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
if (!isset($con) || $con === null || mysqli_connect_errno())
{
    $_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem with the connection. Please try again or contact an administrator.<br></font></p><br></div>";
    $_noerrors = false;
}
// We don't have the password or email info stored in sessions so instead we can get the results from the database.
if ($_noerrors)
{
    $stmt = $con->prepare('SELECT username, givenname, familyname, fistsize FROM userdata WHERE id = ?');
    // In this case we can use the account ID to get the account info.
    if (isset($stmt) && $stmt != null)
    {
        $stmt->bind_param('i', $_SESSION['id']);
        $stmt->execute();
        $stmt->bind_result($username, $givenname,$familyname,$fistsize);
        $stmt->fetch();
        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Profile Page</title>
        <link href="style.css" rel="stylesheet" type="text/css">
        <script src="https://kit.fontawesome.com/210f2f19d7.js" crossorigin="anonymous"></script><!-- fontawesome kit -->
    </head>
    <body class="loggedin">
        <nav class="navtop">
            <div>
                <a href="home.php"><i class="fas fa-home"></i>Home</a>
                <a href="profile.php"><i class="fas fa-user-circle"></i>Profile</a>
                <a href="logout.php"><i class="fas fa-sign-out-alt"></i>Logout</a>
            </div>
        </nav>
            <div class="content">
                <h2>Profile Page</h2>
                <div>
                    <p>Your account details:</p>
                    <table>
                        <tr>
                            <td>Username:</td>
                            <td><?=$_SESSION['username']?></td>
                        </tr>
                        <tr>
                            <td>Name:</td>
                            <td><?=$_SESSION['name']?></td>
                        </tr>
                        <tr>
                            <td>Fist Size:</td>
                            <td><?=$_SESSION['fistsize']?>°</td>
                        </tr>
                    </table>
                </div>
            </div>
    </body>
</html>

