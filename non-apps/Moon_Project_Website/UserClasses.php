<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of UserClasses
 *
 * @author astrobit
 */
require_once 'ClassInfo.php';

class UserClasses
{
    public array $_currentClasses;
    public array $_previousClasses;
    public array $_upcomingClasses;
    public function __construct(int $i_sanitizedUserID, PDO $i_pdo)
    {
        $_currentClasses = [];
        $_previousClasses = [];
        $_upcomingClasses = [];
        //@@TODO use the user's timezone or the default timezone for the class
        $currDate = new DateTime("now");
        try
        {
        $result = $i_pdo->query('SELECT classID, roleID, givenname, '
            . 'familyname, classes.description AS description, '
            . 'classes.start AS start, classes.end AS end, '
            . 'classes.ownerID AS ownerID '
            . 'FROM class_members '
            . 'LEFT JOIN classes ON classes.id = classID '
            . "WHERE userid = $i_sanitizedUserID ");
        }
        catch (\Exception $e)
        {
        echo $e->getMessage() . ' ' . $e->getCode();
        
        }
        while ($row = $result->fetch())
        {
            $newClass = new ClassInfo(
                    $row['classID'], $row['description'],
                    $row['roleID'], $row['start'],
                    $row['end'], $row['ownerID'] == $i_sanitizedUserID);
            if ($currDate >= $row['start'] && 
                $currDate <= $row['end']) // current class
            {
                array_push($_currentClasses,$newClass);
            }
            else if ($currDate > $row['end'])
            {
                array_push($_upcomingClasses,$newClass);
            }
            else 
            {
                array_push($_previousClasses,$newClass);
            }
        }
    }
}
