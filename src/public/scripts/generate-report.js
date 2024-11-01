document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const schoolNameInput = document.getElementById('schoolName');
    const loadingIndicator = document.getElementById('loading');
    const reportOutput = document.getElementById('reportOutput');
    const errorOutput = document.getElementById('errorOutput');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn'); 
    

    generateReportBtn.addEventListener('click', async () => {
        const schoolName = schoolNameInput.value.trim();
        if (!schoolName) {
            displayError('Please enter a school name.');
            return;
        }

        clearOutputs();
        showLoading(true);

        try {
            // Step 1: Get School ID by Name
            const schoolId = await getSchoolIdByName(schoolName);
            if (!schoolId) {
                displayError('School not found. Please check the name and try again.');
                showLoading(false);
                return;
            }

            // Step 2: Generate Report
            const report = await generateReport(schoolId);

            // Display the report
            displayReport(report);
        } catch (error) {
            console.error('Error:', error);
            displayError('An error occurred while generating the report. Please try again later.');
        } finally {
            showLoading(false);
        }
    });

    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    function displayReport(report) {
        const cleanHTML = DOMPurify.sanitize(report, { ADD_TAGS: ['style'] });
        reportOutput.innerHTML = cleanHTML;
        reportOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button when report is displayed
    
        // Log the content to the console
        console.log('Report Content:', reportOutput.innerHTML);
    }
    

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function clearOutputs() {
        reportOutput.innerHTML = '';
        errorOutput.textContent = '';
        reportOutput.classList.add('hidden');
        errorOutput.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden'); // Hide the download button
    }

    async function getSchoolIdByName(schoolName) {
        const response = await fetch(`/api/schools?name=${encodeURIComponent(schoolName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        if (!response.ok) {
            throw new Error('Failed to fetch school ID');
        }
    
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].id; // Return the first matching school's ID
        } else {
            return null;
        }
    }

    async function generateReport(schoolId) {
        const response = await fetch(`/api/reports/${schoolId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate report');
        }

        const data = await response.json();
        return data.report;
    }

    // Event listener for the Download as PDF button
    downloadPdfBtn.addEventListener('click', () => {
        downloadReportAsPDF();
    });

    // Function to download the report as a PDF
    function downloadReportAsPDF() {
        const reportContent = document.getElementById('reportOutput');

        // Define PDF options
        const opt = {
            margin:       0.5, // inches
            filename:     'Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(reportContent).save();
    }

});
