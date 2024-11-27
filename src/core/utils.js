export function navigateTo(path, fileSystem) {
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(part => part.length > 0);

    let currentDir = fileSystem;
    for (const part of parts) {
        if (currentDir && typeof currentDir === 'object' && part in currentDir) {
            currentDir = currentDir[part];
        } else {
            return undefined; // Returns undefined if part doesn't exist in directory
        }
    }
    return currentDir;
}


export function scrollToBottom(terminal) {
    terminal.scrollTop = terminal.scrollHeight;
}

export function isValidPath(path, fileSystem) {
    if (typeof path !== 'string' || !path) return false;
    return !!navigateTo(path, fileSystem);
}

export function getDirectoryAndFileName(path, fileSystem) {
    const parts = path.split('/');
    const fileName = parts.pop();
    let dirPath = parts.join('/');
    if (!dirPath) dirPath = '/';

    const directory = navigateTo(dirPath, fileSystem);
    return { directory, fileName };
}

export function normalizePath(path) {
    const parts = path.split('/');
    const stack = [];

    for (const part of parts) {
        if (part === '..') {
            if (stack.length > 0) stack.pop();
        } else if (part && part !== '.') {
            stack.push(part);
        }
    }

    return '' + stack.join('/');
}

