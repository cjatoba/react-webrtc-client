import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peerService from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";

export const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const { roomId } = useParams();

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

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1>{`Room Page | ${roomId}`}</h1>

      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>

      {myStream && <button onClick={sendStreams}>Send Stream</button>}

      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}

      {myStream && (
        <>
          <h1>My Stream</h1>

          <ReactPlayer
            playing
            muted
            controls
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}

      {remoteStream && (
        <>
          <h1>Remote Stream</h1>

          <ReactPlayer
            playing
            muted
            controls
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};
