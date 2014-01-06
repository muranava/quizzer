var qzi = {};
function markExam () {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');
    // Call server and get an object with the correct answers
    var result = apiRequest(
        '/?admin='
            + adminID
            + '&page=quiz'
            + '&cmd=getcorrectanswers'
        , {
            classid:classID,
            quizno:quizNumber
        });
    if (false === result) return;
    qzi.correctAnswers = result.correctAnswers;
    qzi.serverResults = result.serverResults;
    qzi.clientResult = {};
    qzi.currentStudentID = false;
    var questionsDisplayNodes = document.getElementsByClassName('questions-display');
    var markingDisplayNodes = document.getElementsByClassName('marking-display');
    for (var i=0,ilen=questionsDisplayNodes.length;i<ilen;i+=1) {
        questionsDisplayNodes[i].style.display = 'none';
    }
    
    for (var i=0,ilen=markingDisplayNodes.length;i<ilen;i+=1) {
        markingDisplayNodes[i].style.display = 'block';
    }
    var inputNode = document.getElementById('string-input');
    inputNode.setAttribute('onkeypress','keystrokeHandler(event);');
    inputNode.focus();
};

function keystrokeHandler(event) {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');
    var inputNode = document.getElementById('string-input');
    var inputVal = '';
    if (event.key === 'Enter') {
        // alert(inputNode.value);
        // Capture entry
        var ans = {};
        var inputVal = inputNode.value;
        inputNode.value = '';
        inputVal = inputVal.replace(/^0*/,'');
        var studentOffset = parseInt(inputVal.slice(0,1),10);
        var questionOffset = parseInt(inputVal.slice(1,2),10);
        ans.studentID = inputVal.slice(3,3+studentOffset);
        ans.questionNumber = inputVal.slice(3+studentOffset,3+studentOffset+questionOffset);
        ans.choice = inputVal.slice(3+studentOffset+questionOffset,3+studentOffset+questionOffset+1);
        checkAlreadyDone(ans);
    }
};

function checkAlreadyDone(ans) {
    clearError();
    // Is this student already done?
    if (qzi.serverResults[ans.studentID]) {
        showError([qzi.studentNames[ans.studentID] + ' is already done.']);
    } else {
        checkIncomplete(ans);
    }
};

function checkIncomplete(ans) {
    // If there was a previous exam, is it complete?
    if (qzi.currentStudentID && qzi.currentStudentID !== ans.studentID) {
        showError(['Answers for ' + qzi.studentNames[ans.studentID] + ' are not yet complete']);
    } else {
        qzi.currentStudentID = ans.studentID;
        checkAlreadyAnswered(ans);
    }
};

function checkAlreadyAnswered(ans) {
    // Does this answer conflict? If so, it's an error
    if ("undefined" !== typeof qzi.clientResult[ans.questionNumber]) {
        showError(['Question ' + answer.questionNumber + ' is already done.'],
                  ['Deleting both responses, please try again.']);
        delete qzi.clientResult[ans.questionNumber];
        showAnswers();
    } else {
        recordAnswer(ans);
    }
};

function recordAnswer (ans) {
    qzi.clientResult[ans.questionNumber] = ans.choice;
    showAnswers();
    checkExamComplete(ans);
};

function checkExamComplete(ans) {
    // Is the exam complete?
    var numberOfAnswers = 0;
    for (var key in qzi.clientResult) {
        numberOfAnswers += 1;
    }
    if (qzi.numberOfQuestions === numberOfAnswers) {
        recordExamResult(ans);
    }
};

function recordExamResult(ans) {
    // Fire and forget
    apiRequest(
        
    );
    qzi.serverResults[ans.studentID] = qzi.clientResult;
    qzi.clientResult = {};
    qzi.currentStudentID = false;
    checkExamsComplete();
};

function checkExamsComplete() {
    // Are there no more exams to process?
    var numberOfStudents = 0;
    for (var key in qzi.serverResults) {
        numberOfStudents += 1;
    }
    if (qzi.numberOfStudents === numberOfStudents) {
        setButtonState('exam-completely-marked');
    }
};

function showError (lst) {
    
};

function clearError () {
    
};

function showAnswers () {
    var rightAnswer = false;
    if (ans.choice === qzi.correctAnswers[ans.questionNumber]) {
        rightAnswer = true;
    }
    
};

function downloadExam () {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');
    var downloadFrame = document.getElementById('download-frame');
    downloadFrame.src = '/?admin='
        + adminID
        + '&page=quiz'
        + '&cmd=downloadexam'
        + '&classid='
        + classID
        + '&quizno='
        + quizNumber
    setButtonState('mark-exam');
};

