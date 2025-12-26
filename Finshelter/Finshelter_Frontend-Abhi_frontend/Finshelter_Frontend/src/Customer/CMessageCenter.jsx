import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useCustomerAuth } from "./CustomerAuthContext";

const CustomerMessageCenter = () => {
	const { user, services, serviceMap, messages, setMessages, fetchMessages } =
		useCustomerAuth();
	const [selectedService, setSelectedService] = useState("");
	const [query, setQuery] = useState("");
	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [allServiceMessages, setAllServiceMessages] = useState({});

	// Group messages by serviceId
	useEffect(() => {
		const groupedMessages = messages.reduce((acc, message) => {
			const serviceId = message.service;
			if (!acc[serviceId]) {
				acc[serviceId] = [];
			}
			acc[serviceId].push(message);
			return acc;
		}, {});
		setAllServiceMessages(groupedMessages);
	}, [messages]);

	// Helper functions
	const formatDate = (date) => {
		const options = { day: "2-digit", month: "short", year: "numeric" };
		return new Date(date)
			.toLocaleDateString("en-GB", options)
			.replace(/ /g, " ")
			.replace(",", "");
	};

	const getServiceMessages = (serviceId) => {
		return allServiceMessages[serviceId] || [];
	};

	const getLatestMessage = (serviceId) => {
		const serviceMessages = allServiceMessages[serviceId] || [];
		return serviceMessages.length > 0 ? serviceMessages[0] : null;
	};

	const getUnreadCount = (serviceId) => {
		const serviceMessages = allServiceMessages[serviceId] || [];
		return serviceMessages.filter((message) => message.replyContent?.length)
			.length;
	};

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		setFiles(selectedFiles);
		setPreviews([]);

		selectedFiles.forEach((file) => {
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreviews((prev) => [
						...prev,
						{ url: reader.result, name: file.name },
					]);
				};
				reader.readAsDataURL(file);
			} else {
				setPreviews((prev) => [...prev, { name: file.name }]);
			}
		});
	};

	const sendMessage = async () => {
		if (!selectedService || !query) {
			alert("Please select a service and type your message.");
			return;
		}

		const selectedServiceObj = services.find(
			(service) => service.serviceName === selectedService
		);

		if (!selectedServiceObj) {
			alert("Invalid service selected");
			return;
		}

		const formData = new FormData();
		formData.append("sender", user?.name || "Customer");
		formData.append("recipientId", "admin");
		formData.append("content", query);
		formData.append("service", selectedService);
		formData.append("orderId", selectedServiceObj.orderId);

		files.forEach((file) => {
			formData.append("files", file);
		});

		try {
			const token = localStorage.getItem("customerToken");
			const response = await axios.post(
				"https://195-35-45-82.sslip.io:8000/api/messages/send",
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (!response.data) {
				throw new Error("No response data received");
			}

			setQuery("");
			setFiles([]);
			setPreviews([]);
			fetchMessages();
		} catch (err) {
			console.error("Error sending message:", err);
			alert(err.response?.data?.message || "Failed to send message.");
		}
	};

	const getFileUrl = (fileUrl) => {
		if (!fileUrl) return null;
		return fileUrl.startsWith("http")
			? fileUrl
			: `https://195-35-45-82.sslip.io:8000${fileUrl}`;
	};

	return (
		<div className='admin-chat-container' style={{ paddingTop: "40px" }}>
			{/* WhatsApp-style Sidebar */}
			<div className='chat-sidebar'>
				<div className='sidebar-header'>
					<h3>Services</h3>
					<div className='search-box'>
						<input
							type='text'
							placeholder='Search services...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
				<div className='service-list'>
					{services
						.filter((service) =>
							service.serviceName
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						)
						.map((service) => {
							const latestMessage = getLatestMessage(service.serviceName);
							const unreadCount = getUnreadCount(service.serviceName);
							return (
								<div
									key={service._id}
									className={`order-item ${
										selectedService === service.serviceName ? "selected" : ""
									}`}
									onClick={() => setSelectedService(service.serviceName)}>
									<div className='order-avatar'>
										{service.serviceName.charAt(0).toUpperCase()}
									</div>
									<div className='order-info'>
										<div className='order-header'>
											<span className='order-name'>
												{serviceMap[service.orderId] || service.serviceName}
											</span>
											<span className='message-time'>
												{latestMessage && formatDate(latestMessage.createdAt)}
											</span>
										</div>
										<div className='message-preview'>
											<span>
												{latestMessage
													? latestMessage.content.slice(0, 30) +
													  (latestMessage.content.length > 30 ? "..." : "")
													: "No messages yet"}
											</span>
											{unreadCount > 0 && (
												<span className='unread-count'>{unreadCount}</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
				</div>
			</div>

			{/* Main Chat Area */}
			<div className='main-chat-area'>
				{selectedService ? (
					<>
						<div className='chat-header'>
							<div className='order-info'>
								<div className='order-avatar'>
									{selectedService.charAt(0).toUpperCase()}
								</div>
								<div className='service-details'>
									<span className='service-name'>
										{serviceMap[selectedService] || selectedService}
									</span>
								</div>
							</div>
						</div>

						<ul className='message-list'>
							{getServiceMessages(selectedService).map((msg) => (
								<li key={msg._id} className='message-item'>
									<div className='initial-message'>
										<div className='message-info'>
											<span>
												<strong>{msg.sender?._id || "You"}</strong> to{" "}
												<strong>Support Team</strong>
											</span>
											<small className='message-timestamp'>
												{formatDate(msg.createdAt)}
											</small>
										</div>
										<p className='message-content'>{msg.content}</p>
										{msg.files?.map((file, idx) => (
											<div key={idx} className='message-file'>
												{file.fileType?.startsWith("image/") ? (
													<img
														src={getFileUrl(file.fileUrl)}
														alt={file.fileName}
														className='message-image'
														onError={(e) => {
															e.target.src =
																"https://via.placeholder.com/150?text=Image+Error";
														}}
													/>
												) : (
													<a
														href={getFileUrl(file.fileUrl)}
														target='_blank'
														rel='noopener noreferrer'
														className='file-link'>
														{file.fileName}
													</a>
												)}
											</div>
										))}
									</div>

									<div className='replies-container'>
										{Array.isArray(msg.replyContent) &&
											msg.replyContent.map((reply, replyIdx) => (
												<div key={replyIdx} className='reply-item'>
													<div className='reply-info'>
														<span>
															<strong>
																{reply.repliedBy || "Support Team"}
															</strong>
														</span>
														<small className='message-timestamp'>
															{formatDate(reply.createdAt)}
														</small>
													</div>
													<p className='reply-content'>{reply.content}</p>
													{reply.files?.map((file, fileIdx) => (
														<div key={fileIdx} className='reply-file'>
															{file.fileType?.startsWith("image/") ? (
																<img
																	src={getFileUrl(file.fileUrl)}
																	alt={file.fileName}
																	className='reply-image'
																	onError={(e) => {
																		e.target.src =
																			"https://via.placeholder.com/150?text=Image+Error";
																	}}
																/>
															) : (
																<a
																	href={getFileUrl(file.fileUrl)}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='reply-file-link'>
																	{file.fileName}
																</a>
															)}
														</div>
													))}
												</div>
											))}
									</div>
								</li>
							))}
						</ul>

						<div className='message-input-container'>
							{previews.length > 0 && (
								<div className='preview-container'>
									{previews.map((preview, idx) => (
										<div key={idx} className='preview-item'>
											{preview.url ? (
												<img
													src={preview.url}
													alt={`Preview ${idx + 1}`}
													className='preview-image'
												/>
											) : (
												<div className='file-preview'>{preview.name}</div>
											)}
										</div>
									))}
								</div>
							)}

							<div
								className='input-actions'
								style={{ display: "flex", width: "100%" }}>
								<textarea
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder='Type your message here...'
									className='message-textarea'
								/>
								<div
									className='action-buttons'
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
									}}>
									<div className='attachment-container'>
										<label htmlFor='file-upload' className='attachment-icon'>
											📎
										</label>
										<input
											id='file-upload'
											type='file'
											multiple
											onChange={handleFileChange}
											className='hidden-file-input'
											accept='image/*,application/pdf'
											style={{ display: "none" }}
										/>
									</div>
									<button onClick={sendMessage} className='reply-button'>
										➤
									</button>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className='no-chat-selected'>
						<p>Select a service to view messages</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default CustomerMessageCenter;
