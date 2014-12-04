var mns = MntoneSite;

var NavgationController = (function () {
    function NavgationController(primaryList, secondaryList, lang) {
        this.primaryList = primaryList;
        this.secondaryList = secondaryList;
        this.client = new mns.NavigationClient(lang);
    }
    NavgationController.prototype.loadAsync = function () {
        var _this = this;
        return this.client.getDataAsync().then(function (nav) {
            nav.map(function (n) {
                var img = document.createElement("img");
                img.src = n.icon;
                img.alt = n.title;
                var icon = document.createElement("span");
                icon.className = "image";
                icon.appendChild(img);
                var text = document.createElement("span");
                text.className = "text";
                text.setAttribute("itemprop", "name");
                text.appendChild(document.createTextNode(n.title));
                var a = document.createElement("a");
                a.href = n.url;
                a.setAttribute("itemprop", "url");
                a.appendChild(icon);
                a.appendChild(text);
                var li = document.createElement("li");
                li.appendChild(a);
                if (n.expand) {
                    _this.secondaryList.appendChild(li);
                } else {
                    _this.primaryList.appendChild(li);
                }
            });
        });
    };
    return NavgationController;
})();

window.onload = function () {
    var lang = document.documentElement.lang;
    var primary = document.getElementById("primary-list");
    var secondary = document.getElementById("secondary-list");
    var con = new NavgationController(primary, secondary, lang);
    con.loadAsync();
};
