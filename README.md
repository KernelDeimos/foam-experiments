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
