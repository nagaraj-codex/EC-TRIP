import React from 'react';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { AuthSuccess } from '../components/auth/AuthSuccess.js';

export const ResetSuccessPage: React.FC = () => {
  return (
    <CenteredAuthLayout maxWidth="500px">
      <AuthSuccess
        title="Password changed"
        message="Your password has been changed successfully. You can now log in with your new password."
        buttonText="Continue to Login"
      />
    </CenteredAuthLayout>
  );
};
