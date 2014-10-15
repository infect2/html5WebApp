Function.prototype.bind = Function.prototype.bind || function (target) {
  var self = this;
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};

(function () {
  if (typeof window.Element === "undefined" ||
      "classList" in document.documentElement) {
    return;
  }

  var prototype = Array.prototype,
      push = prototype.push,
      splice = prototype.splice,
      join = prototype.join;

  function DOMTokenList(el) {
    this.el = el;
    // The className needs to be trimmed and split on whitespace
    // to retrieve a list of classes.
    var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }

  DOMTokenList.prototype = {
    add: function (token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    },
    contains: function (token) {
      return this.el.className.indexOf(token) != -1;
    },
    item: function (index) {
      return this[index] || null;
    },
    remove: function (token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    },
    toString: function () {
      return join.call(this, ' ');
    },
    toggle: function (token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    }
  };

  window.DOMTokenList = DOMTokenList;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(HTMLElement.prototype, 'classList', function () {
    return new DOMTokenList(this);
  });
})();

function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;
  this.value          = 2048;
  this.lastStorageState = [];
  this.stateIndex   = 0;
  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  // this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.lastStorageState = [];
  this.stateIndex = 0;
  this.setup();
};

//추가
GameManager.prototype.clearGame = function() {
  this.storageManager.clearGameState();
  // this.setup();
}

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {

  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();
  var previousLastState = JSON.parse(this.storageManager.getLastState());

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
    this.undoCount    = previousState.undoCount; //undo 기능 추가
    this.started = previousState.started;
    this.lastStorageState = previousLastState.lastStorageState;
    this.stateIndex = previousLastState.stateIndex;

  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;
    this.undoCount    = this.undoCount; //undo 기능 추가
    this.started = false;
    this.lastStorageState = [];
    this.stateIndex = 0;

    // Add the initial tiles
    this.addStartTiles();

  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  console.log(this.storageManager.getBestScore());
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }


  if (this.movesAvailable()) {
      this.over = false; // Game over!
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
    this.storageManager.setLastState(this.lastGameSerialize());
  }


  console.log("over :" + this.over);
  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    value:      this.value,
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying,
    started:     this.started,
    undoCount: this.undoCount
  };
};

GameManager.prototype.lastGameSerialize = function () {
  return {
    lastStorageState: this.lastStorageState,
    stateIndex: this.stateIndex
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;
          // The mighty 2048 tile
          if (merged.value === 2048) {
            self.value = 2048;
            self.won = true;
          }

          if (merged.value === 4096) {
             self.value = 4096;
            self.won = true;

          }

        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });
  console.log("moved :" +moved);
  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }
    this.lastStorageState[this.stateIndex % 3] = this.storageManager.getGameState();
    this.stateIndex ++;
    console.log(this.lastStorageState);
    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {

  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

function Grid(size, previousState) {
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }

  return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    size: this.size,
    cells: cellState
  };
};

function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  // this.scoreContainer   = document.querySelector(".score-container");
  // this.bestContainer    = document.querySelector(".best-container");
  this.scoreContainer   = document.querySelector(".score-text");
  this.bestContainer    = document.querySelector(".best-text");
  this.messageContainerOrigin = document.querySelector(".game-message");
  this.messageContainer = document.querySelector(".gameResult");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    console.log(metadata.keepPlay);
    if (metadata.terminated) {
      if (metadata.over) {

          window.setTimeout(function() {
            self.message(false,metadata.score,metadata.bestScore,null); // You lose
          }, 1000);

      } else if (metadata.won) {
        // setTimeout(function() {
        self.message(true,metadata.score,metadata.bestScore,metadata.value); // You win!
        // }, 1000);


      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    // var addition = document.createElement("div");
    // addition.classList.add("score-addition");
    // addition.textContent = "+" + difference;

    // this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won,score,best,value) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "축하합니다! "+value+"을 달성하였습니다." : "Game over!";

  // this.messageContainer.classList.add(type);
  // this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  if(!won) {
    $('#game_play').trigger('finish',[score,best]);
  } else {
    this.messageContainerOrigin.classList.add(type);
    // this.messageContainerOrigin.getElementsByTagName("p")[0].textContent = message;
  }
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainerOrigin.classList.remove("game-won");
  this.messageContainerOrigin.classList.remove("game-over");
};

function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // Respond to button presses
  // this.bindButtonPress(".retry-button", this.restart);
  // this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Respond to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches > 1) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {

  //old key
  // this.bestScoreKey     = "bestScore";
  // this.gameStateKey     = "gameState";
  // this.userStateKey     = "userState";

  //NEW key
  this.bestScoreKey     = "7bestScore";
  this.gameStateKey     = "7gameState";
  this.userStateKey     = "7userState";
  this.lastStateKey     = "7lastState";
  this.bestLevelKey     = "7bestLevel";
  this.bestRateKey      = "7bestRate";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

LocalStorageManager.prototype.getBestLevel = function () {
  return this.storage.getItem(this.bestLevelKey) || 0;
};

LocalStorageManager.prototype.setBestLevel = function (score) {
  this.storage.setItem(this.bestLevelKey, score);
};

