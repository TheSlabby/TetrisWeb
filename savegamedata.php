<?php


require 'vendor/autoload.php';

use App\SQLiteConnection;

$conn = new SQLiteConnection();

if (isset($_POST['name'])) {
    $player_name = $_POST['name'];
    $score = $_POST['score'];
    $lines_cleared = $_POST['lines_cleared'];
    $game_duration = $_POST['game_duration'];

    try {
        $sql = "INSERT INTO tetris_scores (player_name, score, lines_cleared, game_duration)
                VALUES (:player_name, :score, :lines_cleared, :game_duration)";
        $stmt = $conn->getPDO()->prepare($sql);
        $stmt->execute([
            ':player_name' => $player_name,
            ':score' => $score,
            ':lines_cleared' => $lines_cleared,
            ':game_duration' => $game_duration
        ]);
        echo "High score inserted successfully";
        header('Location: index.php');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // SQLite uses SQLSTATE 23000 for integrity constraint violations
            echo "Error: Player name must be unique.";
        } else {
            echo "Error: " . $e->getMessage();
        }
    }
    
}