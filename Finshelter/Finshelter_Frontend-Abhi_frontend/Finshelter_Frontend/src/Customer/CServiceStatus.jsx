import React, { useState, useEffect } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import QueryModal from "./QueryModal";
import FeedbackModal from "./FeedbackModal";
import ServiceProgress from "./ServiceProgress";
import axios from "axios";

const CServiceStatus = () => {
	const { services, uploadDocuments, loading, user } = useCustomerAuth();
	const [selectedService, setSelectedService] = useState(null);
	const [uploadError, setUploadError] = useState("");
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
	const [isDocPreviewModalOpen, setIsDocPreviewModalOpen] = useState(false);
	const [selectedDocuments, setSelectedDocuments] = useState([]);
	const [files, setFiles] = useState({});
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadedDocuments, setUploadedDocuments] = useState([]);
	const [orderModelOrders, setOrderModelOrders] = useState([]);

	const [feedbackGiven, setFeedbackGiven] = useState(() => {
		const savedFeedback =
			JSON.parse(localStorage.getItem("feedbackGiven")) || {};
		return savedFeedback;
	});

	useEffect(() => {
		localStorage.setItem("feedbackGiven", JSON.stringify(feedbackGiven));
	}, [feedbackGiven]);

	useEffect(() => {
		fetchOrderModelOrders();
	}, []);

	const fetchOrderModelOrders = async () => {
		try {
			const token = localStorage.getItem('customerToken');
			if (!token) return;

			const response = await axios.get('http://localhost:8000/api/payment/my-orders', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.success) {
				setOrderModelOrders(response.data.orders);
			}
		} catch (error) {
			console.error('Error fetching orders from Order model:', error);
		}
	};

	const getServiceStage = (service) => {
		const stages = [
			"Signup For The Service",
			"Assigned To An Expert",
			"Document Upload",
			"Service Execution",
			"Deliverables Finalized",
		];

		if (service.status === "completed") {
			return "Deliverables Finalized";
		} else if (service.documents?.length > 0) {
			return "Service Execution";
		} else if (service.employeeId) {
			return "Document Upload";
		} else if (service.activated) {
			return "Assigned To An Expert";
		}
		return "Signup For The Service";
	};

	const openModal = (service) => {
		setSelectedService(service);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setSelectedService(null);
		setIsModalOpen(false);
	};

	const openUploadModal = (service) => {
		const enhancedService = {
			...service,
			serviceName: service.name || service.serviceName,
			requiredDocuments: service.requiredDocuments || [],
		};
		setSelectedService(enhancedService);
		setFiles({});
		setUploadError("");
		setIsUploadModalOpen(true);
	};

	const closeUploadModal = () => {
		setSelectedService(null);
		setFiles({});
		setUploadError("");
		setIsUploadModalOpen(false);
		setUploadProgress(0);
	};

	const openFeedbackModal = (service) => {
		setSelectedService(service);
		setIsFeedbackModalOpen(true);
	};

	const closeFeedbackModal = () => {
		setSelectedService(null);
		setIsFeedbackModalOpen(false);
	};

	const openDocPreviewModal = (documents) => {
		setSelectedDocuments(documents);
		setIsDocPreviewModalOpen(true);
	};

	const closeDocPreviewModal = () => {
		setSelectedDocuments([]);
		setIsDocPreviewModalOpen(false);
	};

	const handleFileChange = (docName, e) => {
		const file = e.target.files[0];
		setFiles((prev) => ({
			...prev,
			[docName]: file,
		}));
	};

	const handleUpload = async () => {
		if (!selectedService) {
			setUploadError("No service selected.");
			return;
		}

		if (!selectedService.requiredDocuments?.length) {
			setUploadError("No required documents specified for this service.");
			return;
		}

		const requiredDocs = selectedService.requiredDocuments.filter(
			(doc) => doc.required
		);
		const missingDocs = requiredDocs.filter((doc) => !files[doc.name]);

		if (missingDocs.length > 0) {
			setUploadError(
				`Please upload required documents: ${missingDocs
					.map((d) => d.name)
					.join(", ")}`
			);
			return;
		}

		try {
			const serviceId = selectedService.serviceId || selectedService._id;
			await uploadDocuments(serviceId, files);
			closeUploadModal();
		} catch (error) {
			setUploadError(
				error.message || "Failed to upload documents. Please try again."
			);
		}
	};

	const formatCurrency = (amount) => {
		console.log("Formatting currency:", amount, typeof amount);
		
		// If amount is undefined or null, return N/A
		if (amount === undefined || amount === null) return "N/A";
		
		// Convert to number if it's a string
		let numericAmount;
		if (typeof amount === 'string') {
			numericAmount = parseFloat(amount);
		} else {
			numericAmount = amount;
		}
		
		// Check if it's a valid number after conversion
		if (isNaN(numericAmount)) {
			console.warn("Invalid amount for formatting:", amount);
			return "₹0.00";
		}
		
		// Format with Indian Rupee symbol and 2 decimal places
		return `₹${numericAmount.toFixed(2)}`;
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "N/A";
		const date = new Date(dateStr);
		const options = { day: "2-digit", month: "short", year: "numeric" };
		return date.toLocaleDateString("en-GB", options).replace(/ /g, " ");
	};

	const handleFeedbackSubmit = (serviceId) => {
		setFeedbackGiven((prev) => ({
			...prev,
			[serviceId]: true,
		}));
	};

	if (loading) return <p>Loading...</p>;

	const stages = [
		"Signup For The Service",
		"Assigned To An Expert",
		"Document Upload",
		"Service Execution",
		"Deliverables Finalized",
	];

	const [selectedServiceName, setSelectedServiceName] = useState("");
	useEffect(() => {
		if (services && services.length > 0) {
			console.log("Services loaded:", services);
			// Log tax information for debugging
			services.forEach(service => {
				console.log(`Service ${service.serviceName || service._id} tax details:`, {
					igst: service.igst,
					cgst: service.cgst,
					sgst: service.sgst,
					discount: service.discount,
					paymentAmount: service.paymentAmount,
					price: service.price,
					totalTax: (service.igst || 0) + (service.cgst || 0) + (service.sgst || 0),
					totalValue: service.price + (service.igst || 0) + (service.cgst || 0) + (service.sgst || 0)
				});
			});
			setSelectedServiceName(services[0].serviceName);
			setUploadedDocuments(services[0].documents || []);
		}
	}, [services]);

	useEffect(() => {
		const selectedService = services.find(
			(service) => service.serviceName === selectedServiceName
		);
		setUploadedDocuments(selectedService?.documents || []);
	}, [selectedServiceName, services]);

	return (
		<div className='tax-dashboard-section'>
			<div className='service-status'>
				<div className='tax-services-wrap-table'>
					<table>
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Date</th>
								<th>Service Name</th>
								<th>Package</th>
								<th>Discounts</th>
								<th>IGST Amount</th>
								<th>CGST Amount</th>
								<th>SGST Amount</th>
								<th>Total Order Value</th>
								<th>Order Status</th>
								<th>Completion Date</th>
								<th>Managed By</th>
								<th>Due Date</th>
								<th>Feedback</th>
								<th>Rating</th>
								<th>Payment Status</th>
								<th>Actions</th>
								<th>Uploaded Documents</th>
							</tr>
						</thead>
						<tbody>
							{/* Display orders from Order model first */}
							{orderModelOrders.map((order, index) => (
								<tr key={`order-${order._id || index}`}>
									<td>{order.orderId || order.razorpayOrderId || "N/A"}</td>
									<td>{formatDate(order.orderDate)}</td>
									<td>{order.serviceName || "N/A"}</td>
									<td>
										{order.packageName ? (
											<div>
												<strong>{order.packageName}</strong>
												{order.servicePrice && <div>₹{order.servicePrice}</div>}
											</div>
										) : (
											<span style={{ color: '#666', fontStyle: 'italic' }}>No package</span>
										)}
									</td>
									<td>{formatCurrency(order.discountAmount || 0)}</td>
									<td>{formatCurrency(order.igstAmount || 0)}</td>
									<td>{formatCurrency(order.cgstAmount || 0)}</td>
									<td>{formatCurrency(order.sgstAmount || 0)}</td>
									<td>{formatCurrency(order.totalAmount || 0)}</td>
									<td>
										<span style={{ 
											fontWeight: 'bold',
											color: order.orderStatus === 'Completed' ? 'green' : 
												order.orderStatus === 'In Process' ? 'blue' : 'orange'
										}}>
											{order.orderStatus || "Pending"}
										</span>
									</td>
									<td>{formatDate(order.actualCompletionDate || order.expectedCompletionDate)}</td>
									<td>
										{order.employeeName ? (
											<span>{order.employeeName}</span>
										) : (
											<span style={{ color: '#666', fontStyle: 'italic' }}>Not assigned</span>
										)}
									</td>
									<td>{formatDate(order.dueDate)}</td>
									<td>
										{order.feedback ? (
											<div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{order.feedback}
											</div>
										) : (
											<span style={{ color: '#666', fontStyle: 'italic' }}>No feedback given</span>
										)}
									</td>
									<td>
										{order.rating ? (
											<span>⭐ {order.rating}/5</span>
										) : (
											<span style={{ color: '#666', fontStyle: 'italic' }}>-</span>
										)}
									</td>
									<td>
										<span style={{
											fontWeight: 'bold',
											color: order.paymentStatus === 'Paid' ? 'green' : 
												order.paymentStatus === 'Pending' ? 'orange' : 'red'
										}}>
											{order.paymentStatus || "Pending"}
										</span>
									</td>
									<td>
										<span style={{ color: '#888', fontStyle: 'italic' }}>From Payment System</span>
									</td>
									<td>
										<span style={{ color: '#888', fontStyle: 'italic' }}>-</span>
									</td>
								</tr>
							))}
							
							{/* Display existing services */}
							{services.length > 0 ? (
								services.map((service, index) => (
									<React.Fragment key={`service-${index}`}>
										<tr>
											<td>{service.orderId || service._id || "N/A"}</td>
											<td>{formatDate(service.purchasedAt)}</td>
											<td>{service.serviceName || service.name}</td>
											<td>
												{service.packageName ? (
													<div>
														<strong>{service.packageName}</strong>
														{service.price && <div>₹{service.price}</div>}
													</div>
												) : (
													<span style={{ color: '#666', fontStyle: 'italic' }}>No package</span>
												)}
											</td>
											<td>{formatCurrency(service.discount || 0)}</td>
											<td>{formatCurrency(service.igst || 0)}</td>
											<td>{formatCurrency(service.cgst || 0)}</td>
											<td>{formatCurrency(service.sgst || 0)}</td>
											<td>{formatCurrency(service.paymentAmount || service.price || 0)}</td>
											<td>
												<span style={{ 
													fontWeight: 'bold',
													color: service.status === 'completed' ? 'green' : 
														service.status === 'In Process' ? 'blue' : 'orange'
												}}>
													{service.status || "Pending"}
												</span>
											</td>
											<td>{formatDate(service.completionDate)}</td>
											<td>
												{service.employeeId ? (
													<span>{service.employeeName || "Assigned"}</span>
												) : (
													<span style={{ color: '#666', fontStyle: 'italic' }}>Not assigned</span>
												)}
											</td>
											<td>{formatDate(service.dueDate)}</td>
											<td>
												{service.feedbackText ? (
													<div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
														{service.feedbackText}
													</div>
												) : (
													<span style={{ color: '#666', fontStyle: 'italic' }}>No feedback given</span>
												)}
											</td>
											<td>
												{service.hasRating ? (
													<div style={{ color: 'gold', fontWeight: 'bold' }}>
														{service.rating} <span style={{ color: 'gold' }}>★</span>
													</div>
												) : (
													<span style={{ color: '#666', fontStyle: 'italic' }}>Not rated</span>
												)}
											</td>
											<td>
												<span style={{ 
													fontWeight: 'bold',
													color: service.paymentAmount > 0 ? 'green' : 'orange'
												}}>
													{service.paymentAmount > 0 ? "Paid" : "Pending"}
												</span>
											</td>
											<td className='tax-btn-cont'>
												<button
													className='tax-service-btn'
													onClick={() => openModal(service)}>
													Query
												</button>

												{service.status === "completed" &&
													(!service.feedback ||
														service.feedback.length === 0) && (
														<button
															className='tax-service-btn'
															onClick={() => openFeedbackModal(service)}>
															Feedback
														</button>
													)}

												{service.status !== "completed" && (
													<button
														className='tax-service-btn'
														onClick={() => openUploadModal(service)}>
														Upload Documents
													</button>
												)}
											</td>
										</tr>
										<tr>
											<td colSpan='17' className='p-4'>
												<div className='w-full'>
													<h4 className='text-lg font-semibold mb-2'>
														Service Progress
													</h4>
													<ServiceProgress
														stages={stages}
														currentStage={getServiceStage(service)}
													/>
												</div>
											</td>
											<td>
												{service.documents && service.documents.length > 0 ? (
													<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
														<span>{service.documents.length} document(s)</span>
														<button
															className='tax-service-btn'
															onClick={() => openDocPreviewModal(service.documents)}
															style={{ padding: '2px 8px', fontSize: '12px' }}
														>
															View
														</button>
													</div>
												) : (
													<span style={{ color: '#666', fontStyle: 'italic' }}>No documents uploaded</span>
												)}
											</td>
										</tr>
									</React.Fragment>
								))
							) : (
								<tr>
									<td colSpan='18' className='text-center'>
										No services found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Use 'open' prop for MUI Dialog components */}
			{selectedService && (
				<>
					<QueryModal
						service={selectedService}
						onClose={closeModal}
						open={isModalOpen}
					/>
					
					<FeedbackModal
						service={selectedService}
						onClose={closeFeedbackModal}
						open={isFeedbackModalOpen}
					/>
				</>
			)}

			{isUploadModalOpen && selectedService && (
				<div className='cquerymodalwrap'>
					<div className='cquerymodal'>
						<h2>Upload Documents for {selectedService.serviceName}</h2>

						{selectedService.requiredDocuments?.length > 0 ? (
							selectedService.requiredDocuments.map((doc, index) => (
								<div key={index} className='document-upload-item'>
									{/* <label> */}
									<div>
										<h5>
											{doc.name} {doc.required && "*"}
										</h5>
										<br />
										<p>{doc.description}</p>
									</div>
									{/* </label> */}
									<input
										type='file'
										onChange={(e) => handleFileChange(doc.name, e)}
										accept='image/*,application/pdf'
									/>
								</div>
							))
						) : (
							<p>No required documents specified for this service.</p>
						)}

						{uploadProgress > 0 && uploadProgress < 100 && (
							<div className='upload-progress'>
								<div
									className='progress-bar'
									style={{ width: `${uploadProgress}%` }}
								/>
								<span>{uploadProgress}%</span>
							</div>
						)}

						{uploadError && <p className='error'>{uploadError}</p>}

						<div className='btnqcont'>
							<button
								className='cquerysubmit'
								onClick={handleUpload}
								disabled={!selectedService.requiredDocuments?.length}>
								Upload
							</button>
							<button className='cqueryclose' onClick={closeUploadModal}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Document Preview Modal */}
			{isDocPreviewModalOpen && (
				<div className='cquerymodalwrap'>
					<div className='cquerymodal'>
						<h2>Uploaded Documents</h2>
						
						{selectedDocuments.length > 0 ? (
							<div className='document-list'>
								{selectedDocuments.map((doc, index) => (
									<div key={index} className='document-item' style={{ 
										margin: '10px 0', 
										padding: '10px', 
										border: '1px solid #eee',
										borderRadius: '4px'
									}}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<span style={{ fontWeight: 'bold' }}>{doc.originalName}</span>
											<small>{new Date(doc.uploadedAt).toLocaleDateString()}</small>
										</div>
										<div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
											<span style={{ fontSize: '12px', color: '#666' }}>
												Size: {Math.round(doc.size / 1024)} KB
											</span>
											<span style={{ fontSize: '12px', color: '#666' }}>
												Type: {doc.mimetype}
											</span>
										</div>
										{doc.path && (
											<a 
												href={`https://195-35-45-82.sslip.io:8000${doc.path}`} 
												target="_blank" 
												rel="noopener noreferrer"
												style={{
													display: 'inline-block',
													marginTop: '8px',
													padding: '4px 12px',
													background: '#1b321d',
													color: 'white',
													borderRadius: '4px',
													textDecoration: 'none',
													fontSize: '12px'
												}}
											>
												View Document
											</a>
										)}
									</div>
								))}
							</div>
						) : (
							<p>No documents available.</p>
						)}
						
						<div className='btnqcont'>
							<button className='cqueryclose' onClick={closeDocPreviewModal}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CServiceStatus;
