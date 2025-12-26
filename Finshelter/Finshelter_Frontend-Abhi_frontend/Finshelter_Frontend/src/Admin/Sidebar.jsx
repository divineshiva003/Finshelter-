import React from "react";
import { AdminDashboardContext } from "./AdminDashboardContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
const Sidebar = ({ activeSection, setActiveSection }) => {
	const sections = [
		"Dashboard",
		"Services",
		"Customers",
		
		"Employees",
		"Orders",
		"Leads",     
		"Message Center",
		"Withdrawal Requests", 
	];
	const { logout, isAuthenticated, selectedOrderPosition } = useContext(AdminDashboardContext);
	const navigate = useNavigate();
	const handleLogout = () => {
		logout(); // Clear authentication state
		navigate("/admin/login"); // Redirect to login page
	};

	return (
		<div className='sidebar'>
			<center>
				<Link to='/' id='side-home'>
					<div>Go to Home</div>
				</Link>
			</center>

			<ul>
				{sections.map((section) => (
					<li
						key={section}
						className={activeSection === section ? "li-active" : ""}
						onClick={() => setActiveSection(section)}>
						{section}
						{section === "Message Center" && selectedOrderPosition && (
							<span style={{ marginLeft: '8px', fontSize: '0.9em', opacity: 0.8 }}>
								({selectedOrderPosition})
							</span>
						)}
					</li>
				))}
				{/* {isAuthenticated && <button onClick={handleLogout}>Logout</button>} */}
			</ul>
		</div>
	);
};
export default Sidebar;
