import { CircularProgress, IconButton, Menu, MenuItem } from "@material-ui/core";
import { MoreVert, CloudDownload, ReadMoreRounded, PlayArrowRounded, PauseRounded } from '@mui/icons-material';
import React, { useRef, useEffect, useState } from "react";

const LS_NAME = 'audioMessageRate';

const AudioModal = ({url}) => {
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [transcription, setTranscription] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const audioElement = audioRef.current;

        const updateProgress = () => {
            const progressPercent = (audioElement.currentTime / duration) * 100;
            setProgress(progressPercent);
            setCurrentTime(audioElement.currentTime);
        };

        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('loadedmetadata', () => {
            setDuration(audioElement.duration);
        });

        audioElement.onplay = () => setIsPlaying(true);
        audioElement.onpause = () => setIsPlaying(false);

        return () => {
            audioElement.removeEventListener('timeupdate', updateProgress);
        };
    }, [duration]);

    useEffect(() => {
        audioRef.current.playbackRate = audioRate;
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    useEffect(() => {
        const progressBar = progressRef.current;

        const handleDragStart = (e) => {
            if (isPlaying) {
                e.preventDefault();
            }
        };

        progressBar.addEventListener('dragstart', handleDragStart);

        return () => {
            progressBar.removeEventListener('dragstart', handleDragStart);
        };
    }, [isPlaying]);

    const togglePlay = () => {
        const audioElement = audioRef.current;
        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
    };

    const handleSeek = (e) => {
        if (isDragging) {
            const progressBar = progressRef.current;
            const percent = ((e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth);
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setProgress(percent * 100);
        }
    };

    const toggleRate = () => {
        let newRate = null;

        switch (audioRate) {
            case 1:
                newRate = 1.5;
                break;
            case 1.5:
                newRate = 2;
                break;
            case 2:
                newRate = 1;
                break;
            default:
                newRate = 1;
                break;
        }

        setAudioRate(newRate);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getAudioSource = () => {
        let sourceUrl = url;

        if (isIOS) {
            sourceUrl = sourceUrl.replace(".ogg", ".mp3");
        }

        return (
            <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />
        );
    };

    const handleDownload = async () => {
        let audioUrl = url;

        if (audioUrl) {
            setIsDownloading(true);
            try {
                const response = await fetch(audioUrl);

                if (!response.ok) {
                    throw new Error('Falha ao baixar o áudio');
                }

                const audioBlob = await response.blob();

                const formData = new FormData();
                formData.append('audio', audioBlob, 'audio.mpeg');

                const conversionResponse = await fetch('https://tcr.elevafoco.com.br/converter', {
                    method: 'POST',
                    body: formData,
                });

                if (!conversionResponse.ok) {
                    throw new Error('Erro na conversão do áudio');
                }

                const convertedAudioBlob = await conversionResponse.blob();

                const convertedAudioUrl = URL.createObjectURL(convertedAudioBlob);

                const link = document.createElement('a');
                link.href = convertedAudioUrl;
                link.download = '';
                link.click();

                URL.revokeObjectURL(convertedAudioUrl);

            } catch (error) {
                console.error("Erro ao converter e baixar o áudio:", error);
            } finally {
                setIsDownloading(false);
            }
        }
    };


    const transcreverAudio = async () => {
        setIsTranscribing(true);
        handleMenuClose();

        try {
            const formData = new FormData();
            const response = await fetch(url);
            const audioBlob = await response.blob();
            formData.append('audio', audioBlob, 'audio.ogg');

            const transcribeResponse = await fetch("https://tcr.elevafoco.com.br/transcrever", {
                method: "POST",
                body: formData,
            });

            const result = await transcribeResponse.text();
            setTranscription(result);
        } catch (error) {
            console.error("Erro ao transcrever o áudio:", error);
        } finally {
            setIsTranscribing(false);
        }
    };

    const charLimit = 200;

    const handleToggle = () => {
        setIsExpanded(true);
    };

    const truncatedTranscription = transcription.slice(0, charLimit);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleSeek(e);
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: 'auto',
            position: 'relative'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgb(134 150 160 / 8%)',
                borderRadius: '10px'
            }}>
                <audio ref={audioRef}>
                    {getAudioSource()}
                </audio>

                <IconButton onClick={togglePlay}>
                    {isPlaying ? <PauseRounded style={{ fontSize: '2.4rem', color: '#9c8d8d' }} /> : <PlayArrowRounded style={{ fontSize: '2.4rem', color: '#9c8d8d' }} />}
                </IconButton>

                {isPlaying && (
                    <div
                        style={{
                            backgroundColor: 'rgba(84, 101, 111, .5)',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '1px 0px 1px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            minWidth: '45px',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                        onClick={toggleRate}
                    >
                        {audioRate}x
                    </div>
                )}

                <div style={{
                    flex: 1,
                    marginLeft: '10px',
                    marginRight: '3px',
                    position: 'relative',
                    minWidth: '10vw'
                }}>
                    <div
                        ref={progressRef}
                        onClick={handleSeek}
                        style={{
                            height: '3px',
                            backgroundColor: 'rgb(171 171 171 / 38%)',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: '#29AFDF'
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: `${progress}%`,
                                top: '-4px',
                                width: '11px',
                                height: '11px',
                                borderRadius: '50%',
                                backgroundColor: '#29AFDF',
                                transform: 'translateX(-50%)',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#8696a0',
                        position: 'absolute',
                        marginTop: '7px',
                        marginLeft: '-7px',
                        width: '100%'
                    }}>
                        <span>{isPlaying ? formatTime(duration - currentTime) : formatTime(duration)}</span>
                    </div>
                </div>

                <IconButton onClick={handleMenuOpen} disabled={isTranscribing}>
                    {isTranscribing ? (
                        <CircularProgress size={24} style={{ color: '#0078ff' }} />
                    ) : (
                        <MoreVert />
                    )}
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            marginTop: '20px',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
                        }
                    }}
                >
                    <MenuItem onClick={handleDownload} style={{ fontSize: '0.8rem', color: '#8696a1' }}>
                        {isDownloading ? (
                            <CircularProgress size={24} style={{ marginRight: '10px', color: '#8696a194' }} />
                        ) : (
                            <CloudDownload style={{ marginRight: '10px', color: '#8696a194' }} />
                        )}
                        Baixar
                    </MenuItem>
                    <MenuItem onClick={transcreverAudio} disabled={isTranscribing} style={{ fontSize: '0.8rem', color: '#8696a1' }}>
                        <ReadMoreRounded style={{ marginRight: '10px', color: '#8696a194' }} />
                        {isTranscribing ? 'Transcrevendo...' : 'Transcrever'}
                    </MenuItem>
                </Menu>
            </div>

            {transcription && (
                <div style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: 'rgb(130 208 255 / 12%)',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    maxWidth: '23vw'
                }}>
                    <strong>Transcrição:</strong>
                    <p>
                        {isExpanded ? transcription : truncatedTranscription}
                        {transcription.length > charLimit && !isExpanded && (
                            <span
                                onClick={handleToggle}
                                style={{
                                    color: '#0297d9',
                                    cursor: 'pointer',
                                }}
                            >
                                ...Ler mais
                            </span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AudioModal;
