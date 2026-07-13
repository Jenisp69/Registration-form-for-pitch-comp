const webAppUrl = 'https://script.google.com/macros/s/AKfycbw5ZgNGMM7chjchLi2N2kFELruFOR7z6xyAIcfnJqDVnU5h5EfYvwZsGnhQtJpMX0fBmA/exec';

const teamSizeSelect = document.getElementById('teamSize');
const dynamicContainer = document.getElementById('dynamicMembersContainer');

// Listen for selection changes to generate dynamic text boxes
teamSizeSelect.addEventListener('change', function() {
    const size = parseInt(this.value);
    dynamicContainer.innerHTML = ''; // Clear previous fields cleanly

    // Loop starts from 2 because Member 1 is always the Team Leader
    for (let i = 2; i <= size; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.style.animation = 'slideIn 0.2s ease forwards';
        
        div.innerHTML = `
            <label>Team Member ${i} Name</label>
            <input type="text" class="form-control member-name-input" placeholder="Full Name of Member ${i}" required>
        `;
        dynamicContainer.appendChild(div);
    }
});

// Structural layout repositioning loop for mobile layout viewports
function setupResponsiveLayout() {
    const registrationCard = document.getElementById('registrationCard');
    const mobilePlaceholder = document.querySelector('.mobile-form-placeholder');
    const desktopContainer = document.querySelector('.container');

    if (window.innerWidth < 968) {
        if (mobilePlaceholder && registrationCard.parentNode !== mobilePlaceholder) {
            mobilePlaceholder.appendChild(registrationCard);
        }
    } else {
        if (registrationCard.parentNode !== desktopContainer) {
            desktopContainer.appendChild(registrationCard);
        }
    }
}
window.addEventListener('DOMContentLoaded', setupResponsiveLayout);
window.addEventListener('resize', setupResponsiveLayout);

// Submission Logic Operations
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Gather dynamic member input values into an array, then join with commas
    const memberInputs = document.querySelectorAll('.member-name-input');
    const memberNamesArray = [];
    memberInputs.forEach(input => {
        if(input.value.trim() !== "") memberNamesArray.push(input.value.trim());
    });
    const teamMembersString = memberNamesArray.join(', ');

    // Match exact column names set up inside Google Sheet headers
    const formData = new URLSearchParams();
    formData.append('teamName', document.getElementById('teamName').value);
    formData.append('leaderName', document.getElementById('leaderName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('teamSize', teamSizeSelect.value);
    formData.append('teamMembers', teamMembersString); // Sends as "Name 2, Name 3"
    formData.append('ideaAbstract', document.getElementById('ideaAbstract').value);

    // POST request to your Google Apps Script Endpoint
    fetch(webAppUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.result === 'success') {
            const toast = document.getElementById('successToast');
            toast.style.display = 'block';
            
            this.reset();
            dynamicContainer.innerHTML = ''; // Wipe dynamic fields on success

            setTimeout(() => {
                toast.style.display = 'none';
            }, 4000);
        } else {
            alert('Error saving data: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to connect to registration server.');
    });
});