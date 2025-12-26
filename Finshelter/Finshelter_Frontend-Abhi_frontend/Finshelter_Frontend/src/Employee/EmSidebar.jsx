import React, { useContext } from "react";
import { EmployeeContext } from "./EmployeeContext";
import "./employee.css";
import { useNavigate } from "react-router-dom";

const EmSidebar = ({ activeSection, setActiveSection }) => {
	const sections = ["Dashboard", "Orders", "Leads", "Customer Queries", "Profile"];

	const { logout, isAuthenticated } = useContext(EmployeeContext);
	const navigate = useNavigate();
	const handleLogout = () => {
		logout(); // Clear authentication state
		navigate("/employees/login"); // Redirect to login page
	};

	return (
		<div className='esidebar'>
			<ul>
				{sections.map((section) => (
					<li
						key={section}
						className={activeSection === section ? "li-active" : ""}
						onClick={() => setActiveSection(section)}>
						{section}
					</li>
				))}
			 <button onClick={handleLogout}>Logout</button>
			</ul>
		</div>
	);
};

export default EmSidebar;
