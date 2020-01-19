function Promise(elecutor) {
  this.state = "padding"; // padding、fullfiled、rejected
  this.value = undefined;
  this.reason = undefined;
  this.onFullfiledFunc = [];
  this.onRejectedFunc = [];
  var that = this;

  function resolve(value) {
    if (that.state === "padding") {
      that.state = "fullfiled";
      that.value = value;
      that.onFullfiledFunc.forEach(fn => fn());
    }
  }

  function reject(reason) {
    if (that.state === "padding") {
      that.state = "rejected";
      that.reason = reason;
      that.onRejectedFunc.forEach(fn => fn());
    }
  }

  elecutor(resolve, reject);
}

Promise.prototype.then = function(onFullfiled, onRejected) {
  var that = this;
  var promise2;
  onFullfiled =
    typeof onFullfiled === "function"
      ? onFullfiled
      : function(value) {
          return value;
        };

  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : function(reason) {
          return reject;
        };

  if (that.state === "padding") {
    promise2 = new Promise(function(resolve, reject) {
      that.onFullfiledFunc.push(function() {
        try {
          var x = onFullfiled(that.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          onRejected(error);
        }
      });
      that.onRejectedFunc.push(function() {
        try {
          var x = onRejected(that.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          onRejected(error);
        }
      });
    });
  }

  if (that.state === "fullfiled") {
    promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onFullfiled(that.value);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        onRejected(error);
      }
    });
  }

  if (that.state === "rejected") {
    promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onRejected(that.reason);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        onRejected(error);
      }
    });
  }

  return promise2;
};

// function resolvePromise(p2, x, resolve, reject) {
//   if (p2 === x && x != undefined) {
//     reject(new TypeError("类型错误"));
//   }
//   //可能是promise,看下对象中是否有then方法，如果有~那就是个promise
//   if (x !== null && (typeof x === "object" || typeof x === "function")) {
//     try {
//       //为了防止出现 {then:11}这种情况,需要判断then是不是一个函数
//       let then = x.then;
//       if (typeof then === "function") {
//         then.call(
//           x,
//           function(y) {
//             //y 可能还是一个promise,那就再去解析，知道返回一个普通值为止
//             resolvePromise(p2, y, resolve, reject);
//           },
//           function(err) {
//             reject(err);
//           }
//         );
//       } else {
//         //如果then不是function 那可能是对象或常量
//         resolve(x);
//       }
//     } catch (e) {
//       reject(e);
//     }
//   } else {
//     //说明是一个普通值
//     resolve(x);
//   }
// }

function resolvePromise(p2, x, resolve, reject) {
  if (p2 === x && x != undefined) {
    reject(new TypeError("type error"));
  }

  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      var then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          function(y) {
            resolvePromise(p2, y, resolve, reject);
          },
          function(error) {
            reject(error);
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

module.exports = Promise;
