/**
 * Created by dev_bcm@sk.com on 2014. 9. 3..
 */


var LocalStorageManager = function(key) {

    this.key = key;
};

LocalStorageManager.prototype.save = function(value) {
    //only save with Object format
    window.localStorage.setItem(this.key, JSON.stringify(value));
};

LocalStorageManager.prototype.load = function() {

    var value;

    value = JSON.parse(window.localStorage.getItem(this.key));
    return value;
};

LocalStorageManager.prototype.clear = function() {

    window.localStorage.removeItem(this.key);
};

LocalStorageManager.prototype.allClear = function() {

    window.localStorage.clear();
};

