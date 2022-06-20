foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'Node',

    properties: [
        {
            name: 'id',
            factory: function () {
                return foam.uuid.randomGUID();
            }
        },
        'container',
        'element',
        {
            class: 'Boolean',
            name: 'active'
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'Window',
    extends: 'com.ericdube.wm.Node',

    imports: [
        'windowManager?'
    ],

    requires: [
        'foam.u2.Element',
        'com.ericdube.wm.WindowAware'
    ],

    properties: [
        {
            class: 'foam.u2.ViewSpec',
            name: 'view'
        },
        {
            name: 'data'
        },
        {
            name: 'active',
            postSet: function (o, n) {
                if ( o != n && this.data && this.WindowAware.isInstance(this.data) ) {
                    this.data[n ? 'windowActive' : 'windowInactive'].pub();
                }
            }
        },
        {
            class: 'Boolean',
            name: 'closable',
            value: true
        }
    ],

    methods: [
        function createElement ({ x }) {
            x = x || this.__context__;
            const el = this.element = x.windowManager.createWindowElement({
                win: this,
            })
                .enableClass('active', this.active$)
                .tag(this.view, { data$: this.data$ });
            
            // If an active window was re-created, flash active property to
            // take focus back
            if (this.active) el.onDetach(el.state$.sub(() => {
                if ( el.state.cls_ === foam.u2.LoadedElementState ) {
                    this.active = false;
                    this.active = true;
                }
            }));
            return el;
        }
    ]
});
