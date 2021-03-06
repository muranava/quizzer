(function () {
    var cogClass = function () {};
    cogClass.prototype.match = function (params) {
        return (this.sys.validCommenter(params)
                && !params.cmd
                && !params.admin
                && params.page === 'i18n');
    };
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var strings = params.strings;
        var i18n = this.sys.i18n;
        for (var str in strings) {
            strings[str] = i18n.__(str);
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(strings));
    }
    exports.cogClass = cogClass;
})();
