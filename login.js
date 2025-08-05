const credentials = [
    { user: "Unlhbg==", pass: "U2Vwcm4xMjEwIQ==" }, // ryan
    { user: "VHJleQ==", pass: "TmF0ZUhpZ2dlcnM=" }, // trey
    { user: "QXlkZW4=", pass: "RGFkZHlOaXRyaXg2OQ==" }, // ayden
    { user: "Sm9zaA==", pass: "TmF0ZUhpZ2dlcnM=" }, // Josh
    { user: "RXRoYW4=", pass: "TmF0ZUhpZ2dlcnM=" }, // Ethan
    { user: "TWF0dGhldw==", pass: "TmF0ZUhpZ2dlcnM=" }, // Matthew
    { user: "SmVzdXM=", pass: "TmF0ZUhpZ2dlcnM=" }, // Jesus
    { user: "TGV2aQ==", pass: "TmF0ZUhpZ2dlcnM=" } // Levi
];
const redirectURL = "YUhSMGNITTZMeTl5ZVdGdWJpMDBMbWRwZEdoMVlpNXBieTlIY205MWNDMURhR0YwTFZkbFluTnBkR1V0VFdWemMyRm5hVzVuTDFObFkzSmxkQT09";
const decode = txt => decodeURIComponent(escape(window.atob(window.atob(txt))));
const encode = txt => window.btoa(window.btoa(txt));
function unlock() {
    const inputUser = document.getElementById("user").value.trim();
    const inputPass = document.getElementById("pass").value.trim();
    const failMsg = document.getElementById("fail");
    let authenticated = false;
    for (let cred of credentials) {
        const decodedUser = decode(cred.user);
        const decodedPass = decode(cred.pass);
        if (inputUser === decodedUser && inputPass === decodedPass) {
            authenticated = true;
            break;
        }
    }
    if (authenticated) {
        localStorage.setItem("auth", "1");
        window.location.href = decode(redirectURL);
    } else {
        failMsg.innerText = "Invalid credentials.";
    }
}
