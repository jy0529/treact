function workLoop(deadline) {
    let shouldYield = false;
    while(globalState.nextUnitOfWork && !shouldYield) {
        globalState.nextUnitOfWork = performUnitOfWork(globalState.nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!globalState.nextUnitOfWork && globalState.wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while(nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

requestIdleCallback(workLoop)

function commitRoot() {
    globalState.deletions.forEach(commitWork);
    commitWork(globalState.wipRoot.child);
    globalState.currentRoot = globalState.wipRoot;
    globalState.wipRoot = null;
}
function commitWork(fiber) {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while(!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (
        fiber.effectTag === 'PLACEMENT' &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom);
    } else if (
        fiber.effectTag === 'UPDATE' &&
        fiber.dom != null
    ) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === 'DELETION') {
        commitDeletion(fiber, domParent);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}