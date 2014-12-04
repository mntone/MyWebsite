var mns = MntoneSite;

var NavgationController = (function () {
    function NavgationController(element, lang) {
        this.element = element;
        this.client = new mns.NavigationClient(lang);
    }
    NavgationController.prototype.loadAsync = function () {
        var _this = this;
        return this.client.getDataAsync().then(function (nav) {
            nav.map(function (n) {
                var span = document.createElement("span");
                span.setAttribute("itemprop", "name");
                span.appendChild(document.createTextNode(n.title));
                var a = document.createElement("a");
                a.href = n.url;
                a.setAttribute("itemprop", "url");
                a.appendChild(span);
                var li = document.createElement("li");
                li.appendChild(a);
                _this.element.appendChild(li);
            });
        });
    };
    return NavgationController;
})();

window.onload = function () {
    var lang = document.documentElement.lang;
    var navUl = document.getElementById("nav-ul");
    var con = new NavgationController(navUl, lang);
    con.loadAsync();
};
