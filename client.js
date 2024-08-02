








/*
// Utility function to get the auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to handle login
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('authToken', data.access_token);
            console.log('Login successful');
            connectSocket();
        } else {
            console.error('Login failed');
            addToLog('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        addToLog('Login error: ' + error.message);
    }
}

// Function to handle registration
async function register(username, password) {
    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.id) {
            console.log('Registration successful. Please login.');
            addToLog('Registration successful. Please login.');
        } else {
            console.error('Registration failed');
            addToLog('Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        addToLog('Registration error: ' + error.message);
    }
}

let socket;
let localStream;
let peerConnections = {};

function connectSocket() {
    const token = getAuthToken();
    console.log('Connecting with token:', token);

    socket = io('http://localhost:3000', {
        auth: {
            token: token
        }
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('getActiveStreams');
        document.getElementById('streamingSection').style.display = 'block';
        document.getElementById('authSection').style.display = 'none';
        addToLog('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        document.getElementById('streamingSection').style.display = 'none';
        document.getElementById('authSection').style.display = 'block';
        addToLog('Connection error: ' + error.message);
    });

    socket.on('streamStarted', (stream) => {
        console.log('New stream started:', stream);
        updateActiveStreamsList();
        addToLog('New stream started: ' + stream.name);
    });

    socket.on('streamStopped', (streamId) => {
        console.log('Stream stopped:', streamId);
        removeRemoteVideo(streamId);
        updateActiveStreamsList();
        addToLog('Stream stopped: ' + streamId);
    });

    socket.on('activeStreams', (streams) => {
        console.log('Active streams:', streams);
        updateActiveStreamsList(streams);
    });

    socket.on('userJoined', async ({ userId }) => {
        console.log('User joined:', userId);
        const peerConnection = await createPeerConnection(userId);
        peerConnections[userId] = peerConnection;

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { target: userId, offer: offer });
        } catch (error) {
            console.error('Error creating offer:', error);
            addToLog('Error creating offer: ' + error.message);
        }
    });

    socket.on('offer', async ({ sender, offer }) => {
        console.log('Received offer from:', sender);
        if (!peerConnections[sender]) {
            peerConnections[sender] = await createPeerConnection(sender);
        }
        const peerConnection = peerConnections[sender];

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { target: sender, answer: answer });
        } catch (error) {
            console.error('Error handling offer:', error);
            addToLog('Error handling offer: ' + error.message);
        }
    });

    socket.on('answer', async ({ sender, answer }) => {
        console.log('Received answer from:', sender);
        const peerConnection = peerConnections[sender];
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error('Error setting remote description:', error);
                addToLog('Error setting remote description: ' + error.message);
            }
        }
    });

    socket.on('iceCandidate', async ({ sender, candidate }) => {
        console.log('Received ICE candidate from:', sender);
        const peerConnection = peerConnections[sender];
        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
                addToLog('Error adding ICE candidate: ' + error.message);
            }
        }
    });

    socket.on('error', (message) => {
        console.error('Socket error:', message);
        addToLog('Socket error: ' + message);
    });
}

async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        addToLog('Error accessing media devices: ' + error.message);
    }
}

function stopLocalStream() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        document.getElementById('localVideo').srcObject = null;
    }
}

async function createPeerConnection(targetId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('iceCandidate', { target: targetId, candidate: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        const remoteVideo = document.getElementById(`remote-video-${targetId}`) || document.createElement('video');
        if (!remoteVideo.id) {
            remoteVideo.id = `remote-video-${targetId}`;
            remoteVideo.autoplay = true;
            remoteVideo.playsInline = true;
            document.getElementById('remoteVideos').appendChild(remoteVideo);
        }
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = event.streams[0];
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    } else {
        console.warn('Local stream not available when creating peer connection');
        addToLog('Warning: Local stream not available when creating peer connection');
    }

    return peerConnection;
}

function removeRemoteVideo(userId) {
    const remoteVideo = document.getElementById(`remote-video-${userId}`);
    if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.remove();
    }
}

function updateActiveStreamsList(streams) {
    const activeStreamsList = document.getElementById('activeStreams');
    activeStreamsList.innerHTML = '';

    if (!streams || !Array.isArray(streams)) {
        console.warn('Invalid streams data received:', streams);
        const li = document.createElement('li');
        li.textContent = 'No active streams';
        activeStreamsList.appendChild(li);
        return;
    }

    if (streams.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No active streams';
        activeStreamsList.appendChild(li);
        return;
    }

    streams.forEach((stream) => {
        if (stream && stream.id && stream.name) {
            const li = document.createElement('li');
            li.textContent = `${stream.name} (${stream.id})`;
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.onclick = () => joinStream(stream.id);
            li.appendChild(joinButton);
            activeStreamsList.appendChild(li);
        } else {
            console.warn('Invalid stream data:', stream);
            addToLog('Warning: Invalid stream data received');
        }
    });
}

async function startStream() {
    const streamName = prompt('Enter stream name:');
    if (streamName) {
        await startLocalStream();
        socket.emit('startStream', { name: streamName });
        addToLog('Started streaming: ' + streamName);
    }
}

function stopStream() {
    socket.emit('stopStream');
    stopLocalStream();
    document.getElementById('remoteVideos').innerHTML = '';
    Object.keys(peerConnections).forEach(userId => {
        removeRemoteVideo(userId);
        if (peerConnections[userId]) {
            peerConnections[userId].close();
        }
    });
    peerConnections = {};
    addToLog('Stopped streaming');
}

async function joinStream(streamId) {
    await startLocalStream();
    socket.emit('joinStream', { streamId: streamId });
    addToLog('Joined stream: ' + streamId);
}

function addToLog(message) {
    const logsDiv = document.getElementById('logs');
    const logEntry = document.createElement('p');
    logEntry.textContent = new Date().toLocaleTimeString() + ': ' + message;
    logsDiv.appendChild(logEntry);
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

function logout() {
    localStorage.removeItem('authToken');
    if (socket) {
        socket.disconnect();
    }
    stopLocalStream();
    document.getElementById('streamingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
    console.log('Logged out successfully');
    addToLog('Logged out successfully');
}

// Initialize the connection if we have a token
if (getAuthToken()) {
    connectSocket();
} else {
    document.getElementById('streamingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
}

// Event listeners
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    register(username, password);
});

document.getElementById('startStream').addEventListener('click', startStream);
document.getElementById('stopStream').addEventListener('click', stopStream);
document.getElementById('logout').addEventListener('click', logout);


*/


