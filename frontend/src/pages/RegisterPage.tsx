import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterModal } from '../components/auth/RegisterModal.js';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <CenteredAuthLayout maxWidth="432px">
      <RegisterModal isOpen={isOpen} onClose={handleClose} />
    </CenteredAuthLayout>
  );
};
