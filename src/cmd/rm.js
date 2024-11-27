import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function rm(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `rm: missing file operand`;
    }

    const [option, targetArg] = args.split(/\s+/);
    const recursive = option === '-r';
    const actualTarget = recursive ? targetArg : option;

    // Determine target path
    const targetPath = actualTarget.startsWith('/') ? actualTarget : `${terminalState.currentPath}/${actualTarget}`;
    const { directory: targetParentDir, fileName: targetName } = getDirectoryAndFileName(targetPath, fileSystem);

    if (!targetParentDir || !(targetName in targetParentDir)) {
        return `rm: cannot remove '${actualTarget}': No such file or directory`;
    }

    const targetObj = targetParentDir[targetName];

    if (typeof targetObj === 'object' && !recursive) {
        return `rm: cannot remove '${actualTarget}': Is a directory`;
    }

    delete targetParentDir[targetName];
    return '';
}

