const webAppUrl = 'https://script.google.com/macros/s/AKfycbxs1duosqmAq2ADculz1O4EbNVQgwFOa4gsPmQ4SvHI9DyyyV2ZwMNvTckNCe8zqpx2Jw/exec';

const teamSizeSelect = document.getElementById('teamSize');
const dynamicContainer = document.getElementById('dynamicMembersContainer');
const fileUploadContainer = document.getElementById('fileUploadContainer');
const addFileBtn = document.getElementById('addFileBtn');

// Modal Elements
const reviewModal = document.getElementById('reviewModal');
const reviewSummary = document.getElementById('reviewSummary');
const backEditBtn = document.getElementById('backEditBtn');
const finalConfirmBtn = document.getElementById('finalConfirmBtn');
const registrationForm = document.getElementById('registrationForm');

// Global arrays to store data temporarily between modal stages
let validatedFilesToUpload = [];
let optimizedTeamMembersString = '';

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

// Stage 1: Form Validation & Confirmation Modal Trigger
registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. STRICT FILE REQUIREMENT VALIDATION
    const fileInputs = document.querySelectorAll('.college-doc-file');
    let hasAtLeastOneFile = false;
    let totalBytes = 0;
    validatedFilesToUpload = []; // Clear array

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            hasAtLeastOneFile = true;
            totalBytes += input.files[0].size;
            validatedFilesToUpload.push(input.files[0]);
        }
    });

    if (!hasAtLeastOneFile) {
        alert("Please upload at least one College ID Card or related document before submitting.");
        return;
    }

    // 2. STRICT TOTAL SIZE LIMIT VALIDATION (10MB limit)
    const maxBytes = 10 * 1024 * 1024; 
    if (totalBytes > maxBytes) {
        alert("The total size of your uploaded files exceeds the 10 MB limit. Please compress your files and try again.");
        return;
    }

    // Gather dynamic member input values into an array, then join with commas
    const memberInputs = document.querySelectorAll('.member-name-input');
    const memberNamesArray = [];
    memberInputs.forEach(input => {
        if (input.value.trim() !== "") memberNamesArray.push(input.value.trim());
    });
    optimizedTeamMembersString = memberNamesArray.join(', ');

    // Read details out of form fields for presentation text variables
    const projectName = document.getElementById('projectName').value;
    const teamNameValue = document.getElementById('teamName').value.trim();
    const teamName = teamNameValue !== "" ? teamNameValue : 'N/A (Solo/No Team Name)';
    const leaderName = document.getElementById('leaderName').value;
    const email = document.getElementById('email').value;
    const contactnum = document.getElementById('contactnum').value;
    const collegeName = document.getElementById('collegeName').value;
    const teamSize = teamSizeSelect.value;
    const ideaAbstract = document.getElementById('ideaAbstract').value;
    const membersDisplay = optimizedTeamMembersString.length > 0 ? optimizedTeamMembersString : 'None (Solo Entry)';

    // Generate readable file items with descriptive icons based on type
    let filesHtml = '<div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">';
    validatedFilesToUpload.forEach(file => {
        const isPdf = file.type === 'application/pdf';
        const iconClass = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image';
        const iconColor = isPdf ? '#ef4444' : '#3b82f6';
        const sizeInKb = (file.size / 1024).toFixed(1);
        
        filesHtml += `
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                <i class="${iconClass}" style="color: ${iconColor}; font-size: 1rem;"></i>
                <span style="font-size: 0.85rem; color: #e2e8f0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 350px;">${file.name}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">(${sizeInKb} KB)</span>
            </div>
        `;
    });
    filesHtml += '</div>';

    // Inject current entries into structural modal preview markup
    reviewSummary.innerHTML = `
        <div class="review-item"><span class="review-label">Project / Idea Title</span><span class="review-value">${projectName}</span></div>
        <div class="review-item"><span class="review-label">Team Name</span><span class="review-value">${teamName}</span></div>
        <div class="review-item"><span class="review-label">Team Leader</span><span class="review-value">${leaderName}</span></div>
        <div class="review-item"><span class="review-label">Email Address</span><span class="review-value">${email}</span></div>
        <div class="review-item"><span class="review-label">Contact Number</span><span class="review-value">${contactnum}</span></div>
        <div class="review-item"><span class="review-label">College Name</span><span class="review-value">${collegeName}</span></div>
        <div class="review-item"><span class="review-label">Group Size</span><span class="review-value">${teamSize} Person(s)</span></div>
        <div class="review-item"><span class="review-label">Additional Members</span><span class="review-value">${membersDisplay}</span></div>
        <div class="review-item"><span class="review-label">Attached Documents</span><span class="review-value">${filesHtml}</span></div>
        <div class="review-item"><span class="review-label">Pitch Abstract</span><span class="review-value">${ideaAbstract}</span></div>
    `;

    // Display overlay
    reviewModal.style.display = 'flex';
});

// Close Preview Window
backEditBtn.addEventListener('click', function() {
    reviewModal.style.display = 'none';
});

// Client-side helper function to compress image files
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        // If it's not an image (e.g. PDF), resolve immediately without modification
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Downscale logic preserving aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export to blob and then to a new File object
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
        };
    });
}

// Stage 2: Final Data Conversion and Server Upload Pipeline
finalConfirmBtn.addEventListener('click', async function() {
    // Dismiss overlay window immediately to prevent multi-click anomalies
    reviewModal.style.display = 'none';

    // === DISPLAY PROGRESS OVERLAY ===
    document.getElementById('submitLoadingOverlay').style.display = 'flex';

    const submitButton = registrationForm.querySelector('.btn-submit');
    const originalButtonText = submitButton.innerText;

    // Freeze input interaction during submission lifecycle execution
    submitButton.disabled = true;
    submitButton.innerText = "Compressing & Submitting...";

    // Pack text fields into URL encoding
    const formData = new URLSearchParams();
    formData.append('projectName', document.getElementById('projectName').value);
    formData.append('teamName', document.getElementById('teamName').value);
    formData.append('leaderName', document.getElementById('leaderName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('contactnum', document.getElementById('contactnum').value);
    formData.append('teamSize', teamSizeSelect.value);
    formData.append('teamMembers', optimizedTeamMembersString);
    formData.append('ideaAbstract', document.getElementById('ideaAbstract').value);
    formData.append('collegeName', document.getElementById('collegeName').value);

    try {
        // 1. Process and compress images on the fly before Base64 conversion
        const compressedFiles = await Promise.all(
            validatedFilesToUpload.map(file => compressImage(file))
        );

        // 2. Convert compressed file objects to Base64 strings safely
        const filePromises = compressedFiles.map(file => {
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

        const processedFiles = await Promise.all(filePromises);
        formData.append('filesJson', JSON.stringify(processedFiles));
    } catch (err) {
        console.error("File processing error: ", err);
        alert("Failed to process the uploaded files. Please try again.");
        
        document.getElementById('submitLoadingOverlay').style.display = 'none';
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
        return;
    }

    // POST request payload pipeline to Google Apps Script Endpoint URL
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
            
            registrationForm.reset();
            dynamicContainer.innerHTML = ''; // Wipe dynamic entries

            // Reset file upload layout parameters back down to a single base element block row
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
        document.getElementById('submitLoadingOverlay').style.display = 'none';
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
    });
});