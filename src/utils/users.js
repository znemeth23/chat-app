const users = [];

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username or room is missing!'
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });
    if (!!existingUser) {
        return {
            error: 'Username already in use!'
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);

    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index,1)[0];
    }
};

const getUser = (id) => {
    const existingUser = users.find((user) => user.id === id);
    if (!existingUser) {
        return {
            error: 'User not found!'
        };
    }
    return existingUser;
};

const getUsersInRoom = (roomName) => {
    return users.filter((user) => user.room === roomName);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
