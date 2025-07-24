import React from "react";
import { useMemo } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

const App = () => {
  const socket = useMemo(
    () =>
      io("http://localhost:5000", {
        withCredentials: true,
      }),
    []
  );

  const [messages, setMessages] = useState("");
  const [msg, setMsg] = useState([]);

  // private chats
  const [socketId, setSocketId] = useState("");
  const [room, setRoom] = useState("");

  // group chats
  const [roomName, setRoomName] = useState("");

  // public chats
  const [publicMessage, setPublicMessage] = useState("");

  // show all socket id
  const [allSocketIds, setAllSocketIds] = useState([]);

  // handle form submit
  const hanldeSubmit = (e) => {
    e.preventDefault();

    socket.emit("messages", { messages, room });

    setMessages("");
  };

  // hanlde group chats
  const handleGroupChats = (e) => {
    e.preventDefault();
    socket.emit("group-chat", roomName);

    setRoomName("");
  };

  // handle Public chats
  const handlePublic = (e) => {
    e.preventDefault();

    socket.emit("public-chat", publicMessage);
    setPublicMessage("");
  };

  // at the time of mounting
  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log(`Frontend Socket Conneected : ${socket.id}`);
    });

    // handle show all socket id
    // ✅ Emit event to get all connected socket IDs
    socket.emit("get-all-users");

    // ✅ Receive the socket IDs
    socket.on("all-users", (ids) => {
       const otherUsers = ids.filter((id) => id !== socket.id);
      setAllSocketIds(otherUsers); // array of socket IDs
    });

    socket.on("welcome", (msg) => {
      console.log(msg);
    });

    // hanlde msg
    socket.on("msg", (data) => {
      console.log(`User send msg: ${data}`);
      setMsg((msg) => [...msg, data]);
    });

    // hanlde public chats
    socket.on("public-message", (data) => {
      setMsg((msg) => [...msg, data]);
    });

    // at the time of unmounting the user will disconnect
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div>
        <h3>Socket.IO Testing</h3>
      </div>

      <div
        className="all-socket-id"
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          cursor:"pointer"
        }}
      >
        <details>
          <summary>🧑‍💻 All Connected Socket IDs</summary>
          {allSocketIds.map((id, i) => (
            <ul key={i}>
              {id}
              <button
                onClick={() => {
                  setRoom(id);
                  alert("Pasted in Room!");
                }}
              >
                copy
              </button>
            </ul>
          ))}
        </details>
      </div>

      <div className="private-chat">
        <p>Your Room ID: {socketId}</p>

        {/* private text field */}
        <form onSubmit={hanldeSubmit}>
          <h4>Private chats</h4>
          <div className="chat-box">
            {/* Message box */}
            <textarea
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevents newline
                  hanldeSubmit(e); // Submit the message
                }
              }}
              name="message"
              placeholder="Bhai likh ke send kar message"
            />

            {/* Room ID Box */}
            <textarea
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevents newline
                  hanldeSubmit(e); // Submit the message
                }
              }}
              name="Room Name"
              placeholder="Other's Room Id"
            />

            <button type="submit">Send</button>
          </div>
        </form>
      </div>

      <div className="group-chat">
        <form onSubmit={handleGroupChats}>
          <h4>Group Chats</h4>

          <textarea
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            name="room name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevents newline
                handleGroupChats(e); // Submit the message
              }
            }}
            placeholder="Group Room Name"
          />

          <button type="submit">Join group</button>
        </form>
      </div>

      <div className="Public chats">
        <form>
          <h4>Public Chats</h4>

          <form onSubmit={handlePublic}>
            <textarea
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              name="public chats"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevents newline
                  handlePublic(e); // Submit the message
                }
              }}
              placeholder="Public Chats"
            />

            <button type="submit">Send Public</button>
          </form>
        </form>
      </div>

      {/* all Messages show here */}
      <div className="message area">
        {msg.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </div>
    </>
  );
};

export default App;
