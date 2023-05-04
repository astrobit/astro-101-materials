let tab = document.getElementById("grid");
tab.setAttribute("hidden","true");

let title = document.getElementById("title");
let question = document.getElementById("question");
let questionholder = document.getElementById("questionholder");
questionholder.setAttribute("hidden","true");

let categories = new Array();
let selections = new Array();
let mode = true; // true = normal mode / false = flashcard
let qmode = true; // true = show question / false = show answer
let level = 0; //0 = 1st round, 1 = 2nd round, 2 = 3rd round
let timerlength = 90; // seconds
let currquestion = null;

let quiz_index_file_promise = getFile("https://www.astronaos.com/astronomy/jquiz/index.json");
let g_quizIndex = null;
if (typeof quiz_index_file_promise != 'undefined' && quiz_index_file_promise !== null)
	quiz_index_file_promise.then(function(value){g_quizIndex = JSON.parse(value)},function(error){console.log("quiz index fetch error: " + error);})

let g_selectQuiz = document.getElementById("quizselect");
let g_selectClass = document.getElementById("classselect");
let g_classList = new Array();
let g_currentQuizList = null;
let g_currentQuiz = null;
g_selectQuiz.setAttribute("hidden","true");

function onSelectQuiz()
{
	g_currentQuiz = null;
	let quiz_data_file_promise = getFile("https://www.astronaos.com/astronomy/jquiz/" + g_currentQuizList[thisClass.quizzes[i].title] + ".json");
	if (typeof quiz_data_file_promise != 'undefined' && quiz_data_file_promise !== null)
		quiz_data_file_promise.then(function(value){g_currentQuiz = JSON.parse(value); initialize();},function(error){g_currentQuiz = null; ret.failed = true; ret.failed = error;})
}
g_selectQuiz.onchange = onSelectQuiz;

function onSelectClass()
{
	while (g_selectQuiz.options.length > 0)
	{
		g_selectQuiz.remove(0);
	}
	const thisClass = g_classList[g_selectClass.value];
	g_currentQuizList = new Array();
	for (let i = 0; i < thisClass.quizzes.length; i++)
	{
		let option = document.createElement("option");
		option.text = thisClass.quizzes[i].title;
		g_currentQuizList[thisClass.quizzes[i].title] = thisClass.quizzes[i].file;
		g_selectQuiz.add(option)
	}
	g_selectQuiz.removeAttribute("hidden");
}
g_selectClass.onchange = onSelectClass;



function indexWaiter()
{
	if (g_quizIndex !== null)
	{
		// populate quiz select
		// 
		let classArray = new Array();
		for (let i = 0; i < g_quizIndex.data.length; i++)
		{
			const classQuizzes = g_quizIndex.data[i];
			g_classList[classQuizzes.class] = {class: classQuizzes.class, quizzes: classQuizzes.quizzes};
			classArray.push(classQuizzes.class);
		}
		classArray.sort();
		for (let i = 0; i < classArray.length; i++)
		{
			let option = document.createElement("option");
			option.text = classArray[i];
			g_selectClass.add(option)
		}
		g_selectQuiz.removeAttribute("hidden");
		if (classArray.length == 1)
			onSelectClass();
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

function onSelect()
{
	const category = Number(this.id.charAt(0)) - 1;
	const row = Number(this.id.charAt(1)) - 1;
	
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
			this.innerHTML = null;
//			window.setTimeout(onAnswer, timerlength * 1000);
		}
	}
	
}

function initialize()
{
	let i;
	questionholder.setAttribute("hidden","true");
	title.innerHTML = g_currentQuiz.title;
	for (i = 1; i < 8; i++)
	{
		let cathdr = document.getElementById("cat" + i.toFixed(0));
		cathdr.innerHTML = g_currentQuiz.categories[i - 1];
		categories.push(cathdr)
		let Sarray = new Array();
		let j;
		for (j = 1; j < 6; j++)
		{
			const id = i.toFixed(0) + j.toFixed(0);
			let button = document.getElementById(id); 
			button.onclick = onSelect;
			button.innerHTML = j * 100;
			Sarray.push(button);
		}
		selections.push(Sarray);
	}
}


