const Promise = require("./Promise2");

var p = new Promise(function(resolve, reject) {
  setTimeout(() => {
    resolve(123);
    p.then(function(value) {
      console.log(value);
    });
  }, 3000);
})
  .then(function(value) {
    console.log(1);
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(6);
      }, 3000);
    }).then(function(value) {
      return value;
    });
    return new Error("123");
  })
  .then()
  .then(function(value) {
    console.log(value);
    return value;
  });

var p1 = Promise.resolve(1);

// Promise.reject(2).catch(function(reason) {
//   console.log(reason);
// });

Promise.all([p1, p1, p1, p]).then(function(res) {
  console.log(res);
});
