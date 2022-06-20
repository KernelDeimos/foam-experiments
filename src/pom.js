foam.POM({
    name: 'foam-experiments',
    version: 1,
    files: [
        { name: 'Controller', flags: 'js' },
        { name: 'lang/FObjectHistory', flags: 'js' },
        { name: 'lang/Command', flags: 'js' },
        { name: 'lang/Terminal', flags: 'js' },
        { name: 'coreapps/BaseApp', flags: 'js' },
        { name: 'coreapps/AppView', flags: 'js' },
        { name: 'coreapps/WMDebugger', flags: 'js' },
        { name: 'coreapps/terminal/Terminal', flags: 'js' },
        { name: 'coreapps/terminal/BufferedSink', flags: 'js' },
        { name: 'wm/api', flags: 'js' },
        { name: 'wm/keyboard', flags: 'js' },
        { name: 'wm/Window', flags: 'js' },
        { name: 'wm/Container', flags: 'js' },
        { name: 'wm/TileWindowManager', flags: 'js' }
    ]
});
