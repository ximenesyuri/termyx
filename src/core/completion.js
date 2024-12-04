import { navigateTo, normalizePath } from './utils.js';
import { updateInputLine, appendOutput, addNewPromptLine } from './term.js'

export function autoCompleteCommand(terminalState, terminal, fileSystem) {
    // Split the input to identify the current word for completion
    const inputParts = terminalState.inputBuffer.trim().split(/\s+/);
    let currentInput = inputParts.pop() || '';

    if (currentInput.startsWith('$')) {
        // Autocomplete for variables
        const varToComplete = currentInput.slice(1);
        const matchingVariables = Object.keys(terminalState.variables).filter(varName => varName.startsWith(varToComplete));

        if (matchingVariables.length === 1) {
            // Exactly one match found, complete the variable
            const completedVariable = matchingVariables[0];
            terminalState.inputBuffer = `${inputParts.join(' ')} $${completedVariable}`.trim();
        } else if (matchingVariables.length > 1) {
            // Multiple matches found, display them
            appendOutput(`\n${matchingVariables.join('\n')}`, terminal);
        }
    } else {
        // Filesystem completion logic
        const inputPath = currentInput.startsWith('/') ? currentInput : `${terminalState.currentPath}/${currentInput}`;
        const normalizedPath = normalizePath(inputPath);
        const pathParts = normalizedPath.split('/');
        const searchDirPath = pathParts.slice(0, -1).join('/') || '/';
        const searchName = pathParts.pop();
        const targetDir = navigateTo(searchDirPath, fileSystem);

        if (targetDir && typeof targetDir === 'object') {
            const possibleCompletions = Object.keys(targetDir).filter(entry => entry.startsWith(searchName));

            if (possibleCompletions.length === 1) {
                const match = possibleCompletions[0];
                const matchIsDirectory = typeof targetDir[match] === 'object';
                currentInput += match.slice(searchName.length) + (matchIsDirectory && !currentInput.endsWith('/') ? '/' : '');

                terminalState.inputBuffer = `${inputParts.join(' ')} ${currentInput}`.trim();
            } else if (possibleCompletions.length > 1) {
                // Show multiple completions
                appendOutput(`\n${possibleCompletions.join('\n')}`, terminal);
            }
        }
    }

    // Update the cursor position to be at the end of the input buffer
    terminalState.cursorPosition = terminalState.inputBuffer.length;
    //updateInputLine(terminal, terminalState);
}
