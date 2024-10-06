import React, { useState } from 'react';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import Image from 'next/image';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';

const AuthPage = () => {
    const isMobileSize = useIsMobileSize();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showInvalidCredentials] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    const quote = getQuoteForDay();

    return (
        <>
            {/* {isMobileSize ? (
                <div className="min-h-screen flex flex-col bg-black">
                    <div className="p-6 flex flex-col items-center justify-center w-11/12 mx-auto">
                        <Image
                            src="/images/ZenTodo_Log_white.webp"
                            alt="ZenTodo Logo"
                            width={300}
                            height={83}
                            className="mb-4"
                            priority={true}
                        />
                        <p className="text-sm text-neutral-content italic text-center mb-6">
                            {quote}
                        </p>
                    </div>
                    <div className="flex-grow bg-gradient-to-b from-slate-900 to-slate-700 p-6 rounded-t-3xl shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-center text-slate-100">
                            {isPasswordReset
                                ? 'Reset Password'
                                : isLogin
                                ? 'Log In'
                                : 'Sign Up'}
                        </h2>
                        <form
                            onSubmit={
                                isPasswordReset
                                    ? handlePasswordReset
                                    : handleSubmit
                            }
                            className="w-full"
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
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
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
                                        className="text-blue-400 hover:underline text-sm"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
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
                                    className="ml-2 text-blue-400 hover:underline"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        )}
                        {isPasswordReset && (
                            <button
                                onClick={() => setIsPasswordReset(false)}
                                className="mt-4 text-blue-400 hover:underline block mx-auto"
                            >
                                Back to Login
                            </button>
                        )}
                    </div>
                </div>
            ) : (
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
                                    isPasswordReset
                                        ? handlePasswordReset
                                        : handleSubmit
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
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
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
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
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
                                            onClick={() =>
                                                setIsPasswordReset(true)
                                            }
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
            )} */}
            AuthPage
        </>
    );
};

export default AuthPage;
