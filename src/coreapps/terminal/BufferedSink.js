foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'BufferedSink',

    properties: [
        {
            class: 'FObjectArray',
            of: 'foam.core.FObject',
            name: 'queue_'
        }
    ],

    methods: [
        function put (o) {
            this.queue_$push(o);
        },

        function next () {
            if ( this.queue_.length == 0 ) return;
            const ret = this.queue_.shift();
            this.propertyChange.pub('queue_', this.queue_$);
            return ret;
        },

        async function waitNext () {
            if ( this.queue_.length ) return this.queue_.shift();
            return await new Promise(rslv => {
                this.onDetach(this.queue_$.sub(s => {
                    if ( ! this.queue_.length ) return;
                    rslv(this.next());
                    s.detach();
                }));
            });
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'AdaptSink',
    extends: 'foam.dao.ProxySink',

    requires: [
        'foam.core.StringHolder'
    ],

    methods: [
        function put (o, ...args) {
            if ( ! foam.core.FObject.isInstance(o) ) {
                o = this.StringHolder.create({ value: '' + o });
            }
            this.delegate.put(o, ...args);
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.coreapps.terminal',
    name: 'QuickProxySink',
    extends: 'foam.dao.ProxySink',
    
    properties: [
        {
            class: 'Function',
            name: 'putFn'
        },
    ],

    methods: [
        function put(...args) {
            this.putFn && this.putFn.apply(this, args);
            return this.delegate.put(...args);
        }
    ]
});
