// Source: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file/30832210#30832210
// Author(s): Kanchu (https://stackoverflow.com/users/1458751/kanchu), Awesomeness01 (https://stackoverflow.com/users/4181717/awesomeness01), trueimage(https://stackoverflow.com/users/2430498/trueimage)

// Function to download data to a file
function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
