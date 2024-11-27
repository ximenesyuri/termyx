import { navigateTo, getDirectoryAndFileName } from '../core/utils.js';

export function cp(args, terminalState, fileSystem) {
    if (!args || args.length < 1) {
        return `cp: missing file operands`;
    }

    const parsedArgs = args.split(/\s+/);
    let recursive = false;
    let source = parsedArgs[0];
    let destination = parsedArgs[1];

    if (source === '-r' && parsedArgs.length > 2) {
        recursive = true;
        source = parsedArgs[1];
        destination = parsedArgs[2];
    }

    const { currentPath } = terminalState;

    const sourcePath = source.startsWith('/') ? source : `${currentPath}/${source}`;
    const destinationPath = destination.startsWith('/') ? destination : `${currentPath}/${destination}`;

    const sourceObj = navigateTo(sourcePath, fileSystem);

    if (!sourceObj) {
        return `cp: cannot stat '${source}': No such file or directory`;
    }

    const destParentDir = navigateTo(destinationPath.replace(/\/[^/]+$/, ''), fileSystem);

    if (!destParentDir) {
        return `cp: target '${destination}' is not a directory`;
    }

    const destinationName = destinationPath.split('/').pop();

    function recursiveCopy(obj) {
        if (typeof obj === 'object') {
            const copy = {};
            for (const key in obj) {
                copy[key] = recursiveCopy(obj[key]);
            }
            return copy;
        }
        return obj;
    }

    if (recursive || typeof sourceObj !== 'object') {
        destParentDir[destinationName] = recursiveCopy(sourceObj);
        return '';
    } else {
        return `cp: omitting directory '${source}'. Use '-r' to copy directories.`;
    }
}
