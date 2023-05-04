let tab = document.getElementById("grid");
tab.setAttribute("hidden","true");
let tabHead = document.getElementById("catetories");
let tabGridBody = document.getElementById("gridbody");

let title = document.getElementById("title");
let question = document.getElementById("question");
let questionholder = document.getElementById("questionholder");
questionholder.setAttribute("hidden","true");

let mode = true; // true = normal mode / false = flashcard
let qmode = true; // true = show question / false = show answer
let level = 0; //0 = 1st round, 1 = 2nd round, 2 = 3rd round
let timerlength = 90; // seconds
let currquestion = null;

function processQuizIndex(value)
{
	g_quizIndex = JSON.parse(value);
}
let quiz_index_file_promise = getFile("https://www.astronaos.com/astronomy/jquiz/index.json");
let g_quizIndex = null;
if (typeof quiz_index_file_promise != 'undefined' && quiz_index_file_promise !== null)
	quiz_index_file_promise.then(processQuizIndex,function(error){console.log("quiz index fetch error: " + error);})

let g_selectClassTab = document.getElementById("classselectDiv");
let g_selectQuizTab = document.getElementById("quizselectDiv");
let g_selectQuiz = document.getElementById("quizselect");
let g_selectClass = document.getElementById("classselect");
let g_classList = new Array();
let g_currentQuizList = null;
let g_currentQuiz = null;
let g_thisClass = null;
let g_quizControls = document.getElementById("quizControls");
g_selectQuizTab.setAttribute("hidden","true");
g_quizControls.setAttribute("hidden","true");

function onSelectQuiz()
{
	if (g_selectQuiz.value !== "Select Quiz ...")
	{
		g_currentQuiz = null;
		let quiz_data_file_promise = getFile("https://www.astronaos.com/astronomy/jquiz/" + g_currentQuizList[g_selectQuiz.value]);
		if (typeof quiz_data_file_promise != 'undefined' && quiz_data_file_promise !== null)
			quiz_data_file_promise.then(function(value){g_currentQuiz = JSON.parse(value); initialize();},function(error){g_currentQuiz = null; ret.failed = true; ret.failed = error;})
	}
}
g_selectQuiz.onchange = onSelectQuiz;

function onSelectClass()
{
	while (g_selectQuiz.options.length > 0)
	{
		g_selectQuiz.remove(0);
	}
	g_thisClass = g_classList[g_selectClass.value];
	g_currentQuizList = new Array();

	{
		let option = document.createElement("option");
		option.text = "Select Quiz ...";
		g_selectQuiz.add(option)
	}
	for (let i = 0; i < g_thisClass.quizzes.length; i++)
	{
		let option = document.createElement("option");
		option.text = g_thisClass.quizzes[i].title;
		g_currentQuizList[g_thisClass.quizzes[i].title] = g_thisClass.quizzes[i].file;
		g_selectQuiz.add(option)
	}
	g_selectQuizTab.removeAttribute("hidden");
}
g_selectClass.onchange = onSelectClass;



function indexWaiter()
{
	if (g_quizIndex !== null)
	{
		// populate quiz select
		// 
		if (g_quizIndex.data.length == 1)
		{
			let option = document.createElement("option");
			option.text = "Select Class ...";
			g_selectClass.add(option)
			
			option = document.createElement("option");
			g_classList[g_quizIndex.data[0].class] = {class: g_quizIndex.data[0].class, quizzes: g_quizIndex.data[0].quizzes};
			option.text = g_quizIndex.data[0].class;
			g_selectClass.add(option)
			
			g_selectClass.value = g_quizIndex.data[0].class;
			onSelectClass();
		}
		else
		{
			let classArray = new Array();
			for (let i = 0; i < g_quizIndex.data.length; i++)
			{
				const classQuizzes = g_quizIndex.data[i];
				g_classList[classQuizzes.class] = {class: classQuizzes.class, quizzes: classQuizzes.quizzes};
				classArray.push(classQuizzes.class);
			}
			classArray.sort();
			
			{
				let option = document.createElement("option");
				option.text = "Select Class ...";
				g_selectClass.add(option)
			}
			for (let i = 0; i < classArray.length; i++)
			{
				let option = document.createElement("option");
				option.text = classArray[i];
				g_selectClass.add(option)
			}
		}
		g_selectQuiz.removeAttribute("hidden");
	}
	else
		window.setTimeout(indexWaiter, 1000.0);
	
}	
indexWaiter();
	
function onAnswer()
{
	if (currquestion !== null)
	{
		if (qmode == false)
		{
			tab.removeAttribute("hidden");
			questionholder.setAttribute("hidden","true");
			g_quizControls.removeAttribute("hidden");
		}
		else
		{
			question.innerHTML = currquestion.a;
			qmode = false;
//			if (mode)
//				window.setTimeout(onAnswer, timerlength * 1000);
				
		}
	}
}

function onSelect(category,row)
{
	let buttonid = category.toFixed(0) + row.toFixed(0);
	let qset = g_currentQuiz.questions[level];
	currquestion = qset[category][row];
	if (!mode || !currquestion.complete)
	{
		tab.setAttribute("hidden","true");
		question.innerHTML = currquestion.q;
		currquestion.complete = true;
		questionholder.removeAttribute("hidden");
		qmode = true;
		if (mode)
		{
			let currButton = document.getElementById(buttonid);
			currButton.innerHTML = null;
//			window.setTimeout(onAnswer, timerlength * 1000);
		}
		g_quizControls.setAttribute("hidden","true");
	}
	
}

function onReset()
{
	let qset = g_currentQuiz.questions[level];
	for (let row = 0; row < 5; row++)
	{
		for (let i = 0; i < g_currentQuiz.categories.length; i++)
		{
			let buttonid = i.toFixed(0) + row.toFixed(0);
			let currButton = document.getElementById(buttonid);
			currButton.innerHTML = ((row + 1) * 100).toFixed(0);
			currquestion = qset[i][row].complete = false;
		}
	}
}

function onSwitchQuiz()
{
	tab.setAttribute("hidden","true");
	questionholder.setAttribute("hidden","true");
	g_selectClassTab.removeAttribute("hidden");
	g_selectQuizTab.removeAttribute("hidden");
	g_quizControls.setAttribute("hidden","true");
}

function initialize()
{
	tab.removeAttribute("hidden"); 
	questionholder.setAttribute("hidden","true");
	g_selectQuizTab.setAttribute("hidden","true"); 
	g_selectClassTab.setAttribute("hidden","true");
	g_quizControls.removeAttribute("hidden");

	let i;
	title.innerHTML = g_currentQuiz.title;
	
	let categoriesHTML = '<tr>';
	for (let i = 0; i < g_currentQuiz.categories.length; i++)
	{
		categoriesHTML += '<th id="cat"'+i+'">' + g_currentQuiz.categories[i] + '</th>';
	}
	categoriesHTML += '</tr>'
	tabHead.innerHTML = categoriesHTML;
	
	let bodyHTML = new String();
	for (let row = 0; row < 5; row++)
	{
		bodyHTML += '<tr>';
		for (let i = 0; i < g_currentQuiz.categories.length; i++)
		{
			bodyHTML += '<td><button id="'+i.toFixed(0)+row.toFixed(0)+'" onclick="onSelect('+i+','+row+');">'+((row+1)*100)+'</button></td>'
		}
		bodyHTML += '</tr>'
	}
	tabGridBody.innerHTML = bodyHTML;	
}


