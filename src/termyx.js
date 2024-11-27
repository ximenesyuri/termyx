import { initTerminal } from './core/term.js';
import { keysHandler } from './core/keys.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTerminal();
});

async function initializeTerminal() {
    const terminalElement = document.getElementById('terminal');
    if (!terminalElement) {
        console.error("Terminal element not found!");
        return;
    }
    
    // Focus the terminal to capture keyboard inputs directly
    terminalElement.tabIndex = 0;  // Make div focusable if it's not inherently so
    terminalElement.focus();

    const filesystemPath = terminalElement.getAttribute('data-filesystem-path');
    const startPath = terminalElement.getAttribute('data-start-path') || '/';

    if (!filesystemPath) {
        console.error('Filesystem path must be defined.');
        return;
    }

    try {
        const response = await fetch(filesystemPath);
        if (!response.ok) {
            throw new Error('Failed to load filesystem configuration.');
        }
        const fileConfig = await response.json();
        const { filesystem } = fileConfig;

        const terminalState = {
            currentPath: startPath,
            commandHistory: [],
            inputBuffer: '',
            historyIndex: 0
        };

        window.addEventListener('keydown', (event) => {
            keysHandler(event, terminalElement, terminalState, filesystem);
        });

        initTerminal(terminalElement, startPath, filesystem, terminalState);

    } catch (error) {
        console.error('Error initializing terminal:', error);
    }
}
