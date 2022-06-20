foam.ENUM({
    package: 'com.ericdube.wm',
    name: 'InputMode',

    values: [
        {
            name: 'NORMAL',
            background: '#550000',
            label: 'NORMAL'
        },
        {
            name: 'INSERT',
            background: '#005500',
            label: 'INSERT'
        }
    ]
});

foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'InputController',

    properties: [
        {
            class: 'FObjectArray',
            name: 'keybindDescriptions'
        }
    ]
})

foam.CLASS({
    package: 'com.ericdube.wm',
    name: 'Keybind',

    properties: [
        { class: 'String', name: 'code' },
        { class: 'Boolean', name: 'ctrl' },
        { class: 'Boolean', name: 'shift' },
        { class: 'Boolean', name: 'alt' },
        { class: 'String', name: 'label' },
        { class: 'String', name: 'command' }
    ]
})
