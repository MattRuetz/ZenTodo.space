import React, { useCallback, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMediaQuery } from 'react-responsive';

type AlertType = 'error' | 'notice' | 'success' | 'welcome';

// Create a context for the mobile alert
const MobileAlertContext = React.createContext<{
    showMobileAlert: (message: string, type: AlertType) => void;
}>({
    showMobileAlert: () => {},
});

// Define the props for the MobileAlertProvider
interface MobileAlertProviderProps {
    children: React.ReactNode; // Define children as ReactNode
}

export const MobileAlertProvider: React.FC<MobileAlertProviderProps> = ({
    children,
}) => {
    const [alert, setAlert] = React.useState<{
        message: string;
        type: AlertType;
    } | null>(null);

    const showMobileAlert = useCallback((message: string, type: AlertType) => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); // Hide after 3 seconds
    }, []);

    return (
        <MobileAlertContext.Provider value={{ showMobileAlert }}>
            {children}
            {alert && (
                <div className={`mobile-alert mobile-alert-${alert.type}`}>
                    {alert.message}
                </div>
            )}
        </MobileAlertContext.Provider>
    );
};

export const useAlert = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const { showMobileAlert } = useContext(MobileAlertContext);

    const showAlert = useCallback(
        (
            message: string,
            type: AlertType = 'notice',
            duration: number = 2000
        ) => {
            if (isMobile) {
                showMobileAlert(message, type);
            } else {
                // Existing toast logic for desktop
                const toastConfig = {
                    position: 'top-center' as const,
                    autoClose: duration,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                };

                const styles = {
                    error: {
                        border: '2px solid',
                        backgroundColor: '#fef2f2',
                        borderColor: `#b91c1c`,
                        color: `#b91c1c`,
                    },
                    notice: {
                        border: '2px solid',
                        backgroundColor: '#fff7ed',
                        borderColor: `#b91c1c`,
                        color: `#b91c1c`,
                    },
                    success: {
                        border: '2px solid',
                        backgroundColor: '#f0fdf4',
                        borderColor: `#16a34a`,
                        color: `#16a34a`,
                    },
                    welcome: {
                        border: '2px solid',
                        backgroundColor: '#f0fdf4',
                        borderColor: `#0ea5e9`,
                        color: `#0ea5e9`,
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
            }
        },
        [isMobile, showMobileAlert]
    );

    const AlertComponent: React.ComponentType = isMobile
        ? React.Fragment
        : ToastContainer;

    return { showAlert, AlertComponent };
};
