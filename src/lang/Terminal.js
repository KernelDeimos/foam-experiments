foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'ToTerminalEFObjectRefinement',
    refines: 'foam.core.FObject',

    methods: [
        function toTerminalE(args, x) {
            const props = this.cls_.getOwnAxiomsByClass(foam.core.Property);
            return foam.u2.Element.create()
                .add('FObject')
                // .forEach(props, function (prop) {
                //     this.start()
                //         .add(prop.name)
                //         .add(this[prop.name])
                //     .end();
                // })
                ;
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'ToTerminalEStringHolderRefinement',
    refines: 'foam.core.StringHolder',

    methods: [
        function toTerminalE(_, x) {
            return x.E().add(this.value);
        }
    ]
});
