import { 
    scrollToBottom, 
    navigateTo, 
    isValidPath, 
    escapeHtml, 
    generateRange,
    parseArrayExpression 
} from './utils.js';
import { initializeHistory } from './history.js';
import { availableCommands } from './cmds.js';
import { setTheme } from './theme.js';

export function initTerminal(terminal, startPath, fileSystem, terminalState) {
    if (!terminalState) {
        console.error("Terminal state is not defined.");
        return;
    }

    terminalState.currentPath = isValidPath(startPath, fileSystem) ? startPath : '/';
    terminal.innerHTML = ''; // Clear existing content to start fresh
    const introText = terminalState.introText || '';
    displayIntro(terminal, introText); // Display optional introductory text
    initializeHistory(terminalState);  // Initialize history tracking
    addNewPromptLine(terminal, terminalState); // Add initial prompt/input line
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
    newLine.innerHTML = `<span class="prompt">${promptText}</span><span class="input-line"></span>`;
    return newLine;
}

function getPromptString(terminalState) {
    if (!terminalState || !terminalState.currentPath || !terminalState.promptText) {
        console.error("Error: terminalState, currentPath or promptText is undefined.");
        return "";
    }
    const path = terminalState.currentPath;
    const prompt = terminalState.promptText;
    if (path == '/') {
        return `${prompt}$ `
    } else {
        console.log(path)
        return `${prompt}/${path}/$ `
    }
}

export function addNewPromptLine(terminal, terminalState) {
    removeExistingCursor(terminal); // Only before adding a new line
    const newLine = createInputLine(getPromptString(terminalState));
    terminal.appendChild(newLine);
    terminalState.inputBuffer = '';
    terminalState.cursorPosition = 0;
    updateInputLine(terminal, terminalState); // Initial update to render line with cursor
    scrollToBottom(terminal); // Ensure the new line is visible
}

function removeExistingCursor(terminal) {
    const previousCursor = terminal.querySelector('.cursor');
    if (previousCursor) {
        previousCursor.remove();
    }
}

export function updateInputLine(terminal, terminalState) {
    const inputLine = terminal.querySelector('.line:last-child .input-line');
    if (inputLine) {
        removeExistingCursor(terminal);
        inputLine.innerHTML = '';
        const beforeCursor = terminalState.inputBuffer.slice(0, terminalState.cursorPosition);
        const cursorCharacter = terminalState.inputBuffer[terminalState.cursorPosition] || ' ';
        const afterCursor = terminalState.inputBuffer.slice(terminalState.cursorPosition + 1);

        inputLine.innerHTML = `${escapeHtml(beforeCursor)}<span class="cursor">${escapeHtml(cursorCharacter)}</span>${escapeHtml(afterCursor)}`;
    } else {
        console.error('Could not find input line element.');
    }
}

export function appendOutput(output, terminal) {
    if (!terminal) {
        console.error("Terminal element is not defined.");
        return;
    }
    if (output) {
        const outputLine = document.createElement('div');
        outputLine.className = 'output';
        outputLine.innerHTML = output;
        terminal.appendChild(outputLine);
    }
}

function processEnvironmentCommand(input, terminalState) {
    const envMatch = input.match(/^([A-Z_]+)=(.+)$/);
    if (envMatch) {
        const [, variable, value] = envMatch;
        if (variable === 'TERMYX_THEME') {
            return setTheme([value], terminalState);
        }
        return `Unknown environment variable: ${variable}`;
    }
    return null;
}

function processVariableAssignment(input, terminalState) {
    const arrayMatch = input.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=\((.*)\)$/);
    if (arrayMatch) {
        const [, varName, values] = arrayMatch;
        terminalState.variables[varName] = values.split(/\s+/); // Split and store as an array
        return true;
    }

    const scalarMatch = input.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.+)$/);
    if (scalarMatch) {
        const [, varName, value] = scalarMatch;
        if (varName === 'TERMYX_THEME') {
            const themeChangeMessage = setTheme([value.trim()], terminalState);
            return themeChangeMessage || `Changed theme to: ${value.trim()}`;
        }
        terminalState.variables[varName] = value;
        return true;
    }

    return false;
}

function replaceVariables(input, terminalState) {
    return input.replace(/\$\{!([a-zA-Z_][a-zA-Z0-9_]*)\[@\]\}/g, (match, arrayName) => {
        if (arrayName in terminalState.variables && Array.isArray(terminalState.variables[arrayName])) {
            return Object.keys(terminalState.variables[arrayName]).join(' ');  // Return indices
        }
        console.warn(`Undefined or non-array variable: ${arrayName}`);
        return '';
    }).replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\[@\]\}/g, (match, arrayName) => {
        if (arrayName in terminalState.variables && Array.isArray(terminalState.variables[arrayName])) {
            return terminalState.variables[arrayName].join(' '); // Flatten array into space-separated string
        }
        console.warn(`Undefined or non-array variable: ${arrayName}`);
        return '';
    }).replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, variableName) => {
        if (variableName in terminalState.variables) {
            return terminalState.variables[variableName];
        }
        console.warn(`Undefined variable: ${variableName}`);
        return '';
    });
}

function processForLoop(input, terminalState, fileSystem, terminal) {
    const forLoopMatch = input.match(/^for\s+(\w+)\s+in\s+(.+);\s+do\s+(.+);\s+done$/);
    if (!forLoopMatch) return false;

    const [, iterator, listExpression, command] = forLoopMatch;
    let items;

    // Handle `${array[@]}`, `${array[*]}`, `${!array[@]}`
    if (listExpression.startsWith('${') && listExpression.endsWith('}')) {
        items = parseArrayExpression(listExpression.slice(2, -1), terminalState);
    } else {
        items = listExpression.split(/\s+/);
    }

    // Iterate over items and execute commands
    items.forEach(item => {
        terminalState.variables[iterator] = item.toString();  // Convert index to string
        const processedCommand = replaceVariables(command, terminalState);
        executeCommand(processedCommand, terminalState, fileSystem, terminal);
    });

    return true;
}

export function executeCommand(commandInput, terminalState, fileSystem, terminal) {
       const [cmd, ...args] = commandInput.split(/\s+/);
   
       if (availableCommands[cmd]) {
           let output;
           try {
               output = availableCommands[cmd](args, terminalState, fileSystem);
           } catch (error) {
               console.error(`Error executing command [${cmd}]:`, error);
               output = `Error executing command: ${error.message}`;
           }
           appendOutput(output, terminal);
       } else {
           appendOutput(`${cmd}: command not found`, terminal);
       }
   }

export function processInput(terminal, terminalState, fileSystem) {
       const inputBuffer = terminalState.inputBuffer.trim();
   
       // Add to history if not empty
       if (inputBuffer) {
           terminalState.commandHistory.push(inputBuffer);
           terminalState.historyIndex = terminalState.commandHistory.length;
       }

       // Handling `for` loop
       if (processForLoop(inputBuffer, terminalState, fileSystem, terminal)) {
           addNewPromptLine(terminal, terminalState);
           terminalState.inputBuffer = '';
           return;
       }

       // Process variable assignments
       if (processVariableAssignment(inputBuffer, terminalState)) {
           appendOutput(`Assigned: ${inputBuffer}`, terminal);
           addNewPromptLine(terminal, terminalState);
           terminalState.inputBuffer = '';
           return;
       }

       // Replace variables and execute command
       const replacedInput = replaceVariables(inputBuffer, terminalState);
       executeCommand(replacedInput, terminalState, fileSystem, terminal);

       addNewPromptLine(terminal, terminalState);
       terminalState.inputBuffer = '';
   }
