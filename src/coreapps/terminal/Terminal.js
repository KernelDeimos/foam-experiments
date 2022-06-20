foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'Terminal',
    extends: 'com.ericdube.coreapps.BaseApp',

    axioms: [
        { class: 'com.ericdube.lang.CommandProvider' }
    ],

    requires: [
        'foam.core.StringHolder',
        'com.ericdube.coreapps.terminal.AdaptSink',
        'com.ericdube.coreapps.terminal.QuickProxySink',
        'com.ericdube.coreapps.terminal.TerminalProgram'
    ],

    exports: [
        'logger'
    ],

    properties: [
        {
            name: 'view',
            value: 'com.ericdube.coreapps.terminal.TerminalView'
        },
        {
            class: 'FObjectArray',
            of: 'foam.core.FObject',
            name: 'buffer'
        },
        {
            class: 'String',
            name: 'inputValue'
        },
        {
            name: 'logger',
            factory: function () {
                return {
                    error: (o) => {
                        this.buffer$push(this.adaptLog_(o));
                    },
                    log: o => {
                        this.buffer$push(this.adaptLog_(o));
                    }
                }
            }
        },
        {
            class: 'String',
            name: 'prompt',
            getter: function () {
                if ( ! this.instance_.prompt ) {
                    this.instance_.prompt = '[terminal]$ ';
                }
                // Replace spaces with a character that won't be removed
                return this.instance_.prompt.replace(' ', ' ');
            }
        },
        {
            class: 'FObjectProperty',
            name: 'outerInputSink',
            documentation: 'terminal input goes here',
            factory: function () {
                let sink = foam.dao.ProxySink.create({
                    delegate$: this.innerInputSink$
                });
                sink = this.QuickProxySink.create({
                    putFn: o => {
                        this.pushLine(this.prompt + o.toString());
                    },
                    delegate: sink
                });
                sink = this.AdaptSink.create({ delegate: sink });
                return sink;
            }
        },
        {
            class: 'FObjectProperty',
            name: 'innerInputSink',
            documentation: 'setting this redirects terminal input',
            factory: function () {
                return foam.dao.QuickSink.create({
                    putFn: o => this.enter_(o)
                });
            }
        },
        {
            class: 'FObjectProperty',
            name: 'outputSink',
            documentation: 'this sink directly updates the terminal buffer',
            factory: function () {
                return this;
            }
        }
    ],

    methods: [
        function pushLine (o) {
            this.buffer$push(this.adaptLog_(o));
        },
        function put (o) {
            this.buffer$push(o);
        },
        function adaptLog_(o) {
            if ( typeof o === 'string' ) {
                return this.StringHolder.create({ value: o });
            }
            return o;
        },
        function enter_(o) {
            let line = o.toString();

            // // this.pushLine('[terminal]$ ' + line);
            // this.pushLine(this.prompt + line);
            
            const tokens = line.split(' ');
            const cmd = tokens.shift();

            // Terminal commands
            // TODO: terminal needs to create its own processCommand fn,
            //   so that scripts can use builtins like "clear"
            if ( cmd === 'clear' ) {
                this.buffer = [];
                return;
            }

            // this.__subContext__.processCommand(this.__subContext__, { cmd, tokens })
            this.processCommand(this.__subContext__, { cmd, tokens })
        }
    ],

    actions: [
        function enter () {
            let line = this.inputValue;
            this.inputValue = '';
            this.outerInputSink.put(line);
        }
    ],
    
    commands: [
        {
            name: 'eval',
            code: function jseval (x, args) {
                const ctx = {
                    console: x.logger
                };
                let returnValue = undefined;
                with ( ctx ) {
                    returnValue = eval(args.tokens.join(' '));
                }
                x.logger.log(returnValue);
            }
        },
        {
            name: 'testProg',
            code: async function testProg (x, args) {
                x = x.createSubContext({
                    outputSink: this.outputSink
                });
                const p = this.TerminalProgram.create({}, x);
                this.innerInputSink = p.inputSink;
                let oldPrompt = this.prompt;
                this.prompt = `testProg> `;
                await p.execute();
                this.prompt = oldPrompt;
                this.clearProperty('innerInputSink');
            }
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'TerminalView',
    extends: 'foam.u2.View',

    imports: [
        'window?',
        'borderColor'
    ],

    css: `
        ^ {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }
        ^buffer > * {
            padding: 0 3pt;
        }
        ^buffer * {
            font-family: monospace;
            line-height: 16pt;
            font-size: 10pt;
        }
        ^promptWrapper {
            display: flex;
            padding: 0 3pt;
        }
        ^inputBar {
            flex-grow: 1;
            background-color: rgba(0,0,0,0.5);
            border: none;
            color: #EEE;
            letter-spacing: inherit;
        }
        ^inputBar, ^promptText, ^promptText * {
            font-family: monospace;
            line-height: 16pt;
            font-size: 10pt;
        }
    `,

    methods: [
        function render () {
            const self = this;

            this
                .addClass()
                .add(this.data.buffer$.map(function (buffer) {
                    return self.E()
                        .addClass(self.myClass('buffer'))
                        .forEach(buffer, function (o) {
                            this.start().add(o.toTerminalE({}, this)).end();
                        })
                }))
                .start()
                    .addClass(this.myClass('promptWrapper'))
                    .start()
                        .addClass(this.myClass('promptText'))
                        // .add('[terminal]$ ')
                        .add(this.data.prompt$)
                    .end()
                    .start('input')
                        .call(function () {
                            this.attrSlot(null, 'input').linkFrom(self.data.inputValue$);
                            this.onDetach(self.data.windowActive.sub(() => {
                                this.focus();
                            }));
                        })
                        .addClass(this.myClass('inputBar'))
                        .on('keydown', function (evt) {
                            if ( evt.code == 'Enter' && ! evt.shiftKey ) {
                                self.data.enter();
                            }
                        })
                    .end()
                .end()
                ;
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'TerminalProgram',

    imports: [
        'outputSink as importedOutputSink'
    ],

    requires: [
        'com.ericdube.coreapps.terminal.BufferedSink',
        'com.ericdube.coreapps.terminal.AdaptSink'
    ],

    properties: [
        {
            name: 'outputSink',
            factory: function () {
                return this.AdaptSink.create({ delegate: this.importedOutputSink });
            }
        },
        {
            name: 'inputSink',
            factory: function () {
                return this.BufferedSink.create();
            }
        }
    ],

    methods: [
        async function execute() {
            this.outputSink.put('Hello there! Enter your name:');
            let name = await this.inputSink.waitNext();
            this.outputSink.put('Your name is: ' + name);
        }
    ]
});
