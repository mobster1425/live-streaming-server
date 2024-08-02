# Live Streaming Server

This project is a live streaming server built with NestJS for the backend and a simple HTML/JavaScript frontend. It supports user authentication, real-time video streaming, and chat functionality.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed the latest version of [Node.js and npm](https://nodejs.org/en/download/)
* You have installed [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
* You have a basic understanding of JavaScript, TypeScript, and WebRTC concepts

## Installing Live Streaming Server

To install the Live Streaming Server, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/mobster1425/live-streaming-server.git
   cd live-streaming-server
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Running the Live Streaming Server

You can run the Live Streaming Server in two ways:

### Using Docker (Recommended for Production)

1. Build the Docker image:
   ```
   docker build -t live-streaming-server .
   ```

2. Run the Docker container:
   ```
   docker run -p 80:80 live-streaming-server
   ```

The server will be available at `http://localhost`.

### Using npm (Recommended for Development)

1. Start the NestJS server:
   ```
   npm run start:dev
   ```

2. In a separate terminal, serve the frontend files:
   ```
   npx http-server -p 8080
   ```

The server will be available at `http://localhost:8080`.

## Using Live Streaming Server

Here's a basic guide on how to use the Live Streaming Server:

1. Open the application in your web browser.
2. Register a new account or log in if you already have one.
3. To start a new stream:
   - Click on "Start Streaming"
   - Allow the browser to access your camera and microphone
   - Your stream will begin, and others can join
4. To join an existing stream:
   - Look for active streams in the "Active Streams" section
   - Click "Join" next to the stream you want to watch
5. Use the chat feature to communicate with other users in the stream

## API Usage

The server exposes the following main API endpoints:

- `POST /auth/register`: Register a new user
  ```json
  {
    "username": "newuser",
    "password": "password123"
  }
  ```

- `POST /auth/login`: Log in a user
  ```json
  {
    "username": "existinguser",
    "password": "password123"
  }
  ```

- WebSocket events:
  - `startStream`: Start a new stream
  - `joinStream`: Join an existing stream
  - `chatMessage`: Send a chat message



## Contributing to Live Streaming Server

To contribute to Live Streaming Server, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Contact

If you want to contact me, you can reach me at feyintola33@gmail.com.

## License

This project uses the following license: [<license_name>](<link_to_license>).