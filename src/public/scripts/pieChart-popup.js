const popupMessages = {
    Lighting: {
        title: "Lighting (Average across all locations)",
        message: `<strong>Average Total Hours of Lighting Use:</strong> 10 hours per day.<br>
            <strong>Light Usage Patterns:</strong> Hallway and lobby lights are typically left on for 2 hours beyond school hours.<br>
            <strong>Energy Efficiency of Lighting Fixtures:</strong> 20% energy savings from LED fixtures over older models.<br>
            <strong>Automatic Controls:</strong> About 70% of rooms utilize motion sensors to reduce unnecessary usage.<br>
            <strong>Brightness Level:</strong> Dimming features used in 80% of classrooms during non-peak hours.`
    },
    HVAC: {
        title: "HVAC System (Average across all locations)",
        message: `<strong>Operating Hours:</strong> HVAC systems run approximately 18 hours per day, with a reduced load at night.<br>
            <strong>Energy Efficiency:</strong> Average HVAC systems yield a 15% reduction in energy use due to high-efficiency models.<br>
            <strong>Temperature Settings:</strong> Set between 20°C during the day and 18°C at night.<br>
            <strong>Cooling/Heating Demand:</strong> Average peak demand for heating is 65 kW and 50 kW for cooling.<br>
            <strong>Automatic Controls:</strong> Smart thermostats are installed in about 60% of rooms for adaptive temperature control.`
    },
    Refrigeration: {
        title: "Refrigeration (Average across all locations)",
        message: `<strong>Energy Usage:</strong> Average monthly consumption of 250 kWh per unit.<br>
            <strong>Temperature Settings:</strong> 4°C for refrigeration and -18°C for frozen items, consistent across locations.<br>
            <strong>Frequency of Door Openings:</strong> Average door opening frequency is 10 times per day, with adjustments for high-use areas.<br>
            <strong>Energy Efficiency:</strong> Energy-efficient models contribute to a 12% average energy reduction.<br>
            <strong>Maintenance:</strong> Monthly maintenance for defrosting and cleaning for all units.`
    },
    Computers: {
        title: "Computers (Average across all locations)",
        message: `<strong>Usage Hours:</strong> Computers are used for 6 hours daily on average.<br>
            <strong>Power Consumption per Unit:</strong> Desktops: 120W per unit; Laptops: 50W per unit.<br>
            <strong>Energy-Saving Settings:</strong> Power-saving modes implemented in 90% of computers.<br>
            <strong>Maintenance:</strong> Regular updates and shutdown policies applied in most labs.<br>
            <strong>Usage Policy:</strong> Standby modes enforced after 15 minutes of inactivity.`
    },
    Equipment: {
        title: "Equipment (Average across all locations)",
        message: `<strong>Operating Hours:</strong> Average of 5 hours daily across all equipment.<br>
            <strong>Energy Efficiency:</strong> Equipment is updated regularly to meet current efficiency standards, saving an average of 10% energy.<br>
            <strong>Usage Patterns:</strong> Increased usage during lab hours; low usage at other times.<br>
            <strong>Maintenance Schedule:</strong> Bi-monthly maintenance to ensure optimal performance.<br>
            <strong>Automation:</strong> Automation applied where possible to reduce idle energy consumption.`
    },
    Appliances: {
        title: "Appliances (Average across all locations)",
        message: `<strong>Daily Usage:</strong> Appliances used for 3 hours daily on average.<br>
            <strong>Energy Consumption:</strong> Energy-efficient models used, reducing consumption by approximately 15%.<br>
            <strong>Power-Saving Features:</strong> Many appliances have timers and standby modes.<br>
            <strong>Usage Guidelines:</strong> Users are encouraged to switch off appliances when not in use.<br>
            <strong>Maintenance:</strong> Quarterly checks to ensure appliances are functioning efficiently.`
    },
    FoodWasteManagement: {
        title: "Food Waste Management (Average across all locations)",
        message: `<strong>Total Food Waste Generated:</strong> Approximately 30kg per week.<br>
            <strong>Disposal Methods:</strong> Composting for organic waste, with some recyclable materials.<br>
            <strong>Composting Efficiency:</strong> Compost bins in 50% of school locations, contributing to garden projects.<br>
            <strong>Frequency of Waste Disposal:</strong> Disposal bins are cleared daily; compost bins are managed weekly.`
    }
};
