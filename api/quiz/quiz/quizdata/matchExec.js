(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var classID = params.classid;
        var studentID = params.studentid;
        var studentKey = params.studentkey;
        var quizNumber = params.quizno;
        var questionIDs = params.questionids ? params.questionids.split(',') : [];
        var sys = this.sys;
        var util = this.utils;
        var quizData = {classID:classID,studentID:studentID,studentKey:studentKey,quizNumber:quizNumber};
        quizData.questions = [];
        var questionsCount = 0;

        if (questionIDs.length) {
            quizData.quizNumber = 'Self-Test';
            getQuestionsByID();
        } else {
            getQuestionsByQuizNumber();
        }

        function getQuestionsByID () {
            var sql = 'SELECT questionID,quizNumber,questionNumber,string AS rubric,correct,examName '
                + 'FROM quizzes '
                + 'NATURAL JOIN questions '
                + 'JOIN strings USING(stringID) '
                + 'WHERE classID=? AND examName IS NULL AND questionID IN (' + questionIDs.join(',') + ') '
                + 'ORDER BY questionID;';
            sys.db.all(sql,[classID],function(err,rows){
                if (err||!rows) {return oops(response,err,'*quiz/quizdata(1)')};
                questionsCount += rows.length;
                getQuestionsRepeater(rows,0,rows.length);
            });
        }

        function getQuestionsByQuizNumber () {
            var sql = 'SELECT questionID,quizNumber,questionNumber,string AS rubric,correct,examName '
                + 'FROM quizzes '
                + 'NATURAL JOIN questions '
                + 'JOIN strings USING(stringID) '
                + 'WHERE classID=? AND quizNumber=? AND examName IS NULL '
                + 'ORDER BY questionNumber';
            sys.db.all(sql,[classID,quizNumber],function(err,rows){
                if (err||!rows) {return oops(response,err,'*quiz/quizdata(2)')};
                questionsCount += rows.length;
                getQuestionsRepeater(rows,0,rows.length);
            });
        }

        function getQuestionsRepeater(rows,pos,limit) {
            if (pos < limit) {
                var obj = {
                    quizNumber: rows[pos].quizNumber,
                    number: rows[pos].questionNumber,
                    rubric: rows[pos].rubric,
                    correct: rows[pos].correct
                }
                getQuestionsRepeater(rows,pos+1,limit);
                
                util.getChoices(response,obj,rows[pos].questionID,function(obj,row) {
                    quizData.questions.push({
                        rubric: obj.rubric,
                        questions:[
                            row.one,
                            row.two,
                            row.three,
                            row.four
                        ],
                        correct: obj.correct,
                        number: obj.number,
                        quizNumber: obj.quizNumber
                    });
                    questionsCount += -1;
                    if (!questionsCount) {
                        response.writeHead(200, {'Content-Type': 'application/json'});
                        response.end(JSON.stringify(quizData));
                    }
                });
            }
        };
    }
    exports.cogClass = cogClass;
})();
