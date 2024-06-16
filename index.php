<?php

require 'vendor/autoload.php';
require 'twig.php';

use App\SQLiteConnection;

$pdo = (new SQLiteConnection())->connect();

echo $twig->render('game.html.twig');