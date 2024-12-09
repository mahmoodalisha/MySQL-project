import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  
  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email: email,
      });
      if (response.status === 200) {
        
        navigate("/login"); 
      }
    } catch (error) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingLeft: "20px" }}>
  <input
    type="text"
    placeholder="First Name"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    required
    style={{
      width: "300px", 
      padding: "10px", 
      margin: "10px 0", 
      borderRadius: "8px", 
      border: "1px solid #ccc", 
      fontSize: "16px", 
      outline: "none", 
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", 
    }}
  />
  <input
    type="text"
    placeholder="Last Name"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    required
    style={{
      width: "300px",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }}
  />
  <input
    type="text"
    placeholder="Phone Number"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    required
    style={{
      width: "300px",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }}
  />
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    style={{
      width: "300px",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }}
  />
</div>


      <button onClick={handleRegister}>Send Verification Code</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
