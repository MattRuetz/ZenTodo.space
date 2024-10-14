import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';

export const ToastContainer: React.FC = () => {
    return (
        <ReactToastifyContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
};
