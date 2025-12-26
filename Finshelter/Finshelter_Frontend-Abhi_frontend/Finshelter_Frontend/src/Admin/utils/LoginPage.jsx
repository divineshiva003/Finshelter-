import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboardContext } from "../AdminDashboardContext";

import ClipLoader from "react-spinners/ClipLoader";
import { useNotification } from "../../NotificationContext";

const LoginPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useContext(AdminDashboardContext); // Removed loading from context
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { showNotification } = useNotification();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); // Start loading
		const success = await login(email, password);

		if (success) {
			showNotification(
				"Login successful! Redirecting to dashboard...",
				"success"
			);
			setTimeout(() => {
				setLoading(false); // Stop loading after redirect
				navigate("/admin/dashboard");
			}, 2000);
		} else {
			showNotification("Login failed. Please check your credentials.", "error");
			setLoading(false); // Stop loading on failure
		}
	};

	return (
		<div className='tax-admin-login'>
			<div
				style={{
					position: "relative",
					width: "300px",
					margin: "auto",
					padding: "20px",
				}}>
				<h1>Admin Login</h1>
				<form onSubmit={handleSubmit}>
					<div>
						<label>Email:</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div style={{ position: "relative" }}>
						<label>Password:</label>
						<input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<i
							className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
							style={{
								position: "absolute",
								right: "-10px",
								top: "60px",
								cursor: "pointer",
							}}
							onClick={() => setShowPassword((prev) => !prev)}></i>
					</div>
					<button type='submit' disabled={loading}>
						Login
					</button>
				</form>
				{loading && (
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							background: "rgba(0,0,0,0.5)",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}>
						<ClipLoader size={50} color='#ffffff' />
					</div>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
