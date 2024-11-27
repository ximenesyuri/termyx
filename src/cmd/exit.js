export function exit(args, terminalElement) {
    if (!terminalElement || !(terminalElement instanceof HTMLElement)) {
        console.error("Invalid terminalElement specified:", terminalElement);
        return;
    }
    
    appendExitMessage(terminalElement);
    disableTerminalInput(terminalElement);
}

function appendExitMessage(terminalElement) {
    const exitMessageLine = document.createElement('div');
    exitMessageLine.className = 'exit-message';
    exitMessageLine.textContent = 'Shell session has been closed.';
    terminalElement.appendChild(exitMessageLine);

    terminalElement.scrollTop = terminalElement.scrollHeight;
}

function disableTerminalInput(terminalElement) {
    window.removeEventListener('keydown', handleKeyDown);

    terminalElement.classList.add('session-closed');

    const inputLine = terminalElement.querySelector('.line:last-child .input-line');
    if (inputLine) {
        inputLine.remove();
    }

    const cursor = terminalElement.querySelector('.cursor');
    if (cursor) {
        cursor.classList.add('hidden');
    }
}

