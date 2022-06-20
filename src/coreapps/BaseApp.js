foam.CLASS({
    package: 'com.ericdube.coreapps',
    name: 'BaseApp',
    implements: ['com.ericdube.wm.WindowAware'],

    properties: [
        {
            class: 'foam.u2.ViewSpec',
            name: 'view',
            factory: function () {
                return {
                    class: 'com.ericdube.coreapps.AppView',
                    of: this.cls_
                }
            }
        }
    ],

    listeners: [
        function onWindowActive () {},
        function onWindowInactive () {}
    ]
});
