// src/components/SignUpForm.tsx
import React, { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import Draggable from 'react-draggable';
import TaskCardTopBar from './TaskCardTopBar';

interface SignUpFormProps {
    position: { x: number; y: number };
    onClose: () => void;
    onDrag: (newPosition: { x: number; y: number }) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
    position,
    onClose,
    onDrag,
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            // Login
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });
            if (result?.error) {
                alert(result.error);
            } else {
                onClose();
            }
        } else {
            // Sign up
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                // Automatically log in after successful registration
                await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });
                onClose();
            } else {
                alert(data.message || 'An error occurred');
            }
        }
    };

    const handleDrag = (e: any, data: any) => {
        onDrag({ x: data.x, y: data.y });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only stop propagation if the click is on the form background, not on input fields
        if (e.target === formRef.current) {
            e.stopPropagation();
        }
    };

    return (
        <Draggable
            position={position}
            onDrag={handleDrag}
            bounds="parent"
            handle=".drag-handle"
        >
            <div
                ref={formRef}
                className="absolute w-64 bg-base-300 rounded shadow"
                onMouseDown={handleMouseDown}
            >
                /{' '}
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered w-full"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input input-bordered w-full"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            {isLogin ? 'Log In' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="btn btn-link w-full"
                        >
                            {isLogin
                                ? 'Need an account? Sign Up'
                                : 'Already have an account? Log In'}
                        </button>
                    </form>
                </div>
            </div>
        </Draggable>
    );
};

export default SignUpForm;
