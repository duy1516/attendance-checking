import { Button } from '@/components/ui/button';
import React from 'react';

export const SignupButton = () => {
  return (
    <Button
      variant="default"
      className="px-4 py-2 rounded-xl disabled:opacity-50"
    >
      Sign Up
    </Button>
  );
};