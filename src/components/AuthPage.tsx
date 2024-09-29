import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAlert } from '@/hooks/useAlert';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import Image from 'next/image';
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    const { showAlert } = useAlert();

    const quote = getQuoteForDay();

    const handleShowInvalidCredentials = () => {
        setShowInvalidCredentials(true);
        setTimeout(() => {
            setShowInvalidCredentials(false);
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });
            if (result?.error) {
                if (result.error === 'CredentialsSignin') {
                    handleShowInvalidCredentials();
                    return;
                }
                showAlert(result.error, 'error');
            } else {
                showAlert('Welcome back!', 'welcome');
            }
        } else {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            if (response.ok) {
                showAlert('Account created successfully!', 'success');
                // Sign in the user after successful signup
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });
                if (result?.error) {
                    showAlert(result.error, 'error');
                } else {
                    showAlert('Welcome to ZenTodo!', 'welcome');
                }
            } else {
                const data = await response.json();
                showAlert(data.message || 'Failed to create account', 'error');
            }
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (response.ok) {
                showAlert(
                    'Password reset email sent. Please check your inbox.',
                    'success'
                );
                setIsPasswordReset(false);
            } else {
                const data = await response.json();
                showAlert(
                    data.message || 'Failed to send reset email',
                    'error'
                );
            }
        } catch (error) {
            showAlert('An error occurred. Please try again.', 'error');
        }
    };

    return (
        <div className="h-screen flex items-center justify-start bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-md w-4/12 h-full">
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-slate-100">
                        {isPasswordReset
                            ? 'Reset Password'
                            : isLogin
                            ? 'Log In'
                            : 'Sign Up'}
                    </h2>
                    <form
                        onSubmit={
                            isPasswordReset ? handlePasswordReset : handleSubmit
                        }
                        className="w-8/12"
                    >
                        {!isLogin && !isPasswordReset && (
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-slate-100"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border rounded-md bg-slate-200 text-slate-900 border-slate-900"
                                    required
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block mb-2 text-slate-100"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border rounded-md bg-slate-200 text-slate-900 border-slate-900"
                                required
                            />
                        </div>
                        {!isPasswordReset && (
                            <div className="mb-6">
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-slate-100"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full p-3 border rounded-md bg-slate-200 text-slate-900 border-slate-900"
                                    required
                                />
                            </div>
                        )}
                        {showInvalidCredentials && isLogin && (
                            <div
                                id="error-message"
                                className="text-red-500 text-center mb-4"
                            >
                                Invalid email or password - try again.
                            </div>
                        )}
                        {!isPasswordReset && (
                            <div className="mb-4 text-right">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordReset(true)}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                        >
                            {isPasswordReset
                                ? 'Reset Password'
                                : isLogin
                                ? 'Log In'
                                : 'Sign Up'}
                        </button>
                    </form>
                    {!isPasswordReset && (
                        <p className="mt-4 text-center text-slate-100">
                            {isLogin
                                ? "Don't have an account?"
                                : 'Already have an account?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-blue-600 hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    )}
                    {isPasswordReset && (
                        <button
                            onClick={() => setIsPasswordReset(false)}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            </div>
            <div className="p-3 w-8/12 h-full flex flex-col items-center justify-center">
                <Image
                    src="/images/ZenTodo_Log_slate900.webp"
                    alt="ZenTodo Logo"
                    width={600}
                    height={200}
                    className="mb-10"
                    priority={true}
                />
                <p className="mt-2 text-md text-neutral-content italic max-w-md text-center">
                    {quote}
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
