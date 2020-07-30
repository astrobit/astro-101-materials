<?php
require_once 'errorBox.php';
require_once 'UserData.php';
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
    if ($_noerrors)
    {
        // Prepare our SQL, preparing the SQL statement will prevent SQL injection.
        $userResult = $con->query('SELECT id, password FROM userdata '
            . "WHERE username = '$userName'");
        if ($userResult->rowCount() > 0)
        {
            $row = $userResult->fetch();
    // Account exists, now we verify the password.
    // Note: remember to use password_hash in your registration file to store the hashed passwords.
            if (password_verify($passwordEntered, $row['password']))
            {
            // Verification success! User has loggedin!
            // Create sessions so we know the user is logged in, they basically act like cookies but remember the data on the server.
                session_regenerate_id();
                $userData = new UserData($con, $userName);
                $userData->serializeSession();
                $_SESSION['loggedin'] = true;
                $_SESSION['generalerror'] = null;
                $_SESSION['usernameerror'] = null;
                $_SESSION['passworderror'] = null;

                header('Location: home.php');
                exit();
                $_SESSION['passworderror'] = errorBox("Success.");
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
