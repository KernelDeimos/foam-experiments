foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'WindowButton',
    extends: 'foam.u2.Element',
    css: `
        ^ {
            padding: 0 5pt;
            line-height: 20pt;
        }
        ^:hover {
            background-color: rgba(255,255,255,0.4);
            cursor: pointer;
        }
    `,
    properties: [
        {
            class: 'String',
            name: 'label'
        }
    ],
    methods: [
        function render () {
            this.addClass();
            this.add(this.label)
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'TileWindowManager',
    extends: 'foam.u2.Controller',

    axioms: [
        { class: 'com.ericdube.lang.CommandProvider' }
    ],

    exports: [
        'as windowManager'
    ],

    requires: [
        ...[
            'Window', 'Container',
            'WindowButton',
            'InputMode',
        ].map(name => `com.ericdube.wm.${name}`)
    ],

    // topics: ['newWindow'],

    css: `
        BODY {
            margin: 0;
            padding: 0;
        }

        * {
            font-family: Helvetica;
        }

        ^ {
            background-color: #333;
            display: flex;
            width: 100vw;
            height: 100vh;
            justify-contents: stretch;
            align-items: stretch;
            display: flex;
            flex-grow: 1;
            flex-direction: column;
        }
        ^header {
            flex-basis: 20pt;
            display: flex;
            padding: 0 10pt;
            line-height: 24pt;
            background-color: #000;
            color: #DDD;
        }
        ^modeIndicator {
            padding: 0 5pt;
            margin-left: 5pt;
            text-align: center;
        }
        ^modeIndicator > span {
            font-family: monospace;
            font-size: 9pt;
        }
        ^windowmgr {
            flex-grow: 1;
            display: flex;
            gap: 10pt;
            padding: 10pt;
        }
        ^container {
            flex-grow: 1;
            display: flex;
            gap: 10pt;
        }
        ^container.ready {
            padding: 2pt;
            border: 1px solid #7DD;
        }
        ^container.active {
            outline: 2px solid #7DD;
        }
        ^window {
            flex-grow: 1;
            border-radius: 4pt;
            border: 2px solid #555;
            background-color: rgba(0,0,0,0.5);
            color: #EEE;
            overflow: hidden;
        }
        ^window.selected {
            border-color: #777;
        }
        ^window.active {
            border-color: #ffdb58;
        }
        ^window-navbar {
            height: 20pt;
            display: flex;
            background-color: #7f6400;
        }
    `,

    properties: [
        {
            name: 'activeWindow',
            postSet: function (o, n) {
                if ( ! n ) debugger;
                let i;
                this.removeFromActiveStack_(n);
                this.activeStack$push(n);
            }
        },
        {
            name: 'activeNode'
        },
        {
            class: 'FObjectArray',
            of: 'com.ericdube.wm.Window',
            name: 'activeStack'
        },
        {
            name: 'activeContainer',
            postSet: function (o, n) {
                if ( ! this.rootContainer ) this.rootContainer = n;
            }
        },
        'rootContainer',
        {
            name: 'windows',
            getter: function () {
                const nodes = [];
                const getChildren = (container) => {
                    for ( let node of container.wmNodes ) {
                        if ( this.Container.isInstance(node) ) {
                            getChildren(node);
                            continue;
                        }
                        nodes.push(node);
                    }
                };
                getChildren(this.rootContainer);
                return nodes;
            }
        },
        {
            class: 'Class',
            name: 'defaultApp'
        },
        {
            class: 'Enum',
            of: 'com.ericdube.wm.InputMode',
            name: 'inputMode',
            value: com.ericdube.wm.InputMode.NORMAL
        },
        {
            class: 'String',
            name: 'title',
            value: 'Userspace OS'
        }
    ],

    methods: [
        function init () {
            console.log('WM', this);
        },
        function render () {
            const self = this;
            this.rootContainer = this.activeContainer = this.Container.create();
            this
                .on('keydown', this.onKeyDown)
                .attrs({ tabindex: 0 })
                .addClass()
                .start()
                    .addClass(this.myClass('header'))
                    .add(this.title$)
                    .start()
                        .addClass(this.myClass('modeIndicator'))
                        .add(this.inputMode$.map(mode => mode.label))
                        .style({
                            'background-color': this.inputMode$.dot('background')
                        })
                    .end()
                .end()
                .start()
                    .addClass(this.myClass('windowmgr'))
                    .add(this.rootContainer.createElement({}))
                    // .start()
                    //     .addClass(this.myClass('window'))
                    //     .add('test')
                    // .end()
                .end()
                ;
            
            // Open unclosable default window
            const app = this.defaultApp.create({}, this.__subContext__);
            const window = this.Window.create({
                view: app.view, data: app,
                closable: false
            });
            this.addWindow(window);
        },
        function newTerminal () {
            console.log('defaultApp', this.defaultApp)
            const app = this.defaultApp.create({}, this.__subContext__);
            const window = this.Window.create({
                view: app.view,
                data: app
                // view: {
                //     class: 'foam.u2.view.ValueView'
                // },
                // data: foam.u2.Element.NEXT_ID()
            });
            this.addWindow(window);
            // const container = this.activeContainer;
            // const element = this.E()
            //     .addClass(this.myClass('window'))
            // element.add(element.id)
            // const window = this.Window.create({ container, element });
            // container.addWindow(window);
            // // this.pub('newWindow', window)
            // this.newWindow(window);
        },
        function addWindow (window) {
            const container = this.activeContainer;
            const element = this.E()
                .addClass(this.myClass('window'))
                .start()
                    .addClass(this.myClass('window-navbar'))
                    .start(this.WindowButton, { label: 'X' })
                        .on('click', () => {
                            this.removeWindow(window);
                        })
                    .end()
                .end()
                .tag(window.view, { data$: window.data$ })
                ;
            window.element = element;
            container.addWindow(window);
            this.focusWindow(window);
        },
        function removeFromActiveStack_(n) {
            while ( (i = this.activeStack.indexOf(n)) != -1 ) {
                this.activeStack.splice(i, 1);
            }
        },
        function popActiveStack() {
            this.activeStack.pop();
            const win = this.activeStack[this.activeStack.length - 1];
            console.log('tried to focus...', win.id)
            if ( win ) this.focusWindow(win);
            else if ( this.windows.length > 0 ) this.focusWindow(this.windows[0]);
        },
        // function moveLeft() {
        //     const win = this.activeWindow;
        //     const previous = win.container.getPrevious(win);
        //     if ( previous )
        //     const otherWin = evt.code == 'ArrowLeft'
        //         ? win.container.getPrevious(win)
        //         : win.container.getNext(win);
        //     if ( ! otherWin ) {}
        //     else this.focusWindow(otherWin);
        // },
        function activateNeighbour(startWin, reverse, vertical) {
            // find applicable container
            let node = startWin;
            let container = startWin.container;
            while ( true ) {
                if ( container.vertical == vertical ) {
                    let nextNode = reverse ? container.getPrevious(node)
                        : container.getNext(node) ;
                    if ( nextNode ) {
                        const otherWin = this.Container.isInstance(nextNode)
                            ? nextNode.getSelectedWindow()
                            : nextNode;
                        if ( ! otherWin ) {
                            console.warn('did not expect this');
                            debugger;
                            break;
                        }
                        console.log('yay', otherWin, { startWin, node, container });
                        this.focusWindow(otherWin);
                        break;
                    }
                }
                if ( container == this.rootContainer ) {
                    console.log('ding! (case 1)')
                    break;
                }
                node = container;
                container = container.container;
            }
            
            console.log('loop end');
        },
        function removeRedundantContainers_(container) {
            const replacement = container.wmNodes.length == 1 &&
                this.Container.isInstance(container.wmNodes[0]) &&
                container.wmNodes[0];
            if ( replacement ) {
                if ( this.rootContainer === container ) {
                    this.rootContainer = replacement;
                } else {
                    container.container.swapNode(container, replacement);
                }
            }
            for ( const node of container.wmNodes ) {
                if ( ! this.Container.isInstance(node) ) continue;
                this.removeRedundantContainers_(node);
            }
        }
    ],

    listeners: [
        function onKeyDown(evt) {
            // if ( evt.code == 'KeyN' && evt.shiftKey ) {
            //     this.newTerminal();
            // }
            if ( evt.code == 'ArrowLeft' && evt.ctrlKey && evt.shiftKey ) {
                const window = this.activeWindow;
                if ( ! window.container.movePrevious(window) ) {
                    // if ( ! window.container.parent ) return
                    // window.container.removeWindow(window)
                    // window.container.parent.addWindow(window)
                };
            }
            if ( evt.code == 'ArrowRight' && evt.ctrlKey && evt.shiftKey ) {
                const window = this.activeWindow;
                if ( ! window.container.moveNext(window) ) {
                    // if ( ! window.container.parent ) return
                    // window.container.removeWindow(window)
                    // window.container.parent.addWindow(window)
                };
            }
            const bindings = ({
                [this.InputMode.NORMAL.name]: [
                    ['KeyI!', false, false, () => { this.inputMode = this.InputMode.INSERT }],
                    ['KeyN!', false, false, () => this.newTerminal()],
                    ['ArrowLeft|ArrowRight', true, false, evt => {
                        const reverse = evt.code == 'ArrowLeft';
                        this.activateNeighbour(this.activeWindow, reverse, false);
                    }],
                    ['ArrowUp|ArrowDown', true, false, evt => {
                        const reverse = evt.code == 'ArrowUp';
                        this.activateNeighbour(this.activeWindow, reverse, true);
                    }],
                    ['KeyC!', false, false, () => {
                        this.createNewContainer();
                    }],
                    ['KeyS!', false, false, () => {
                        this.activeWindow.container.vertical =
                            ! this.activeWindow.container.vertical;
                    }],
                    // ['ArrowLeft|ArrowRight', true, false, evt => {
                    //     const win = this.activeWindow;
                    //     const otherWin = evt.code == 'ArrowLeft'
                    //         ? win.container.getPrevious(win)
                    //         : win.container.getNext(win);
                    //     if ( ! otherWin ) {}
                    //     else this.focusWindow(otherWin);
                    // }],
                    ['KeyQ!',false,false,() => {
                        if ( ! this.activeWindow.closable ) return;
                        this.removeWindow(this.activeWindow);
                    }],
                    ['KeyA!',false,false,() => {
                        const win = this.activeWindow;
                        if ( ! win.container ) return;
                        this.focusWindow(win.container);
                    }]
                ],
                [this.InputMode.INSERT.name]: [
                    ['Escape!', false, false, () => { this.inputMode = this.InputMode.NORMAL }],
                ]
            })[this.inputMode.name];
            for ( const binding of bindings ) {
                let spec = binding[0];
                let preventDefault = false;
                if ( spec.endsWith('!') ) {
                    spec = spec.slice(0, -1);
                    preventDefault = true;
                }
                const applies = spec.split('|').includes(evt.code)
                    && binding[1] == evt.ctrlKey && binding[2] == evt.shiftKey;
                if ( ! applies ) continue;
                binding[3](evt);
                if ( preventDefault ) evt.preventDefault();
            }
        },
        function focusWindow(win) {
            // for ( let otherWin of this.windows ) {
            //     if ( otherWin === win ) continue;
            //     otherWin.element.removeClass('active');
            // }
            if ( ! win ) {
                console.warn('tried to focus null window');
                debugger;
                return;
            }
            
            if ( this.activeWindow ) {
                this.activeWindow.element.removeClass('active');
                this.activeWindow.active = false;
            }
            this.activeWindow = win;
            this.activeNode = win;
            this.activeWindow.active = true;
            this.activeStack$push(this.activeWindow);

            this.activeContainer = this.activeWindow.container;
        },
        function removeWindow(win) {
            this.removeFromActiveStack_(win);
            let container = win.container;
            container.removeNode(win);
            // while ( container.wmNodes.length == 0 && container.container ) {
            //     container.container.removeNode(container);
            // }
            if ( this.activeWindow === win ) {
                console.log('removing active window')
                this.popActiveStack();
            } else {
                // ???: wonder if theres a better solution than re-focus
                this.focusWindow(this.activeWindow);
            }
            if ( container.wmNodes.length == 0 && container.container ) {
                this.activeContainer = container.container;
                this.removeWindow(container);
            }
            // TODO: maybe optimize this by providing a more specific container
            this.removeRedundantContainers_(this.rootContainer);
        },
        function createNewContainer() {
            const win = this.activeWindow;
            const parentContainer = win.container;

            // don't create container if there is only one window
            if ( parentContainer.wmNodes.length == 1 ) return;

            const newContainer = this.Container.create();
            parentContainer.swapNode(win, newContainer);
            newContainer.addNode(win);
            this.activeContainer = newContainer;
            this.focusWindow(win);
        },
        
        // --- as windowManager
        function createWindowElement({ win }) {
            return this.E()
                .addClass(this.myClass('window'))
                .on('click', () => {
                    this.focusWindow(win);
                })
                .start()
                    .addClass(this.myClass('window-navbar'))
                    .start(this.WindowButton, { label: 'X' })
                        .show(win.closable$)
                        .on('click', evt => {
                            this.removeWindow(win);
                            evt.stopPropagation();
                        })
                    .end()
                .end()
                ;
        },
        function createContainerElement({ container }) {
            return this.E().addClass(this.myClass('container'));
        }
    ],

    commands: [
        function test (x, args) {
            x.logger.log(JSON.stringify(args))
        },
        function open (x, args) {
            const appCls = this.defaultApp;

            const app = appCls.create({}, this.__subContext__);
            const window = this.Window.create({
                view: app.view,
                data: app
            });
            this.addWindow(window);
        },
        function wmdebug (x, args) {
            const appCls = com.ericdube.coreapps.WMDebugger;

            const app = appCls.create({}, this.__subContext__);
            const window = this.Window.create({
                view: app.view,
                data: app
            });
            this.addWindow(window);
        },
        function containerme () {
            const win = this.activeWindow;
            const parentContainer = win.container;
            const newContainer = this.Container.create();
            parentContainer.swapNode(win, newContainer);
            newContainer.addNode(win);
            this.activeContainer = newContainer;
            this.focusWindow(win);
        }
    ]
});
