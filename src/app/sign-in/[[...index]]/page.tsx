// src/app/sign-in/[[...index]]/page.tsx
import Preloader from '@/components/Preloader/Preloader';
import { useSignIn } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

// Dynamic import allows for lazy loading of the Space component
const AuthPage = dynamic(() => import('@/components/AuthPage'), {
    loading: () => <Preloader />,
});

export default function SignInPage() {
    const { isLoaded } = useSignIn();

    if (!isLoaded) {
        return <Preloader />;
    }

    return <AuthPage action="sign-in" />;
}
