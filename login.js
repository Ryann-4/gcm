const u = "VG1GMFpVaHBaMmRsY25NPQ==";
    const p = "VG1GMFpVaHBaMmRsY25NPQ==";
    const q = "YUhSMGNITTZMeTl5ZVdGdWJpMDBMbWRwZEdoMVlpNXBieTlIY205MWNDMURhR0YwTFZkbFluTnBkR1V0VFdWemMyRm5hVzVuTDFObFkzSmxkQT09";
    const decode = txt => decodeURIComponent(escape(window.atob(window.atob(txt))));
    const encode = txt => window.btoa(window.btoa(txt));
    function unlock() {
      const inputUser = document.getElementById("user").value.trim();
      const inputPass = document.getElementById("pass").value.trim();
      const failMsg = document.getElementById("fail");
      const decodedUser = decode(u);
      const decodedPass = decode(p);
      if (inputUser === decodedUser && inputPass === decodedPass) {
        localStorage.setItem("auth", "1");
        window.location.href = decode(q);
      } else {
        failMsg.innerText = "Invalid credentials.";
      }
    }
