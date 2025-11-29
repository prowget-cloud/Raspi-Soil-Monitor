import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkClass = "bg-agri-green-dark text-white";
  const inactiveLinkClass = "text-gray-200 hover:bg-agri-green-dark hover:text-white";

  return (
    <header className="bg-agri-green shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 16.707a1 1 0 01-1.414 0l-1.06-1.061a1 1 0 010-1.414l1.06-1.061a1 1 0 011.414 0l1.061 1.06a1 1 0 010 1.414l-1.061 1.06zM16.293 16.707a1 1 0 01-1.414 0l-1.06-1.061a1 1 0 010-1.414l1.06-1.061a1 1 0 011.414 0l1.061 1.06a1 1 0 010 1.414l-1.061 1.06z" />
              </svg>
              <span className="text-white text-xl font-bold">Smart Agri Monitoring</span>
            </NavLink>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Public Monitoring
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Admin Dashboard
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;