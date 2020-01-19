function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x && x != undefined) {
    reject(new TypeError("type error"));
  }

  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      var then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          function(y) {
            resolvePromise(promise2, y, resolve, reject);
          },
          function(reason) {
            reject(reason);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      reject(error);
    }
  } else {
    resolve(x);
  }
}

function Promise(executor) {
  this.state = "padding"; // padding/fulfilled/rejected
  this.value = undefined;
  this.reason = undefined;

  this.onfulfilledCallbacks = [];
  this.onrejectedCallbacks = [];

  var that = this;

  function resolve(value) {
    if (that.state === "padding") {
      that.value = value;
      that.state = "fulfilled";
      that.onfulfilledCallbacks.forEach(function(fn) {
        fn();
      });
    }
  }

  function reject(reason) {
    if (that.state === "padding") {
      that.reason = reason;
      that.state = "rejected";
      that.onrejectedCallbacks.forEach(function(fn) {
        fn();
      });
    }
  }

  executor(resolve, reject);
}

Promise.prototype.then = function(onfulfilled, onrejected) {
  var that = this;
  var promise2;
  onfulfilled =
    typeof onfulfilled === "function"
      ? onfulfilled
      : function(value) {
          return value;
        };

  onrejected =
    typeof onrejected === "function"
      ? onrejected
      : function(reason) {
          return reason;
        };

  if (that.state === "fulfilled") {
    promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onfulfilled(that.value);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  if (that.state === "rejected") {
    promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onrejected(that.reason);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  if (that.state === "padding") {
    promise2 = new Promise(function(resolve, reject) {
      that.onfulfilledCallbacks.push(function() {
        try {
          var x = onfulfilled(that.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });

      that.onrejectedCallbacks.push(function() {
        try {
          var x = onrejected(that.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return promise2;
};

Promise.prototype.catch = function(onrejected) {
  var that = this;
  var promise2;
  onrejected =
    typeof onrejected === "function"
      ? onrejected
      : function(reason) {
          return reason;
        };

  if (that.state === "rejected") {
    promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onrejected(that.reason);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  if (that.state === "padding") {
    promise2 = new Promise(function(resolve, reject) {
      that.onrejectedCallbacks.push(function() {
        try {
          var x = onrejected(that.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return promise2;
};

Promise.resolve = function(value) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(value);
    } catch (error) {
      reject(error);
    }
  });
};

Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  });
};

Promise.all = function(iterable) {
  var promise2 = new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (!(iterable instanceof Array)) {
        reject(new TypeError("Promise.all`s arguments should is iterable"));
      }

      var res = [];

      for (var i = 0; i < iterable.length; i++) {
        var item = iterable[i];
        item.then(function(value) {
          res.push(value);
          if (i === iterable.length) {
            resolve(res);
          }
        });
      }
    }, 0);
  });

  return promise2;
};

module.exports = Promise;
