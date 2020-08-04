<?php
    function get_geolocation($apiKey, $ip, $lang = 'en', $fields = '*', $excludes = '')
    {
        $url = "https://api.ipgeolocation.io/ipgeo?apiKey=$apiKey&ip=$ip&lang=$lang&fields=$fields&excludes=$excludes";
        $cURL = curl_init();

        curl_setopt($cURL, CURLOPT_URL, $url);
        curl_setopt($cURL, CURLOPT_HTTPGET, true);
        curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($cURL, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Accept: application/json'
            ));
        curl_setopt($cURL, CURLOPT_FAILONERROR, true);
        $_result = curl_exec($cURL);
        curl_close($cURL);
        return $_result;
    }
    function get_astronomy($apiKey, $ip, $lat, $long, $date, $lang = 'en', $fields = '*', $excludes = '')
    {
        $url = "https://api.ipgeolocation.io/astronomy?apiKey=$apiKey&ip=$ip&lang=$lang&fields=$fields&excludes=$excludes&lat=$lat&long=$long&date=$date";
        $cURL = curl_init();

        curl_setopt($cURL, CURLOPT_URL, $url);
        curl_setopt($cURL, CURLOPT_HTTPGET, true);
        curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($cURL, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Accept: application/json'
            ));
        curl_setopt($cURL, CURLOPT_FAILONERROR, true);
        $_result = curl_exec($cURL);
        curl_close($cURL);
        return $_result;
    }