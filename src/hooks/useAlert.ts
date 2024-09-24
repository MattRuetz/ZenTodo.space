import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './useTheme';

type AlertType = 'error' | 'notice' | 'success' | 'welcome';

export const useAlert = () => {
    const theme = useTheme();

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
                backgroundColor: `var(--${theme}-accent-red-low-opacity)`,
                borderColor: `var(--${theme}-accent-red)`,
                color: `var(--${theme}-text-default)`,
            },
            notice: {
                border: '2px solid',
                backgroundColor: `var(--${theme}-accent-grey-low-opacity)`,
                borderColor: `var(--${theme}-accent-grey)`,
                color: `var(--${theme}-text-default)`,
            },
            success: {
                border: '2px solid',
                backgroundColor: `var(--${theme}-accent-green-low-opacity)`,
                borderColor: `var(--${theme}-accent-green)`,
                color: `var(--${theme}-text-default)`,
            },
            welcome: {
                border: '2px solid',
                backgroundColor: `var(--${theme}-accent-blue-low-opacity)`,
                borderColor: `var(--${theme}-accent-blue)`,
                color: `var(--${theme}-text-default)`,
            },
        };

        const toastFunction = {
            error: toast.error,
            notice: toast.info,
            success: toast.success,
            welcome: toast.success,
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
