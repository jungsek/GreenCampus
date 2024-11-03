document.addEventListener('DOMContentLoaded', () => {
    const reportsTableBody = document.getElementById('reportsTable').querySelector('tbody');
    const errorOutput = document.getElementById('errorOutput');

    fetchReports();

    async function fetchReports() {
        try {
            const response = await fetch('/api/reports');
            if (!response.ok) {
                throw new Error('Failed to fetch reports.');
            }
            const data = await response.json();
            displayReports(data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            displayError('An error occurred while fetching the reports.');
        }
    }

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function displayReports(reports) {
        reportsTableBody.innerHTML = '';
        if (reports.length === 0) {
            reportsTableBody.innerHTML = '<tr><td colspan="5">No reports available.</td></tr>';
            return;
        }

        reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.id}</td>
                <td>${report.school_name}</td>
                <td>${report.year}</td>
                <td>${new Date(report.created_at).toLocaleDateString()}</td>
                <td><a href="viewReport.html?reportId=${report.id}" class="btn btn-primary btn-sm">View</a></td>
            `;
            reportsTableBody.appendChild(row);
        });
    }
});
