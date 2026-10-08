import React from 'react';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm.js';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <CenteredAuthLayout maxWidth="500px">
      <ForgotPasswordForm />
    </CenteredAuthLayout>
  );
};
