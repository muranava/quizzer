(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var ruleGroupID = params.groupid;
        var lang = params.lang;
        var langName = params.langname;
        var sql = "SELECT RS.string AS heading,CASE WHEN RT.string IS NOT NULL THEN RT.string ELSE EN.string END AS text "
            + "FROM rules "
            + "JOIN ruleStrings RS USING(ruleStringID) "
            + "JOIN (SELECT ruleID,string FROM ruleTranslations WHERE lang='en') EN USING(ruleID) "
            + "LEFT JOIN (SELECT ruleID,string FROM ruleTranslations WHERE lang=?) RT USING(ruleID) "
            + "WHERE ruleGroupID=? "
            + "ORDER BY heading;";
        sys.db.all(sql,[lang,ruleGroupID],function(err,rows){
            if (err||!rows) {return oops(response,err,'classes/gettranslations(1)')};
            composeDocument(rows);
        });

        function composeDocument(rows) {
            var obj = [];
            var misc = {
                category:'Miscellaneous',
                entries:[]
            };
            var category = false;
            var catnum = 0;
            var entrynum = 0;
            for (var i=0,ilen=rows.length;i<ilen;i++) {
                var row = rows[i];
                var m = row.heading.match(/^(?:\*\*)?([^*]+)(?:\*\*)?:\s*(.*)/);
                if (m) {
                    if (m[1] !== category) {
                        catnum += 1;
                        entrynum = 0;
                        var section = {
                            category:catnum + ". " + m[1],
                            entries:[]
                        };
                        obj.push(section);
                        category = m[1];
                    }
                    entrynum += 1;
                    var entry = {
                        heading: catnum + "." + entrynum + ". " + m[2],
                        text: row.text
                    }
                    section.entries.push(entry);
                } else {
                    misc.entries.push(row);
                }
            }
            if (misc.entries.length) {
                obj.push(misc);
            }
            // Good. So now we have the content, in sections, in Markdown, ready for catenating.
            var txt = '## Style and Grammar Notes for ' + langName + '\n\n';
            for (var i=0,ilen=obj.length;i<ilen;i++) {
                var section = obj[i];
                txt += '### ' + section.category + '\n\n';
                for (var j=0,jlen=section.entries.length;j<jlen;j++) {
                    var entry = section.entries[j];
                    txt += '#### ' + entry.heading + '\n\n';
                    txt += entry.text + '\n\n';
                }
            }
            // Convert to HTML
            var html = sys.markdown(txt,true,true);
            // And now convert it to RTF
            sys.pandoc.convert('html',html,['rtf'],function(result, err){
                if (err) {
                    // should probably respond before throwing
                    throw "Error in pandoc conversion: " + err;
                }
                // And ship it for downloading ... ?
                response.writeHead(200, {
                    'Content-Type': 'application/rtf',
                    'Content-Disposition': 'attachment; filename="QuizzerGuide_' + lang + '.rtf"'
                });
                response.end("{\\rtf1\\ansi\\deff3\\adeflang1025\n" + result.rtf + "\n\\par}");
            });
        }
    }
    exports.cogClass = cogClass;
})();