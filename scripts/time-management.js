
let inputSemester = document.getElementById("courseload");
let inputWork = document.getElementById("work");
let inputCommute = document.getElementById("commute");
let inputChildCare = document.getElementById("childcare");
let inputVolunteer = document.getElementById("volunteer");
let inputOrganizations = document.getElementById("organizations");
let inputSocialMedia = document.getElementById("social media");
let inputEntertainment = document.getElementById("entertainment");
let inputSocializing = document.getElementById("socializing");
let inputOther = document.getElementById("other");

let outputScore = document.getElementById("score");
let outputTotal = document.getElementById("totalHours");
let outputMaxLoad = document.getElementById("maxLoad");
let outputComments = document.getElementById("scoreComments");


inputSemester.addEventListener("input", update);
inputWork.addEventListener("input", update);
inputCommute.addEventListener("input", update);
inputChildCare.addEventListener("input", update);
inputVolunteer.addEventListener("input", update);
inputOrganizations.addEventListener("input", update);
inputSocialMedia.addEventListener("input", update);
inputEntertainment.addEventListener("input", update);
inputSocializing.addEventListener("input", update);
inputOther.addEventListener("input", update);

function update()
{
	const totalHours = Number(inputWork.value) + Number(inputCommute.value) + Number(inputChildCare.value) + Number(inputVolunteer.value) + Number(inputOrganizations.value) + Number(inputSocialMedia.value) + Number(inputEntertainment.value) + Number(inputSocializing.value) + Number(inputOther.value);
	const rawScore = Number(inputSemester.value) / (20 - 0.25 * totalHours);
	const delta = Number(inputSemester.value) - (20 - 0.25 * totalHours);
	const finalScore = (rawScore <= 1) ? 100 : 100 - 10 * delta;
	const maxHours = -0.25 * totalHours + 20;
	const totalClassHours = inputSemester.value * 4;
	const totalWeekHours = 112;
	
	outputScore.value = finalScore.toFixed(0);
	outputTotal.value = totalHours;
	outputMaxLoad.value = maxHours;
	
	if (finalScore >= 100)
	{
		outputScore.style = "color:green";
		outputComments.value = "Your schedule is well balanced."
	}
	else if (finalScore > 70)
	{
		outputScore.style = "color:yellow";
		outputComments.value = "Your schedule is slightly overbooked. If you can, reduce your class load or outside of school activities."
	}
	else
	{
		outputScore.style = "color:red";
		outputComments.value = "Your schedule is highly overbooked. Reduce your class load or outside of school activities."
	}
}

update();
