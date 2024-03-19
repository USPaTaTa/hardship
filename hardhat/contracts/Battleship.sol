// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Battleship game contract
contract BattleshipGame {
    // Players
    address public player1;
    address public player2;
    // Current player
    address public currentPlayer;
    
    // Player boards
    mapping(address => mapping(uint => mapping(uint => bool))) public playerBoards;
    // Ship placements
    mapping(address => uint[2][]) public shipsPlacement;
    // Ready status
    mapping(address => bool) public readyToPlay;
    
  
    
    // Events
    event GameStarted(address player1, address player2);
    event PlayerReady(address player);
    event GameEnded(address winner);

    // Constructor
    constructor(address _player1, address _player2) {
        player1 = _player1;
        player2 = _player2;
        currentPlayer = _player2;
        emit GameStarted(_player1, _player2);
    }
    
    // Only players modifier
    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Not a player.");
        _;
    }
    
    // Only current player modifier
    modifier onlyCurrentPlayer() {
        require(msg.sender == currentPlayer, "Not your turn.");
        _;
    }
    
    // Place ships function
    function placeShips(uint[2][][] memory _shipCoordinates) public onlyPlayers {
        require(_shipCoordinates.length == 5, "Invalid ship count");

        // All the ship size
        uint[] memory shipSizes = new uint[](5);
        shipSizes[0] = 5;
        shipSizes[1] = 4;
        shipSizes[2] = 3;
        shipSizes[3] = 3;
        shipSizes[4] = 2;

        // Loop over each ship
        for (uint i = 0; i < _shipCoordinates.length; i++) {
            // Check that the ship size matches the expected size
            require(_shipCoordinates[i].length == shipSizes[i], "Invalid ship size");
            // Loop over each coordinate pair for the current ship
            for (uint j = 0; j < _shipCoordinates[i].length; j++) {
                // Add the coordinate pair to the player's ship placements
                shipsPlacement[msg.sender].push(_shipCoordinates[i][j]);
                // Extract the x and y coordinates
                uint x = _shipCoordinates[i][j][0];
                uint y = _shipCoordinates[i][j][1];
                // Mark the coordinate on the player's board as occupied by a ship
                playerBoards[msg.sender][x][y] = true;
            }
        }
        readyToPlay[msg.sender] = true;
        emit PlayerReady(msg.sender);
    }
    // Calculate ship size function
    function calculateShipSize(uint[2] memory _shipCoordinates) private pure returns (uint) {
        return 1 + (_shipCoordinates[0] > _shipCoordinates[1] ? _shipCoordinates[0] - _shipCoordinates[1] : _shipCoordinates[1] - _shipCoordinates[0]);
    }
}