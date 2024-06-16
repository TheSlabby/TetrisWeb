<?php

require 'vendor/autoload.php';
require 'twig.php';

use App\SQLiteConnection;

// setup database
$conn_obj = new SQLiteConnection();
$conn_obj->initialize();
$pdo = $conn_obj->getPDO();

// get leaderboard
$stmt = $pdo->query("SELECT player_name, score, lines_cleared, game_duration, date_played FROM tetris_scores ORDER BY score DESC LIMIT 20");
$topScores = $stmt->fetchAll();

echo $twig->render('game.html.twig', [
    'topScores' => $topScores,
]);