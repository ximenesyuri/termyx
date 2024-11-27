import { navigateTo, normalizePath } from '../core/utils.js';

export function autoCompleteCommand(terminalState, terminal, fileSystem) {
    // Split the input to get the current command and path part
    const inputParts = terminalState.inputBuffer.trim().split(/\s+/);
    let pathToComplete = inputParts.pop() || '';

    // Resolve to an absolute path, starting from the current directory if necessary
    const { currentPath } = terminalState;
    const inputPath = pathToComplete.startsWith('/') ? pathToComplete : `${currentPath}/${pathToComplete}`;
    const normalizedPath = normalizePath(inputPath);

    // Isolate the directory and the specific search item
    const pathParts = normalizedPath.split('/');
    const searchDirPath = pathParts.slice(0, -1).join('/') || '/';
    const searchName = pathParts.pop();

    const targetDir = navigateTo(searchDirPath, fileSystem);

    if (targetDir && typeof targetDir === 'object') {
        const possibleCompletions = Object.keys(targetDir).filter(entry => entry.startsWith(searchName));

        if (possibleCompletions.length === 1) {
            // Autocomplete with the only match
            const match = possibleCompletions[0];
            const matchIsDirectory = typeof targetDir[match] === 'object';

            // If the entry is a directory and not already ending with '/', add a '/'
            const completion = match.slice(searchName.length) + (matchIsDirectory && !pathToComplete.endsWith('/') ? '/' : '');

            // Update pathToComplete only with missing parts
            pathToComplete = pathToComplete + completion;
        } else if (possibleCompletions.length > 1) {
            // Log or handle multiple options appropriately
            console.log('Possible completions:', possibleCompletions.join(', '));
        }
    }

    // Update terminal state with the new input buffer
    terminalState.inputBuffer = `${inputParts.join(' ')} ${pathToComplete}`.trim();
}
