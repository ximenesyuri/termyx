const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const directoryToTraverse = process.env.TERMYX_FS_DIR;
const pathToEnvFile = process.env.TERMYX_ENV_FILE;
const prompt = process.env.TERMYX_PROMPT;
const outputPath = path.resolve('./dist');
const introText = (process.env.TERMYX_INTRO || '').replace(/\\n/g, '<br>');
const title = process.env.TERMYX_TITLE || 'termyx';
const theme = process.env.TERMYX_THEME;
const themesDirectory = path.resolve('./themes');

function createOrCleanDirSync(dirPath) {
    const resolvedPath = path.resolve(dirPath);
    try {
        const stats = fs.statSync(resolvedPath);
        if (!stats.isDirectory()) {
            throw new Error(`The path exists and is not a directory: ${resolvedPath}`);
        }
        const files = fs.readdirSync(resolvedPath);
        for (const file of files) {
            const filePath = path.join(resolvedPath, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.mkdirSync(resolvedPath, { recursive: true });
        } else {
            console.error(`Error handling path ${resolvedPath}: ${error.message}`);
        }
    }
}

function copyDirectorySync(source, destination) {
    try {
        fs.cpSync(source, destination, { recursive: true });
    } catch (error) {
        console.error(`Error copying directory: ${error.message}`);
    }
}

function readDirectorySync(dirPath) {
    const directoryContents = {};
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.resolve(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            directoryContents[dirent.name] = readDirectorySync(fullPath);
        } else if (dirent.isFile()) {
            directoryContents[dirent.name] = fs.readFileSync(fullPath, 'utf-8');
        }
    });
    return directoryContents;
}

function generateFileSystemJson() {
    if (directoryToTraverse && pathToEnvFile) {
        const envContent = dotenv.parse(fs.readFileSync(pathToEnvFile));
        const filesystemStruct = readDirectorySync(directoryToTraverse);

        const resultJson = {
            envs: envContent,
            filesystem: filesystemStruct
        };
        fs.writeFileSync(path.join(outputPath, 'filesystem.json'), JSON.stringify(resultJson, null, 2));
        console.log('filesystem.json has been created!');
    } else {
        const sourcePath = path.resolve('assets/filesystem.json');
        if (fs.existsSync(sourcePath)) {
            const destPath = path.join(outputPath, 'filesystem.json');
            fs.copyFileSync(sourcePath, destPath);
            console.log('Using existing filesystem.json from assets/');
        } else {
            console.error('Error: No directories specified and assets/filesystem.json not found.');
        }
    }
}

function generateAssets() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <script type="module" src="index.js"></script>
    <div id="terminal"
         data-intro-text="${introText}"
         data-prompt="${prompt}"
         data-filesystem-path="filesystem.json"
         data-start-path="/">
    </div>
</body>
</html>`;

    const cssContent = `
body {
    background-color: #${cssBg};
    color: #${cssFg};
    font-family: "Courier New", Courier, monospace;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.terminal {
    padding: 15px;
    height: 90vh;
    overflow-y: auto;
    box-sizing: border-box;
    white-space: pre-wrap;
}

h1 {
    color: #00ff00;
}

a {
    color: #57f7ff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    padding: 5px 0;
    color: #c0c0c0;
}

.prompt  {
    color: #${cssPrompt};
    display: inline;
    line-height: 25px;
    visibility: visible;
}

.input-line {
    color: #${cssInput};
    display: inline;
    line-height: 25px;
    visibility: visible;
}

.intro-text {
    color: #${cssIntro};
}

.dir {
    color: #${cssDir};
}

.file {
    color: #${cssFile};
}


a:hover {
    text-decoration: underline;
}

.cursor {
    height: 17.5px;
    background-color: #${cssCursor};
    animation: blink 1s steps(1) infinite;
    display: inline-block;
    width: 8px;
}

@keyframes blink {
    50% { background-color: transparent; }
}

.output {
    color: #${cssOutput};
}

.error {
    color: #${cssError};
}
`;

    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlContent);
    fs.writeFileSync(path.join(outputPath, 'styles.css'), cssContent);
    console.log('HTML and CSS files have been created.');
}

function loadTheme() {
    let themePath;

    if (theme) {
        if (fs.existsSync(theme)) {
                themePath = path.resolve(theme);
        } else {
            themePath = path.join(themesDirectory, `${theme}.json`);
        }
    } else {
        themePath = path.join(themesDirectory, `basic.json`);
    }
    console.log(themePath)
    try {
        if (fs.existsSync(themePath)) {
            const themeContent = fs.readFileSync(themePath, 'utf-8');
            const theme = JSON.parse(themeContent);
            return {
                cssBg: theme.background || cssBg,
                cssFg: theme.foreground || cssFg,
                cssDir: theme.directories || cssDir,
                cssFile: theme.files || cssFile,
                cssIntro: theme.intro || cssIntro,
                cssPrompt: theme.prompt || cssPrompt,
                cssInput: theme.input || cssInput,
                cssCursor: theme.cursor || cssCursor,
                cssOutput: theme.output || cssOutput,
                cssError: theme.error || cssError,
            };
        } else {
            console.warn(`Warning: Theme file not found: ${themePath}`);
        }
    } catch (error) {
        console.error("Error loading theme:", error);
    }
    return {};
}

createOrCleanDirSync(outputPath);
copyDirectorySync(path.resolve('./src'), outputPath)

const {
    cssBg,
    cssFg,
    cssDir,
    cssFile,
    cssIntro,
    cssPrompt,
    cssInput,
    cssCursor,
    cssOutput,
    cssError
} = loadTheme();

generateFileSystemJson();
generateAssets();
