import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { WebviewTag } from 'electron';
import Icon from './Icons';
import { logEvent } from '@/utility/logger';

// Webview component
const WebviewComponent: React.FC<{ headerText: string; url: string }> = ({ headerText, url }) => {
    const webviewRef = useRef<WebviewTag | null>(null); // Cast to Electron's WebviewTag type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorTitle, setErrorTitle] = useState<string | null>(null);

    useEffect(() => {
        const webview = webviewRef.current;

        if (!webview) {
            logEvent(`error`,'Webview reference is null.');
            return;
        }

        const handleStartLoading = () => {
            logEvent(`info`,`Webview for ${headerText} started loading.`);
            setError(null);
            setLoading(true);
        };

        const handleStopLoading = () => {
            logEvent(`info`,`Webview for ${headerText} finished loading.`);
            setLoading(false);

            // Use executeJavaScript safely
            webview.executeJavaScript('document.body.innerHTML')
                .then((htmlContent) => {
                    if (!htmlContent.trim()) {
                        setErrorTitle('TimedOut');
                        setError(`${headerText} loaded but is empty from source: ${url}`);
                        logEvent(`error`,`${headerText} loaded but is empty from source: ${url}`);
                    }
                })
                .catch((err) => {
                    logEvent(`error`,`Error while checking webview content: ${err.message}`);
                });
        };

        const handleFailLoad = (event: any) => {
            const { errorCode, errorDescription } = event;
            logEvent(`error`,`Webview failed to load. Error Code: ${errorCode}, Description: ${errorDescription}`);
            setError(`Failed to load content. Error: ${errorDescription}`);
            setLoading(false);
        };

        // Add event listeners
        webview.addEventListener('did-start-loading', handleStartLoading);
        webview.addEventListener('did-stop-loading', handleStopLoading);
        webview.addEventListener('did-fail-load', handleFailLoad);

        // Cleanup event listeners on unmount
        return () => {
            webview.removeEventListener('did-start-loading', handleStartLoading);
            webview.removeEventListener('did-stop-loading', handleStopLoading);
            webview.removeEventListener('did-fail-load', handleFailLoad);
        };
    }, [url]);

    return (
        <Box sx={{ height: '900px', position: 'relative' }}>
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1,
                        backgroundImage: "url(../assets/images/error_red_card.gif)",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center 300px",
                        backgroundSize: "100px"
                    }}
                >
                    <Box sx={{
                        display:"flex",
                        flexDirection: "column",
                        width: "527px",
                        textAlign: "center",
                        alignItems: "center",
                        }}>
                        {errorTitle && 
                            <h4>{errorTitle}</h4>
                        }    
                        {error}
                    </Box>
                </Box>
            )}

            <Box sx={{ height: '900px' }}>
                <webview
                    id="velocityWebView"
                    ref={webviewRef as React.RefObject<WebviewTag>} // Use Electron's WebviewTag type
                    src={url}
                    style={{ width: '100%', height: 'calc(100% - 50px)', border: 'none' }}
                />
            </Box>
        </Box>
    );
};

export default WebviewComponent;