function buildQuestionList (quizobj) {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    var inputNode = document.getElementById('string-input');
    inputNode.setAttribute('onkeypress','keystrokeHandler(event);');
    inputNode.blur();

    // Call for quiz questions
    if (!quizobj) {
        // if rows is nil, call the server.
        var quizobj = apiRequest(
            '/?admin='
                + adminID
                + '&page=quiz'
                + '&cmd=readquestions'
            , {
                classid:classID,
                quizno:quizNumber
            });
        if (false === quizobj) return;
    }
    var questionsLst = displayQuestions(quizobj.questions);
    var button = document.getElementById('add-question-button');
    button.disabled = false;
    qzi.pending = quizobj.pending;
    if (quizobj.examName) {
        console.log("SETTING EXAM BUTTON");
        
        setButtonState('download-exam',questionsLst,quizobj.pending);
    } else {
        setButtonState('send-quiz',questionsLst,quizobj.pending);
    }
}

function enableEditing () {
    var buttons = document.getElementsByClassName('editing-button');
    for (var i=0,ilen=buttons.length;i<ilen;i+=1) {
        buttons[i].style.display = 'inline';
        buttons[i].disabled = false;
    }
};

function disableEditing () {
    var buttons = document.getElementsByClassName('editing-button');
    for (var i=0,ilen=buttons.length;i<ilen;i+=1) {
        buttons[i].style.display = 'none';
    }
    var radios = document.getElementsByClassName('selection');
    for (var i=0,ilen=radios.length;i<ilen;i+=1) {
        var radio = radios[i];
        console.log("tagName: "+radio.tagName);
        if (radio.tagName.toLowerCase() == "input") {
            var marker = document.createElement('span');
            marker.setAttribute('class','selection');
            if (radio.checked) {
                marker.innerHTML = '\u25ef';
                marker.setAttribute('style','color:green;text-weight:bold;')
            } else {
                //marker.innerHTML = '\u274c';
                marker.innerHTML = '\u00d7';
                marker.setAttribute('style', 'color:red;');
            }
            radio.parentNode.insertBefore(marker,radio);
            radio.parentNode.removeChild(radio);
        }
    }
};

function sendQuiz() {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    var emptystr = apiRequest(
        '/?admin='
            + adminID
            + '&page=quiz'
            + '&cmd=sendquiz'
        , {
            classid:classID,
            quizno:quizNumber
        });
    setButtonState('quiz-done');
}

function writeChoice(questionNumber, choice) {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    var emptystr = apiRequest(
        '/?admin='
            + adminID 
            + '&page=quiz'
            + '&cmd=writeonechoice'
        , {
            classid:classID,
            quizno:quizNumber,
            questionno:questionNumber,
            choice:choice
        }
    );
}

function addQuestion () {
    // Add a question node and populate using openQuestion()
    var questions = document.getElementById('quiz-questions');
    questions.appendChild(openQuestion());
    var button = document.getElementById('add-question-button');
    button.disabled = true;
}

