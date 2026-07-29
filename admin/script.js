const form = document.getElementById("loginForm");
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "techrwt" && password === "123456") {
            localStorage.setItem("adminLoggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("error").textContent = "Invalid Username or Password";
        }
    });
}

window.logout = function () {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
}
