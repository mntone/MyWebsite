var MntoneLib;
(function (MntoneLib) {
    "use strict";

    var HttpClient = (function () {
        function HttpClient() {
        }
        HttpClient.prototype.getAsync = function (url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                };
                xhr.onerror = function () {
                    reject(new Error(xhr.statusText));
                };
                xhr.send();
            });
        };

        HttpClient.prototype.getAsJsonAsync = function (url) {
            return this.getAsync(url).then(function (ret) {
                return JSON.parse(ret);
            });
        };
        return HttpClient;
    })();
    MntoneLib.HttpClient = HttpClient;
})(MntoneLib || (MntoneLib = {}));
