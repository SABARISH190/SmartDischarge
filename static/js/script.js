// Modal and Form Handling Functions
function openAddPatientModal() {
    console.log('openAddPatientModal called');
    const modal = document.getElementById('addPatientModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    // Show the modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Force reflow to ensure the element is rendered before starting the animation
    void modal.offsetWidth;
    
    // Reset form when opening
    const form = document.getElementById('add_patient_form');
    if (form) {
        form.reset();
        
        // Set default dates
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        // Set default admission date to yesterday
        const admissionDate = form.querySelector('#admission_date');
        if (admissionDate) {
            admissionDate.value = formatDate(yesterday);
        }
        
        // Set default discharge date to today
        const dischargeDate = form.querySelector('#discharge_date');
        if (dischargeDate) {
            dischargeDate.value = formatDate(today);
        }
    }
    
    // Clear any validation errors
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    // Hide all error messages
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.style.display = 'none';
    });
    
    // Trigger the animation
    const modalContent = modal.querySelector('.relative');
    if (modalContent) {
        // Reset any previous transforms
        modalContent.style.transform = 'translateY(0)';
        modalContent.style.opacity = '1';
    }
}

function closeAddPatientModal() {
    console.log('closeAddPatientModal called');
    const modal = document.getElementById('addPatientModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    // Start the closing animation
    const modalContent = modal.querySelector('.relative');
    if (modalContent) {
        modalContent.style.transform = 'translateY(-20px)';
        modalContent.style.opacity = '0';
    }
    
    // Hide the modal after the animation completes
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 300); // Match this with your CSS transition duration
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, setting up event listeners');
    
    // Add click event listeners to all Add Patient buttons
    document.querySelectorAll('.add-patient-btn').forEach(button => {
        console.log('Found add-patient button:', button);
        button.addEventListener('click', openAddPatientModal);
    });
    
    // Add click event listener to the modal close button
    const closeButton = document.querySelector('#addPatientModal [aria-label="Close"]');
    if (closeButton) {
        console.log('Found close button:', closeButton);
        closeButton.addEventListener('click', closeAddPatientModal);
    } else {
        console.warn('Close button not found');
    }
    
    // Add click event listener to the modal overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        console.log('Found modal overlay:', modalOverlay);
        modalOverlay.addEventListener('click', closeAddPatientModal);
    } else {
        console.warn('Modal overlay not found');
    }
    
    // Handle form submission
    const addPatientForm = document.getElementById('add_patient_form');
    if (addPatientForm) {
        addPatientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            // Add your form submission logic here
        });
    } else {
        console.warn('Add patient form not found');
    }
});

