import { navigateTo } from '../core/utils.js';

export function ls(args, terminalState, fileSystem) {
    // Determine the path from the arguments or default to currentPath
    const path = args.length > 0 && args[0] ? args[0] : '.';
    const { currentPath } = terminalState;
    const fullPath = path === '.' ? currentPath : (path.startsWith('/') ? path : `${currentPath}/${path}`);
    
    // Navigate to the desired directory
    const dir = navigateTo(fullPath, fileSystem);
    
    // Validate the directory and list contents
    if (dir && typeof dir === 'object') {
        return Object.keys(dir).map(entry => {
            return typeof dir[entry] === 'object'
                ? `<span class="dir">${entry}</span>`
                : entry;
        }).join(' ');
    }
    
    // Error message if the path did not resolve to a directory
    return `ls: cannot access '${fullPath}': No such file or directory`;
}
