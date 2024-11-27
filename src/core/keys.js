import { updateInputLine, processInput, addNewPromptLine } from './term.js';
import { navigateHistory } from './history.js';
import { autoCompleteCommand } from './completion.js';

export function keysHandler(event, terminal, terminalState, fileSystem) {
    console.log('Key event captured:', event.key);

    if (!terminalState || typeof terminalState.inputBuffer !== 'string') {
        console.error("Invalid terminal state.");
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        terminalState.inputBuffer += event.key;
        console.log('New buffer:', terminalState.inputBuffer);
        updateInputLine(terminal, terminalState);
    } else {
        handleSpecialKeys(event, terminal, terminalState, fileSystem);
    }
}

function handleSpecialKeys(event, terminal, terminalState, fileSystem) {
    switch (event.key) { 
        case 'Enter':
            event.preventDefault();
            processInput(terminal, terminalState, fileSystem);
            terminalState.inputBuffer = '';
            break;
        case 'Backspace':
            event.preventDefault();
            terminalState.inputBuffer = terminalState.inputBuffer.slice(0, -1);
            updateInputLine(terminal, terminalState);
            break;
        case 'Tab':
            event.preventDefault();
            autoCompleteCommand(terminalState, terminal, fileSystem);
            updateInputLine(terminal, terminalState);
            break;
        case 'ArrowUp':
            event.preventDefault();
            navigateHistory(-1, terminalState);
            updateInputLine(terminal, terminalState);
            break;
        case 'ArrowDown':
            event.preventDefault();
            navigateHistory(1, terminalState);
            updateInputLine(terminal, terminalState);
            break;
        default:
            break;
    }
}

