(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var page = this.page;
        this.sys.db.get('SELECT name FROM classes WHERE classID=?',[params.classid],function(err,row){
            if (err||!row) {return oops(response,err,'class')};
            var myPage = page.toString().replace(/@@CLASS@@/g, row.name);
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(myPage);
        });
    }
    exports.cogClass = cogClass;
})();