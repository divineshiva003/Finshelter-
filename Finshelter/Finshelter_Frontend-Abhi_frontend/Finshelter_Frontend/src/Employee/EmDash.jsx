import React, { useContext, useEffect } from "react";
import { EmployeeContext } from "./EmployeeContext";
import EmployeeDashboardCharts from "./EmployeeDashboardCharts";

const EmDash = () => {
	const {
		employeeInfo,
		metrics,
		status,
		loading,
		error,
		fetchEmployeeDashboard,
	} = useContext(EmployeeContext);

	useEffect(() => {
		fetchEmployeeDashboard();
	}, [fetchEmployeeDashboard]);

	if (loading) return <div>Loading dashboard data...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className='ctax-dashboard-section'>
			{employeeInfo ? (
				<>
					<div className='cdashboard-summary'>
						<h1>Welcome, {employeeInfo.name}</h1>

						{/* <div>
							<div className='cdashboard-card'>
								<p>
									<strong>Assigned Customers:</strong> {metrics.totalCustomers}
								</p>
							</div>
							<div className='cdashboard-card'>
								<p>
									<strong>Active Customers:</strong> {metrics.activeCustomers}
								</p>
							</div>
							<div className='cdashboard-card'>
								<p>
									<strong>Completed Services:</strong>{" "}
									{metrics.completedServices}
								</p>
							</div>
							<div className='cdashboard-card'>
								<p>
									<strong>Service:</strong>{" "}
									{employeeInfo.serviceId?.name || "Not Assigned"}
								</p>
							</div>
							<div className='cdashboard-card'>
								<p>
									<strong>Profile Status:</strong>{" "}
									{status.isProfileComplete ? "Complete" : "Incomplete"}
								</p>
							</div>
						</div> */}
					</div>

					{/* Add the charts component */}
					<EmployeeDashboardCharts
						metrics={metrics}
						employeeInfo={employeeInfo}
					/>
				</>
			) : (
				<p>No dashboard data available</p>
			)}
		</div>
	);
};

export default EmDash;
