<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of UserData
 *
 * @author astrobit
 */
require_once 'UserPermissions.php';

class UserData
{
    public int $_id;
    public string $_userName;
    public string $_givenName;
    public string $_familyName;
    public string $_email;
    public int $_permissions;
    public bool $_useGeoIP;
    public bool $_useDeviceLocation;
    public float $_fistSize;
    public int $_timeZoneID;
//    public int $_timeZoneName;
    public int $_locationID;
    public float $_locationLatitude;
    public float $_locationLongitude;
    public int $_defaultMeasurementUnits;
    
    public function __construct(PDO $i_con = null, string $i_userNameSanitized = null)
    {
        if (isset($i_con) && !empty($i_con) && $i_con !== null && 
            isset($i_userNameSanitized) && !empty($i_userNameSanitized) &&
            $i_userNameSanitized !== null)
        {
            try
            {
            $result = $i_con->query('SELECT userdata.id AS id, username, email, '
                . 'emailVerified, givenname, familyname, fistsize, '
                . 'permissionsID, allowUseGeoIP, allowUseDevice, '
                . 'defaultTimeZoneID, defaultLocationID, defaultLatitude, '
                . 'defaultLongitude, defaultMeasurementUnitsID, '
                . 'permissions.instructor AS p_instr, '
                . 'permissions.administrator AS p_admin, '
                . 'permissions.researcher AS p_res '
                . 'FROM userdata '
                . 'LEFT JOIN permissions ON permissionsID = permissions.id ' 
                . "WHERE username = '$i_userNameSanitized' ");
            }
       catch (\PDOException $e)
        {
           print('exception '. $e->getMessage() . ' ' . $e->getCode());
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
            if ($result->rowCount() > 0)
            {
                $row = $result->fetch();
                $this->_id = $row['id'];
                $this->_userName = $row['username'];
                $this->_givenName = $row['givenname'];
                $this->_familyName = $row['familyname'];
                $this->_email = $row['email'];
                if ($row['p_admin'])
                {
                    $this->_permissions = UserPermissions::administrator;
                }
                else if ($row['p_res'] && $row['p_instr'])
                {
                    $this->_permissions = UserPermissions::instructor_researcher;
                }
                else if ($row['p_res'])
                {
                    $this->_permissions = UserPermissions::researcher;
                }
                else if ($row['p_instr'])
                {
                    $this->_permissions = UserPermissions::instructor;
                }
                else
                {
                    $this->_permissions = UserPermissions::user;
                }
                $this->_useGeoIP = $row['allowUseGeoIP'] == 1;
                $this->_useDeviceLocation = $row['allowUseDevice'] == 1;
                if ($row['fistsize'] !== null)
                {
                    $this->_fistSize = $row['fistsize'];
                }
                else
                {
                    $this->_fistSize = -1.0;
                }
                if ($row['defaultTimeZoneID'] !== null)
                {
                    $this->_timeZoneID = $row['defaultTimeZoneID'];
                }
                else
                {
                    $this->_timeZoneID = -1;
                }
    //            $this->_timeZoneName = $row['tz_name'];
                if ($row['defaultLocationID'] !== null)
                {
                    $this->_locationID = $row['defaultLocationID'];
                }
                else
                {
                    $this->_locationID = -1;
                }
                if ($row['defaultLatitude'] !== null)
                {
                    $this->_locationLatitude = $row['defaultLatitude'];
                }
                else
                {
                    $this->_locationLatitude = -91;
                }
                if ($row['defaultLongitude'] !== null)
                {
                    $this->_locationLongitude = $row['defaultLongitude'];
                }
                else
                {
                    $this->_locationLongitude = -181;
                }
                if ($row['defaultMeasurementUnitsID'] !== null)
                {
                    $this->_defaultMeasurementUnits = $row['defaultMeasurementUnitsID'];
                }
                else
                {
                    $this->_defaultMeasurementUnits = -1;
                }
            }
        }
    }
    
    public function serializeSession(string $i_prefix = null)
    {
        $_prefix = '';
        if (isset($i_prefix) && !empty($i_prefix) && $i_prefix !== null)
        {
            $_prefix = $i_prefix . '.UserData.';
        }
        else
        {
            $_prefix = '.UserData.';
        }
        $_SESSION[$_prefix . 'id'] = $this->_id;
        $_SESSION[$_prefix . 'userName'] = $this->_userName;
        $_SESSION[$_prefix . 'givenName'] = $this->_givenName;
        $_SESSION[$_prefix . 'familyName'] = $this->_familyName;
        $_SESSION[$_prefix . 'email'] = $this->_email;
        $_SESSION[$_prefix . 'permissions'] = $this->_permissions;
        $_SESSION[$_prefix . 'useGeoIP'] = $this->_useGeoIP;
        $_SESSION[$_prefix . 'useDeviceLocation'] = $this->_useDeviceLocation;
        $_SESSION[$_prefix . 'fistSize'] = $this->_fistSize;
        $_SESSION[$_prefix . 'timeZoneID'] = $this->_timeZoneID;
        $_SESSION[$_prefix . 'timeZoneName'] = $this->_timeZoneName;
        $_SESSION[$_prefix . 'locationID'] = $this->_locationID;
        $_SESSION[$_prefix . 'locationLatitude'] = $this->_locationLatitude;
        $_SESSION[$_prefix . 'locationLongitude'] = $this->_locationLongitude;
        $_SESSION[$_prefix . 'defaultMeasurementUnits'] = $this->_defaultMeasurementUnits;
    }
    public function deserializeSession(string $i_prefix = null)
    {
        $_prefix = '';
        if (isset($i_prefix) && !empty($i_prefix) && $i_prefix != null)
        {
            $_prefix = $i_prefix.'.UserData.';
        }
        else
        {
            $_prefix = '.UserData.';
        }
        
        $this->_id = $_SESSION[$_prefix . 'id'];
        $this->_userName = $_SESSION[$_prefix . 'userName'];
        $this->_givenName = $_SESSION[$_prefix . 'givenName'];
        $this->_familyName = $_SESSION[$_prefix . 'familyName'];
        $this->_email = $_SESSION[$_prefix . 'email'];
        $this->_permissions = $_SESSION[$_prefix . 'permissions'];
        $this->_useGeoIP = $_SESSION[$_prefix . 'useGeoIP'];
        $this->_useDeviceLocation = $_SESSION[$_prefix . 'useDeviceLocation'];
        $this->_fistSize = $_SESSION[$_prefix . 'fistSize'];
        $this->_timeZoneID = $_SESSION[$_prefix . 'timeZoneID'];
//        $this->_timeZoneName = $_SESSION[$_prefix . 'timeZoneName'];
        $this->_locationID = $_SESSION[$_prefix . 'locationID'];
        $this->_locationLatitude = $_SESSION[$_prefix . 'locationLatitude'];
        $this->_locationLongitude = $_SESSION[$_prefix . 'locationLongitude'];
        $this->_defaultMeasurementUnits = $_SESSION[$_prefix . 'defaultMeasurementUnits'];
    }
     
}
