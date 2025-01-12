const popupMessages = {
    Lighting: {
        title: "Lighting",
        message: `<strong>Average Daily Use:</strong> Lights are on for approximately 10 hours per day.<br>
            <strong>After-Hours Use:</strong> Hallway and lobby lights remain on 2 hours past school hours.<br> `,
        recommendations: `<strong>AI Recommendations:</strong> <br>
            1. Consider replacing the remaining 20% of non-LED fixtures with LEDs to further reduce energy consumption.<br>
            2. Upgrade motion sensors to cover 90% of rooms for improved efficiency.<br>
            3. Ensure that lights are dimmed during non-peak hours for all rooms, especially in less-used areas.`
    },
    HVAC: {
        title: "HVAC System",
        message: `<strong>Average Daily Operating Hours:</strong> 18 hours<br>
            <strong>Energy Usage Per Month:</strong> HVAC systems consume an estimated 1,500 kWh monthly.<br>
            <strong>Average Temperature Set:</strong> 22°C.<br>
            <strong>Peak Cooling/Heating Demand:</strong> Heating demand reaches 65 kW and cooling peaks at 50 kW.`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Expand the use of smart thermostats to all rooms for a more consistent and efficient temperature regulation.<br>
            2. Consider adding a demand response system that adjusts the temperature during peak energy hours to save costs.<br>
            3. Schedule regular maintenance checks for HVAC systems to ensure they are operating at peak efficiency.`
    },
    Refrigeration: {
        title: "Refrigeration",
        message: `<strong>Monthly Energy Usage:</strong> 180 kWh<br>
            <strong>Temperature Control:</strong> 4°C for refrigeration, -18°C for freezing<br>
            <strong>Usage Patterns:</strong> Doors opened 12-30 times per day, increasing cooling demand.<br> `,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Ensure refrigeration doors are only opened when necessary to avoid energy spikes.<br>
            2. Replace older units with newer, more efficient models to reduce consumption further.<br>
            3. Monitor the performance of refrigeration units and adjust settings based on usage patterns to optimize energy use.<br>`
    },
    Computers: {
        title: "Computers",
        message: `<strong>Average Daily Usage:</strong> Computers are actively used for 6 hours daily.<br>
            <strong>Power Consumption:</strong> Desktops consume 120W per unit, laptops 50W.<br>
            <strong>Standby Power Use:</strong> Standby modes activate after 15 minutes of inactivity, covering 90% of devices.<br>
            <strong>Total Lab Consumption:</strong> Computer labs consume around 300 kWh monthly.<br> `,
        recommendations:  ` <strong>AI Recommendations:</strong><br>
            1. Encourage users to fully shut down desktops after use, especially for extended periods.<br>
            2. Consider upgrading to energy-efficient computers or laptops to further reduce consumption.<br>
            3. Set up automated shutdowns after a certain period of inactivity across all devices.<br>`
    },
    Equipment: {
        title: "Equipment",
        message: `<strong>Average Operating Hours:</strong> 5 hours daily, primarily during lab activities.<br>
            <strong>Energy Consumption:</strong> Equipment accounts for approximately 10% of total energy use, varying by type and lab schedule.<br>
            <strong>Usage Peaks:</strong> High usage during lab hours, minimal at other times.<br>
            <strong>Automation Coverage:</strong> Energy-saving automation is applied to reduce idle consumption.<br>`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Extend the use of energy-saving automation to cover all lab equipment, ensuring idle times are minimized.<br>
            2. Upgrade older equipment to energy-efficient models.<br>
            3. Encourage users to shut off equipment when not in use for extended periods to prevent unnecessary consumption.<br> `
    },
    Appliances: {
        title: "Appliances",
        message: `<strong>Average Daily Use:</strong> Common appliances are used for about 3 hours daily.<br>
            <strong>Energy Consumption:</strong> Energy-efficient models contribute to a 15% reduction in power use.<br>
            <strong>Total Monthly Usage:</strong> Appliances consume around 200 kWh monthly across all units.<br> `,
        recommendations:  `<strong>AI Recommendations:</strong><br>
            1. Continue to replace older appliances with newer, energy-efficient models.<br>
            2. Set timers for appliances that are frequently used for short periods to limit energy consumption.<br>
            3. Ensure that all appliances are in power-saving modes when not in use.<br> `
    },
    FoodWasteManagement: {
        title: "Food Waste Management",
        message: `<strong>Average Waste Generated:</strong> About 30kg of food waste per week, with regular disposal and composting.<br>
            <strong>Daily Disposal Frequency:</strong> Waste bins are emptied daily, compost bins weekly.<br>
            <strong>Energy Use in Waste Management:</strong> Minimal direct energy use; disposal and composting are primarily manual processes.<br><br>`,
        recommendations:   `<strong>AI Recommendations:</strong><br>
            1. Encourage waste reduction efforts, such as better portion control, to reduce the overall food waste generated.<br>
            2. Increase the frequency of compost bin collections during peak waste generation times.<br>
            3. Explore energy-efficient ways of processing organic waste, such as using solar-powered composting systems.<br>`
    }
};
