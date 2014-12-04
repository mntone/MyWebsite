var MntoneSite;
(function (MntoneSite) {
    "use strict";

    var Navigation = (function () {
        function Navigation() {
        }
        return Navigation;
    })();
    MntoneSite.Navigation = Navigation;

    var NavigationClient = (function () {
        function NavigationClient(lang) {
            this.lang = lang;
            this.client = new MntoneLib.HttpClient();
        }
        NavigationClient.prototype.getDataAsync = function () {
            return this.client.getAsJsonAsync("/d/nav-" + this.lang + ".json").then(function (j) {
                return j;
            });
        };
        return NavigationClient;
    })();
    MntoneSite.NavigationClient = NavigationClient;
})(MntoneSite || (MntoneSite = {}));
