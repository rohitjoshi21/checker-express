export const initializeBoard = (): number[] => {
    const board = new Array(64).fill(0);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                if (j <= 2) {
                    board[i * 8 + j] = 1;
                } else if (j >= 5) {
                    board[i * 8 + j] = -1;
                }
            }
        }
    }
    return board;
};
