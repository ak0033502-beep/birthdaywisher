"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/** 3×3 sliding photo puzzle (shuffled with valid moves so it is always solvable). Shared by the v1 StoryViewer and the v2 block viewer. */
export function SlidingPuzzle({ imageUrl, onSolve, t }: { imageUrl: string, onSolve: () => void, t: Record<string, string> }) {
    const [tiles, setTiles] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const [isSolved, setIsSolved] = useState(false);

    useEffect(() => {
        // Shuffle by making 50 random valid moves from solved state to guarantee solvability
        let current = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let emptyIdx = 8;
        for (let i = 0; i < 60; i++) {
            const validMoves = [];
            const row = Math.floor(emptyIdx / 3);
            const col = emptyIdx % 3;
            if (row > 0) validMoves.push(emptyIdx - 3);
            if (row < 2) validMoves.push(emptyIdx + 3);
            if (col > 0) validMoves.push(emptyIdx - 1);
            if (col < 2) validMoves.push(emptyIdx + 1);

            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            current[emptyIdx] = current[randomMove];
            current[randomMove] = 8;
            emptyIdx = randomMove;
        }
        setTiles([...current]);
    }, []);

    const moveTile = (index: number) => {
        const emptyIdx = tiles.indexOf(8);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIdx / 3);
        const emptyCol = emptyIdx % 3;

        // Check if adjacent
        if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
            const newTiles = [...tiles];
            newTiles[emptyIdx] = newTiles[index];
            newTiles[index] = 8;
            setTiles(newTiles);

            if (newTiles.join(',') === '0,1,2,3,4,5,6,7,8') {
                setIsSolved(true);
                setTimeout(onSolve, 1000);
            }
        }
    };

    return (
        <div className={`w-full aspect-square relative ${t.card} border-t-2 border-l-2 bg-gradient-to-br from-white/10 to-transparent rounded-2xl overflow-hidden p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full z-0 bg-black/40 rounded-xl overflow-hidden p-1 border border-black/20 shadow-inner">
                {tiles.map((tile, i) => (
                    <motion.div
                        key={i}
                        layout
                        onClick={() => !isSolved && moveTile(i)}
                        className={`w-full h-full rounded-md shadow-md relative ${tile === 8 && !isSolved ? 'opacity-0' : 'cursor-pointer hover:brightness-110'} bg-black`}
                        style={{
                            backgroundImage: (isSolved || tile !== 8) ? `url(${imageUrl})` : 'none',
                            backgroundSize: '300% 300%',
                            backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%`
                        }}
                    >
                        {!isSolved && tile !== 8 && (
                            <div className="absolute inset-0 border-[0.5px] border-white/20 pointer-events-none rounded-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"></div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
