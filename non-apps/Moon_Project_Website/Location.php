<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Location
 *
 * @author astrobit
 */
class Location
{
    public int $_id;
    public string $_name;
    public string $_city;
    public string $_state_province;
    public string $_postcode;
    public int $_countryID;
    public float $_latitude;
    public float $_longitude;
    public int $_timezoneID;
    public string $_timezoneName;
    
    public function __construct(int $i_sanitizedLocationID = null, PDO $i_pdo = null)
    {
         if (isset($i_sanitizedLocationID) && !empty($i_sanitizedLocationID) && 
            $i_sanitizedLocationID !== null &&
            isset($i_pdo) && !empty($i_pdo) && $i_pdo !== null)
        {
            try
            {
            $result = $i_pdo->query('SELECT * '
                . 'FROM locations '
                . "WHERE id = $i_sanitizedLocationID ");
            }
            catch (\Exception $e)
            {
                echo $e->getMessage() . ' ' . $e->getCode();

            }
            $row = $result->fetch();
            if (isset($row) && !empty($row) && $row !== null)
            {
                $this->_id = $row['id'];
                $this->_name = $row['name'];
                $this->_city = $row['city'];
                $this->_state_province = $row['state_province'];
                $this->_postcode = $row['postcode'];
                $this->_countryID = $row['countryID'];
                $this->_latitude = $row['latitude'];
                $this->_longitude = $row['longitude'];
                $this->_timezoneID = $row['timezoneID'];
                
                
                if ($this->_timezoneID !== null && $this->_timezoneID >= 0)
                {
                    try
                    {
                        $result = $i_pdo->query('SELECT name'
                            . 'FROM timezones'
                            . "WHERE id = $this->_timezoneID ");
                    }
                    catch (\PDOException $e)
                    {
                        print('exception '. $e->getMessage() . ' ' . $e->getCode());
                        throw new \PDOException($e->getMessage(), (int)$e->getCode());
                    }
                    $row = $result->fetch();
                    $this->_timezoneName = $row['name'];
                }
            }
        }
    }
}
