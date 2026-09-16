import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isLoggedIn } from './authSession';

export const VisitorAuthGate: React.FC = () => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};

export default VisitorAuthGate;
