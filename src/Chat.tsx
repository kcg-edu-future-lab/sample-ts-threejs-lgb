import { useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { ChangeState, ClassName, Distributed, GetState, Madoi, SetState } from 'madoi-client';
import { useMadoiModel } from 'madoi-client-react';
import type { PeerProfile } from './App';
import './Chat.css';

type ChatMessage = {
  peerId: string;
  senderName?: string;
  text: string;
  sentAt: string;
};

@ClassName("ChatModel")
class ChatModel {
  private messages: ChatMessage[] = [];

  @Distributed()
  @ChangeState()
  addMessage(message: ChatMessage) {
    this.messages = [...this.messages, message];
  }

  @GetState()
  getMessages() {
    return this.messages;
  }

  @SetState()
  setMessages(messages: ChatMessage[]) {
    this.messages = messages;
  }
}

type ChatProps = {
  madoi: Madoi<PeerProfile>;
};

const stopEventPropagation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
  event.stopPropagation();
};

export function Chat({ madoi }: ChatProps) {
  const chatModel = useMadoiModel(madoi, () => new ChatModel());
  const [chatText, setChatText] = useState("");
  const [speakerName, setSpeakerName] = useState(() => {
    const name = madoi.getSelfPeer().profile.name;
    return typeof name === "string" ? name : "";
  });
  const selfPeerId = madoi.getSelfPeer().id;
  const resolvedSpeakerName = speakerName.trim() || "You";

  const updateSpeakerName = (event: FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    madoi.updateSelfPeerProfile("name", speakerName.trim() || undefined);
  };

  const sendChatMessage = (event: FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const text = chatText.trim();
    if(text.length === 0) return;
    chatModel.addMessage({
      peerId: selfPeerId,
      senderName: resolvedSpeakerName,
      text,
      sentAt: new Date().toLocaleTimeString(),
    });
    setChatText("");
  };

  return <aside
    className="chatPanel"
    onClick={stopEventPropagation}
    onContextMenu={stopEventPropagation}
    onDoubleClick={stopEventPropagation}
    onKeyDown={stopEventPropagation}
    onKeyUp={stopEventPropagation}
    onMouseDown={stopEventPropagation}
    onMouseMove={stopEventPropagation}
    onMouseUp={stopEventPropagation}
  >
    <div className="chatHeader">
      <span>Chat</span>
      <form className="speakerNameForm" onSubmit={updateSpeakerName}>
        <input
          aria-label="Speaker name"
          value={speakerName}
          onChange={event => setSpeakerName(event.target.value)}
          onBlur={() => madoi.updateSelfPeerProfile("name", speakerName.trim() || undefined)}
          placeholder="名前"
        />
        <button type="submit">変更</button>
      </form>
    </div>
    <div className="chatMessages">
      {chatModel.getMessages().map((message, index) => (
        <div className="chatMessage" key={index}>
          <div className="chatMeta">
            <span>{message.senderName ?? (message.peerId === selfPeerId ? "You" : message.peerId.slice(0, 8))}</span>
            <time>{message.sentAt}</time>
          </div>
          <div className="chatText">{message.text}</div>
        </div>
      ))}
    </div>
    <form className="chatForm" onSubmit={sendChatMessage}>
      <input
        aria-label="Chat message"
        value={chatText}
        onChange={event => setChatText(event.target.value)}
        placeholder="メッセージを入力"
      />
      <button type="submit">送信</button>
    </form>
  </aside>;
}
