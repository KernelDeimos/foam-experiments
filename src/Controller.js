foam.CLASS({
    package: 'com.ericdube',
    name: 'Controller',
    extends: 'foam.nanos.controller.ApplicationController',

    axioms: [
        { class: 'com.ericdube.lang.CommandProvider' }
    ],

    properties: [
        {
            name: 'route',
            getter: function () {
                let route = this.instance_.route || ''
                return route == '' ? 'ericdube.home' : route;
            }
        }
    ],

    commands: [
        function controllerId (x, args) {
            x.logger.log(this.cls_.id)
        }
    ]
});
