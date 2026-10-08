import React from 'react';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { RecoverAccountForm } from '../components/auth/RecoverAccountForm.js';

export const RecoverAccountPage: React.FC = () => {
  return (
    <CenteredAuthLayout maxWidth="500px">
      <RecoverAccountForm />
    </CenteredAuthLayout>
  );
};
