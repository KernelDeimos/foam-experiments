foam.POM({
    name: 'foam-experiments--build',
    version: 1,
    projects: [
        { name: 'node_modules/foam3/src/pom' },
        { name: 'node_modules/foam3/src/foam/nanos/pom' },
        { name: 'node_modules/foam3/src/foam/support/pom' },
        { name: 'src/pom' }
    ],
    foobar: {
        protected: ['foam3', 'src'],
        generate: ['js', 'java'],
        build: {
            objectDir: 'build',
            javaOutDir: 'build/src/java'
        },
        target: {
            runDir: 'runtime'
        }
    }
});
