<?php
require_once 'errorBox.php';
session_start();

mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality

$_SESSION['generalerror'] = null;
$_SESSION['usernameerror'] = null;
$_SESSION['passworderror'] = null;
$_noerrors = true;

$requestMethod = filter_input(INPUT_SERVER,'REQUEST_METHOD',FILTER_DEFAULT);
if ($requestMethod === 'POST')
{

    $config = parse_ini_file('../../config/moon_proj_config.ini'); 


    // Try and connect to the database, if a connection has not been established yet
    $con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
    //$con = mysqli_connect('localhost','moonproject','7c3J0r*nO0M#0rD$s@P','moon_project');
    //$con = mysqli_connect('localhost','root','yr3v0c$iDSST','moon_project');
    //$con = mysqli_connect('localhost','root','colombia','moon_project');
    if ( !isset($con) || $con === null || mysqli_connect_errno() )
    {
        $_SESSION['generalerror'] = errorBox("An error has occurred. Please contact an administrator.");
        $_noerrors = false;
    }
    if ($_noerrors)
    {
        $userName = filter_input(INPUT_POST,'username',FILTER_SANITIZE_SPECIAL_CHARS);
        $passwordEntered = filter_input(INPUT_POST,'password',FILTER_DEFAULT);

        // Now we check if the data from the login form was submitted, isset() will check if the data exists.
        if ( !isset($userName) )
        {
                // Could not get the data that should have been sent.
            $_SESSION['usernameerror'] = errorBox("A user name is required");
            $_noerrors = false;
        }

        if ( !isset($passwordEntered) )
        {
                // Could not get the data that should have been sent.
            $_SESSION['passworderror'] = errorBox("A password is required");
            $_noerrors = false;
        }
    }
    if ($_noerrors)
    {
        // Prepare our SQL, preparing the SQL statement will prevent SQL injection.
        $stmt = $con->prepare('SELECT id, password, givenname, familyname, fistsize FROM userdata WHERE username = ?');
        if ($stmt != null)
        {
            // Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
            $stmt->bind_param('s', $userName);
            $stmt->execute();
            // Store the result so we can check if the account exists in the database.
            $stmt->store_result();
            if ($stmt->num_rows > 0)
            {
                $stmt->bind_result($id, $password, $givenname, $familyname, $fistsize);
                $stmt->fetch();
        // Account exists, now we verify the password.
        // Note: remember to use password_hash in your registration file to store the hashed passwords.
                if (password_verify($passwordEntered, $password))
                {
                // Verification success! User has loggedin!
                // Create sessions so we know the user is logged in, they basically act like cookies but remember the data on the server.
                    session_regenerate_id();
                    $_SESSION['loggedin'] = TRUE;
                    $_SESSION['name'] = $givenname;
                    $_SESSION['username'] = $userName;
                    $_SESSION['fistsize'] = $fistsize;
                    $_SESSION['id'] = $id;
                    $_SESSION['generalerror'] = null;
                    $_SESSION['usernameerror'] = null;
                    $_SESSION['passworderror'] = null;

                    header('Location: home.php');
                    exit();
                }
                else
                {
                    $_SESSION['passworderror'] = errorBox("The password does not match.");
                }
            }
            else
            {
                $_SESSION['usernameerror'] = errorBox("No user with this name has been found.");
            }
            $stmt->close();
        }
    }
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Login</title>
        <script src="https://kit.fontawesome.com/210f2f19d7.js" crossorigin="anonymous"></script><!-- fontawesome kit -->
        <link href="style.css" rel="stylesheet" type="text/css">
    </head>
    <body>
        <div class="login">
            <h1>Login</h1>
            <?php 
                echo $_SESSION['generalerror'];
            ?>
            <form action="authenticate.php" method="post">
                <label for="username">
                    <i class="fas fa-user"></i>
                    <input type="text" name="username" placeholder="Username" id="username" required>
                </label>
                <?php 
                    echo $_SESSION['usernameerror'];
                ?>
                <label for="password">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" placeholder="Password" id="password" required>
                </label>
                <?php 
                    echo $_SESSION['passworderror'];
                ?>
                <input type="submit" value="Login">
            </form>
            <div> Don't have an account? <a href="register.php" >Register Here.</a> </div>
        </div>
    </body>
</html>
