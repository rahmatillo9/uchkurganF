"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation"; // URL'dan parametr olish
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { Send } from "lucide-react";
import API from "@/lib/axios";

const SOCKET_SERVER_URL = "http://localhost:3001";

export default function Messages() {
  const { id } = useParams(); // URL'dan 'id' ni olamiz
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).id : null;

  const [receiver, setReceiver] = useState(null);

  // 👇 Qabul qiluvchi (receiver) ma'lumotlarini olish
  useEffect(() => {
    const fetchReceiverData = async () => {
      try {
        const response = await API.get(`/users/${id}`);
        setReceiver(response.data);
      } catch (error) {
        console.error("Error fetching receiver data:", error);
      }
    };

    if (id) {
      fetchReceiverData();
    }
  }, [id]);

  useEffect(() => {
    console.log("Receiver ID (from URL):", id); // ID to‘g‘ri kelayotganini tekshirish
  }, [id]);

  // 👇 Socket.io ulanishi
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // 👇 Xabarlarni serverdan olish
  useEffect(() => {
    if (id && userId) {
      socketRef.current?.emit("joinChat", userId);
      fetchMessages();
    }
  }, [id, userId]);

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/messages?userId=${userId}&otherUserId=${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // 👇 Xabar yuborish
  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && id) {
      const newMessage = {
        message: inputMessage.trim(),
        senderId: userId,
        receiverId: id,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      // Xabarni avval lokal state-ga qo‘shish
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Serverga jo‘natish
      socketRef.current?.emit("sendMessage", newMessage);

      setInputMessage("");
    }
  };


  

  return (
    <div className="flex flex-col h-screen">
      {/* 👇 Qabul qiluvchining profili */}
      <div className="flex items-center p-4 border-b">
        {receiver && (
          <>
            {/* <img src={receiver.image} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" /> */}
            <h2 className="text-lg font-semibold">{receiver.nickname}</h2>
          </>
        )}
      </div>

      {/* 👇 Xabarlar */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id || message.createdAt} className={`mb-2 max-w-[80%] ${message.senderId === userId ? "ml-auto" : ""}`}>
            <div className={`p-3 rounded-lg ${message.senderId === userId ? "bg-blue-500 text-white" : "bg-slate-700"}`}>
              <p>{message.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 👇 Xabar yozish formasi */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border rounded-l-lg p-3 focus:outline-none focus:border-blue-500"
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-blue-500 text-white px-6 rounded-r-lg hover:bg-blue-600">
            <Send />
          </button>
        </div>
      </form>
    </div>
  );
}