const SERVER_URL = 'https://livestream-server-o5d8.onrender.com'
 const LOCAL_SERVER_URL='http://localhost:3000'
function getAuthToken() {
    return localStorage.getItem('authToken');
}

async function login(username, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('authToken', data.access_token);
            console.log('Login successful');
            connectSocket();
        } else {
            console.error('Login failed');
            addToLog('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        addToLog('Login error: ' + error.message);
    }
}

async function register(username, password) {
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.id) {
            console.log('Registration successful. Please login.');
            addToLog('Registration successful. Please login.');
        } else {
            console.error('Registration failed');
            addToLog('Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        addToLog('Registration error: ' + error.message);
    }
}

let socket;
let localStream;
let peerConnections = {};
let currentStreamId = null;

function connectSocket() {
    const token = getAuthToken();
    console.log('Connecting with token:', token);

    socket = io('/', {
        auth: {
            token: token
        }
    });
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('getActiveStreams');
        document.getElementById('streamingSection').style.display = 'block';
        document.getElementById('authSection').style.display = 'none';
        addToLog('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        document.getElementById('streamingSection').style.display = 'none';
        document.getElementById('authSection').style.display = 'block';
        addToLog('Connection error: ' + error.message);
    });

    socket.on('streamStarted', (stream) => {
        console.log('New stream started:', stream);
        updateActiveStreamsList();
        addToLog('New stream started: ' + stream.name);
    });

    socket.on('streamStopped', (streamId) => {
        console.log('Stream stopped:', streamId);
        removeRemoteVideo(streamId);
        updateActiveStreamsList();
        addToLog('Stream stopped: ' + streamId);
    });

    socket.on('activeStreams', (streams) => {
        console.log('Active streams:', streams);
        updateActiveStreamsList(streams);
    });

    socket.on('userJoined', async ({ userId }) => {
        console.log('User joined:', userId);
        const peerConnection = await createPeerConnection(userId);
        peerConnections[userId] = peerConnection;

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { target: userId, offer: offer });
        } catch (error) {
            console.error('Error creating offer:', error);
            addToLog('Error creating offer: ' + error.message);
        }
    });

    socket.on('offer', async ({ sender, offer }) => {
        console.log('Received offer from:', sender);
        if (!peerConnections[sender]) {
            peerConnections[sender] = await createPeerConnection(sender);
        }
        const peerConnection = peerConnections[sender];

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { target: sender, answer: answer });
        } catch (error) {
            console.error('Error handling offer:', error);
            addToLog('Error handling offer: ' + error.message);
        }
    });

    socket.on('answer', async ({ sender, answer }) => {
        console.log('Received answer from:', sender);
        const peerConnection = peerConnections[sender];
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error('Error setting remote description:', error);
                addToLog('Error setting remote description: ' + error.message);
            }
        }
    });

    socket.on('iceCandidate', async ({ sender, candidate }) => {
        console.log('Received ICE candidate from:', sender);
        const peerConnection = peerConnections[sender];
        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
                addToLog('Error adding ICE candidate: ' + error.message);
            }
        }
    });

    socket.on('error', (message) => {
        console.error('Socket error:', message);
        addToLog('Socket error: ' + message);
    });

    socket.on('chatMessage', (message) => {
        console.log('Received chat message:', message);
        addChatMessage(message);
    });

    socket.on('chatHistory', (messages) => {
        console.log('Received chat history:', messages);
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        messages.forEach(addChatMessage);
    });
}

