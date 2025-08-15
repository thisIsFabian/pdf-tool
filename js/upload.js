let drop_zone = document.getElementById("drop_zone");

//prevent browser default behaviour
drop_zone.addEventListener("dragenter", (e) => {
    e.stopPropagation();
    e.preventDefault();
});
drop_zone.addEventListener("dragover", (e) => {
    e.stopPropagation();
    e.preventDefault();
});

drop_zone.addEventListener("drop", dropHandler);

function dropHandler(e) {
    e.stopPropagation();
    e.preventDefault();

    if(e.dataTransfer.files) {

        [...e.dataTransfer.files].forEach((file, i) => {
            console.log(`… file[${i}].name = ${file.name}`);
        });

    }
        


}

document.getElementById("file_input").addEventListener("change", uploadHandler);

function readerPromise(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function(){
            resolve(reader.result);
        };
        reader.onerror = function(){
            reject(reader);
        };

        reader.readAsArrayBuffer(file);
    });
}

function uploadHandler(e) {

    let files = e.target.files;

    if(!files.length) return;

    let promises = [];
    for(const file of files) {
        promises.push(readerPromise(file));
    }

    Promise.all(promises).then(async function(file_array) {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        console.log(file_array);

        for(const buffer of file_array) {
            const pdfDoc = await PDFLib.PDFDocument.load(buffer, {updateMetadata: false});
            console.log("pages: " + pdfDoc.getPageCount())
        }


    });

    

}

