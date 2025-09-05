import {PDFDocument} from "https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.4.2/+esm";
import "./draggable_list.js";
import {documents} from "./upload.js";
import "./menu.js";


async function extractPDFpages() {

    let list = document.getElementById("document_list");
    let list_items = list.getElementsByClassName("list_item");

    if(list_items.length == 0) return;

    let first_item = list_items[0];
    let newPDF = documents[first_item.dataset.index];

    // remove pages from the first document in the list that should not be included
    let input = first_item.getElementsByClassName("pages_input")[0].value;
    let pages_kept = 0, pages_removed = 0;
    let pageCount = newPDF.getPageCount();
    for(let i = 0; i < pageCount; i++) {

        let includedPagesIndices = getIncludedPageIndices(input, newPDF);

        if(i !== includedPagesIndices[pages_kept]) {
            newPDF.removePage(i - pages_removed);
            pages_removed++;
        } else {
            pages_kept++;
        }

    }

    // append selected pages from the other documents to the new pdf
    for(let i = 1; i < list_items.length; i++) {

        let item = list_items[i];
        let sourcePDF = documents[item.dataset.index];

        //let input = "1-2, 4, 45-56,34-3,15-16,asd-a";
        let input = item.getElementsByClassName("pages_input")[0].value;

        let includedPagesIndices = getIncludedPageIndices(input, sourcePDF);

        // remove indices that are too large
        let maxIndex = sourcePDF.getPageCount();
        for(let i = includedPagesIndices.length; i >= 0; i--) {
            if(includedPagesIndices[i] > maxIndex) {
                includedPagesIndices.splice(i, 1);
            }
        }

        let copiedPages = await newPDF.copyPages(sourcePDF, includedPagesIndices);
        copiedPages.forEach((page, i) => {
            newPDF.addPage(page);
        });

    }

    // download:
    if(newPDF.getPageCount() > 0) {
        let bytes = await newPDF.save();

        let blob = new Blob([bytes], {type: "application/pdf"});

        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "myFileName.pdf";
        link.click();
    } else {
        //TODO: user feedback
    }

}

function getIncludedPageIndices(input, srcPDF) {

    let includedPagesIndices = [];

    if(input) {
        let pages = input.split(",");  

        for(let page of pages) {
            page = page.trim();
            if (page.includes("-")) {
                let numbers = page.split("-");
                const [start, end] = [Number(numbers[0]), Number(numbers[1])];

                for(let i = 0; i < Math.max((end - start) + 1, 0); i++) {
                    includedPagesIndices.push(start + i - 1);
                }
            } else {
                let number = Number(page);
                if(number) {
                    includedPagesIndices.push(number - 1);
                }
            }
        }

        includedPagesIndices.sort((a, b) => a - b);
    } else {
        // include all pages
        includedPagesIndices = Array.from(Array(srcPDF.getPageCount()).keys());
    }

    return includedPagesIndices;
}


document.getElementById("download_button").addEventListener('click', () => {
    extractPDFpages();
});