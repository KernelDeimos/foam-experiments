foam.CLASS({
    package: 'com.ericdube.coreapps',
    name: 'WMDebugger',
    extends: 'com.ericdube.coreapps.BaseApp',

    imports: [
        'windowManager'
    ]
})

foam.CLASS({
    package: 'com.ericdube.coreapps',
    name: 'WMDebuggerAppView',
    extends: 'foam.u2.View',

    properties: [
        ['ticker', 0]
    ],

    css: `
        ^container {
            display: flex;
            gap: 10pt;
            background-color: #7CC;
            padding: 10pt;
            border: 2px solid orange;
        }
        ^window {
            background-color: green;
            width: 100px;
            word-wrap: break-word;
            font-size: 10px;
        }
    `,

    methods: [
        function render () {
            setInterval(() => {
                this.ticker++;
            }, 100);
            this.addClass().add(this.slot(function (ticker) {
                const el = this.E();
                this.renderContainer(el, this.data.windowManager.rootContainer)
                return el;
            }))
        },
        function renderContainer (el, container) {
            const self = this;
            el
                .start()
                    .addClass(this.myClass('container'))
                    .style({ 'flex-direction': container.vertical ? 'column' : 'row' })
                    .forEach(container.wmNodes, function (node) {
                        if ( node.cls_.id.endsWith('Container') ) {
                            self.renderContainer(this, node);
                        } else {
                            this
                                .start()
                                    .addClass(self.myClass('window'))
                                    .add(node.id)
                                .end()
                        }
                    })
                .end()
        }
    ]
});
