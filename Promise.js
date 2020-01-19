function Promise(executor) {
  if (!(this instanceof Promise)) {
    return new Promise(executor);
  }

  this.state = "padding";
  this.value = undefined;
  this.reason = undefined;
  this.onFulfilledFunc = [];
  this.onRejectedFunc = [];
  const _this = this;

  function resolve(value) {
    if (_this.state === "padding") {
      _this.value = value;
      _this.onFulfilledFunc.forEach(fn => fn());
      _this.state = "fulfilled";
    }
  }

  function reject(reason) {
    if (_this.state === "padding") {
      _this.reason = reason;
      _this.onRejectedFunc.forEach(fn => fn());
      _this.state = "rejected";
    }
  }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  const _this = this;
  let promise2;
  onFulfilled =
    typeof onFulfilled === "function"
      ? onFulfilled
      : function(value) {
          return value;
        };

  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : function(error) {
          return error;
        };

  if (_this.state === "padding") {
    promise2 = new Promise(function(resolve, reject) {
      _this.onFulfilledFunc.push(function() {
        setTimeout(function() {
          try {
            let x = onFulfilled(_this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });

      _this.onRejectedFunc.push(function() {
        setTimeout(function() {
          try {
            let x = onRejected(_this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  if (_this.state === "fulfilled") {
    promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        try {
          let x = onFulfilled(_this.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  if (_this.state === "rejected") {
    promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        try {
          let x = onRejected(_this.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return promise2;
};

function resolvePromise(p2, x, resolve, reject) {
  if (p2 === x && x != undefined) {
    reject(new TypeError("类型错误"));
  }
  //可能是promise,看下对象中是否有then方法，如果有~那就是个promise
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      //为了防止出现 {then:11}这种情况,需要判断then是不是一个函数
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          function(y) {
            //y 可能还是一个promise,那就再去解析，知道返回一个普通值为止
            resolvePromise(p2, y, resolve, reject);
          },
          function(err) {
            reject(err);
          }
        );
      } else {
        //如果then不是function 那可能是对象或常量
        resolve(x);
      }
    } catch (e) {
      reject(e);
    }
  } else {
    //说明是一个普通值
    resolve(x);
  }
}

module.exports = Promise;
