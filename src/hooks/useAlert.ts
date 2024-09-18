import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type AlertType = 'error' | 'notice' | 'success';

export const useAlert = () => {
    const showAlert = (
        message: string,
        type: AlertType = 'notice',
        duration: number = 3000
    ) => {
        const toastConfig = {
            position: 'top-center' as const,
            autoClose: duration,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        };

        const styles = {
            error: {
                backgroundColor: '#f8d7da',
                color: '#721c24',
            },
            notice: {
                backgroundColor: '#e2e3e5',
                color: '#383d41',
            },
            success: {
                backgroundColor: '#d4edda',
                color: '#155724',
            },
        };

        const toastFunction = {
            error: toast.error,
            notice: toast.info,
            success: toast.success,
        };

        toastFunction[type](message, {
            ...toastConfig,
            style: {
                ...styles[type],
                padding: '10px 20px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            },
        });
    };

    const AlertComponent: React.ComponentType = ToastContainer;

    return { showAlert, AlertComponent };
};
