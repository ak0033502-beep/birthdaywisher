"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchCardProps {
    children: ReactNode;
    onUnlock: () => void;
    brushSize?: number;
    unlockThreshold?: number; // percentage (0-100)
}

export function ScratchCard({
    children,
    onUnlock,
    brushSize = 40,
    unlockThreshold = 50,
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScratched, setIsScratched] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Setup Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || isScratched) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize canvas to match container exactly
        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;

            // Fill with silver scratch-off gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#c0c0c0");
            gradient.addColorStop(0.5, "#e0e0e0");
            gradient.addColorStop(1, "#a0a0a0");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add some "foil" texture noise
            for (let i = 0; i < 5000; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)";
                ctx.fillRect(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 3,
                    Math.random() * 3
                );
            }

            // Text instructions on top
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.font = "bold 20px system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("RUB TO REVEAL", canvas.width / 2, canvas.height / 2);

            ctx.globalCompositeOperation = "source-over"; // Reset for drawing
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, [isScratched]);

    const calculateScratchPercentage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        // Check alpha channel for every 4th value (RGBA)
        // We can step by 16 or 32 to dramatically speed up calculation
        for (let i = 3; i < pixels.length; i += 32) {
            if (pixels[i] < 50) {
                transparentPixels++;
            }
        }

        const totalCheckedPixels = pixels.length / 32;
        return (transparentPixels / totalCheckedPixels) * 100;
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas || isScratched) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        // Check completion every stroke
        const percentage = calculateScratchPercentage(ctx, canvas.width, canvas.height);
        if (percentage > unlockThreshold) {
            setIsScratched(true);
            setTimeout(() => onUnlock(), 800); // Small delay to let them see the rest melt away
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDrawing(true);
        handleTouchMove(e);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        e.preventDefault(); // Stop scrolling while scratching
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        scratch(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        handleMouseMove(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden select-none border border-white/5 shadow-2xl"
        >
            {/* The hidden content underneath */}
            <div className="absolute inset-0 z-0 bg-black/40 flex items-center justify-center p-8">
                {children}
            </div>

            {/* The scratchable silver canvas on top */}
            <AnimatePresence>
                {!isScratched && (
                    <motion.canvas
                        ref={canvasRef}
                        exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 z-10 w-full h-full cursor-pointer touch-none"
                        onMouseDown={handleMouseDown}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onMouseMove={handleMouseMove}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                        onTouchMove={handleTouchMove}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
