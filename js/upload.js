import {updateAllItemsList} from "./draggable_list.js";
import {PDFDocument} from "https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.4.2/+esm";

export let documents = [];

document.getElementById("file_input").addEventListener("change", uploadHandler);

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

function uploadHandler(e) {

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
            document.getElementById("drop_zone_wrapper").style.display = "none";
            document.getElementById("list_wrapper").style.display = "block";

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
    let index = this.dataset.index;
    documents.splice(index, 1);
    this.parentNode.remove();
    updateAllItemsList();
}

function itemInputValidation() {

    if(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/.test(this.value) || !this.value) { //check if the input matches a pattern like "1-2, 4, 6-7"
        this.style.backgroundColor = "var(--background-color)";
        this.style.borderColor = "var(--border-color)";
    } else {
        this.style.backgroundColor = "var(--error-backoground-color)";
        this.style.borderColor = "var(--error-border-color)";
    }

    if(this.onblur) {
        this.addEventListener("input", itemInputValidation);
        this.onblur = null;
    }

}