function openQuestion (questionNumber) {

    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    if (!questionNumber) {
        questionNumber = 0;
    }
    var qobj = {};
    var node;
    if (questionNumber) {
        // If questionNumber present, call for JSON of question from server
        // (to get markdown)
        qobj = apiRequest(
            '/?admin='
                + adminID
                + '&page=quiz'
                + '&cmd=readonequestion'
            , {
                classid:classID,
                quizno:quizNumber,
                questionno:questionNumber
            }
        );
        if (false === qobj) return;
        // ... empty this child ...
        node = document.getElementById('quiz-question-' + questionNumber);
        for (var i=0,ilen=node.childNodes.length;i<ilen;i+=1) {
            node.removeChild(node.childNodes[0]);
        }
        // ... and fill with saved data.
        
    } else {
        // Otherwise, create empty object
        qobj = {
            rubric: "",
            questions: ["", "", "", ""],
            correct: 3
        }
        node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + questionNumber);
    }
    var rubric = document.createElement('div');
    rubric.setAttribute("class", "rubric");
    var rubricBox = document.createElement('textarea');
    rubricBox.setAttribute('style', 'vertical-align: top;');
    rubricBox.setAttribute('placeholder', 'Enter rubric here');
    rubricBox.value = qobj.rubric;
    rubricBox.setAttribute('cols', '70');
    rubricBox.setAttribute('rows', '3');
    rubric.appendChild(rubricBox);
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Standard');
    button.setAttribute('onclick', 'standardRubric(' + questionNumber + ')')
    button.setAttribute('class', 'button');
    rubric.appendChild(button);
    node.appendChild(rubric);

    for (var i=0,ilen=qobj.questions.length;i<ilen;i+=1) {
        var choice_wrapper = document.createElement('div');
        choice_wrapper.setAttribute('class', 'choice');
        var checkbox = document.createElement('input');
        if (qobj.correct === i) {
            checkbox.setAttribute('checked', true);
        }
        checkbox.setAttribute('name', 'question-' + questionNumber);
        checkbox.setAttribute('type', 'radio');
        checkbox.setAttribute('class', 'selection');
        choice_wrapper.appendChild(checkbox)
        var selectionText = document.createElement('textarea');
        selectionText.setAttribute('cols', '60');
        selectionText.setAttribute('rows', '3');
        selectionText.setAttribute('class', 'selection-text');
        selectionText.setAttribute('placeholder', 'Enter choice here');
        selectionText.value = qobj.questions[i];
        choice_wrapper.appendChild(selectionText)
        var cloneButton = document.createElement('input');
        cloneButton.setAttribute('type', 'button');
        if (i === 0) {
            cloneButton.setAttribute('value', 'Copy to all');
            cloneButton.setAttribute('onclick', 'copyToAll(' + questionNumber + ');');
            cloneButton.setAttribute('class', 'button');
        } else {
            cloneButton.setAttribute('value', 'Ditto');
            cloneButton.setAttribute('onclick', 'dittoPrevious(' + questionNumber + ',' + i + ');');
            cloneButton.setAttribute('class', 'button');
        }
        choice_wrapper.appendChild(cloneButton);
        node.appendChild(choice_wrapper);
    }
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Save Question');
    button.setAttribute('onclick', 'closeQuestion("' + questionNumber + '")');
    button.setAttribute('class', 'button');
    node.appendChild(button);
    return node;
}

function standardRubric (questionNumber) {
    var node = document.getElementById('quiz-question-' + questionNumber);
    if (!node.childNodes[0].childNodes[0].value) {
        node.childNodes[0].childNodes[0].value = "Which of the following is correct?";
    }
}

function copyToAll (questionNumber) {
    var node = document.getElementById('quiz-question-' + questionNumber);
    if (node.childNodes[1].childNodes[1].value) {
        var val = node.childNodes[1].childNodes[1].value;
        for (var i=2,ilen=5;i<ilen;i+=1) {
            if (!node.childNodes[i].childNodes[1].value) {
                node.childNodes[i].childNodes[1].value = val;
            }
        }
    }
}

function dittoPrevious (questionNumber, choice) {
    var node = document.getElementById('quiz-question-' + questionNumber);
    var prev = node.childNodes[choice].childNodes[1];
    var current = node.childNodes[1 + choice].childNodes[1];
    if (prev.value && !current.value) {
        current.value = prev.value;
    }
}

function closeQuestion (questionNumber) {

    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    // Extracts text-box content to object
    var node = document.getElementById('quiz-question-' + questionNumber);
    var rubric = node.childNodes[0].childNodes[0].value;
    var abort = false;
    if (!rubric) {
        abort = true;
        alert("Rubric is empty. All fields must have content.");
    }
    var correct = 0;
    var questions = [];
    for (var i=1,ilen=node.childNodes.length - 1;i<ilen;i+=1) {
        if (node.childNodes[i].childNodes[0].checked) {
            correct = (i-1);
        }
        var content = node.childNodes[i].childNodes[1].value;
        if (!content && !abort) {
            abort = true;
            alert("Choice " + i + " is empty. All fields must have content.");
        }
        questions.push(content);
    }
    if (abort) return;
    var obj = {
        rubric: rubric,
        questions: questions,
        correct: correct
    }
    // Sends object to server for saving
    var questionNumber = apiRequest(
        '/?admin=' 
            + adminID 
            + '&page=quiz'
            + '&cmd=writeonequestion'
        , {
            classid:classID,
            quizno:quizNumber,
            questionno:questionNumber,
            data:obj
        });
    if (false === questionNumber) return;
    node.setAttribute('id', 'quiz-question-' + questionNumber);
    for (var i=0,ilen=node.childNodes.length;i<ilen;i+=1) {
        node.removeChild(node.childNodes[0])
    }
    displayQuestion(obj, questionNumber);
    setButtonState('send-quiz');
}

