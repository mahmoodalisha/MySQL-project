import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]); 
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const handleSendVerificationCode = async () => {
    try {
        const response = await axios.post("http://localhost:5000/login", { email });
        const { token, previewUrl } = response.data;

        if (token) {
            localStorage.setItem('token', token); 
        }

        if (previewUrl) {
            setIsCodeSent(true);
        }
    } catch (error) {
        setError("Failed to send verification code. Please try again.");
    }
};


  const handleCodeChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      
      if (value !== "" && index < 3) {
        document.getElementById(`code-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmitCode = async () => {
    const code = verificationCode.join(""); 
    console.log("Entered Verification Code: ", code);
    alert("Login successful!");
    navigate("/");
  };

  return (
    <div>
      <h2>Login</h2>
      <input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  style={{
    width: "300px",         
    height: "40px",         
    fontSize: "16px",       
    padding: "0 10px",      
    border: "1px solid #ccc", 
    borderRadius: "8px",    
    outline: "none",        
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", 
  }}
/>

      <button onClick={handleSendVerificationCode}>Send Verification Code</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isCodeSent && (
        <div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0" }}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                value={digit}
                maxLength={1}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
                    document.getElementById(`code-input-${index - 1}`).focus();
                  }
                }}
                style={{
                  width: "50px",
                  height: "50px",
                  fontSize: "20px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  outline: "none",
                }}
              />
            ))}
          </div>
          <button onClick={handleSubmitCode}>Submit Code</button>
        </div>
      )}
    </div>
  );
};

export default Login;
