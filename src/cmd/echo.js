import { navigateTo } from '../core/utils.js';

export function echo(args, terminalState, fileSystem) {
    // Ensure args is an array
    if (!Array.isArray(args)) {
        console.error("Unexpected args format in echo command:", args);
        return "echo: internal error";
    }

    const currentPath = terminalState.currentPath;
    const input = args.join(' ');

    const match = input.match(/^(['"]?)(.*?)\1\s*(>+)\s*(\S+)?$/);
    if (match) {
        const [, , content, redirectType, fileName] = match;
        if (!fileName) {
            return `echo: missing file operand`;
        }

        const dir = navigateTo(currentPath, fileSystem);
        if (!dir || typeof dir !== 'object') {
            return `echo: cannot write to file: Directory does not exist`;
        }

        if (redirectType === '>') {
            dir[fileName] = content;
        } else if (redirectType === '>>') {
            dir[fileName] = (dir[fileName] || '') + content;
        }
        return '';
    }

    return args.map(arg => arg.replace(/^(['"])(.*)\1$/, '$2')).join(' ');
}

