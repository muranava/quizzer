(function () {
    var cogClass = function () {};
    cogClass.prototype.match = function (params) {
        return (this.sys.validAdmin(params,1)
                && !params.cmd
                && !params.commenter
                && (!params.page || params.page === 'top'));
    };
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(this.page)
    }
    exports.cogClass = cogClass;
})();
