// EmployeeDashboard.jsx
import React, { useState, useEffect } from "react";
import EmSidebar from "./EmSidebar";
import EmDash from "./EmDash";
import EmAssignedCustomers from "./EmAssignedCustomers";
import EmployeeQueries from "./EmployeeQueries";
import EmProfile from "./EmProfile";
import EmLeads from "./EmLeads";
import { useNotification } from "../NotificationContext";
import EmTopbar from "./EmTopbar";

const EmployeeDashboard = () => {
	const [activeSection, setActiveSection] = useState("Dashboard");
	const { showNotification, setCurrentPage } = useNotification();

	useEffect(() => {
		setCurrentPage("employee");
	}, [setCurrentPage]);
	return (
		<div className='employee-dashboard'>
			<EmSidebar
				activeSection={activeSection}
				setActiveSection={setActiveSection}
			/>
			<div className='content1'>
				<EmTopbar activeSection={activeSection} setActiveSection={setActiveSection} />
				<div className='content'>
					{activeSection === "Dashboard" && <EmDash />}
					{activeSection === "Orders" && <EmAssignedCustomers />}
					{activeSection === "Leads" && <EmLeads />}
					{activeSection === "Customer Queries" && <EmployeeQueries />}
					{activeSection === "Profile" && <EmProfile />}
				</div>
			</div>
		</div>
	);
};

export default EmployeeDashboard;
