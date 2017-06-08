fetch('../propbrowse/props.json').then(function(res) {
    return res.json();
}).then(function(data) {
    var properties = new Properties(data);
    window.view = new View("#app", properties);
});