const generateMessage = (username, msgText) => {
    return {
        text: msgText,
        createdAt: new Date().getTime(),
        username: username
    };
};

const generateLocationMessage = (username, coordData) => {
    return {
        url: 'https://google.com/maps?q=' + coordData.lat + ',' + coordData.long,
        createdAt: new Date().getTime(),
        username: username
    };
};

module.exports = {
    generateMessage,
    generateLocationMessage
};