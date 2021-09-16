import log from 'loglevel';

const factory = log.methodFactory;

log.methodFactory = function(method, level, name) {
    const fn = factory(method, level, name);

    return function(msg) {
        const args = [method.toUpperCase() + ':', ...arguments];
        fn.apply(undefined, args);
    }
}

export default log;