
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | DSA Tracker',
  description: 'Create an account to start tracking your DSA progress.',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}
