import { displayIntro } from './intro.js';
import { scrollToBottom, navigateTo, isValidPath } from './utils.js';
import { initializeHistory } from './history.js';
import { availableCommands } from './cmds.js';

export function initTerminal(terminal, startPath, fileSystem, terminalState) {
    if (!terminalState) {
        console.error("Terminal state is not defined.");
        return;
    }

    terminalState.currentPath = isValidPath(startPath, fileSystem) ? startPath : '/';
    terminal.innerHTML = '';
    displayIntro(terminal);
    initializeHistory(terminalState);
    addNewPromptLine(terminal, terminalState);
}

function createInputLine(promptText) {
    const newLine = document.createElement('div');
    newLine.className = 'line';
    newLine.innerHTML = `<span class="prompt">${promptText}</span><span class="input-line"></span><span class="cursor">&nbsp;</span>`;
    return newLine;
}

function getPromptString(terminalState) {
    if (!terminalState || !terminalState.currentPath) {
        console.error("Error: terminalState or currentPath is undefined.");
        return "yx@dev$ ";
    }
    const path = terminalState.currentPath;
    return `yx@dev/${path === '' ? path : path + '/'}$ `;
}

export function addNewPromptLine(terminal, terminalState) {
    removeExistingCursor(terminal);
    const newLine = createInputLine(getPromptString(terminalState));
    terminal.appendChild(newLine);
    scrollToBottom(terminal);
}

export function updateInputLine(terminal, terminalState) {
    const inputLine = terminal.querySelector('.line:last-child .input-line');
    if (inputLine) {
        inputLine.textContent = terminalState.inputBuffer;
    } else {
        console.error('Input line not found; ensure DOM structure is correct.');
    }
}

function removeExistingCursor(terminal) {
    const previousCursor = terminal.querySelector('.cursor');
    if (previousCursor) {
        previousCursor.remove();
    }
}

function appendOutput(output, terminal) {
    if (output) {
        const outputLine = document.createElement('div');
        outputLine.className = 'output';
        outputLine.innerHTML = output;
        terminal.appendChild(outputLine);
        removeExistingCursor(terminal);
    }
}

export function processInput(terminal, terminalState, fileSystem) {
    const inputBuffer = terminalState.inputBuffer;
    const commandHistory = terminalState.commandHistory;
    console.log(`Processing input: ${inputBuffer}`);

    // Add input to history if it's not empty
    if (inputBuffer.trim()) {
        commandHistory.push(inputBuffer);
        terminalState.historyIndex = commandHistory.length;
    }

    // Split input into command and arguments
    const [cmd, ...args] = inputBuffer.trim().split(/\s+/);
    
    let output;
    if (availableCommands[cmd]) {
        try {
            // Execute command with args array
            output = availableCommands[cmd](args, terminalState, fileSystem);
        } catch (error) {
            // Handle any errors that occur during command execution
            console.error(`Error executing command [${cmd}]:`, error);
            output = `Error executing command: ${error.message}`;
        }
    } else {
        // Inform user if command is not found
        output = `${cmd}: command not found`;
    }

    // Output result to terminal and prepare for the next command
    appendOutput(output, terminal);
    addNewPromptLine(terminal, terminalState);
    terminalState.inputBuffer = '';  // Clear buffer for next input
}