/*
async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        // If there are existing peer connections, add tracks to them
        Object.values(peerConnections).forEach(peerConnection => {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        });
    } catch (error) {
        console.error('Error accessing media devices:', error);
        addToLog('Error accessing media devices: ' + error.message);
    }
}*/


async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        // If there are existing peer connections, add tracks to them
        Object.values(peerConnections).forEach(peerConnection => {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        });
    } catch (error) {
        console.error('Error accessing media devices:', error);
        addToLog('Error accessing media devices: ' + error.message);
    }
}

function stopLocalStream() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        document.getElementById('localVideo').srcObject = null;
        localStream = null;
    }
}


async function createPeerConnection(targetId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Sending ICE candidate to', targetId);
            socket.emit('iceCandidate', { target: targetId, candidate: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('Received remote track from', targetId);
        const remoteVideo = document.getElementById(`remote-video-${targetId}`) || document.createElement('video');
        if (!remoteVideo.id) {
            remoteVideo.id = `remote-video-${targetId}`;
            remoteVideo.autoplay = true;
            remoteVideo.playsInline = true;
            document.getElementById('remoteVideos').appendChild(remoteVideo);
        }
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    };

    if (localStream) {
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    } else {
        console.warn('Local stream not available when creating peer connection');
        addToLog('Warning: Local stream not available when creating peer connection');
    }

    return peerConnection;
}

/*
function removeRemoteVideo(userId) {
    const remoteVideo = document.getElementById(`remote-video-${userId}`);
    if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.remove();
    }
}
*/


function removeRemoteVideo(userId) {
    const remoteVideo = document.getElementById(`remote-video-${userId}`);
    if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.remove();
    }
}



