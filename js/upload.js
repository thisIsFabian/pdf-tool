import {updateAllItemsList} from "./draggable_list.js";
import {PDFDocument} from "https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.4.2/+esm";

export let documents = [];

document.getElementById("file_input").addEventListener("change", loadFilesFromInput);

let drop_zone = document.getElementById("main_content");
drop_zone.addEventListener('dragover', e => {
    e.preventDefault();
    drop_zone.getElementsByTagName("rect")[0].style.stroke = "var(--accent-color)";
});
drop_zone.addEventListener('dragleave', () => {
    drop_zone.getElementsByTagName("rect")[0].style.stroke = "var(--stroke-color)";
});
drop_zone.addEventListener("drop", loadFilesFromDropEvent);

document.getElementById("drop_zone_wrapper").addEventListener("click", clickFileUploadInput);
document.getElementById("add_file_button").addEventListener("click", clickFileUploadInput);

function clickFileUploadInput() {
    document.getElementById("file_input").click();
}


function readerPromise(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function(){
            resolve([reader.result, file.name]);
        };
        reader.onerror = function(){
            reject(reader);
        };

        reader.readAsArrayBuffer(file);
    });
}

function loadFilesFromInput(e) {

    let files = e.target.files;

    if(!files.length) return;

    let promises = [];
    for(const file of files) {
        if(file.type === "application/pdf") {
            promises.push(readerPromise(file));
        } else {
            console.log("Only PDF files will be accepted.");
        }
    }

    Promise.all(promises).then(async function(file_array) { //file_array contains the read arrayBuffers and file names

        if(file_array.length > 0) {
            openListView();

            for(const item of file_array) {
                try {
                    const pdfDoc = await PDFDocument.load(item[0], {updateMetadata: false});
                    documents.push(pdfDoc);
                    addListItem(item[1], documents.length-1);
                } catch(err) {
                    console.error(err);
                    //TODO: user feedback
                }
            }
        }

    });

}

async function loadFilesFromDropEvent(e) {

    e.preventDefault();
    drop_zone.getElementsByTagName("rect")[0].style.stroke = "var(--stroke-color)";

    let files = e.dataTransfer.files;

    if(!files.length) return;

    let loadSuccess = false;

    for(const file of files) {
        if(file.type === "application/pdf") {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer, {updateMetadata: false});
                documents.push(pdfDoc);
                addListItem(file.name, documents.length-1);
                loadSuccess = true;
            } catch(err) {
                console.error(err);
                //TODO: user feedback
            }
        } else {
            console.log("Only PDF files will be accepted.");
        }
    }

    if(loadSuccess) {
        openListView();
    }

}

function addListItem(filename, docIndex) {

    let newItem = document.createElement("div");
    newItem.classList = "list_item is-idle js-item";

    let fileNameText = document.createElement("span");
    fileNameText.innerHTML = filename;

    let deleteButton = document.createElement("a");
    deleteButton.classList = "delete_item_button";
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete_button"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    deleteButton.href = "#";
    deleteButton.onclick = removeDocumentFromList;
    deleteButton.title = "Remove";

    let dragHandle = document.createElement("div");
    dragHandle.classList = "drag-handle js-drag-handle";
    dragHandle.innerHTML = "⠿";
    dragHandle.title = "Drag";

    let pagesInput = document.createElement("input");
    pagesInput.classList = "pages_input";
    pagesInput.placeholder = "Select pages, e.g.: 1-2, 4-5";
    pagesInput.title = "Select pages, e.g.: 3-5, 8";
    pagesInput.onblur = itemInputValidation;

    newItem.appendChild(dragHandle);
    newItem.appendChild(fileNameText);
    newItem.append(pagesInput);
    newItem.appendChild(deleteButton);

    newItem.dataset.index = docIndex;

    document.getElementById("document_list").appendChild(newItem);

}

function removeDocumentFromList() {
    let index = this.parentNode.dataset.index;
    //documents.splice(index, 1);
    documents[index] = null;
    this.parentNode.remove();
    updateAllItemsList();

    if(documents.every(elem => elem === null)) {
        closeListView();
    }
}

function itemInputValidation() {

    if(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/.test(this.value) || !this.value) { //check if the input matches a pattern like "1-2, 4, 6-7"
        //this.style.backgroundColor = "var(--background-color)";
        this.style.borderColor = "var(--border-color)";
    } else {
        //this.style.backgroundColor = "var(--error-backoground-color)";
        this.style.borderColor = "var(--error-border-color)";
    }

    if(this.onblur) {
        this.addEventListener("input", itemInputValidation);
        this.onblur = null;
    }

}

function openListView() {
    document.getElementById("drop_zone_wrapper").style.display = "none";
    document.getElementById("list_wrapper").style.display = "block";
    document.getElementById("download_button").style.display = "flex";
    document.getElementById("main_content").style.height = "calc(100vh - 81px)";
}

function closeListView() {
    document.getElementById("drop_zone_wrapper").style.display = "block";
    document.getElementById("list_wrapper").style.display = "none";
    document.getElementById("download_button").style.display = "none";
    document.getElementById("main_content").style.height = "100%";
    documents = [];
}
