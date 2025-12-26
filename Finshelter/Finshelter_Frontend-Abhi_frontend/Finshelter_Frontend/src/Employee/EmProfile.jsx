import React, { useContext, useState, useEffect } from "react";
import { EmployeeContext } from "./EmployeeContext";

const EmProfile = () => {
	const {
		user,
		formData,
		handleFieldUpdate,
		handleSaveProfile,
		loading,
		employeeInfo,
	} = useContext(EmployeeContext);

	const [editableField, setEditableField] = useState("");
	const [activeTab, setActiveTab] = useState("profile");
	const [localFormData, setLocalFormData] = useState({});

	useEffect(() => {
		if (employeeInfo) {
			// Initialize local form data with employee info
			setLocalFormData({
				...employeeInfo,
				// Convert date fields to proper format
				dob: employeeInfo.dob
					? new Date(employeeInfo.dob).toISOString().split("T")[0]
					: "",
				dateOfJoining: employeeInfo.dateOfJoining
					? new Date(employeeInfo.dateOfJoining).toISOString().split("T")[0]
					: "",
				currentOrgRelieveDate: employeeInfo.currentOrgRelieveDate
					? new Date(employeeInfo.currentOrgRelieveDate)
							.toISOString()
							.split("T")[0]
					: "",
				previousOrgFromDate: employeeInfo.previousOrgFromDate
					? new Date(employeeInfo.previousOrgFromDate)
							.toISOString()
							.split("T")[0]
					: "",
				previousOrgToDate: employeeInfo.previousOrgToDate
					? new Date(employeeInfo.previousOrgToDate).toISOString().split("T")[0]
					: "",
				passingMonthYear: employeeInfo.passingMonthYear
					? new Date(employeeInfo.passingMonthYear).toISOString().split("T")[0]
					: "",
			});
		}
	}, [employeeInfo]);

	const handleFieldEdit = (field) => {
		setEditableField(field);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLocalFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		handleFieldUpdate(name, value);
	};

	const getProfileInitial = () => {
		return localFormData?.name ? localFormData.name.charAt(0) : "?";
	};

	const renderTabContent = (tab) => {
		const fields = {
			profile: [
				{ label: "Employee Code", name: "_id", value: localFormData._id },
				{ label: "Full Name", name: "fullName", value: localFormData.name },
				{ label: "Email", name: "email", value: localFormData.email },
				{
					label: "Phone Number",
					name: "phoneNumber",
					value: localFormData.phoneNumber,
				},
				{
					label: "Date of Birth",
					name: "dob",
					value: localFormData.dob,
					type: "date",
				},
				{ label: "Gender", name: "gender", value: localFormData.gender },
				{
					label: "Date of Joining",
					name: "dateOfJoining",
					value: localFormData.dateOfJoining,
					type: "date",
				},
				{
					label: "Designation",
					name: "designation",
					value: localFormData.designation,
				},
			],
			taxInfo: [
				{ label: "PAN", name: "pan", value: localFormData.pan },
				{ label: "GSTIN", name: "gst", value: localFormData.gst },
				{ label: "TAN", name: "tan", value: localFormData.tan },
			],
			communicationinfo: [
				{
					label: "Full Address",
					name: "fulladdress",
					value: localFormData.fulladdress,
				},
				{ label: "City", name: "city", value: localFormData.city },
				{ label: "State", name: "state", value: localFormData.state },
				{ label: "Country", name: "country", value: localFormData.country },
				{
					label: "Postal Code",
					name: "postalCode",
					value: localFormData.postalCode,
				},
			],
			professionalinfo: [
				{
					label: "Position Code",
					name: "positionCode",
					value: localFormData.positionCode,
				},
				{
					label: "Department Code",
					name: "departmentCode",
					value: localFormData.departmentCode,
				},
				{
					label: "Department Name",
					name: "departmentName",
					value: localFormData.departmentName,
				},
			],
			employmentinfo: [
				{
					label: "Previous Organization",
					name: "previousOrganization",
					value: localFormData.previousOrganization,
				},
				{
					label: "From Date",
					name: "previousOrgFromDate",
					value: localFormData.previousOrgFromDate,
					type: "date",
				},
				{
					label: "To Date",
					name: "previousOrgToDate",
					value: localFormData.previousOrgToDate,
					type: "date",
				},
				{
					label: "Total Experience",
					name: "totalExperience",
					value: localFormData.totalExperience,
				},
			],
			educationinfo: [
				{
					label: "Education Qualification",
					name: "educationQualification",
					value: localFormData.educationQualification,
				},
				{
					label: "University",
					name: "university",
					value: localFormData.university,
				},
				{
					label: "Month & Year of Passing",
					name: "passingMonthYear",
					value: localFormData.passingMonthYear,
					type: "date",
				},
				{
					label: "Certifications",
					name: "certifications",
					value: localFormData.certifications,
				},
				{
					label: "Institute",
					name: "institute",
					value: localFormData.institute,
				},
			],
		};

		return (
			<div className='tab-content'>
				<h3>{tab.replace(/([A-Z])/g, " $1").trim()}</h3>
				{fields[tab].map((field) => (
					<div key={field.name} className='field-row'>
						<label htmlFor={field.name}>{field.label}:</label>
						{field.type === "date" ? (
							<input
								id={field.name}
								name={field.name}
								type='date'
								value={field.value || ""}
								onChange={handleInputChange}
								className={editableField === field.name ? "editable" : ""}
								disabled={editableField !== field.name}
							/>
						) : (
							<input
								id={field.name}
								name={field.name}
								value={field.value || ""}
								onChange={handleInputChange}
								className={editableField === field.name ? "editable" : ""}
								disabled={editableField !== field.name}
							/>
						)}
						<i
							className='fa-solid fa-pen-to-square edit-icon'
							onClick={() => handleFieldEdit(field.name)}
						/>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className='profile-container'>
			<div className='psidebar'>
				<ul>
					<li
						onClick={() => setActiveTab("profile")}
						className={activeTab === "profile" ? "selected" : ""}>
						Basic Profile
					</li>
					<li
						onClick={() => setActiveTab("taxInfo")}
						className={activeTab === "taxInfo" ? "selected" : ""}>
						Tax Info
					</li>
					<li
						onClick={() => setActiveTab("communicationinfo")}
						className={activeTab === "communicationinfo" ? "selected" : ""}>
						Communication Info
					</li>
					<li
						onClick={() => setActiveTab("professionalinfo")}
						className={activeTab === "professionalinfo" ? "selected" : ""}>
						Professional Information
					</li>
					<li
						onClick={() => setActiveTab("employmentinfo")}
						className={activeTab === "employmentinfo" ? "selected" : ""}>
						Employment Info
					</li>
					<li
						onClick={() => setActiveTab("educationinfo")}
						className={activeTab === "educationinfo" ? "selected" : ""}>
						Education Info
					</li>
				</ul>
			</div>
			<div className='content'>
				<div className='profile-header'>
					<div className='profile-icon'>{getProfileInitial()}</div>
					<h2>{localFormData?.name}</h2>
				</div>
				{renderTabContent(activeTab)}
				<div className='save-button-container'>
					<button
						className='save-button'
						onClick={handleSaveProfile}
						disabled={loading}>
						{loading ? "Saving..." : "Save Profile"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EmProfile;
