const socket = io();

/** ------------------------ SETUP ------------------------  */
// --- Elements
const messageForm = document.getElementById('message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

// --- Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// --- Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

// --- Autoscroll
const autoscroll = () => {
    // New message
    const $newMessage = messages.lastElementChild;

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageHeight = $newMessage.offsetHeight + parseInt(newMessageStyles.marginBottom) + parseInt(newMessageStyles.marginTop);

    // Visible height
    const visHeight = messages.offsetHeight;

    // Height of container (total height)
    const containerHeight = messages.scrollHeight;

    // How far are we scrolled
    const scrollOffset = messages.scrollTop + visHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

/** ------------------------ JOIN ------------------------  */
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

/** ------------------------ MESSAGING ------------------------  */
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    messageFormButton.setAttribute('disabled','disabled');

    socket.emit('sendMessage', messageFormInput.value, (reply) => {
        messageFormButton.removeAttribute('disabled');
        messageFormInput.value = '';
        messageFormInput.focus();
        console.log('Message delivered!', reply);
    });
});
socket.on('message', (data) => {
    console.log(data);
    const html = Mustache.render(messageTemplate, {
        message: data.text,
        createdAt: moment(data.createdAt).format("MMM D, H:mm"),
        username: data.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

/** ------------------------ SHARING LOCATION ------------------------  */
const locButton = document.getElementById('send-location');
locButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported');
    }
    locButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
       console.log(position);
       socket.emit('sendLocation', {lat: position.coords.latitude, long: position.coords.longitude}, () => {
           locButton.removeAttribute('disabled');
       });
    });
});
socket.on('locationBroadcast', (data) => {
    console.log(data);
    const html = Mustache.render(locationMessageTemplate, {
        link: data.url,
        createdAt: moment(data.createdAt).format("MMM D, H:mm"),
        username: data.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

/** ------------------------ USER LIST ------------------------  */
socket.on('roomData', ({ room, users }) => {
    console.log(users);
    userList.innerHTML = Mustache.render(sidebarTemplate, {
        roomName: room,
        users: users
    });
});