import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function mv(args, terminalState, fileSystem) {
    if (!args || args.length < 2) {
        return `mv: missing file or destination operand`;
    }

    const [sourceArg, destinationArg] = args.split(/\s+/);
    
    // Determine source path
    const sourcePath = sourceArg.startsWith('/') ? sourceArg : `${terminalState.currentPath}/${sourceArg}`;
    const { directory: sourceParentDir, fileName: sourceName } = getDirectoryAndFileName(sourcePath, fileSystem);
    const sourceObj = sourceParentDir && sourceParentDir[sourceName];

    if (!sourceObj) {
        return `mv: cannot stat '${sourceArg}': No such file or directory`;
    }

    // Determine destination path
    const destinationPath = destinationArg.startsWith('/') ? destinationArg : `${terminalState.currentPath}/${destinationArg}`;
    const { directory: destParentDir, fileName: destinationName } = getDirectoryAndFileName(destinationPath, fileSystem);

    if (!destParentDir) {
        return `mv: cannot move to '${destinationArg}': Invalid destination path`;
    }

    // Handle the actual move
    if (destParentDir[destinationName] !== undefined) {
        if (typeof destParentDir[destinationName] === 'object' && typeof sourceObj === 'object') {
            destParentDir[destinationName] = { ...destParentDir[destinationName], [sourceName]: sourceObj };
        } else {
            return `mv: cannot overwrite non-directory '${destinationName}' with directory`;
        }
    } else {
        destParentDir[destinationName] = sourceObj;
    }

    delete sourceParentDir[sourceName];
    return '';
}
