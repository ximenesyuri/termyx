import { navigateTo } from '../core/utils.js';
import { normalizePath } from '../core/utils.js';

export function cd(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `cd: missing directory argument`;
    }

    const pathArg = args[0];
    const pathToNavigate = pathArg.startsWith('/')
        ? pathArg // Absolute path
        : `${terminalState.currentPath}/${pathArg}`; // Relative path

    const normalizedPath = normalizePath(pathToNavigate);
    const targetDir = navigateTo(normalizedPath, fileSystem);

    if (targetDir !== undefined && typeof targetDir === 'object') {
        terminalState.currentPath = normalizedPath;
        return ''; // Successfully changed directory
    }
    return `cd: no such file or directory: ${pathArg}`;
}

