
function submit()
{
	const queryElement = document.getElementById("query");
	const filenameElement = document.getElementById("filename");
	const queryText = queryElement.value;
	const queryLength = queryText.length;
	
	let i;
	if (queryLength > 0 && filenameElement.value.length > 0)
	{
		simbadQuery(queryText).then(function(result){
				download(result,filenameElement.value,"json");},
				function(error){
				console.log("Error: " + error);}
				);
	}	
}

