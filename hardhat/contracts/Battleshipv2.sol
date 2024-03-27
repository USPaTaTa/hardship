// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BattleShip {
    // VARIABLES
    address public host;
    address public guest;
    address public winner;
    address public currentPlayer;
    bool public gameStarted;
    bool public gameOver;
    mapping(address => Coordinate[]) public historyAttacks;
    mapping(address => Coordinate[]) public realGrid;

    // STRUCT
    struct Coordinate {
        uint8 x;
        uint8 y;
        coordinateStatus status;
    }

    // ENUM
    enum coordinateStatus {
        Unknown,
        Miss,
        Hit,
        Sunk
    }

    // EVENT
    event GameStarted(address host, address guest);
    event GameEnded(address winner);
    event Attack(address indexed attacker, uint8 x, uint8 y, coordinateStatus result);

    constructor(address _guest) {
        require(_guest != address(0), "Invalid address");
        host = msg.sender;
        guest = _guest;
    }

    // MODIFIERS
    modifier onlyPlayers() {
        require(msg.sender == host || msg.sender == guest, "You are not a player in this game.");
        _;
    }

    modifier gameNotStarted() {
        require(!gameStarted, "The game has already started.");
        _;
    }

    modifier gameStartedOnly() {
        require(gameStarted, "The game has not started yet.");
        _;
    }

    modifier gameNotOver() {
        require(!gameOver, "The game is over.");
        _;
    }

    modifier gameOverOnly() {
        require(gameOver, "The game is not over.");
        _;
    }

    modifier validCoordinate(uint8 _x, uint8 _y) {
        require(_x >= 0 && _x <= 9, "Invalid x coordinate.");
        require(_y >= 0 && _y <= 9, "Invalid y coordinate.");
        _;
    }

    modifier isCurrentPlayer() {
        require(msg.sender == currentPlayer, "Not your turn.");
        _;
    }
    
    modifier lastAttackUnknown() {
        require(historyAttacks[currentPlayer == host ? guest : host].length == 0 || historyAttacks[currentPlayer == host ? guest : host][historyAttacks[currentPlayer == host ? guest : host].length - 1].status != coordinateStatus.Unknown, "Last attack of adversary is unknown, please call setLastAttackStatus first.");
        _;
    }

    modifier lastAttackNotUnknown() {
        require(historyAttacks[currentPlayer == host ? guest : host].length == 0 || historyAttacks[currentPlayer == host ? guest : host][historyAttacks[currentPlayer == host ? guest : host].length - 1].status == coordinateStatus.Unknown, "Last attack of adversary is not unknown.");
        _;
    }

    // FUNCTIONS
    function startGame() external onlyPlayers gameNotStarted {
        require(msg.sender == host, "Only host can start the game.");
        gameStarted = true;
        currentPlayer = guest;
        emit GameStarted(host, guest);
    }

    function attack(uint8 _x, uint8 _y) external onlyPlayers gameStartedOnly gameNotOver isCurrentPlayer lastAttackUnknown validCoordinate(_x, _y) {
        historyAttacks[msg.sender].push(Coordinate(_x, _y, coordinateStatus.Unknown));
        emit Attack(msg.sender, _x, _y, coordinateStatus.Unknown);
        currentPlayer = currentPlayer == host ? guest : host;
    }

    function setLastAttackStatus(coordinateStatus _status) external onlyPlayers gameStartedOnly gameNotOver isCurrentPlayer lastAttackNotUnknown {
        require(historyAttacks[currentPlayer == host ? guest : host].length > 0, "No attack to set status");
        require(_status != coordinateStatus.Unknown, "Status cannot be Unknown");
        historyAttacks[currentPlayer == host ? guest : host][historyAttacks[currentPlayer == host ? guest : host].length - 1].status = _status;
        emit Attack(currentPlayer == host ? guest : host, historyAttacks[currentPlayer == host ? guest : host][historyAttacks[currentPlayer == host ? guest : host].length - 1].x, historyAttacks[currentPlayer == host ? guest : host][historyAttacks[currentPlayer == host ? guest : host].length - 1].y, _status);
        checkGameOver();
    }

    function checkGameOver() internal {
        uint8 sunkShips = 0;
        for (uint i = 0; i < historyAttacks[msg.sender].length; i++) {
            if (historyAttacks[msg.sender][i].status == coordinateStatus.Sunk) {
                sunkShips++;
            }
        }
        if (sunkShips == 5) {
            gameOver = true;
        }
    }

    function setRealGrid(Coordinate[] memory _grid) external onlyPlayers gameStartedOnly gameOverOnly {
        require(_grid.length >= 17, "Invalid grid size");
        for (uint i = 0; i < _grid.length; i++) {
            realGrid[msg.sender].push(_grid[i]);
        }
    }

    function checkWinner() external onlyPlayers gameStartedOnly gameOverOnly {
        require(realGrid[host].length >= 17, "Host grid not set yet");
        require(realGrid[guest].length >= 17, "Guest grid not set yet");
        uint8 sunkShipsHost = 0;
        uint8 hitShipsHost = 0;
        uint8 sunkShipsGuest = 0;
        uint8 hitShipsGuest = 0;
        for (uint i = 0; i < historyAttacks[host].length; i++) {
            uint8 x = historyAttacks[host][i].x;
            uint8 y = historyAttacks[host][i].y;
            for (uint j = 0; j < realGrid[guest].length; j++) {
                if (realGrid[guest][j].x == x && realGrid[guest][j].y == y) {
                    if (realGrid[guest][j].status == coordinateStatus.Sunk) {
                        sunkShipsHost++;
                    } else if (realGrid[guest][j].status == coordinateStatus.Hit) {
                        hitShipsHost++;
                    }
                    break;
                }
            }
        }
        for (uint i = 0; i < historyAttacks[guest].length; i++) {
            uint8 x = historyAttacks[guest][i].x;
            uint8 y = historyAttacks[guest][i].y;
            for (uint j = 0; j < realGrid[host].length; j++) {
                if (realGrid[host][j].x == x && realGrid[host][j].y == y) {
                    if (realGrid[host][j].status == coordinateStatus.Sunk) {
                        sunkShipsGuest++;
                    } else if (realGrid[host][j].status == coordinateStatus.Hit) {
                        hitShipsGuest++;
                    }
                    break;
                }
            }
        }
        if (sunkShipsHost == 5 && hitShipsHost == 12 && sunkShipsGuest < 5 && hitShipsGuest < 12) {
            winner = host;
        } else if (sunkShipsGuest == 5 && hitShipsGuest == 12 && sunkShipsHost < 5 && hitShipsHost < 12) {
            winner = guest;
        } else {
            uint8 historyHitShipsHost = 0;
            uint8 historySunkShipsHost = 0;
            uint8 historyHitShipsGuest = 0;
            uint8 historySunkShipsGuest = 0;
            for (uint i = 0; i < historyAttacks[host].length; i++) {
                if (historyAttacks[host][i].status == coordinateStatus.Hit) {
                    historyHitShipsHost++;
                } else if (historyAttacks[host][i].status == coordinateStatus.Sunk) {
                    historySunkShipsHost++;
                }
            }
            for (uint i = 0; i < historyAttacks[guest].length; i++) {
                if (historyAttacks[guest][i].status == coordinateStatus.Hit) {
                    historyHitShipsGuest++;
                } else if (historyAttacks[guest][i].status == coordinateStatus.Sunk) {
                    historySunkShipsGuest++;
                }
            }
            if (historySunkShipsHost == 5 && sunkShipsHost < 5) {
                winner = guest;
            } else if (historySunkShipsGuest == 5 && sunkShipsGuest < 5) {
                winner = host;
            } else if (historyHitShipsHost == 12 && hitShipsHost < 12) {
                winner = guest;
            } else if (historyHitShipsGuest == 12 && hitShipsGuest < 12) {
                winner = host;
            } else {
                winner = address(0);
            }
        }
        emit GameEnded(winner);
    }

    function surrender() external onlyPlayers gameStartedOnly gameNotOver {
        winner = currentPlayer == host ? guest : host;
        gameOver = true;
        emit GameEnded(winner);
    }

    function getAllAttacks(address _player) external view onlyPlayers returns (Coordinate[] memory) {
        return historyAttacks[_player];
    }

}
