function Counter() {
    const [state, setState] = TReact.useState(1);
    const [name, setName] = TReact.useState('name');
    return TReact.createElement('h1', {
        onClick: () => {
            setState(c => c + 1);
            setName(name => `${name}-${state}`);
        },
    }, 'Count' + state + name);
}


TReact.render(TReact.createElement(Counter), document.getElementById('root'));
