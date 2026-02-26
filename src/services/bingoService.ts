import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BingoTile {
    id: number;
    text: string;
    status: 'empty' | 'pending' | 'completed';
    completedBy?: string; // user ID who successfully uploaded the pic
    completedAt?: number;
    proofUrl?: string;
    mediaType?: 'image' | 'video';
}

export interface BingoBoard {
    id: string; // usually the week or month ID, e.g. "week-42-2026"
    tiles: BingoTile[];
    createdAt: number;
}

// A delightfully unhinged pool of prompts
const BINGO_PROMPTS = [
    "Catch partner sleeping (unflattering)",
    "Take a picture of the weirdest bug you see today",
    "Selfie with a random animal (not our pet)",
    "Make an absurd face in public",
    "Send a voice note of your best evil laugh",
    "Take a picture of something that looks like an among us character",
    "Photoshop your partner into a historical event",
    "Send a meme that is completely incomprehensible",
    "Drink water aggressively on video",
    "Selfie with 0.5x zoom from below",
    "Picture of a perfectly round rock",
    "Recreate a famous painting with household items",
    "Send a dramatic close up of your eye",
    "Wear an outfit that completely clashes",
    "A picture of the inside of your fridge",
    "Your partner's most chaotic natural state",
    "A cloud that looks like a questionable shape",
    "Something that shouldn't be sticky but is",
    "A cursed angle of your face",
    "Video of you trying to balance something on your head",
    "A text message with 15 emojis that make a story",
    "A picture of a dog that isn't yours",
    "Screenshot of the weirdest YouTube recommendation you have",
    "A very threatening picture of a harmless object"
];

function generateTiles(): BingoTile[] {
    // Shuffle prompts
    const shuffled = [...BINGO_PROMPTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 24); // 24 prompts + 1 free space

    const tiles: BingoTile[] = [];
    let promptIndex = 0;

    for (let i = 0; i < 25; i++) {
        if (i === 12) {
            // Center space is FREE
            tiles.push({
                id: i,
                text: "FREE SPACE (Exist)",
                status: 'completed',
                completedBy: "system",
                completedAt: Date.now(),
            });
        } else {
            tiles.push({
                id: i,
                text: selected[promptIndex],
                status: 'empty',
            });
            promptIndex++;
        }
    }

    return tiles;
}

export const subscribeToBingoBoard = (coupleId: string, boardId: string, callback: (board: BingoBoard | null) => void) => {
    const boardRef = doc(db, 'couples', coupleId, 'bingo_boards', boardId);

    return onSnapshot(boardRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as BingoBoard);
        } else {
            callback(null);
        }
    });
};

export const initializeBingoBoard = async (coupleId: string, boardId: string) => {
    const boardRef = doc(db, 'couples', coupleId, 'bingo_boards', boardId);

    const boardSnap = await getDoc(boardRef);
    if (!boardSnap.exists()) {
        const newBoard: BingoBoard = {
            id: boardId,
            tiles: generateTiles(),
            createdAt: Date.now(),
        };
        await setDoc(boardRef, newBoard);
        return newBoard;
    }
    return boardSnap.data() as BingoBoard;
};

export const submitBingoTile = async (
    coupleId: string,
    boardId: string,
    tileId: number,
    userId: string,
    proofUrl: string,
    mediaType: 'image' | 'video'
) => {
    const boardRef = doc(db, 'couples', coupleId, 'bingo_boards', boardId);
    const boardSnap = await getDoc(boardRef);

    if (boardSnap.exists()) {
        const board = boardSnap.data() as BingoBoard;

        const updatedTiles = board.tiles.map(tile => {
            if (tile.id === tileId) {
                return {
                    ...tile,
                    status: 'pending' as const,
                    completedBy: userId,
                    completedAt: Date.now(),
                    proofUrl: proofUrl,
                    mediaType: mediaType,
                };
            }
            return tile;
        });

        await updateDoc(boardRef, { tiles: updatedTiles });
    }
};

export const reviewBingoTile = async (
    coupleId: string,
    boardId: string,
    tileId: number,
    isAccepted: boolean
) => {
    const boardRef = doc(db, 'couples', coupleId, 'bingo_boards', boardId);
    const boardSnap = await getDoc(boardRef);

    if (boardSnap.exists()) {
        const board = boardSnap.data() as BingoBoard;

        const updatedTiles = board.tiles.map(tile => {
            if (tile.id === tileId) {
                if (isAccepted) {
                    return { ...tile, status: 'completed' as const };
                } else {
                    return {
                        id: tile.id,
                        text: tile.text,
                        status: 'empty' as const,
                    };
                }
            }
            return tile;
        });

        await updateDoc(boardRef, { tiles: updatedTiles });
    }
};
