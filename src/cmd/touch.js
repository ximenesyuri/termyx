import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function touch(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `touch: missing file name argument`;
    }

    const { currentPath } = terminalState;
    const { directory, fileName } = getDirectoryAndFileName(`${currentPath}/${args[0]}`, fileSystem);

    if (directory && typeof directory === 'object') {
        directory[fileName] = '';  // Create a file if it doesn't exist or empty contents if it does
        return '';
    }
    return `touch: cannot create file: No such file or directory`;
}