LocalStorageManager.prototype.getBestRate = function () {
  return this.storage.getItem(this.bestRateKey) || 0;
};

LocalStorageManager.prototype.setBestRate = function (score) {
  this.storage.setItem(this.bestRateKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.getUserState = function () {
  return this.storage.getItem(this.userStateKey);
};

LocalStorageManager.prototype.setUserState = function (userState) {
  this.storage.setItem(this.userStateKey, JSON.stringify(userState));
};

LocalStorageManager.prototype.getLastState = function () {
  return this.storage.getItem(this.lastStateKey);
};

LocalStorageManager.prototype.setLastState = function (lastState) {
  this.storage.setItem(this.lastStateKey, JSON.stringify(lastState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
  this.storage.removeItem(this.lastStateKey);
};

function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};

// Wait till the browser is ready to render the game (avoids glitches)

$(function(window,$,document){

    var $startBtn = $('.startBtn'),
        $restart = $('.restartBtn'),
        $backBtn = $('.backBtn'),
        $layerPop = $('.layerWrapper'),
        $best = $('.bestScore'),
        $game = $('#game_play'),
        game,
        best;


    $(document).ready(function() {
        var width = (window.innerWidth - 200) / 2;

        game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);

        best = game.storageManager.getBestScore();

        $best.text(best);
        //best score를 읽었으면 해당 rate와 level을 기록한다
        //매번 기록하는 것 보다 best score는 있는데, 없을 경우만 기록하도록 하는게 좋겠음
        //IMPROVE ME
        if(best > 0){
            var res = intepretGameResult(best);
            game.storageManager.setBestLevel(res.levelID);
            game.storageManager.setBestRate(res.rate);
        }
    });


    $restart.on('click', function(e) {
        e.preventDefault();
        window.location.reload();
    });

    $backBtn.on('click', function(e) {

        window.location.href="http://egame.skmcgw.com/planetArcade/client/index.html";
    });


    function intepretGameResult(point){
        //정규 분포에 따라서 level의 분포 구간은 정함
        //IMPROVE ME
        //실제 정규 분포의 PDF에 따라서 score를 probability로 변경하지는 않음
        //똑똑한 배철민 매니저가 해줄 것임
        //http://hyperphysics.phy-astr.gsu.edu/hbase/math/immath/gauds.gif
        //levelID는 css style의 class 명과 동일해야하므로 고치지 마시오. 아니면 두개를 같이 고치시오
        var scoreDB = [
            {
                levelDesc: "초하수",
                levelID: "lv-6",
                startPnt: 0,
                endPnt: 49999,
                startRate:  97,
                endRate: 100
            },
            {
                levelDesc: "하수",
                levelID: "lv-5",
                startPnt: 50000,
                endPnt: 199999,
                startRate: 84,
                endRate: 97
            },
            {
                levelDesc: "중수",
                levelID: "lv-4",
                startPnt: 200000,
                endPnt: 299999,
                startRate: 16,
                endRate: 84
            },
            {
                levelDesc: "고수",
                levelID: "lv-3",
                startPnt: 300000,
                endPnt: 399999,
                startRate: 4,
                endRate: 16
            },
            {
                levelDesc: "초고수",
                levelID: "lv-2",
                startPnt: 400000,
                endPnt: 799999,
                startRate: 0.1,
                endRate: 3
            },
            {
                levelDesc: "신(神)",
                levelID: "lv-1",
                startPnt: 800000,
                endPnt: "Infinity",
                startRate: 0,
                endRate: 0.1
            }
        ];

        var score, i,
            levelDesc, levelID, rate,
            levelNum = scoreDB.length;

        for (i=0;i<levelNum;i++){
            score = scoreDB[i];
            if (score.startPnt > point || score.endPnt < point) {
                continue;
            }
            levelDesc = score.levelDesc;
            levelID = score.levelID;
            rate = (function(){
                // % 표시 방식
                // 0 - 0.1: 0.1%
                // 0.2 - 1.0: 1.0%
                // 1.1% - 99.9%: 소수점 두째자리 이하 날림
                // 100% : 소수점 없음
                var  res,
                    ratePerPoint = (score.endRate-score.startRate)/(score.endPnt - score.startPnt);
                res = score.endRate - ratePerPoint * (point - score.startPnt);
                if (res <= 0.1) {
                    res = 0.1;
                }
                if (res > 100) {
                    res = 100;
                }
                if (res>0.1) {
                    res = res*10;
                    res = Math.ceil(res);
                    res = res/10;
                }
                return res.toString();
            })();
            break;
        }
        console.log(levelDesc);
        console.log(levelID);
        console.log(rate);

        return {
            levelDesc: levelDesc,
            levelID: levelID,
            rate: rate
        }
    }
    $game.on('finish', function(e, score) {
        var obj = {},
            res = intepretGameResult(score);

        $('.p2 strong').addClass(res.levelID);
        $('.p1 strong').text(res.rate);

        $('.game-result').removeClass('hidden');

        if (best < score) {
            $best.text(score);
            game.storageManager.setBestScore(score);
            game.storageManager.setBestLevel(res.levelID);
            game.storageManager.setBestRate(res.rate);
        }
    });
}(window,jQuery,document));