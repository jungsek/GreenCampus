document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('year');
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const errorOutput = document.getElementById('errorOutput');
    const dataTables = document.getElementById('dataTables');
    const energyUsageTableBody = document.getElementById('energyUsageTable').querySelector('tbody');
    const carbonFootprintTableBody = document.getElementById('carbonFootprintTable').querySelector('tbody');
    const energyBreakdownTableBody = document.getElementById('energyBreakdownTable').querySelector('tbody');
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');

    // Assume the user is the principal of Lincoln High School with schoolId = 1
    const schoolId = 1;

    // Fetch available years on page load
    fetchAvailableYears(schoolId);

    fetchDataBtn.addEventListener('click', () => {
        const selectedYear = parseInt(yearSelect.value);
        if (isNaN(selectedYear)) {
            displayError('Please select a valid year.');
            return;
        }
        fetchDataForYear(schoolId, selectedYear);
    });

    downloadCsvBtn.addEventListener('click', () => {
        downloadDataAsCsv();
    });

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function clearError() {
        errorOutput.textContent = '';
        errorOutput.classList.add('hidden');
    }

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
        yearSelect.innerHTML = ''; // Clear existing options
        if (years.length === 0) {
            yearSelect.innerHTML = '<option value="">No years available</option>';
            return;
        }
        yearSelect.innerHTML = '<option value="">Select a year</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    async function fetchDataForYear(schoolId, year) {
        clearError();
        dataTables.classList.add('hidden');

        try {
            // Fetch Energy Usage
            const energyUsageResponse = await fetch(`/api/energy-usage/${schoolId}/monthly/${year}`);
            if (!energyUsageResponse.ok) throw new Error('Failed to fetch energy usage data.');
            const energyUsageData = await energyUsageResponse.json();

            // Fetch Carbon Footprint
            const carbonFootprintResponse = await fetch(`/api/carbon-footprint/${schoolId}/year/${year}`);
            if (!carbonFootprintResponse.ok) throw new Error('Failed to fetch carbon footprint data.');
            const carbonFootprintData = await carbonFootprintResponse.json();

            // Fetch Energy Breakdown
            const energyBreakdownResponse = await fetch(`/api/energy-breakdown/${schoolId}/year/${year}`);
            if (!energyBreakdownResponse.ok) throw new Error('Failed to fetch energy breakdown data.');
            const energyBreakdownData = await energyBreakdownResponse.json();

            // Display Data
            displayEnergyUsageData(energyUsageData);
            displayCarbonFootprintData(carbonFootprintData);
            displayEnergyBreakdownData(energyBreakdownData);

            dataTables.classList.remove('hidden');

        } catch (error) {
            console.error('Error fetching data:', error);
            displayError('An error occurred while fetching data.');
        }
    }

    function displayEnergyUsageData(data) {
        energyUsageTableBody.innerHTML = '';
        if (data.length === 0) {
            energyUsageTableBody.innerHTML = '<tr><td colspan="3">No data available for this year.</td></tr>';
            return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.month}</td>
                <td>${item.energy_kwh.toFixed(2)}</td>
                <td>${item.avg_temperature_c.toFixed(1)}</td>
            `;
            energyUsageTableBody.appendChild(row);
        });
    }

    function displayCarbonFootprintData(data) {
        carbonFootprintTableBody.innerHTML = '';
        if (data.length === 0) {
            carbonFootprintTableBody.innerHTML = '<tr><td colspan="2">No data available for this year.</td></tr>';
            return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(item.timestamp).toISOString().split('T')[0]}</td>
                <td>${item.total_carbon_tons.toFixed(2)}</td>
            `;
            carbonFootprintTableBody.appendChild(row);
        });
    }

    function displayEnergyBreakdownData(data) {
        energyBreakdownTableBody.innerHTML = '';
        if (data.length === 0) {
            energyBreakdownTableBody.innerHTML = '<tr><td colspan="4">No data available for this year.</td></tr>';
            return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.month}</td>
                <td>${item.location}</td>
                <td>${item.category}</td>
                <td>${item.percentage}</td>
            `;
            energyBreakdownTableBody.appendChild(row);
        });
    }

    function downloadDataAsCsv() {
        // Collect data from tables
        const energyUsageData = tableToCsv('energyUsageTable');
        const carbonFootprintData = tableToCsv('carbonFootprintTable');
        const energyBreakdownData = tableToCsv('energyBreakdownTable');

        // Combine data
        const csvContent = `Energy Usage\n${energyUsageData}\n\nCarbon Footprint\n${carbonFootprintData}\n\nEnergy Breakdown\n${energyBreakdownData}`;

        // Create a blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `Data_${yearSelect.value}.csv`;
        downloadLink.click();
        URL.revokeObjectURL(url);
    }

    function tableToCsv(tableId) {
        const table = document.getElementById(tableId);
        let csv = '';
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            cols.forEach(col => {
                // Escape commas and quotes
                let data = col.innerText.replace(/"/g, '""');
                if (data.indexOf(',') > -1 || data.indexOf('"') > -1) {
                    data = `"${data}"`;
                }
                rowData.push(data);
            });
            csv += rowData.join(',') + '\n';
        });
        return csv.trim();
    }
});
