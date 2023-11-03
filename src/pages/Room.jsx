import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peerService from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const { roomId } = useParams();
  const [screenWidth, setScreenWidth] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const navigate = useNavigate();

  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peerService.getOffer();

    socket.emit("user:call", { to: remoteSocketId, offer });

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream);

      const ans = await peerService.getAnswer(offer);

      socket.emit("call:accepted", { to: from, ans });
    },
    [socket],
  );

  const sendStreams = useCallback(() => {
    try {
      for (const track of myStream.getTracks()) {
        peerService.peer.addTrack(track, myStream);
      }
    } catch (error) {
      console.error("Ops! Something went wrong sending the stream.");
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ ans }) => {
      peerService.setLocalDescription(ans);

      sendStreams();
    },
    [sendStreams],
  );

  const handleExit = () => {
    socket.emit("user:exit", { to: remoteSocketId });
    myStream?.getTracks().forEach((track) => track.stop());

    navigate("/", { state: { userExit: true } });
  };

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();

    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peerService.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peerService.peer.removeEventListener(
        "negotiationneeded",
        handleNegoNeeded,
      );
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peerService.getAnswer(offer);

      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peerService.setLocalDescription(ans);
  }, []);

  const handleExitRoom = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleTrackEvent = useCallback(async (ev) => {
    const remoteStream = ev.streams;

    setRemoteStream(remoteStream[0]);
  }, []);

  useEffect(() => {
    peerService.peer.addEventListener("track", handleTrackEvent);

    return () => {
      peerService.peer.removeEventListener("track", handleTrackEvent);
    };
  }, [handleTrackEvent]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("user:exit", handleExitRoom);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("user:exit", handleExitRoom);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleExitRoom,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      <aside className="bg-green-800 max-md:h-24 max-md:justify-around items-center max-md:bottom-0 max-md:w-screen w-64 md:h-screen px-3 max-md:fixed flex md:flex-col max-md:order-2">
        <h1 className="text-xl text-green-200 max-md:order-2 mb-5 font-bold mt-5">{`Sala | ${roomId}`}</h1>

        {myStream && (
          <ReactPlayer
            className="max-md:order-1"
            width={screenWidth.width < 768 ? "" : "100%"}
            height={screenWidth.width < 768 ? "100px" : "200px"}
            playing
            muted
            url={myStream}
          />
        )}

        <h4 className="text-lg text-green-200">
          {remoteSocketId ? "Conectado" : "Aguardando uma conexão..."}
        </h4>

        <div className="flex flex-row gap-5 max-md:order-4 md:mt-5">
          {myStream && (
            <FontAwesomeIcon
              className="text-blue-400 w-8 h-8"
              icon={["fas", "video"]}
              onClick={sendStreams}
            >
              Enviar transmissão
            </FontAwesomeIcon>
          )}

          {remoteSocketId && (
            <FontAwesomeIcon
              className="text-green-400 w-8 h-8"
              icon={["fas", "phone"]}
              onClick={handleCallUser}
            >
              Chamar
            </FontAwesomeIcon>
          )}

          <FontAwesomeIcon
            className="text-red-400 w-8 h-8"
            icon={["fas", "sign-out-alt"]}
            onClick={handleExit}
          />
        </div>
      </aside>
      <section className="w-full max-md:order-1 max-md:h-100">
        {remoteStream && (
          <ReactPlayer
            width={screenWidth.width < 768 ? "100vw" : "100%"}
            height={screenWidth.width < 768 ? screenWidth.height - 96 : "100vh"}
            playing
            controls
            url={remoteStream}
          />
        )}
      </section>
    </div>
  );
};
