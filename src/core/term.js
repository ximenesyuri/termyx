import { defaultIntroText } from './intro.js';
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
    const introText = terminalState.introText || defaultIntroText();
    displayIntro(terminal, introText);
    initializeHistory(terminalState);
    addNewPromptLine(terminal, terminalState);
}

function displayIntro(terminal, introText) {
    const introElement = document.createElement('pre');
    introElement.className = 'intro-text';
    introElement.innerHTML = introText;
    terminal.appendChild(introElement);
}

function createInputLine(promptText) {
    const newLine = document.createElement('div');
    newLine.className = 'line';
    newLine.innerHTML = `<span class="prompt">${promptText}</span><span class="input-line"></span><span class="cursor">&nbsp;</span>`;
    return newLine;
}

function getPromptString(terminalState) {
    if (!terminalState || !terminalState.currentPath || !terminalState.promptText) {
        console.error("Error: terminalState, currentPath or promptText is undefined.");
        return "termyx$ ";
    }
    const path = terminalState.currentPath;
    const prompt = terminalState.promptText;
    return `${prompt}/${path === '' ? path : path + '/'}$ `;
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

    if (inputBuffer.trim()) {
        commandHistory.push(inputBuffer);
        terminalState.historyIndex = commandHistory.length;
    }

    const [cmd, ...args] = inputBuffer.trim().split(/\s+/);
    
    let output;
    if (availableCommands[cmd]) {
        try {
            output = availableCommands[cmd](args, terminalState, fileSystem);
        } catch (error) {
            console.error(`Error executing command [${cmd}]:`, error);
            output = `Error executing command: ${error.message}`;
        }
    } else {
        output = `${cmd}: command not found`;
    }

    appendOutput(output, terminal);
    addNewPromptLine(terminal, terminalState);
    terminalState.inputBuffer = '';
}

