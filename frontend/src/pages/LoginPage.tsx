import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { LoginForm } from '../components/auth/LoginForm.js';
import { RegisterModal } from '../components/auth/RegisterModal.js';

export const LoginPage: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      <AuthLayout
        bottomContent={
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: 600 }}>Create a Page</span> for a celebrity, brand or business.
          </p>
        }
      >
        <LoginForm onOpenRegisterModal={() => setIsRegisterOpen(true)} />
      </AuthLayout>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
};
