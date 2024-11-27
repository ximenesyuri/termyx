import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function cat(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `cat: missing file operand`;
    }

    const { currentPath } = terminalState;
    const filePath = `${currentPath}/${args[0]}`;
    const { directory, fileName } = getDirectoryAndFileName(filePath, fileSystem);

    if (directory && typeof directory === 'object' && fileName in directory) {
        const fileContent = directory[fileName];
        return typeof fileContent === 'string' ? fileContent : `cat: ${args[0]}: Is a directory`;
    }

    return `cat: ${args[0]}: No such file or directory`;
}
