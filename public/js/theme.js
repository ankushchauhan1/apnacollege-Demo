const themeBtn = document.getElementById("theme-btn");

if (themeBtn) {

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.classList.replace("fa-moon", "fa-sun");
    }

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeBtn.classList.replace("fa-moon", "fa-sun");
        } else {
            localStorage.setItem("theme", "light");
            themeBtn.classList.replace("fa-sun", "fa-moon");
        }

    });

}