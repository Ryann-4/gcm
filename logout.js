if (localStorage.getItem("auth") === null) {
    localStorage.setItem("auth", "0");
  }
  if (localStorage.getItem("auth") !== "1") {
    window.location.href = "https://ryann-4.github.io/gcm/index.html";
  }
  function logout() {
    localStorage.setItem("auth", "0");
    window.location.href = "https://ryann-4.github.io/gcm/index.html";
  }
