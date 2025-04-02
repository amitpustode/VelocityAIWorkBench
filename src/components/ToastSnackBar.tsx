import { Alert, Snackbar } from '@mui/material';
import React, { useState, useCallback } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

interface ToastProps {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
    open: boolean;
    onClose: () => void;
    autoHideDuration?: number;
}

export const useToast = () => {
    const [toastOpen, setToastOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastSeverity, setToastSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('success');

    const showToast = useCallback(
        (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
            setToastMessage(message);
            setToastSeverity(severity);
            setToastOpen(true);
        },
        []
    );

    const hideToast = useCallback(() => {
        setToastOpen(false);
    }, []);

    // Define icons based on severity
    const severityIcons: Record<string, React.ReactNode> = {
        success: <CheckIcon fontSize="inherit" />,
        error: <ErrorIcon fontSize="inherit" />,
        warning: <WarningIcon fontSize="inherit" />,
        info: <InfoIcon fontSize="inherit" />,
    };

    // ToastSnackbar component now uses state from the hook
    const ToastSnackbar: React.FC<{ autoHideDuration?: number }> = ({ autoHideDuration = 5000 }) => {
        return (
            <Snackbar
                open={toastOpen}
                autoHideDuration={autoHideDuration}
                onClose={hideToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    icon={severityIcons[toastSeverity]}
                    onClose={hideToast}
                    sx={{ width: '100%', boxShadow:"0px 4px 6px rgba(0, 0, 0, 0.15)" }}
                    severity={toastSeverity}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        );
    };

    return { ToastSnackbar, showToast, hideToast };
};
