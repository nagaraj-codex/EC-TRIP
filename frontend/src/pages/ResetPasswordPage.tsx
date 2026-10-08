import React from 'react';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm.js';

export const ResetPasswordPage: React.FC = () => {
  return (
    <CenteredAuthLayout maxWidth="500px">
      <ResetPasswordForm />
    </CenteredAuthLayout>
  );
};
