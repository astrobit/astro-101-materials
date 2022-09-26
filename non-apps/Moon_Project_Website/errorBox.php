<?php
mb_internal_encoding("UTF-8"); // ensure utf-8 functionality
mb_http_output("UTF-8"); // ensure utf-8 functionality

function errorBox($i_Message)
{
    return "<div><i class=\"fas fa-exclamation-triangle\"></i><p class=\"checkboxprompt\"> <font color=\"red\">".$i_Message.".</font></p></div>";
}

?>