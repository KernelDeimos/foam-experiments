foam.CLASS({
    package: 'com.ericdube.coreapps',
    name: 'AppView',
    extends: 'foam.u2.View',

    axioms: [
        foam.pattern.Faceted.create()
    ],

    methods: [
        function render () {
            this.tag({
                class: 'foam.u2.detail.SectionedDetailView'
            }, { data: this.data });
        }
    ]
});
