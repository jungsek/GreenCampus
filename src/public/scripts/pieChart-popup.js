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
    },

    EnergyUsage: {
        title: "Energy Usage",
        message: `<strong>Energy Consumption:</strong> 6,000 kWh of energy per month across all buildings.<br>
            <strong>Carbon Emissions:</strong> Estimated carbon emissions from energy use are 3,500 kg CO2 per month.<br>
            <strong>Major Energy Consumers:</strong> Classroom lighting, computer labs, and HVAC systems.`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Install energy-efficient lighting systems, such as LEDs, in classrooms and hallways.<br>
            2. Optimize HVAC settings to operate during peak hours and turn off when rooms are unoccupied.<br>
            3. Incorporate renewable energy sources, such as solar panels, to offset energy consumption and reduce carbon emissions.<br>`
    },
    
    FoodServices: {
        title: "Cafeteria",
        message: `<strong>Food Waste:</strong> Approximately 300 kg of food is wasted monthly in the school cafeteria.<br>
            <strong>Food Production and Transportation:</strong> The carbon footprint from food production and transportation is approximately 800 kg CO2 per month.<br>
            <strong>Waste Sources:</strong> Leftovers from student meals and kitchen overproduction.`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Reduce food waste by implementing pre-order systems to better match meal production with student preferences.<br>
            2. Partner with local farms to source fresh ingredients and reduce transportation-related emissions.<br>
            3. Introduce educational programs to encourage students to take only what they can eat and reduce leftovers.<br>`
    },
    
    Transportation: {
        title: "Transportation",
        message: `<strong>Student and Staff Commuting:</strong> Total commuting distance for students and staff is approximately 1,200 km daily.<br>
            <strong>School Bus Fleet:</strong> Diesel-powered buses contribute 1,000 kg CO2 emissions per month.<br>`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Expand bike parking facilities and encourage cycling by creating safe bike routes to school.<br>
            2. Transition the school bus fleet to electric or hybrid vehicles to significantly reduce emissions.<br>
            3. Launch a carpool program for staff and students to minimize individual car usage.<br>`
    },
    
    WasteManagement: {
        title: "Waste Management",
        message: `<strong>Waste Generation:</strong> Generates 500 kg of waste monthly, with 150 kg being recycled.<br>
            <strong>Major Waste Sources:</strong> Paper, food packaging, and single-use plastics.`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Increase recycling rates by placing clearly labeled bins in classrooms and common areas.<br>
            2. Implement a composting program for food and organic waste from the cafeteria.<br>
            3. Transition to reusable or biodegradable materials for food packaging and classroom supplies.<br>`
    },
    
    WaterUsage: {
        title: "Water Usage",
        message: `<strong>Average Monthly Water Usage:</strong> 40,000 liters of water are used monthly.<br>
            <strong>Water Heating:</strong> Water heating contributes to 15% of the school’s total energy consumption.<br>
            <strong>Major Usage Areas:</strong> Restrooms, cafeteria, and sports facilities.`,
        recommendations: `<strong>AI Recommendations:</strong><br>
            1. Install low-flow faucets and toilets to reduce water consumption in restrooms.<br>
            2. Use solar-powered water heaters to minimize the carbon footprint of water heating.<br>
            3. Launch a water conservation campaign to educate students and staff about responsible water usage.<br>`
    }
};
