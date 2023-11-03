import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket],
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;

      navigate(`/room/${room}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <h1 className="text-6xl text-green-200 mb-10 font-bold">
        SALA DE ESPERA
      </h1>

      <form
        className="flex flex-col justify-center items-center border rounded-lg border-green-100 p-10 lg:w-1/2 gap-7"
        onSubmit={handleSubmitForm}
      >
        <Input
          placeholder="Digite seu email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <Input
          placeholder="Digite o nome da sala"
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <Button className="mt-5 w-1/2 h-15 lg:text-3xl" type="submit">
          Entrar
        </Button>
      </form>
    </div>
  );
};
