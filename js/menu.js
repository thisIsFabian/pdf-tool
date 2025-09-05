document.getElementById("home_nav").addEventListener("click", () => {
    document.getElementById("merge_pdf_container").style.display = "block";
    document.getElementById("about_container").style.display = "none";
});

document.getElementById("about_nav").addEventListener("click", () => {
    document.getElementById("merge_pdf_container").style.display = "none";
    document.getElementById("about_container").style.display = "block";
});