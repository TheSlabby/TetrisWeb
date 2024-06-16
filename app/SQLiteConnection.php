<?php

namespace App;

class SQLiteConnection {
    private $pdo;

    public function __construct() {
        $this->pdo = new \PDO("sqlite:" . Config::PATH_TO_SQLITE_FILE);
    }

    public function initialize() {
        // creates tables if they dont exist
        $sql = "CREATE TABLE IF NOT EXISTS tetris_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_name VARCHAR(100) NOT NULL UNIQUE,
                    score INT NOT NULL,
                    lines_cleared INT NOT NULL,
                    game_duration INT NOT NULL, -- Duration in seconds
                    date_played DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )";
        $this->pdo->exec($sql);
    }

    public function getPDO() {
        return $this->pdo;
    }

}