function useState(initial) {
    const oldHook = 
        globalState.wipFiber.alternate &&
        globalState.wipFiber.alternate.hooks &&
        globalState.wipFiber.alternate.hooks[globalState.hookIndex];

    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    };

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        hook.state = action(hook.state);
    });

    const setState = action => {
        hook.queue.push(action);
        globalState.wipRoot = {
            dom: globalState.currentRoot.dom,
            props: globalState.currentRoot.props,
            alternate: globalState.currentRoot,
        };
        globalState.nextUnitOfWork = globalState.wipRoot;
        globalState.deletions = [];
    }

    globalState.wipFiber.hooks.push(hook);
    globalState.hookIndex++;
    return [hook.state, setState];
}