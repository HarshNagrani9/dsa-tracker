
import { SignInForm } from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | DSA Tracker',
  description: 'Sign in to your DSA Tracker account.',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <SignInForm />
    </div>
  );
}
