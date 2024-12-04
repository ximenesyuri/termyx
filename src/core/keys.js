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
        terminalState.inputBuffer = [
            terminalState.inputBuffer.slice(0, terminalState.cursorPosition),
            event.key,
            terminalState.inputBuffer.slice(terminalState.cursorPosition)
        ].join('');
        terminalState.cursorPosition++;
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
            terminalState.cursorPosition = 0;
            break;
        case 'Backspace':
            event.preventDefault();
            if (terminalState.cursorPosition > 0) {
                terminalState.inputBuffer = 
                    terminalState.inputBuffer.slice(0, terminalState.cursorPosition - 1) +
                    terminalState.inputBuffer.slice(terminalState.cursorPosition);
                terminalState.cursorPosition--; // Move cursor position back by one
                updateInputLine(terminal, terminalState);
            }
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
        case 'ArrowLeft':
            event.preventDefault();
            if (terminalState.cursorPosition > 0) {
                terminalState.cursorPosition--;
                updateInputLine(terminal, terminalState);
            }
            break;
        case 'ArrowRight':
            event.preventDefault();
            if (terminalState.cursorPosition < terminalState.inputBuffer.length) {
                terminalState.cursorPosition++;
                updateInputLine(terminal, terminalState);
            }
            break;
        default:
            break;
    }
}

