import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdvanceAI from './components/AdvanceAI';
import BuildTheOrganization from './components/BuildTheOrganization';
import CreateAndMaintainAnalytics from './components/CreateAndMaintainAnalytics';
import CreateTheStrategy from './components/CreateTheStrategy';
import GovernData from './components/GovernData';
import IntegrateAndManageData from './components/IntegrateAndManageData';
import ManagerDandA from './components/ManagerDandA';
import ManageTheFunction from './components/ManageTheFunction'; 
import Login from './components/Login';
import Register from './components/Register';
import './App.css';


const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<AdvanceAI />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/build-the-organization" element={<BuildTheOrganization />} />
            <Route path="/create-and-maintain-analytics" element={<CreateAndMaintainAnalytics />} />
            <Route path="/create-the-strategy" element={<CreateTheStrategy />} />
            <Route path="/govern-data" element={<GovernData />} />
            <Route path="/integrate-and-manage-data" element={<IntegrateAndManageData />} />
            <Route path="/manage-d-a" element={<ManagerDandA />} />
            <Route path="/manage-the-function" element={<ManageTheFunction />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
