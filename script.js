const webAppUrl = 'https://script.google.com/macros/s/AKfycbxs1duosqmAq2ADculz1O4EbNVQgwFOa4gsPmQ4SvHI9DyyyV2ZwMNvTckNCe8zqpx2Jw/exec';

const teamSizeSelect = document.getElementById('teamSize');
const dynamicContainer = document.getElementById('dynamicMembersContainer');
const fileUploadContainer = document.getElementById('fileUploadContainer');
const addFileBtn = document.getElementById('addFileBtn');

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

// Dynamic File Upload Fields ("+" Button logic)
addFileBtn.addEventListener('click', function() {
    const div = document.createElement('div');
    div.className = 'file-input-wrapper';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '8px';
    div.style.animation = 'slideIn 0.2s ease forwards';

    div.innerHTML = `
        <input type="file" name="collegeDoc" class="form-control college-doc-file" accept="image/*,application/pdf" style="flex-grow: 1;" required>
        <button type="button" class="remove-file-btn" style="background-color: #ef4444; color: white; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; font-weight: bold;">-</button>
    `;
    fileUploadContainer.appendChild(div);

    // Event listener to remove this specific file input row
    div.querySelector('.remove-file-btn').addEventListener('click', function() {
        div.remove();
    });
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
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('.btn-submit');
    const originalButtonText = submitButton.innerText;

    // 1. STRICT FILE REQUIREMENT VALIDATION
    const fileInputs = document.querySelectorAll('.college-doc-file');
    let hasAtLeastOneFile = false;
    let totalBytes = 0;
    const filesToUpload = [];

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            hasAtLeastOneFile = true;
            totalBytes += input.files[0].size;
            filesToUpload.push(input.files[0]);
        }
    });

    if (!hasAtLeastOneFile) {
        alert("Please upload at least one College ID Card or related document before submitting.");
        return; // HALT SUBMISSION
    }

    // 2. STRICT TOTAL SIZE LIMIT VALIDATION (10MB limit)
    const maxBytes = 10 * 1024 * 1024; // 10 Megabytes in Bytes
    if (totalBytes > maxBytes) {
        alert("The total size of your uploaded files exceeds the 10 MB limit. Please compress your files and try again.");
        return; // HALT SUBMISSION
    }

    // If validations pass, disable submit button during active execution
    submitButton.disabled = true;
    submitButton.innerText = "Submitting...";
    
    // Gather dynamic member input values into an array, then join with commas
    const memberInputs = document.querySelectorAll('.member-name-input');
    const memberNamesArray = [];
    memberInputs.forEach(input => {
        if(input.value.trim() !== "") memberNamesArray.push(input.value.trim());
    });
    const teamMembersString = memberNamesArray.join(', ');

    // Pack text fields into URL encoding
    const formData = new URLSearchParams();
    formData.append('teamName', document.getElementById('teamName').value);
    formData.append('leaderName', document.getElementById('leaderName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('contactnum', document.getElementById('contactnum').value);
    formData.append('teamSize', teamSizeSelect.value);
    formData.append('teamMembers', teamMembersString);
    formData.append('ideaAbstract', document.getElementById('ideaAbstract').value);
    formData.append('collegeName', document.getElementById('collegeName').value);

    // Convert all collected files to Base64 strings safely
    const filePromises = filesToUpload.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    data: reader.result.split(',')[1],
                    name: file.name,
                    type: file.type
                });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    });

    try {
        const processedFiles = await Promise.all(filePromises);
        formData.append('filesJson', JSON.stringify(processedFiles));
    } catch (err) {
        console.error("File processing error: ", err);
        alert("Failed to process the uploaded files. Please try again.");
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
        return;
    }

    // POST request to Google Apps Script Endpoint
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
            toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> Registered successfully! ID: <strong>#${data.uniqueId}</strong>. Check your email.`;
            toast.style.display = 'block';
            
            this.reset();
            dynamicContainer.innerHTML = ''; // Wipe dynamic fields

            // Reset file upload slots back to a single input row
            const extraInputs = fileUploadContainer.querySelectorAll('.file-input-wrapper');
            extraInputs.forEach((el, index) => {
                if (index > 0) el.remove();
            });

            setTimeout(() => {
                toast.style.display = 'none';
                toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> Registration submitted successfully!`;
            }, 6500); 
        } else {
            alert('Error saving data: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to connect to registration server.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
    });
});