var nextnodecounter = 0;
var xmldocstr;
var correctanscounter = 0;
var randmarrcnt = 0;  
var quesindex = 0;  
var getvalue;  
var ansarry = new Array();
var complete = false;
var i;

var classID = getParameterByName('classid');
var studentID = getParameterByName('id');
var studentKey = getParameterByName('key');
var quizNumber = getParameterByName('quizno');
var hostname = getParameterByName('hostname');
if (!hostname) {
    hostname = 'our.law.nagoya-u.ac.jp';
}

var xhr = new XMLHttpRequest();
xhr.open('POST', 'http://' + hostname + ':3498/?cmd=quizdata&classid=' + classID+ '&id=' + studentID + '&key=' + studentKey + '&quizno=' + quizNumber, false);
xhr.setRequestHeader("Content-type","text/plain");
xhr.send(null);
var quizData = JSON.parse(xhr.responseText);

// Need something to extract the query string

function UITest1() {
  for (var i=0,ilen=quizData.questions.length;i<ilen;i+=1) {
    remap = randomize(quizData.questions[i].questions);
    quizData.questions[i].remap = remap;
  }
  var remap = randomize(quizData.questions);
  quizData.remap = remap;
  displaychild(quizData);
}
function OnSuccessCall(response) {  
}  
function OnErrorCall(response) {  
}  
function loadXMLString(str) {  
	if (window.DOMParser) {  
		parser = new DOMParser();  
		xmlDoc =
            parser.parseFromString(str, "text/xml");  
    }  
    else // Internet Explorer  
	{  
	    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");  
		xmlDoc.async = "false";  
		xmlDoc.loadXML(txt);  
	}  
	return xmlDoc;  
}  
var newxmldoc;
function displaychild(quizData) {  
    // randomizeques(quizData);
    document.getElementById("nextButton").disabled = true;  
	if (document.getElementById("nextButton").innerHTML == "Show&nbsp;Result") {  
        document.getElementById("nextButton").onclick = ShowResult;
        document.getElementById("nextButton").disabled = false;
    }
    if (quizData.questions.length == nextnodecounter) {
      return;
    }
    var question = quizData.questions[nextnodecounter];
    document.getElementById("question").innerHTML = marked.parse(question.rubric);
    
    // display question text  
	document.getElementById("options").innerHTML = "";

    ansarry.push(question.correct);

    for (var i=0,ilen=question.questions.length;i<ilen;i+=1) {
        var choice = marked(question.questions[i]);
        var radioBtn = $('<li><div class="choice"><input name="r1" type="radio" value="'
                         + i
                         + '" onclick="enablebtn(this.value)" id="rbtnCount' + i + '" /><div class="label">' 
                         + choice
                         + '</div></div></li>');  
        radioBtn.appendTo('#options');  
        checkradiobtn();
    }
}  
function FunNextNode() {
	nextnodecounter = nextnodecounter + 1;
    var pos = (nextnodecounter-1);
	if (getvalue == quizData.questions[pos].remap[ansarry[nextnodecounter-1]]) {  
	    correctanscounter = correctanscounter + 1;  
	}  
	var questions = quizData.questions;
    if (questions.length == (nextnodecounter)) {
        document.getElementById("nextButton").innerHTML = "Show&nbsp;Result";
        // nextnodecounter += -1;
    }
    displaychild(quizData);  
}  
function checkradiobtn()  
{  
	var radios =
        document.getElementsByTagName('input');  
    var value;  
    for (var i = 0; i < radios.length; i++) {  
	    if (radios[i].type == 'radio' && radios[i].checked) {  
		    document.getElementById("nextButton").disabled = true;  
        }
    }  
} 
var setvalue; 
function enablebtn(setvalue) {  
	document.getElementById("nextButton").disabled = false;  
    getvalue = setvalue;  
}  
function ShowResult() {  
	document.getElementById("result").style.display="block";
    
    document.getElementById("noofques").innerHTML = nextnodecounter;  
    document.getElementById("noofcorans").innerHTML = correctanscounter;  
    // XXX Dump result somewhere. We would want:
    // XXX   * Total correct
    // XXX   * Questions missed
    // XXX   * Date and time submitted
    // XXX Dump as JSON. Viz: http://stackoverflow.com/questions/5670752/write-pretty-json-to-file-using-node-js
    // XXX Secondary API reads the results and compiles to CSV
    // XXX Done.
}
// function to get random index of questions  
var tempcount = 0;  
var tempxmldoc;  
var randquearr = new Array();  

function randomize(array) {
  var orig_order = [];
  for (var i=0,ilen=array.length;i<ilen;i+=1) {
    orig_order.push(i);
  }
  var new_order = orig_order.slice();
  var currentIndex = array.length
      , temporaryValue
      , randomIndex
      , temporaryPos
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    temporaryPos = new_order[currentIndex];
    array[currentIndex] = array[randomIndex];
    new_order[currentIndex] = new_order[randomIndex];
    array[randomIndex] = temporaryValue;
    new_order[randomIndex] = temporaryPos;
  }
  var remap = {};
  for (var i=0,ilen=array.length;i<ilen;i+=1) {
    remap[new_order[i]] = orig_order[i];
  }
  return remap;
}

