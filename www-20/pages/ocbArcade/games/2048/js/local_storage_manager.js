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
