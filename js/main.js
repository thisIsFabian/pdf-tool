import {PDFDocument, PDFDict, PDFName, PDFArray} from "https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.4.2/+esm";
import "./draggable_list.js";
import {documents} from "./upload.js";


async function extractPDFpages() {

    let list = document.getElementById("document_list");
    let list_items = list.getElementsByClassName("list_item");

    if(list_items.length == 0) return;

    let newPDF = await PDFDocument.create();

    let pageIndices = [];

    for(let i = 0; i < list_items.length; i++) {

        let item = list_items[i];
        let sourcePDF = documents[item.dataset.index];

        //let input = "1-2, 4, 45-56,34-3,15-16,asd-a";
        let input = item.getElementsByClassName("pages_input")[0].value;

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
            includedPagesIndices = Array.from(Array(sourcePDF.getPageCount()).keys());
        }

        // Append selected pages to the new pdf:
        let copiedPages = await newPDF.copyPages(sourcePDF, includedPagesIndices);
        copiedPages.forEach((page, i) => {
            newPDF.addPage(page);
        });
        pageIndices.push(includedPagesIndices);

    }

    // download:
    let bytes = await newPDF.save();

    let blob = new Blob([bytes], {type: "application/pdf"});

    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "myFileName.pdf";
    link.click();

}


document.getElementById("download_button").addEventListener('click', () => {
    extractPDFpages();
});