import "./MessageList.css";
import useLoginContext from "../hooks/useLoginContext.ts";
import type { ChatMessage } from "../util/types.ts";
import { useEffect, useRef } from "react";
import useTimeSince from "../hooks/useTimeSince.ts";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useLoginContext();
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const timeSince = useTimeSince();
  useEffect(() => {
    if (!chatWindowRef.current) return;
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="chatWindow" ref={chatWindowRef}>
      <div className="chatScroller">
        {messages.map((message) => {
          // Move messages
          if ("type" in message && message.type === "move") {
            // Use structured moveInfo for action and sender
            const isMe = user && message.createdBy && user.username === message.createdBy.username;
            const sender = isMe ? "You" : message.createdBy.display;
            let action = message.text;
            if (
              message.moveInfo &&
              typeof message.moveInfo === "object" &&
              "action" in message.moveInfo &&
              typeof message.moveInfo.action === "string"
            ) {
              action = message.moveInfo.action;
            }
            // Only call replace if action is a string
            const actionText = typeof action === "string" ? action.replace(/^\w+ /, "") : "";
            return (
              <div key={message.messageId} className="chatMove">
                <div className="chatMoveContent">
                  {isMe ? actionText : `${sender} ${actionText}`}
                </div>
                <div className="chatMoveSender">
                  {sender} {timeSince(message.createdAt)}
                </div>
              </div>
            );
          }
          // System/meta messages
          if ("meta" in message) {
            return (
              <div key={message.messageId} className="chatMeta">
                {user.username === message.user.username ? "you" : message.user.display}{" "}
                {message.meta}
                {" chat "}
                {timeSince(message.dateTime)}
              </div>
            );
          }
          // User's own chat messages
          if (user.username === message.createdBy.username) {
            return (
              <div key={message.messageId} className="chatMe">
                <div className="chatSender">{timeSince(message.createdAt)}</div>
                <div className="chatContent">{message.text}</div>
              </div>
            );
          }
          // Other users' chat messages
          return (
            <div key={message.messageId} className="chatOther">
              <div className="chatSender">
                {message.createdBy.display} {timeSince(message.createdAt)}
              </div>
              <div className="chatContent">{message.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
