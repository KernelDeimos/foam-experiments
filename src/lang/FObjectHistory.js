foam.CLASS({
    package: 'com.ericdube.lang',
    name: 'FObjectHistory',
    extends: 'foam.core.FObjectArray',

    methods: [
        function installInProto (proto) {
            // "bloop" as in onomatopoeia for a bubble moving up
            this.SUPER(proto);
            const prop = this;
            Object.defineProperty(proto, prop.name + '$bloop', {
                get: function bloopMethodGetter() {
                    return function (obj) {
                        // WET: to prevent duplicate property updates
                        if ( ! obj ) return;
                        const arr = this[prop.name];
                        let i; while ( (i = arr.indexOf(obj)) != -1 ) {
                            arr.splice(i, 1);
                        }

                        this[`${prop.name}$push`](obj);
                    }
                }
            });
            Object.defineProperty(proto, prop.name + '$forget', {
                get: function forgetMethodGetter() {
                    return function (obj) {
                        // WET: to prevent duplicate property updates
                        if ( ! obj ) return;
                        const arr = this[prop.name];
                        let i; while ( (i = arr.indexOf(obj)) != -1 ) {
                            arr.splice(i, 1);
                        }

                        this.propertyChange.pub(prop.name, this.slot(prop.name))
                    }
                }
            });
            Object.defineProperty(proto, prop.name + '$top', {
                get: function topGetter() {
                    return this[prop.name][this[prop.name].length - 1];
                }
            })
        }
    ]
});
