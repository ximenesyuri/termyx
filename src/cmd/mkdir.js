import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function mkdir(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `mkdir: missing directory name argument`;
    }

    const { currentPath } = terminalState;
    const targetPath = args[0].startsWith('/') ? args[0] : `${currentPath}/${args[0]}`;
    const { directory, fileName: newDirName } = getDirectoryAndFileName(targetPath, fileSystem);

    if (directory && typeof directory === 'object') {
        if (newDirName in directory) {
            return `mkdir: cannot create directory '${newDirName}': File exists`;
        }
        directory[newDirName] = {};  // Create the directory
        return '';
    }
    return `mkdir: cannot create directory: No such file or directory`;
}
