'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileCompletionWizard from './ProfileCompletionWizard';

export default function ProfileModalGlobal() {
  const { isProfileModalOpen, closeProfileModal, user } = useAuth();

  return (
    <ProfileCompletionWizard
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      initialRole={user?.userType || 'student'}
    />
  );
}
