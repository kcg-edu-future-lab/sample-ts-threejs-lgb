import { ClassName, EnterRoomAllowed, type EnterRoomAllowedDetail, PeerEntered, type PeerEnteredDetail, type PeerInfo, PeerLeaved, type PeerLeavedDetail, PeerProfileUpdated, type PeerProfileUpdatedDetail } from "madoi-client";
import { Peer } from "./Peer";

@ClassName("VirtualRoomLocalModel")
export class PeerManager {
    private self: Peer;
    private others: Map<string, Peer> = new Map();

    constructor(){
        this.self = new Peer("", "", [0, 0, 0], [0, 0, 0, 0]);
    }

    get selfAvatar(){
        return this.self;
    }

    get otherAvatars(){
        return Array.from(this.others.values());
    }

    @EnterRoomAllowed()
    protected enterRoomAllowed({selfPeer, otherPeers}: EnterRoomAllowedDetail){
        this.self = this.createPeerFromPeerInfo(selfPeer);
        for(const p of otherPeers){
            this.others.set(p.id, this.createPeerFromPeerInfo(p));
        }
    }

    @PeerEntered()
    protected peerEntered({peer}: PeerEnteredDetail){
        this.others.set(peer.id, this.createPeerFromPeerInfo(peer));
    }

    @PeerProfileUpdated()
    protected peerProfileUpdated({peerId, updates}: PeerProfileUpdatedDetail){
        let avatar: Peer | undefined = this.self;
        if(this.self.id !== peerId){
            avatar = this.others.get(peerId);
        }
        if(!avatar || !updates) return;
        if(updates["name"]) avatar.name = updates["name"];
        else if(updates["position"]) avatar.position = updates["position"];
        else if(updates["orientation"]) avatar.orientation = updates["orientation"];
    }

    @PeerLeaved()
    protected peerLeaved({peerId}: PeerLeavedDetail){
        this.others.delete(peerId);
    }

    private createPeerFromPeerInfo(p: PeerInfo){
        return new Peer(
            p.id, p.profile["name"],
            p.profile["position"],
            p.profile["quaternion"]);
    }
}
