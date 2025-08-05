const credentials = [
    { user: "VW5saGJnPT0=", pass: "VTJWd2NtNHhNakV3SVE9PQ==" }, // ryan
    { user: "VkhKbGVRPT0=", pass: "VG1GMFpVaHBaMmRsY25NPQ==" }, // trey
    { user: "UVhsa1pXND0=", pass: "UkdGa1pIbE9hWFJ5YVhnMk9RPT0=" }, // ayden
    { user: "U205emFBPT0=", pass: "VG1GMFpVaHBaMmRsY25NPQ==" }, // Josh
    { user: "UlhSb1lXND0=", pass: "VG1GMFpVaHBaMmRsY25NPQ==" }, // Ethan
    { user: "VFdGMGRHaGxkdz09", pass: "VG1GMFpVaHBaMmRsY25NPQ==" }, // Matthew
    { user: "U21WemRYTT0=", pass: "VG1GMFpVaHBaMmRsY25NPQ==" }, // Jesus
    { user: "VEdWMmFRPT0=", pass: "VG1GMFpVaHBaMmRsY25NPQ==" } // Levi
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
