import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';  
import '../styles/Navbar.css';
import { CgMenuRightAlt } from "react-icons/cg";

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="navbar-header">
        <img 
          src="https://www.indusnet.co.in/site/wp-content/themes/indusnetblog/assets/images/logo-inverse.svg" 
          alt="Logo" 
          className="navbar-logo" 
        />
        <button className="toggle-button" onClick={toggleNavbar}>
          <CgMenuRightAlt 
            size={24}
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s ease", 
            }}
          />
        </button>
        <p>Survey Form</p>
      </div>
      <ul>
        <li>
          <NavLink to="/" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/028/856/888/small_2x/lightning-bolt-3d-rendering-icon-illustration-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Advance AI Maturity
          </NavLink>
        </li>

        <li>
          <NavLink to="/build-the-organization" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/041/502/136/non_2x/golden-glitter-gear-settings-icon-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Build The Organization
          </NavLink>
        </li>

        <li>
          <NavLink to="/create-and-maintain-analytics" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/046/824/348/non_2x/multicolored-pie-chart-symbol-isolated-on-transparent-background-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Create And Maintain Analytics Content
          </NavLink>
        </li>

        <li>
          <NavLink to="/create-the-strategy" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/012/562/554/non_2x/bar-chart-infographic-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Create The Strategy and Operating Model
          </NavLink>
        </li>

        <li>
          <NavLink to="/govern-data" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/009/876/398/non_2x/realistic-magnifying-glass-clip-art-free-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Govern Data And Analytics Assets
          </NavLink>
        </li>

        <li>
          <NavLink to="/integrate-and-manage-data" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/046/824/576/non_2x/success-bar-chart-symbol-isolated-on-transparent-background-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Integrate And Manage Data
          </NavLink>
        </li>

        <li>
          <NavLink to="/manage-d-a" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/049/950/183/non_2x/colorful-bar-graph-showing-data-growth-over-time-cut-out-transparent-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Manager D&A Value and outcomes
          </NavLink>
        </li>

        <li>
          <NavLink to="/manage-the-function" activeClassName="active">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/009/338/770/non_2x/3d-icon-dart-board-with-arrow-for-business-target-png.png" 
              alt="Icon" 
              className="navbar-icon" 
            />
            Manage The Function
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