function showValidationError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    input.classList.add('is-invalid');
    
    let errorElement = formGroup.querySelector('.invalid-feedback');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearValidationError(input) {
    if (!input) return;
    
    input.classList.remove('is-invalid');
    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorElement = formGroup?.querySelector('.invalid-feedback');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    document.querySelectorAll('.notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="ml-2 text-sm hover:opacity-80" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function validateForm(form) {
    let isValid = true;
    
    // Clear previous validation errors
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showValidationError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Check if age is a valid number
    const ageField = form.querySelector('#age');
    if (ageField && ageField.value) {
        const age = parseInt(ageField.value, 10);
        if (isNaN(age) || age < 0 || age > 120) {
            showValidationError(ageField, 'Please enter a valid age between 0 and 120');
            isValid = false;
        }
    }
    
    // Check if discharge date is after admission date
    const admissionDate = form.querySelector('#admission_date');
    const dischargeDate = form.querySelector('#discharge_date');
    
    if (admissionDate && dischargeDate && admissionDate.value && dischargeDate.value) {
        const admission = new Date(admissionDate.value);
        const discharge = new Date(dischargeDate.value);
        
        if (discharge < admission) {
            showValidationError(dischargeDate, 'Discharge date cannot be before admission date');
            isValid = false;
        }
    }
    
    // Scroll to first error if any
    if (!isValid) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

function setupFormValidation() {
    const form = document.getElementById('add_patient_form');
    if (!form) return;
    
    // Validate on input/change
    const validateField = (field) => {
        if (field.hasAttribute('required') && !field.value.trim()) {
            showValidationError(field, 'This field is required');
            return false;
        }
        
        // Special validation for specific fields
        if (field.id === 'age' && field.value) {
            const age = parseInt(field.value, 10);
            if (isNaN(age) || age < 0 || age > 120) {
                showValidationError(field, 'Please enter a valid age between 0 and 120');
                return false;
            }
        }
        
        if (field.id === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showValidationError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        if (field.id === 'patient_id' && field.value) {
            const id = field.value.trim();
            if (!/^\d+$/.test(id)) {
                showValidationError(field, 'Patient ID must contain only numbers');
                return false;
            }
        }
        
        // Clear any existing errors
        clearValidationError(field);
        return true;
    };
    
    // Setup event listeners for all form fields
    const formFields = form.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        // Validate on blur (when user leaves the field)
        field.addEventListener('blur', () => validateField(field));
        
        // Also validate on input for required fields
        if (field.hasAttribute('required')) {
            field.addEventListener('input', () => validateField(field));
        }
    });
    
    // Validate dates when they change
    const admissionDate = form.querySelector('#admission_date');
    const dischargeDate = form.querySelector('#discharge_date');
    
    const validateDates = () => {
        if (!admissionDate.value || !dischargeDate.value) return true;
        
        const admission = new Date(admissionDate.value);
        const discharge = new Date(dischargeDate.value);
        
        if (discharge < admission) {
            showValidationError(dischargeDate, 'Discharge date cannot be before admission date');
            return false;
        }
        
        clearValidationError(dischargeDate);
        return true;
    };
    
    if (admissionDate) admissionDate.addEventListener('change', validateDates);
    if (dischargeDate) dischargeDate.addEventListener('change', validateDates);
    
    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("AJAX handler attached for add_patient_form");
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Validate form before submission
        if (!validateForm(form)) {
            return;
        }
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
            
            // Additional validation for dates (double-check)
            const admissionDate = new Date(form.admission_date.value);
            const dischargeDate = form.discharge_date.value ? new Date(form.discharge_date.value) : null;
            
            if (dischargeDate && dischargeDate < admissionDate) {
                showNotification('Discharge date cannot be before admission date', 'error');
                form.discharge_date.focus();
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            
            // Submit the form using Fetch API
            const formData = new FormData(form);
            console.log('Submitting form data:', Object.fromEntries(formData.entries()));
            
            const response = await fetch(form.action || '/add_patient', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            let result;
            try {
                result = await response.json();
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                throw new Error('Invalid response from server');
            }
            
            console.log('Server response:', result);
            
            if (!response.ok) {
                throw new Error(result.error || `Server responded with status ${response.status}`);
            }
            
            if (result.success) {
                showNotification(result.message || 'Patient added successfully!', 'success');
                closeAddPatientModal();
                // Refresh the patient list if we're on the view database page
                if (typeof window.patientsTable !== 'undefined') {
                    window.patientsTable.ajax.reload();
                }
            } else {
                throw new Error(result.error || 'Failed to add patient');
            }
        } catch (error) {
            console.error('Error:', error);
            let errorMessage = 'Failed to add patient. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            }
            
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                response: error.response
            });
            
            showNotification(errorMessage, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Initialize when document is ready
$(document).ready(function() {
    // Set today's date
    $('#discharge_date').val(new Date().toISOString().split('T')[0]);

    // Set default admission date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    $('#admission_date').val(yesterday.toISOString().split('T')[0]);

    // Set default discharge date to today
    $('#discharge_date').val(new Date().toISOString().split('T')[0]);

    // Initialize form validation if the form exists on the page
    if (document.getElementById('add_patient_form')) {
        setupFormValidation();
    }

    // Theme toggle
    const themeToggle = $('#theme-toggle');
    const html = $('html');
    const themeIcon = themeToggle.find('i');

    function setTheme(theme) {
        html.removeClass('light-theme dark-theme').addClass(theme);
        themeIcon.removeClass('fa-moon fa-sun').addClass(theme === 'dark-theme' ? 'fa-sun' : 'fa-moon');
        localStorage.setItem('theme', theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    setTheme(savedTheme);

    themeToggle.click(function() {
        const currentTheme = html.hasClass('light-theme') ? 'light-theme' : 'dark-theme';
        const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        setTheme(newTheme);
    });

    // Enable/disable buttons
    $('#patient_id').on('input', function() {
        const patientId = $(this).val().trim();
        $('#generate_btn').prop('disabled', !patientId);
        $('#preview_btn').prop('disabled', !patientId);
        $('#patient_preview').addClass('hidden').html('');
        console.log("Entered Patient ID:", patientId);
    });

    // Show notification
    function showNotification(message, isError = false) {
        const notification = $(`
            <div class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg animateFadeIn ${isError ? 'notification-error' : 'notification-success'}">
                <span>${message}</span>
                <button class="ml-2 text-SM hover:text-opacity-80 dismiss-notification"><i class="fas fa-times"></i></button>
            </div>
        `);
        $('body').append(notification);
        setTimeout(() => {
            notification.addClass('animateFadeOut');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        notification.find('.dismiss-notification').click(() => {
            notification.addClass('animateFadeOut');
            setTimeout(() => notification.remove(), 500);
        });
    }

    // Preview patient
    $('#preview_btn').click(function(e) {
        e.preventDefault();
        const patientId = $('#patient_id').val().trim();
        if (!patientId) {
            showNotification('Enter a patient ID', true);
            return;
        }

        $('#patient_preview').removeClass('hidden').html('<div class="spinner mr-2"></div>Fetching patient data...');

        $.ajax({
            url: '/preview',
            type: 'POST',
            data: { patient_id: patientId },
            success: function(data) {
                if (data.error) {
                    $('#patient_preview').html(`
                        <div class="alert-error p-4 rounded-lg">
                            <strong>⚠️ Error:</strong> ${data.error}
                        </div>
                    `);
                } else {
                    $('#patient_preview').html(`
                        <div class="p-4 card-secondary rounded-lg">
                            <strong>Patient Details:</strong><br>
                            <p>Name: ${data.name}</p>
                            <p>Sex: ${data.sex}</p>
                            <p>Age: ${data.age}</p>
                            <p>State: ${data.state}</p>
                            <p>Chief Complaint: ${data.chief_complaint}</p>
                            <p>Diagnosis: ${data.disease}</p>
                            <p>Hospital Stay: ${data.stay_duration} days</p>
                            <p>Chronic Condition: ${data.chronic ? 'Yes' : 'No'}</p>
                            <p>Doctor: ${data.doctor_name}</p>
                            <p>Allergies: ${data.allergies}</p>
                            <p>Admission Date: ${data.admission_date}</p>
                            <p>Discharge Date: ${data.discharge_date}</p>
                            <p>Test Reports: ${data.test_reports ? '<a href="/' + data.test_reports + '" target="_blank" class="text-teal-600 hover:underline">View Report</a>' : 'None'}</p>
                            ${data.is_fallback ? "<p class='italic'>Note: Based on similar patient data</p>" : ""}
                        </div>
                    `);
                }
            },
            error: function(xhr, status, error) {
                console.error('Preview AJAX Error:', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });
                $('#patient_preview').html(`
                    <div class="alert-error p-4 rounded-lg">
                        <strong>⚠️ Error:</strong> Failed to fetch patient data.
                    </div>
                `);
            }
        });
    });

    // Generate summary
    $('#generate_btn').click(function(e) {
        e.preventDefault();
        const patientId = $('#patient_id').val().trim();
        if (!patientId) {
            showNotification('Enter a patient ID', true);
            return;
        }

        $('#result').removeClass('hidden').html('<div class="spinner mr-2"></div><span class="text-gray-600 dark:text-gray-400">Generating summary...</span>');

        $.ajax({
            url: '/generate',
            type: 'POST',
            data: {
                patient_id: patientId,
                detail_level: $('input[name="detail_level"]:checked').val(),
                doctor_notes: $('#doctor_notes').val(),
                discharge_date: $('#discharge_date').val()
            },
            success: function(data) {
                console.log("Response:", data);
                $('#result').html('');
                if (data.error) {
                    $('#result').html(`<div class="alert-error p-4 rounded-lg"><strong>⚠️ Error:</strong> ${data.error}</div>`);
                } else {
                    $('#result').html(`
                        <div class="alert-success p-4 rounded-lg card">
                            <strong>✅ Discharge Summary</strong>
                            ${data.summary.is_fallback ? "<p class='mt-2 italic'>Note: Generated based on similar patient data</p>" : ""}
                            <p class="mt-2"><strong>Chief Complaint:</strong> ${data.summary.chief_complaint}</p>
                            <p class="mt-2"><strong>History of Present Illness:</strong> ${data.summary.hpi}</p>
                            <p class="mt-2"><strong>Past History:</strong> ${data.summary.past_history}</p>
                            <p class="mt-2"><strong>Social History:</strong> ${data.summary.social_history}</p>
                            <p class="mt-2"><strong>Allergies:</strong> ${data.summary.allergies}</p>
                            <p class="mt-2"><strong>Physical Exam:</strong> ${data.summary.physical_exam}</p>
                            <p class="mt-2"><strong>Laboratory Data:</strong> ${data.summary.lab_data}</p>
                            <p class="mt-2"><strong>Hospital Course:</strong> ${data.summary.hospital_course}</p>
                            <p class="mt-2"><strong>Condition:</strong> ${data.summary.condition}</p>
                            <p class="mt-2"><strong>Diagnoses:</strong> ${data.summary.diagnosis}</p>
                            <p class="mt-2"><strong>Medications:</strong> ${data.summary.medications}</p>
                            <p class="mt-2"><strong>Diet:</strong> ${data.summary.diet}</p>
                            <p class="mt-2"><strong>Activity:</strong> ${data.summary.activity}</p>
                            <p class="mt-2"><strong>Follow-Up:</strong> ${data.summary.follow_up}</p>
                            <p class="mt-2"><strong>Instructions:</strong> ${data.summary.discharge_instructions}</p>
                            <p class="mt-2"><strong>AI Notes:</strong> ${data.summary.ai_notes}</p>
                            <p class="mt-2"><strong>Admission Date:</strong> ${data.summary.admission_date}</p>
                            <p class="mt-2"><strong>Discharge Date:</strong> ${data.summary.discharge_date}</p>
                            <p class="mt-2"><strong>Doctor:</strong> ${data.summary.doctor_name}</p>
                            <button class="copy-summary-btn inline-block mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"><i class="fas fa-copy mr-2"></i>Copy Summary</button>
                            <a href="/download/${data.pdf_file}" class="inline-block mt-4 button px-4 py-2 rounded-lg transition"><i class="fas fa-download mr-2"></i>Download PDF</a>
                        </div>
                    `);

                    // Attach click event to Copy Summary button
                    $('.copy-summary-btn').click(function() {
                        const summaryText = `Chief Complaint: ${data.summary.chief_complaint}\nHPI: ${data.summary.hpi}\nPast History: ${data.summary.past_history}\nSocial History: ${data.summary.social_history}\nAllergies: ${data.summary.allergies}\nPhysical Exam: ${data.summary.physical_exam}\nLab Data: ${data.summary.lab_data}\nHospital Course: ${data.summary.hospital_course}\nCondition: ${data.summary.condition}\nDiagnoses: ${data.summary.diagnosis}\nMedications: ${data.summary.medications}\nDiet: ${data.summary.diet}\nActivity: ${data.summary.activity}\nFollow-Up: ${data.summary.follow_up}\nInstructions: ${data.summary.discharge_instructions}\nAI Notes: ${data.summary.ai_notes}\nAdmission: ${data.summary.admission_date}\nDischarge: ${data.summary.discharge_date}\nDoctor: ${data.summary.doctor_name}`;
                        navigator.clipboard.writeText(summaryText).then(() => {
                            showNotification('Summary copied to clipboard!');
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            showNotification('Failed to copy summary.', true);
                        });
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Generate AJAX Error:', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });
                $('#result').html(`<div class="alert-error p-4 rounded-lg"><strong>⚠️ Error:</strong> Failed to generate summary. Please try again.</div>`);
            },
            timeout: 60000
        });
    });

    // Form submission (optional, kept for compatibility)
    $('#summary_form').submit(function(e) {
        e.preventDefault();
        $('#generate_btn').click();
    });

    // Handle test report upload form submission
    $('#upload_test_report_form').submit(function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        $.ajax({
            url: '/upload_test_report',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                if (data.error) {
                    showNotification(`Failed to upload test report: ${data.error}`, true);
                } else {
                    showNotification(data.message);
                    $('#upload_test_report_form')[0].reset();
                }
            },
            error: function(xhr, status, error) {
                console.error('Upload Test Report AJAX Error:', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });
                showNotification('Failed to upload test report. Please try again.', true);
            }
        });
    });

    // Handle load more button for pagination
    $(document).on('click', '#load-more', function() {
        const nextPage = $(this).data('next-page');
        $.ajax({
            url: '/view_database',
            type: 'GET',
            data: { page: nextPage, ajax: true },
            success: function(data) {
                if (data.error) {
                    showNotification(`Failed to load more patients: ${data.error}`, true);
                    return;
                }
                const tbody = $('#patient-table-body');
                data.patients.forEach(patient => {
                    const row = `
                        <tr class="border-t animateFadeIn">
                            <td class="p-2 sm:p-3">${patient.PatientID}</td>
                            <td class="p-2 sm:p-3">${patient.Name}</td>
                            <td class="p-2 sm:p-3">${patient.Sex}</td>
                            <td class="p-2 sm:p-3">${patient.State}</td>
                            <td class="p-2 sm:p-3">${patient.GeneralHealth}</td>
                            <td class="p-2 sm:p-3">${patient.HasChronicCondition ? 'Yes' : 'No'}</td>
                            <td class="p-2 sm:p-3">${patient.HospitalStayDuration}</td>
                            <td class="p-2 sm:p-3">${patient.RiskCategory}</td>
                            <td class="p-2 sm:p-3">${patient.DoctorName}</td>
                            <td class="p-2 sm:p-3">${patient.Allergies}</td>
                            <td class="p-2 sm:p-3">${patient.ChiefComplaint}</td>
                            <td class="p-2 sm:p-3">${patient.AdmissionDate}</td>
                            <td class="p-2 sm:p-3">${patient.DischargeDate}</td>
                            <td class="p-2 sm:p-3">
                                ${patient.TestReports ? `<a href="/${patient.TestReports}" target="_blank" class="text-teal-600 hover:underline">View Report</a>` : 'None'}
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });
                if (!data.has_more) {
                    $('#load-more').remove();
                } else {
                    $('#load-more').data('next-page', data.next_page);
                }
            },
            error: function(xhr, status, error) {
                console.error('Load More AJAX Error:', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });
                showNotification('Failed to load more patients. Please try again.', true);
            }
        });
    });
});