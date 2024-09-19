import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type AlertType = 'error' | 'notice' | 'success';

export const useAlert = () => {
    const showAlert = (
        message: string,
        type: AlertType = 'notice',
        duration: number = 2000
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
                border: '2px solid',
                backgroundColor: '#721c2433',
                borderColor: '#721c24',
                color: 'white',
            },
            notice: {
                border: '2px solid',
                backgroundColor: '#383d4133',
                borderColor: '#383d41',
                color: 'white',
            },
            success: {
                border: '2px solid',
                backgroundColor: '#15572433',
                borderColor: '#155724',
                color: 'white',
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
                fontSize: '14px',
            },
        });
    };

    const AlertComponent: React.ComponentType = ToastContainer;

    return { showAlert, AlertComponent };
};
