import { useRef, type KeyboardEvent, type MouseEvent, type SubmitEvent } from 'react';
import { ChangeState, ClassName, Distributed, GetState, Madoi, SetState } from 'madoi-client';
import { useMadoiModel, useSelfPeer } from 'madoi-client-react';
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
  const speakerNameRef = useRef<HTMLInputElement>(null!);
  const chatMessageRef = useRef<HTMLInputElement>(null!);
  const selfPeer = useSelfPeer(madoi);

  const updateSpeakerName = (event: SubmitEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(speakerNameRef.current.value.trim().length == 0) return;
    madoi.updateSelfPeerProfile("name", speakerNameRef.current.value);
  };

  const sendChatMessage = (event: SubmitEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const text = chatMessageRef.current.value.trim();
    if(text.length === 0) return;
    chatModel.addMessage({
      peerId: selfPeer.id,
      senderName: selfPeer.profile.name,
      text,
      sentAt: new Date().toLocaleTimeString(),
    });
    chatMessageRef.current.value = "";
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
          ref={speakerNameRef}
          aria-label="Speaker name"
          placeholder="名前"
        />
        <button type="submit">変更</button>
      </form>
    </div>
    <div className="chatMessages">
      {chatModel.getMessages().map((message, index) => (
        <div className="chatMessage" key={index}>
          <div className="chatMeta">
            <span>{(message.peerId === selfPeer.id ? "(You)" : "") + (message.senderName || message.peerId.slice(0, 8))}</span>
            <time>{message.sentAt}</time>
          </div>
          <div className="chatText">{message.text}</div>
        </div>
      ))}
    </div>
    <form className="chatForm" onSubmit={sendChatMessage}>
      <input
        ref={chatMessageRef}
        aria-label="Chat message"
        placeholder="メッセージを入力"
      />
      <button type="submit">送信</button>
    </form>
  </aside>;
}
