import { initTerminal } from './core/term.js';
import { keysHandler } from './core/keys.js';


async function initializeTerminal() {
    const terminalElement = document.getElementById('terminal');
    if (!terminalElement) {
        console.error("Terminal element not found!");
        return;
    }

    terminalElement.tabIndex = 0;

    const filesystemPath = 'fs.json';
    const startPath = terminalElement.getAttribute('data-start-path');
    const introTextFromElement = terminalElement.getAttribute('data-intro-text');
    const promptText = terminalElement.getAttribute('data-prompt');

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
        const { filesystem, envs = {} } = fileConfig;

        const introText = introTextFromElement || '';

        const terminalState = {
            currentPath: startPath,
            commandHistory: [],
            inputBuffer: '',
            historyIndex: 0,
            cursorPosition: 0,
            envs,
            variables: { ...envs },
            introText,
            promptText
        };

        window.addEventListener('keydown', (event) => {
            keysHandler(event, terminalElement, terminalState, filesystem);
        });

        initTerminal(terminalElement, startPath, filesystem, terminalState);

    } catch (error) {
        console.error('Error initializing terminal:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTerminal();
});
