// src/app/sign-up/[[...index]]/page.tsx
import Preloader from '@/components/Preloader/Preloader';
import { useSignUp } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

// Dynamic import allows for lazy loading of the Space component
const AuthPage = dynamic(() => import('@/components/AuthPage'), {
    loading: () => <Preloader />,
});

export default function SignUpPage() {
    const { isLoaded } = useSignUp();

    if (!isLoaded) {
        return <Preloader />;
    }

    return <AuthPage action="sign-up" />;
}
