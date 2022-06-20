foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'Command',
    extends: 'foam.core.Listener',
    documentation: `
        A foam.core.Listener that is automatically exported
    `
});

foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'CommandProvider',

    properties: [
        {
            name: 'name',
            factory: function () { return this.cls_.id }
        },
        {
            name: 'code',
            value: function (x, args) {
                const cmd = args.cmd;
                if ( ! this.commands.hasOwnProperty(cmd) ) {
                    if ( this.__context__.processCommand ) {
                        this.__context__.processCommand(x, args);
                        return;
                    }
                    x.logger?.error(`command not found: ${cmd}`);
                    return;
                }
                console.log('||', cmd, '||', args)
                console.log('??', this.commands[cmd].toString())
                this.commands[cmd](x, args);
            }
        }
    ],

    methods: [
        function installInClass(cls) {
            const p = foam.core.Property.create({
                name: 'commands',
                factory: function () {
                    const commands = this.cls_.getAxiomsByClass(com.ericdube.lang.Command);
                    let commandMap = {};
                    if ( this.parentCommands ) {
                        commandMap = { ...this.parentCommands };
                    }
                    commandMap = {
                        ...commandMap,
                        ...commands.reduce((m, axiom) => {
                            m[axiom.name] = this[axiom.name];
                            return m;
                        }, {})
                    };
                    return commandMap;
                }
            });
            const ep = foam.core.Export.create({
                exportName: 'commands',
                key: 'commands'
            });
            const m = foam.core.Method.create({
                name: 'processCommand',
                code: this.code
            })
            const em = foam.core.Export.create({
                exportName: 'processCommand',
                key: 'processCommand'
            });
            cls.installAxiom(p);
            cls.installAxiom(ep);
            cls.installAxiom(m);
            cls.installAxiom(em);
        }
    ]
})

foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'CommandModelRefinement',
    refines: 'foam.core.Model',

    properties: [
        {
            class: 'AxiomArray',
            of: 'com.ericdube.lang.Command',
            name: 'commands',
            adaptArrayElement: function(o) {
                if ( typeof o === 'function' ) {
                var name = foam.Function.getName(o);
                foam.assert(name, 'Command must be named');
                return com.ericdube.lang.Command.create({name: name, code: o});
                }

                return com.ericdube.lang.Command.isInstance(o) ?
                    o :
                    com.ericdube.lang.Command.create(o) ;
            }
        }
    ]
});
