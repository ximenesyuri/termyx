export function initializeHistory(terminalState) {
    terminalState.commandHistory = [];
    terminalState.historyIndex = 0;
}

export function navigateHistory(direction, terminalState) {
    const { commandHistory } = terminalState;

   if (commandHistory.length > 0) {
        const newIndex = terminalState.historyIndex + direction;
        terminalState.historyIndex = Math.min(Math.max(newIndex, 0), commandHistory.length - 1);
        terminalState.inputBuffer = commandHistory[terminalState.historyIndex] || '';
        terminalState.cursorPosition = terminalState.inputBuffer.length;
    } 
}
