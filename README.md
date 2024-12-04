# About

# Dependencies

- `node`
- `npm` 
    - `dotenv`
    - `http-server`

# Install

1. clone the repository:
```
git clone https://git@github.com/ximenesyuri/xtermy your/favorite/location
```
2. install `dotenv` and `http-server`:
```
cd your/favorite/location
npm install
```

# Build and  Run

```
process           command
---------------------------------
build             npm run build
run               npm run start
```

# Configuration

The configuration is made through environment variables defined in `.local.env`. Make a copy of it:
```
cp .local.env .env
```

They appear in two contexts:

1. setting the terminal file system
2. setting the terminal style

## File System

`termyx` uses a file system defined in a `fs.json` file, as follows:

```json
{
    "envs": {
        "SOME_ENV": "env value",
        "OTHER_ENV": "other env value",
        ...
    },
    "filesystem": {
        "some-dir" {
            "some-subdir" {
                "some-file.txt": "file content",
                ...
            },
            ...
        },
        ...
    }
}
```

You can set a `filesystem` directory and a `env` file which will be used in the build process to automatically generate the `fs.json`:

```
env                     meaning                            
-----------------------------------------------------------------------------------
TERMYX_FS_DIR           directory to be used as file system in fs.json 
TERMYX_ENV_FILE         file with environment variables to be used in fs.json
```

> **OBS.** If some of the above envs was not set, a default `fs.json` will be used, which tries to mimic UNIX's structure

## Terminal Style

You can also set some structural parts of the `html` and one of the existing terminal themes.

```
env                     meaning                            default
-----------------------------------------------------------------------------
TERMYX_INTRO            text before the prompt             the termyx ascii
TERMYX_TITLE            metatitle of the page              termyx
TERMYX_THEME            terminal theme to be used          basic
```

> **OBS.** Alternatively, you can create your own custom theme, as below, by passing its path as the value of `TERMYX_THEME`.

```json
{
  "background": "0c0c0c",
  "foreground": "bfbfbf",
  "directories": "00ff00",
  "files": "bfbfbf",
  "intro": "bfbfbf",
  "prompt": "bfbfbf",
  "input": "bfbfbf",
  "cursor": "bfbfbf",
  "output": "bfbfbf",
  "error": "ff6666"
}
```