async function joinStream(streamId) {
    await startLocalStream();
    socket.emit('joinStream', { streamId: streamId });
    currentStreamId = streamId;
    socket.emit('getChatHistory', { streamId: streamId });
    addToLog('Joined stream: ' + streamId);
}

function updateActiveStreamsList(streams) {
    const activeStreamsList = document.getElementById('activeStreams');
    activeStreamsList.innerHTML = '';

    if (!streams || !Array.isArray(streams)) {
        console.warn('Invalid streams data received:', streams);
        const li = document.createElement('li');
        li.textContent = 'No active streams';
        activeStreamsList.appendChild(li);
        return;
    }

    if (streams.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No active streams';
        activeStreamsList.appendChild(li);
        return;
    }

    streams.forEach((stream) => {
        if (stream && stream.id && stream.name) {
            const li = document.createElement('li');
            li.textContent = `${stream.name} (${stream.id})`;
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.onclick = () => joinStream(stream.id);
            li.appendChild(joinButton);
            activeStreamsList.appendChild(li);
        } else {
            console.warn('Invalid stream data:', stream);
            addToLog('Warning: Invalid stream data received');
        }
    });
}


/*

async function startStream() {
    const streamName = prompt('Enter stream name:');
    if (streamName) {
        await startLocalStream();
        socket.emit('startStream', { name: streamName });
        currentStreamId = socket.id;
        addToLog('Started streaming: ' + streamName);
    }
}

function stopStream() {
    socket.emit('stopStream');
    stopLocalStream();
    document.getElementById('remoteVideos').innerHTML = '';
    Object.keys(peerConnections).forEach(userId => {
        removeRemoteVideo(userId);
        if (peerConnections[userId]) {
            peerConnections[userId].close();
        }
    });
    peerConnections = {};
    currentStreamId = null;
    addToLog('Stopped streaming');
}


*/


async function startStream() {
    const streamName = prompt('Enter stream name:');
    if (streamName) {
        await startLocalStream();
        socket.emit('startStream', { name: streamName });
        currentStreamId = socket.id;
        addToLog('Started streaming: ' + streamName);
    }
}

function stopStream() {
    if (socket) {
        socket.emit('stopStream');
    }
    stopLocalStream();
    document.getElementById('remoteVideos').innerHTML = '';
    Object.keys(peerConnections).forEach(userId => {
        if (peerConnections[userId]) {
            peerConnections[userId].close();
            delete peerConnections[userId];
        }
    });
    currentStreamId = null;
    addToLog('Stopped streaming');
}

async function joinStream(streamId) {
    await startLocalStream();
    socket.emit('joinStream', { streamId: streamId });
    currentStreamId = streamId;
    socket.emit('getChatHistory', { streamId: streamId });
    addToLog('Joined stream: ' + streamId);
}

function addToLog(message) {
    const logsDiv = document.getElementById('logs');
    const logEntry = document.createElement('p');
    logEntry.textContent = new Date().toLocaleTimeString() + ': ' + message;
    logsDiv.appendChild(logEntry);
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

function logout() {
    localStorage.removeItem('authToken');
    if (socket) {
        socket.disconnect();
    }
    stopLocalStream();
    document.getElementById('streamingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
    console.log('Logged out successfully');
    addToLog('Logged out successfully');
}

function addChatMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${new Date(message.timestamp).toLocaleTimeString()} - ${message.sender}: ${message.message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message && currentStreamId) {
        socket.emit('chatMessage', { streamId: currentStreamId, message: message });
        chatInput.value = '';
    }
}

// Initialize the connection if we have a token
if (getAuthToken()) {
    connectSocket();
} else {
    document.getElementById('streamingSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
}

// Event listeners
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    register(username, password);
});

document.getElementById('startStream').addEventListener('click', startStream);
document.getElementById('stopStream').addEventListener('click', stopStream);
document.getElementById('logout').addEventListener('click', logout);
document.getElementById('sendMessage').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});


