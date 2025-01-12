"use client";
import { useEffect, useRef, useState } from "react";
import {
    FaBackward,
    FaCompress,
    FaExpand,
    FaForward,
    FaPause,
    FaPlay,
    FaVolumeMute,
    FaVolumeUp,
} from "react-icons/fa";
import shaka from "shaka-player";
import CustomRangeSlider from "./CustomRangeSlider";
import "./ShakaPlayer.css";

const ShakaPlayer = ({
    src,
    drmConfig,
    email,
    watchTime = 0,
    getWatchTime,
    id = null,
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null); // Reference to the container for fullscreen
    const dropdownRefForQuality = useRef(null);
    const dropdownRefForSpeed = useRef(null);
    const intervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(20);
    const [duration, setDuration] = useState(0);
    const [qualityOptions, setQualityOptions] = useState([]);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [playbackRate, setPlaybackRate] = useState(1); // To store the playback speed
    const [progressTooltip, setProgressTooltip] = useState({
        visible: false,
        time: "0:00",
        x: 0,
    });
    const [isOpenForQuality, setIsOpenForQuality] = useState(false);
    const [isOpenForSpeed, setIsOpenForSpeed] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [position, setPosition] = useState(null);
    const [bufferedPercentage, setBufferedPercentage] = useState(0);

    const startPositionChange = () => {
        if (intervalRef.current) return; // Prevent duplicate intervals

        intervalRef.current = setInterval(() => {
            // Random position 10 to 75% between each side
            const top = Math.floor(Math.random() * 66) + 10;
            const left = Math.floor(Math.random() * 66) + 10;
            setPosition({
                top: `${top}%`,
                left: `${left}%`,
            });
        }, 5000); // Change position every 5 seconds
    };

    const stopPositionChange = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    const toggleDropdownForQuality = () => {
        setIsOpenForQuality(!isOpenForQuality);
    };

    const toggleDropdownForSpeed = () => {
        setIsOpenForSpeed(!isOpenForSpeed);
    };

    const handleOptionClick = quality => {
        changeQuality(null, quality.id);
    };

    useEffect(() => {
        const video = videoRef.current;
        const player = new shaka.Player(video);

        // Attach player to the window for debugging.
        window.player = player;

        // Listen for error events.
        player.addEventListener("error", onErrorEvent);

        // Configure DRM if provided
        if (drmConfig) {
            player.configure({ drm: drmConfig });
        }

        // Load the video source.
        player
            .load(src)
            .then(() => {
                console.log("The video has now been loaded!");
                setDuration(video.duration);

                // Fetch available quality options
                const tracks = player.getVariantTracks();
                const autoOption = {
                    id: "auto",
                    width: "Auto",
                    height: "Auto",
                };
                setQualityOptions([autoOption, ...tracks]);
                setSelectedQuality("auto"); // Default to auto

                if (watchTime) {
                    video.currentTime = parseFloat(watchTime);
                    setCurrentTime(parseFloat(watchTime));
                } else {
                    const savedTime = localStorage.getItem(id || "currentTime");
                    if (savedTime) {
                        video.currentTime = parseFloat(savedTime);
                        setCurrentTime(parseFloat(savedTime));
                    }
                }
            })
            .catch(onError);

        // Sync progress bar with video playback
        const updateProgress = () => {
            setCurrentTime(video.currentTime);
            setDuration(video.duration);
            // Save current time to local storage
            const currentTime = localStorage.getItem(id || "currentTime");

            if (video.currentTime === 0 && currentTime) {
                video.currentTime = currentTime;
            } else {
                localStorage.setItem(id || "currentTime", video.currentTime);
            }

            // Calculate buffered percentage
            const buffered = video.buffered;
            if (buffered.length > 0) {
                const bufferedEnd = buffered.end(buffered.length - 1);
                const bufferedPercent = (bufferedEnd / video.duration) * 100;
                setBufferedPercentage(bufferedPercent);
            }
            if (video.currentTime >= video.duration) {
                setIsPlaying(false);
                setCurrentTime(0);
                setBufferedPercentage(0);
                localStorage.removeItem(id || "currentTime");
            }
        };

        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("progress", updateProgress);

        // Fullscreen change event listener
        const handleFullscreenChange = () => {
            if (
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement
            ) {
                setIsFullscreen(true);
            } else {
                setIsFullscreen(false);
            }
        };

        // Listen for fullscreen change
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener(
            "mozfullscreenchange",
            handleFullscreenChange,
        );
        document.addEventListener(
            "webkitfullscreenchange",
            handleFullscreenChange,
        );
        document.addEventListener("msfullscreenchange", handleFullscreenChange);

        // Start position changes when video starts playing
        const handlePlay = () => {
            startPositionChange();
        };

        // Stop position changes when video pauses
        const handlePause = () => {
            stopPositionChange();
        };

        // Attach event listeners
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        // Cleanup
        return () => {
            player.destroy();
            video.removeEventListener("timeupdate", updateProgress);
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
            document.removeEventListener(
                "mozfullscreenchange",
                handleFullscreenChange,
            );
            document.removeEventListener(
                "webkitfullscreenchange",
                handleFullscreenChange,
            );
            document.removeEventListener(
                "msfullscreenchange",
                handleFullscreenChange,
            );
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("progress", updateProgress);

            stopPositionChange();
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (video.currentTime > 0) {
                if (getWatchTime)
                    getWatchTime(video.currentTime, video.duration);
            }
        };
    }, [src, drmConfig]);

    function onErrorEvent(event) {
        onError(event.detail);
    }

    function onError(error) {
        console.error("Error code", error.code, "object", error);
    }

    const togglePlayPause = e => {
        e.stopPropagation();
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = e => {
        e.stopPropagation();
        const video = videoRef.current;
        video.muted = !video.muted;
        setIsMuted(video.muted);
        if (video.muted) {
            setVolume(0);
        } else {
            setVolume(video.volume || 1);
        }
    };

    const toggleFullscreen = e => {
        e.stopPropagation();
        const container = containerRef.current;
        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) {
                // Firefox
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                // Chrome, Safari and Opera
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                // IE/Edge
                container.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                // IE/Edge
                document.msExitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleVolumeChange = volume => {
        // e.stopPropagation();
        // const volume = e.target.value;
        const video = videoRef.current;
        video.volume = volume;
        setVolume(volume);
    };

    const skipForward = (e, seconds) => {
        e.stopPropagation();
        const video = videoRef.current;
        video.currentTime = Math.min(
            video.duration,
            video.currentTime + seconds,
        );
    };

    const skipBackward = (e, seconds) => {
        e.stopPropagation();
        const video = videoRef.current;
        video.currentTime = Math.max(0, video.currentTime - seconds);
    };

    const changeQuality = (e, qualityId) => {
        // e.stopPropagation();
        const player = window.player; // Use the global player reference

        if (qualityId === "auto") {
            // Enable adaptive quality selection
            player.configure({ abr: { enabled: true } });
            setSelectedQuality("auto");
        } else {
            // Disable adaptive quality and select specific track
            const track = qualityOptions.find(q => q.id === qualityId);
            if (track) {
                player.configure({ abr: { enabled: false } });
                player.selectVariantTrack(track, true); // Force track selection
                setSelectedQuality(qualityId);
            }
        }
    };

    const changePlaybackRate = (e, rate) => {
        e.stopPropagation();
        const video = videoRef.current;
        video.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const progressPercentage = (currentTime / duration) * 100;

    const handleProgressHover = e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; // Mouse position relative to the progress bar
        const width = rect.width;
        const hoverTime = (x / width) * duration;
        setProgressTooltip({ visible: true, time: formatTime(hoverTime), x });
    };

    const handleProgressHoverLeave = () => {
        setProgressTooltip({ visible: false, time: "0:00", x: 0 });
    };

    const handleClickOutside = event => {
        if (
            dropdownRefForQuality.current &&
            !dropdownRefForQuality.current.contains(event.target)
        ) {
            setIsOpenForQuality(false);
        }
        if (
            dropdownRefForSpeed.current &&
            !dropdownRefForSpeed.current.contains(event.target)
        ) {
            setIsOpenForSpeed(false);
        }
    };

    useEffect(() => {
        let timeout;
        const handleMouseMove = e => {
            if (
                containerRef.current &&
                containerRef.current.contains(e.target)
            ) {
                setControlsVisible(true);
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    setControlsVisible(false);
                }, 10000); // 10 seconds
            }
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="player-container"
            style={{ position: "relative", width: "100%", height: "auto" }}
            onContextMenu={e => e.preventDefault()}
            onClick={togglePlayPause}
        >
            {email && position ? (
                <div
                    style={{
                        position: "absolute",
                        ...position,
                        color: "#247e00",
                        padding: "5px",
                        fontSize: "8px",
                        fontStyle: "italic",
                    }}
                >
                    {email}
                </div>
            ) : null}
            <video
                ref={videoRef}
                width="100%"
                controls={false}
                style={{ display: "block", width: "100%" }}
                onContextMenu={e => e.preventDefault()}
            />

            {/* Custom Controls */}
            <div
                style={{
                    ...styles.controls,
                    opacity: controlsVisible ? 1 : 0,
                    transition: "opacity 0.5s",
                    backgroundColor: "rgba(0, 0, 0, 0.164)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div
                    onMouseMove={handleProgressHover}
                    onMouseLeave={handleProgressHoverLeave}
                    onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const width = rect.width;
                        const newTime = (x / width) * duration;
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                    }}
                    style={{
                        width: `100%`,
                        cursor: "pointer",
                        backgroundColor: "gray",
                        height: "4px",
                        borderRadius: "5px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${bufferedPercentage}%`,
                            height: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                        }}
                    />
                    {progressTooltip.visible && (
                        <div
                            style={{
                                position: "absolute",
                                top: "-30px",
                                left: `${progressTooltip.x}px`,
                                transform: "translateX(-50%)",
                                backgroundColor: "black",
                                color: "white",
                                padding: "2px 5px",
                                borderRadius: "3px",
                                fontSize: "12px",
                            }}
                        >
                            {progressTooltip.time}
                        </div>
                    )}
                    <div
                        style={{
                            width: `${progressPercentage}%`,
                            cursor: "pointer",
                            backgroundColor: "blue",
                            height: "4px",
                            borderRadius: "5px",
                        }}
                    ></div>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "5px",
                    }}
                >
                    <div>
                        <button
                            onClick={e => skipBackward(e, 10)}
                            style={styles.controlButton}
                        >
                            <FaBackward color="white" />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            style={styles.controlButton}
                        >
                            {isPlaying ? (
                                <FaPause color="white" />
                            ) : (
                                <FaPlay color="white" />
                            )}
                        </button>
                        <button
                            onClick={e => skipForward(e, 10)}
                            style={styles.controlButton}
                        >
                            <FaForward color="white" />
                        </button>
                        <span style={styles.timeDisplay}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <button
                            onClick={toggleMute}
                            style={styles.controlButton}
                        >
                            {isMuted ? (
                                <FaVolumeMute color="white" />
                            ) : (
                                <FaVolumeUp color="white" />
                            )}
                        </button>

                        <CustomRangeSlider
                            min={0}
                            max={1}
                            step={"0.1"}
                            value={volume}
                            onChange={handleVolumeChange}
                            disabled={isMuted}
                        />

                        {/* Quality Selector */}
                        {qualityOptions.length > 1 ? (
                            <div
                                style={{
                                    position: "relative",
                                    display: "inline-block",
                                    cursor: "pointer",
                                }}
                                ref={dropdownRefForQuality}
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={toggleDropdownForQuality}
                                    style={{
                                        ...styles.controlButton,
                                        fontWeight: "bold",
                                        backgroundColor: "white",
                                        borderRadius: "5px",
                                        fontSize: "10px",
                                        padding: "4px 8px",
                                    }}
                                >
                                    HQ
                                </button>
                                {isOpenForQuality ? (
                                    <ul
                                        style={{
                                            position: "absolute",
                                            backgroundColor: "#c7c7c775",
                                            color: "#fff",
                                            listStyle: "none",
                                            padding: "5px",
                                            margin: 0,
                                            border: "1px solid #fff",
                                            cursor: "pointer",
                                            top:
                                                qualityOptions.length > 1
                                                    ? "-160px"
                                                    : "-40px",
                                            right: "2px",
                                            borderRadius: "5px",
                                        }}
                                    >
                                        {qualityOptions
                                            .sort((a, b) => b.height - a.height)
                                            .map(q => (
                                                <li
                                                    key={q.id}
                                                    onClick={() =>
                                                        handleOptionClick(q)
                                                    }
                                                    style={{
                                                        margin: "0px",
                                                        padding: "2px",
                                                        cursor: "pointer",
                                                        borderRadius: "5px",
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        color:
                                                            selectedQuality ===
                                                            q.id
                                                                ? "#fff"
                                                                : "#000",
                                                        backgroundColor:
                                                            selectedQuality ===
                                                            q.id
                                                                ? "#777777"
                                                                : "transparent",
                                                    }}
                                                >
                                                    {q.width === "Auto"
                                                        ? "Auto"
                                                        : `${q.width}p`}
                                                </li>
                                            ))}
                                    </ul>
                                ) : null}
                            </div>
                        ) : null}

                        {/* Playback Speed Dropdown */}
                        <div
                            style={{
                                position: "relative",
                                display: "inline-block",

                                cursor: "pointer",
                            }}
                            onClick={e => e.stopPropagation()}
                            ref={dropdownRefForSpeed}
                        >
                            <button
                                onClick={toggleDropdownForSpeed}
                                style={{
                                    ...styles.controlButton,
                                    margin: 0,
                                    width: 40,
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    color: "white",
                                }}
                            >
                                {playbackRate}x
                            </button>
                            {isOpenForSpeed && (
                                <ul
                                    style={{
                                        position: "absolute",
                                        backgroundColor: "#c7c7c775",
                                        color: "#fff",
                                        listStyle: "none",
                                        padding: "5px",
                                        margin: 0,
                                        border: "1px solid #fff",
                                        cursor: "pointer",
                                        top: "-160px",
                                        right: "0px",
                                        borderRadius: "5px",
                                    }}
                                >
                                    {[
                                        "0.5",
                                        "1",
                                        "1.25",
                                        "1.5",
                                        "1.75",
                                        "2",
                                    ].map(q => (
                                        <li
                                            key={q}
                                            onClick={e =>
                                                changePlaybackRate(
                                                    e,
                                                    parseFloat(q),
                                                )
                                            }
                                            style={{
                                                margin: "0px",
                                                padding: "2px",
                                                cursor: "pointer",
                                                borderRadius: "5px",
                                                textAlign: "center",
                                                fontSize: "12px",
                                                color:
                                                    playbackRate.toString() ===
                                                    q
                                                        ? "#fff"
                                                        : "#000",
                                                backgroundColor:
                                                    playbackRate.toString() ===
                                                    q
                                                        ? "#777777"
                                                        : "transparent",
                                            }}
                                        >
                                            {q}x
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            style={styles.controlButton}
                        >
                            {isFullscreen ? (
                                <FaCompress color="white" />
                            ) : (
                                <FaExpand color="white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatTime = time => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Basic CSS Styles for Custom Controls
const styles = {
    controls: {
        position: "absolute",
        bottom: "0px",
        backgroundColor: "transparent",
        padding: "6px",
        border: "none",
        color: "#fff",
        width: "100%",
    },
    controlButton: {
        background: "none",
        color: "#fff",
        border: "none",
        fontSize: "16px",
        margin: "0 10px",
        cursor: "pointer",
    },
    progressBar: {
        width: "100%",
        margin: "0 10px",
    },
    timeDisplay: {
        fontSize: "14px",
        margin: "0 10px",
        width: "300px",
        color: "white",
    },
    qualitySelect: {
        backgroundColor: "#777777",
        color: "#fff",
        border: "1px solid #fff",
        padding: "5px",
        marginLeft: "10px",
        width: "100px",
    },
    playbackRateSelect: {
        backgroundColor: "#777777",
        color: "#fff",
        border: "1px solid #fff",
        padding: "5px",
        marginLeft: "10px",
        width: "80px",
    },
};

export default ShakaPlayer;
