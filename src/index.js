import { initTerminal } from './core/term.js';
import { keysHandler } from './core/keys.js';
import { defaultIntroText } from './core/intro.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTerminal();
});

async function initializeTerminal() {
    const terminalElement = document.getElementById('terminal');
    if (!terminalElement) {
        console.error("Terminal element not found!");
        return;
    }

    terminalElement.tabIndex = 0;
    terminalElement.focus();

    const filesystemPath = terminalElement.getAttribute('data-filesystem-path');
    const startPath = terminalElement.getAttribute('data-start-path') || '/';
    const introTextFromElement = terminalElement.getAttribute('data-intro-text');
    const promptText = terminalElement.getAttribute('data-prompt') || 'termyx$ ';

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

        const introText = introTextFromElement || defaultIntroText();

        const terminalState = {
            currentPath: startPath,
            commandHistory: [],
            inputBuffer: '',
            historyIndex: 0,
            envs,
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
