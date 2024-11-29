import { navigateTo } from '../core/utils.js';

export function ls(args, terminalState, fileSystem) {
    const path = args.length > 0 && args[0] ? args[0] : '.';
    const { currentPath } = terminalState;
    const fullPath = path === '.' ? currentPath : (path.startsWith('/') ? path : `${currentPath}/${path}`);
    
    const dir = navigateTo(fullPath, fileSystem);
    
    if (dir && typeof dir === 'object') {
        return Object.keys(dir).map(entry => {
            const isDirectory = typeof dir[entry] === 'object';
            const entryClass = isDirectory ? 'dir' : 'file';
            return `<span class="${entryClass}">${entry}</span>`;
        }).join(' ');
    }
    
    return `ls: cannot access '${fullPath}': No such file or directory`;
}
