foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'Container',
    extends: 'com.ericdube.wm.Node',

    imports: [
        'windowManager'
    ],

    properties: [
        {
            class: 'FObjectArray',
            of: 'com.ericdube.wm.Node',
            name: 'wmNodes'
        },
        {
            class: 'Boolean',
            name: 'vertical'
        },
        {
            class: 'com.ericdube.lang.FObjectHistory',
            of: 'com.ericdube.wm.Node',
            name: 'activeStack',
            hidden: true // until adequate view exists
        },
        {
            name: 'listeners',
            factory: () => ({})
        }
    ],

    methods: [
        function addWindow(node) {
            return this.addNode(node);
        },
        function addNode(node) {
            // WET: swapNode
            node.container = this;

            this.addNode_(node, { order: this.wmNodes.length });

            // remember this node
            this.wmNodes$push(node);

            // listen for node updates
            const detachable = foam.core.FObject.create();
            this.listeners[node.id] = detachable;
            detachable.onDetach(node.active$.sub(() => {
                this.activeStack$bloop(node);
            }));

        },
        function removeNode(node) {
            const index = this.wmNodes.indexOf(node);

            // stop listening for node updates
            this.listeners[node.id].detach();
            delete this.listeners[node.id];

            // forget about the node
            this.wmNodes.splice(index, 1);

            // remove u2 element from container
            node.element.remove();

            // fix css
            this.assignOrder_();
        },
        function swapNode(existingNode, replacementNode) {
            const index = this.wmNodes.indexOf(existingNode);
            existingNode.element.remove();

            // WET: addNode
            replacementNode.container = this;
            // const element = replacementNode.createElement({ x: this.__context__ });
            // element.style({ order: index });
            // this.element.add(element);
            this.addNode_(replacementNode, { order: index });

            this.wmNodes[index] = replacementNode;
            this.propertyChange.pub('wmNodes', this.wmNodes$)

            // WET: addNode
            const detachable = foam.core.FObject.create();
            this.listeners[replacementNode.id] = detachable;
            detachable.onDetach(replacementNode.active$.sub(() => {
                this.activeStack$bloop(replacementNode);
            }));
        },
        function addNode_(node, { order }) {
            const element = node.createElement({ x: this.__context__ });
            element.style({ order });
            this.element.add(element);
        },
        function movePrevious(node) {
            const index = this.wmNodes.indexOf(node);
            if ( index < 1 ) return false;
            let tmp = this.wmNodes[index-1];
            this.wmNodes[index-1] = this.wmNodes[index];
            this.wmNodes[index] = tmp;
            this.assignOrder_();
            return true;
        },
        function moveNext(node) {
            const index = this.wmNodes.indexOf(node);
            if ( index == -1 || index == this.wmNodes.length - 1 ) return false;
            let tmp = this.wmNodes[index+1];
            this.wmNodes[index+1] = this.wmNodes[index];
            this.wmNodes[index] = tmp;
            this.assignOrder_();
            return true;
        },
        function getPrevious(node) {
            const index = this.wmNodes.indexOf(node);
            if ( index < 1 ) return undefined;
            return this.wmNodes[index-1];
        },
        function getNext(node) {
            const index = this.wmNodes.indexOf(node);
            if ( index == this.wmNodes.length - 1 ) return undefined;
            return this.wmNodes[index+1];
        },
        function getSelectedWindow() {
            const selectedWindow = this.activeStack$top;
            if ( this.cls_.isInstance(selectedWindow) ) {
                return selectedWindow.getSelectedWindow();
            }
            return selectedWindow;
        },
        function assignOrder_() {
            for ( let i = 0 ; i < this.wmNodes.length ; i++ ) {
                this.wmNodes[i].element.style({ order: ''+i });
            }
        },
        function createElement ({ x }) {
            x = x || this.__context__;
            const element = this.element = x.windowManager.createContainerElement({
                container: this
            });
            this.element.style({
                'flex-direction': this.vertical$.map(v => v ? 'column' : 'row')
            });
            this.element.enableClass('ready', this.slot(function (wmNodes, container) {
                if ( ! container ) return false;
                return wmNodes.length == 1;
            }));
            for ( let i = 0 ; i < this.wmNodes.length ; i++ ) {
                this.addNode_(this.wmNodes[i], { order: i });
            }
            return element;
        }
    ]
});