function displayQuestions (quizobj) {
    var questions = document.getElementById('quiz-questions');
    // Purge children
    for (var i=0,ilen=questions.childNodes.length;i<ilen;i+=1) {
        questions.removeChild(questions.childNodes[0]);
    }
    // Sort return
    var lst = [];
    for (var key in quizobj) {
        lst.push(key);
    }
    lst.sort(function(a,b){
        var a = parseInt(a, 10);
        var b = parseInt(b, 10);
        if (a>b) {
            return 1;
        } else if (a<b) {
            return -1;
        } else {
            return 0;
        }
    });
    setButtonState('send-quiz',lst);
    // Display objects in lst
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        displayQuestion(quizobj[lst[i]], lst[i]);
        var node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + lst[i]);
    }
    return lst;
}

function displayQuestion (qobj, questionNumber) {

    // XXX Put a listener on the checkbox nodes, so that correct answer
    // XXX can be set and saved without opening and closing the
    // XXX question with the button.

    var questions = document.getElementById('quiz-questions');
    var node = document.getElementById('quiz-question-' + questionNumber);
    if (!node) {
        node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + questionNumber);
        questions.appendChild(node);
    }
    var rubric = document.createElement('div');
    rubric.setAttribute("class", "rubric");
    rubric.innerHTML = markdown(qobj.rubric);
    node.appendChild(rubric);
    for (var i=0,ilen=qobj.questions.length;i<ilen;i+=1) {
        var choice_wrapper = document.createElement('div');
        choice_wrapper.setAttribute('class', 'choice');
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'radio');
        checkbox.setAttribute('name', 'question-' + questionNumber);
        checkbox.setAttribute('class', 'selection');
        checkbox.setAttribute('onclick', 'writeChoice(' + questionNumber + ', ' + i + ')');
        if (qobj.correct == i) {
            checkbox.checked = true;
        }
        choice_wrapper.appendChild(checkbox)
        var selectionText = document.createElement('div');
        selectionText.setAttribute('class', 'selection-text');
        selectionText.innerHTML = markdown(qobj.questions[i]);
        choice_wrapper.appendChild(selectionText)
        node.appendChild(choice_wrapper)
    }
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Edit Question');
    button.setAttribute('class', 'button editing-button');
    button.setAttribute('onclick', 'openQuestion("' + questionNumber + '")');
    node.appendChild(button);
}

function setButtonState (state,lst) {
    var pending = qzi.pending;
    if ("undefined" === typeof lst) {
        lst = [1];
    }
    var sendQuiz = document.getElementById('send-quiz');
    var quizDone = document.getElementById('quiz-done');
    var downloadExam = document.getElementById('download-exam');
    var markExam = document.getElementById('mark-exam');
    var addQuestion = document.getElementById('add-question-button');
    if (lst.length == 0) {
        sendQuiz.disabled = true;
    } else {
        sendQuiz.disabled = false;
    }
    if ('download-exam' === state && pending > 0) {
        state = 'mark-exam';
    }
    switch (state) {
    case 'send-quiz':
        downloadExam.style.display = 'none';
        if (lst.length == 0) {
            sendQuiz.style.display = 'none';
            quizDone.style.display = 'inline';
            quizDone.value = "In Draft";
            enableEditing();
        } else if (pending == -1) {
            sendQuiz.style.display = 'inline';
            sendQuiz.value = 'Send Quiz';
            quizDone.style.display = 'none';
            enableEditing();
        } else if (pending === 0) {
            sendQuiz.style.display = 'none';
            quizDone.style.display = 'inline';
            quizDone.value = "Responses Complete";
            disableEditing();
        } else {
            sendQuiz.style.display = 'inline';
            sendQuiz.value = 'Responses Pending: ' + pending;
            quizDone.style.display = 'none';
            disableEditing();
        }
        break;
    case 'quiz-done':
        sendQuiz.style.display = 'none';
        quizDone.style.display = 'inline';
        quizDone.value = 'Quiz Sent';
        downloadExam.style.display = 'none';
        disableEditing();
        break;
    case 'download-exam':
        console.log("  Set download-exam");
        sendQuiz.style.display = 'none';
        quizDone.style.display = 'none';
        downloadExam.style.display = 'inline';
        markExam.style.display = 'none';
        break;
    case 'mark-exam':
        console.log("  Set mark-exam");
        sendQuiz.style.display = 'none';
        quizDone.style.display = 'none';
        downloadExam.style.display = 'none';
        markExam.style.display = 'inline';
        disableEditing();
        break;
    default:
        sendQuiz.style.display = 'inline';
        quizDone.style.display = 'none';
        downloadExam.style.display = 'none';
        break;
    }
}

