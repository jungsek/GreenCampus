document.addEventListener('DOMContentLoaded', () => {
    const errorOutput = document.getElementById('errorOutput');
    const reportContentDiv = document.getElementById('reportContent');

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');

    if (!reportId) {
        displayError('No report ID specified.');
        return;
    }

    fetchReport(reportId);

    async function fetchReport(reportId) {
        try {
            const response = await fetch(`/api/reports/id/${reportId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch report.');
            }
            const data = await response.json();
            displayReport(data.report.content);
        } catch (error) {
            console.error('Error fetching report:', error);
            displayError('An error occurred while fetching the report.');
        }
    }

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function displayReport(content) {
        reportContentDiv.innerHTML = content;
    }
});
