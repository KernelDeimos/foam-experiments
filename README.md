## Building and Running

### Note about required FOAM version
This repository is built using the FOOBAR build system, which is currently only
available in its development branch (NP-7064/PureNodeBuild).

You may wish to rebase a local copy of NP-7064/PureNodeBuild onto the branch
"development" to test against the latest features in FOAM.

### Build with FOOBAR

```
npm install
node node_modules/foam3/tools/foobar
```

### Run

```
./run.sh
```

Note: run will be moved to foobar in the future.


## Where are things?

### /src/jrls

- a spid called ericdube (going to rename it - haven't yet)
- a menu called ericdube.home which launches the tiling window manager
  - the menu also specifies the "default app" of the WM, which is the terminal

### src/lang

- The `commands` axiom
- Refinements for `toTerminalE` (TODO: move to coreapps/terminal)
- FObjectHistory subclass of Property

### src/wm

- The window manager
- Some keybind stuff that isn't used yet

### coreapps

- Apps made for the window manager
- coreapps/terminal
- `wmdebug` app, which helps debug the tiling window manager
