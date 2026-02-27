"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as faceapi from "@vladmandic/face-api";
import { Camera, SmilePlus, Sparkles } from "lucide-react";

export function SmileLock({ children, onUnlock }: { children: ReactNode, onUnlock: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [smileScore, setSmileScore] = useState(0);
    const [statusText, setStatusText] = useState("Loading AI Models...");

    // 1. Load Models securely from local public/models directory
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
                setStatusText("Waiting for Camera Permission...");
            } catch (error) {
                console.error("Failed to load face-api models:", error);
                setStatusText("Error loading camera AI. Please refresh.");
            }
        };
        loadModels();
    }, []);

    // 2. Start Video Stream
    useEffect(() => {
        if (!isModelsLoaded) return;

        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCameraPermission(true);
                    setStatusText("Look at the camera & smile! 😄");
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasCameraPermission(false);
                setStatusText("Camera permission denied. Cannot unlock without a smile.");
            }
        };

        startVideo();

        // Cleanup stream when unmounted
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isModelsLoaded]);

    // 3. Run Detection Loop
    useEffect(() => {
        if (!hasCameraPermission || isUnlocked || !videoRef.current) return;

        let animationFrameId: number;

        const detectSmile = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                const detections = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceExpressions();

                if (detections) {
                    // Get the 'happy' expression score (0.0 to 1.0)
                    const happyScore = detections.expressions.happy;
                    setSmileScore(happyScore);

                    if (happyScore > 0.8) {
                        setIsUnlocked(true);
                        setStatusText("Beautiful smile detected! 💖");
                        setTimeout(() => onUnlock(), 1000);
                        return; // Stop loop
                    } else if (happyScore > 0.4) {
                        setStatusText("Almost there... bigger smile! 😁");
                    } else {
                        setStatusText("Come on, let me see that smile! 😊");
                    }
                } else {
                    setStatusText("Searching for your face...");
                    setSmileScore(0);
                }
            }

            // Re-run the loop very fast
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(detectSmile);
            }, 100);
        };

        // Start detect loop once video is actually playing
        videoRef.current.addEventListener('play', () => {
            animationFrameId = requestAnimationFrame(detectSmile);
        });

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [hasCameraPermission, isUnlocked, onUnlock]);

    // Render the unlocked content behind the lock
    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black/80 flex flex-col items-center justify-center border-t-2 border-l-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl group">

            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000 group-hover:opacity-60 grayscale-[50%]"
            />

            {/* Scanning Overlay Effect */}
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/scan-lines.png')] mix-blend-overlay opacity-50 pointer-events-none" />

            {/* UI Content */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 w-full">

                <AnimatePresence mode="wait">
                    {!isModelsLoaded ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Initializing AI</h3>
                            <p className="text-white/50 text-sm max-w-[200px]">Getting the facial recognition engine ready...</p>
                        </motion.div>
                    ) : hasCameraPermission === false ? (
                        <motion.div key="denied" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20 backdrop-blur-md">
                            <Camera className="w-12 h-12 text-red-400 mb-4" />
                            <h3 className="text-xl font-bold text-red-500 mb-2">Camera Blocked</h3>
                            <p className="text-white/70 text-sm max-w-[200px]">
                                We need to see your smile to unlock this promise! Please allow camera access in your browser.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="scanning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full">

                            <div className="relative mb-6">
                                {/* The Targeting Box */}
                                <div className="absolute inset-0 rounded-2xl border-4 border-pink-500/30 scale-125 animate-pulse" />
                                <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 relative overflow-hidden">
                                    {/* Fill based on smile score */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-pink-500/40 transition-all duration-300"
                                        style={{ height: `${smileScore * 100}%` }}
                                    />
                                    <SmilePlus className={`w-12 h-12 relative z-10 transition-colors duration-300 ${smileScore > 0.8 ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,1)] scale-110' : 'text-white/60'}`} />
                                </div>
                            </div>

                            <motion.h3
                                className="text-2xl font-black text-white mb-2 drop-shadow-md"
                                animate={smileScore > 0.8 ? { scale: [1, 1.1, 1], color: ['#fff', '#ec4899', '#fff'] } : {}}
                            >
                                Smile to Unlock
                            </motion.h3>

                            <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 inline-flex items-center gap-2">
                                {smileScore > 0.8 && <Sparkles className="w-4 h-4 text-pink-500" />}
                                <p className={`text-sm font-medium ${smileScore > 0.8 ? 'text-pink-400' : 'text-white/70'}`}>
                                    {statusText}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
