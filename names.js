const nameSelect = document.getElementById('nameSelect');
  window.addEventListener('DOMContentLoaded', () => {
    const loggedInName = localStorage.getItem('username');
    if (loggedInName) {
      nameSelect.innerHTML = `<option value="${loggedInName}" selected>${loggedInName}</option>`;
      const fakeNameInput = document.createElement('input');
      fakeNameInput.type = 'hidden';
      fakeNameInput.id = 'nameInput';
      fakeNameInput.value = loggedInName;
      document.getElementById('sendForm').appendChild(fakeNameInput);
    } else {
      alert('Please log in first.');
      window.location.href = 'index.html';
    }
  });