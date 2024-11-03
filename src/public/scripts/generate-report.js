document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const yearInput = document.getElementById('year');
    const loadingIndicator = document.getElementById('loading');
    const reportOutput = document.getElementById('reportOutput');
    const errorOutput = document.getElementById('errorOutput');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Assume the user is the principal of Lincoln High School with schoolId = 1
    const schoolId = 1;

    // Fetch available years on page load
    fetchAvailableYears(schoolId);

    generateReportBtn.addEventListener('click', async () => {
        const year = parseInt(yearInput.value.trim());
        if (!year || isNaN(year)) {
            displayError('Please enter a valid year.');
            return;
        }

        clearOutputs();
        showLoading(true);

        try {
            // Generate Report with schoolId and year
            const report = await generateReport(schoolId, year);

            // Display the report
            displayReport(report);
        } catch (error) {
            console.error('Error:', error);
            displayError('An error occurred while generating the report. Please try again later.');
        } finally {
            showLoading(false);
        }
    });

    async function fetchAvailableYears(schoolId) {
        try {
            const response = await fetch(`/api/energy-usage/${schoolId}/years`);
            if (!response.ok) {
                throw new Error('Failed to fetch available years.');
            }
            const data = await response.json();
            populateYearDropdown(data.years);
        } catch (error) {
            console.error('Error fetching available years:', error);
            displayError('An error occurred while fetching available years.');
        }
    }

    function populateYearDropdown(years) {
        const yearSelect = document.getElementById('year');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    function displayReport(report) {
        const cleanHTML = DOMPurify.sanitize(report, { ADD_TAGS: ['style'] });
        reportOutput.innerHTML = cleanHTML;
        reportOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button when report is displayed
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

    async function generateReport(schoolId, year) {
        // Include the year as a query parameter
        const response = await fetch(`/api/reports/${schoolId}?year=${year}`, {
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
