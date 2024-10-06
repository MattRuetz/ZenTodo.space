'use client';

import { SignUp } from '@clerk/nextjs';
import { useSignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    const { isLoaded } = useSignUp();

    if (!isLoaded) {
        return null;
    }

    return (
        <>
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </>
    );
}
