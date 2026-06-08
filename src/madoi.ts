/**
 * Madoi is licensed under ASL2.0
 * Copyright kcg.edu FutureLab.
 * see https://github.com/kcg-edu-future-lab/madoi
 */
import { type TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";

// ---- message definitions ----
export type CastType =
	"UNICAST" | "MULTICAST" | "BROADCAST" |
	"SELFCAST" | "OTHERCAST" | 
	"PEERTOSERVER" | "SERVERTOPEER";

export interface Message{
	type: string;
	sender: string;
	castType: CastType;
	recipients: string[] | undefined;
	[name: string]: any;
}

export interface RoomSpec{
	maxLog: number;
}
export interface RoomInfo{
	id: string;
	spec: RoomSpec;
	profile: {[key: string]: any};
}
export interface PeerInfo{
	id: string;
	order: number;
	profile: {[key: string]: any};
}

// CastType別メッセージ用interface。
export interface ServerToPeerMessage extends Message{
	sender: "__SERVER__";
	castType: "SERVERTOPEER";
	recipients: undefined;
}
export interface PeerToServerMessage extends Message{
	castType: "PEERTOSERVER";
	recipients: undefined;
}
const peerToServerMessageDefault = {
	sender: "__PEER__",
	castType: "PEERTOSERVER" as "PEERTOSERVER",
	recipients: undefined
};

export interface PeerToPeerMessage extends Message{
	castType: "UNICAST" | "MULTICAST" | "BROADCAST" | "SELFCAST" | "OTHERCAST";
}

export interface BroadcastMessage extends PeerToPeerMessage{
	castType: "BROADCAST";
	recipients: undefined;
}
const broadcastMessageDefault = {
	sender: "__PEER__",
	castType: "BROADCAST" as "BROADCAST",
	recipients: undefined
};

export interface BroadcastOrOthercastMessage extends PeerToPeerMessage{
	castType: "BROADCAST" | "OTHERCAST";
	recipients: undefined;
}
const broadcastOrOthercastMessageDefault = {
	sender: "__PEER__",
	recipients: undefined
};

export interface Ping extends PeerToServerMessage{
	type: "Ping";
	body: object | undefined;
}
export function newPing(body = undefined): Ping{
	return {
		type: "Ping",
		...peerToServerMessageDefault,
		body: body
	};
}

export interface Pong extends ServerToPeerMessage{
	type: "Pong";
	body: object | undefined;
}

export interface EnterRoomBody{
	room?: {
		spec: RoomSpec;
		profile: {[key: string]: any};
	};
	selfPeer?: PeerInfo;
}
export interface EnterRoom extends PeerToServerMessage, EnterRoomBody{
	type: "EnterRoom";
}
export function newEnterRoom(body: EnterRoomBody): EnterRoom{
	return {
		type: "EnterRoom",
		...peerToServerMessageDefault,
		...body
	};
}

export interface EnterRoomAllowed extends ServerToPeerMessage{
	type: "EnterRoomAllowed";
	room: RoomInfo;
	selfPeer: PeerInfo;
	otherPeers: PeerInfo[];
	histories: StoredMessageType[];
}
export interface EnterRoomDenied extends ServerToPeerMessage{
	type: "EnterRoomDenied";
	message: string;
}

export interface LeaveRoomBody{
}
export interface LeaveRoom extends PeerToServerMessage, LeaveRoomBody{
	type: "LeaveRoom";
}
export function newLeaveRoom(body: LeaveRoomBody): LeaveRoom{
	return {
		type: "LeaveRoom",
		...peerToServerMessageDefault,
		...body
	};
}
export interface LeaveRoomDone extends ServerToPeerMessage{
	type: "LeaveRoomDone";
}

export interface UpdateRoomProfileBody{
	updates?: {[key: string]: any};
	deletes?: string[];
}
export interface UpdateRoomProfile extends BroadcastMessage, UpdateRoomProfileBody{
	type: "UpdateRoomProfile"
}
export function newUpdateRoomProfile(body: UpdateRoomProfileBody): UpdateRoomProfile{
	return {
		type: "UpdateRoomProfile",
		...broadcastMessageDefault,
		...body
	};
}

export interface PeerEntered extends ServerToPeerMessage{
	type: "PeerEntered";
	peer: PeerInfo;
}

export interface PeerLeaved extends ServerToPeerMessage{
	type: "PeerLeaved";
	peerId: string;
}

export interface UpdatePeerProfileBody{
	updates?: {[key: string]: any};
	deletes?: string[];
}
export interface UpdatePeerProfile extends BroadcastMessage, UpdatePeerProfileBody{
	type: "UpdatePeerProfile"
}
export function newUpdatePeerProfile(body: UpdatePeerProfileBody): UpdatePeerProfile{
	return {
		type: "UpdatePeerProfile",
		...broadcastMessageDefault,
		...body
	};
}

export interface FunctionDefinition{
	funcId: number;
	name: string;
	config: MethodConfig;
}
export interface DefineFunctionBody{
	definition: FunctionDefinition;
}
export interface DefineFunction extends PeerToServerMessage, DefineFunctionBody{
	type: "DefineFunction";
}
export function newDefineFunction(body: DefineFunctionBody): DefineFunction{
	return {
		type: "DefineFunction",
		...peerToServerMessageDefault,
		...body
	};
}
export interface MethodDefinition{
	methodId: number;
	name: string;
	config: MethodConfig;
}
export interface ObjectDefinition{
	objId: number;
	className: string;
	methods: MethodDefinition[];
}
export interface DefineObjectBody{
	definition: ObjectDefinition;
}
export interface DefineObject extends PeerToServerMessage, DefineObjectBody{
	type: "DefineObject";
}
export function newDefineObject(body: DefineObjectBody): DefineObject{
	return {
		type: "DefineObject",
		...peerToServerMessageDefault,
		...body
	}
}

export interface InvokeFunctionBody{
	funcId: number;
	args: any[];
}
export interface InvokeFunction extends BroadcastOrOthercastMessage, InvokeFunctionBody{
	type: "InvokeFunction";
}
export function newInvokeFunction(castType: "BROADCAST" | "OTHERCAST", body: InvokeFunctionBody): InvokeFunction{
	return {
		type: "InvokeFunction",
		castType: castType,
		...broadcastOrOthercastMessageDefault,
		...body
	};
}
export interface UpdateObjectStateBody{
	objId: number;
	objRevision: number;
	state: string;
}
export interface UpdateObjectState extends PeerToServerMessage{
	type: "UpdateObjectState";
}
export function newUpdateObjectState(body: UpdateObjectStateBody): UpdateObjectState{
	return {
		type: "UpdateObjectState",
		...peerToServerMessageDefault,
		...body
	};
}
export interface InvokeMethodBody{
	objId: number;
	objRevision: number;  // メソッド実行前のクライアントのオブジェクトリビジョン
	methodId: number;
	args: any[];
	serverObjRevision?: number; // サーバー側のオブジェクトリビジョン
}
export interface InvokeMethod extends BroadcastOrOthercastMessage, InvokeMethodBody{
	type: "InvokeMethod";
}
export function newInvokeMethod(castType: "BROADCAST" | "OTHERCAST", body: InvokeMethodBody): InvokeMethod{
	return {
		type: "InvokeMethod",
		castType: castType,
		...broadcastOrOthercastMessageDefault,
		...body
	};
}

export interface UserMessage<C> extends Message{
	content: C;
}

export type UpstreamMessageType =
	Ping |
	EnterRoom | LeaveRoom |
	UpdateRoomProfile | UpdatePeerProfile |
	DefineFunction | DefineObject | 
	InvokeFunction | UpdateObjectState | InvokeMethod;
export type DownStreamMessageType =
	Pong |
	EnterRoomAllowed | EnterRoomDenied | LeaveRoomDone | UpdateRoomProfile |
	PeerEntered | PeerLeaved | UpdatePeerProfile |
	InvokeFunction | UpdateObjectState | InvokeMethod |
	UserMessage<any>;
export type StoredMessageType = InvokeMethod | InvokeFunction | UpdateObjectState;


//---- decorators ----

type MethodConfig = {
	beforeEnterRoom?: {};
	enterRoomAllowed?: {};
	enterRoomDenied?: {};
	leaveRoomDone?: {};
	roomProfileUpdated?: {};
	peerEntered?: {};
	peerLeaved?: {};
	peerProfileUpdated?: {};
	userMessageArrived?: {type: string};
	distributed?: DistributedConfig;
	changeState?: {};
	getState?: GetStateConfig;
	setState?: {};
	hostOnly?: {};
}

function addMethodConfig(config: MethodConfig){
	return (target: any, name: string, _descriptor: PropertyDescriptor) => {
		target[name].madoiMethodConfig_ = {
			...(target[name].madoiMethodConfig_ ? target[name].madoiMethodConfig_ : {}),
			...config};
	}
}

export interface DecoratedMethod{
	madoiMethodConfig_: MethodConfig;
}

// Decorator
export function ClassName(name: string){
	return (target: any) => {
		target.madoiClassConfig_ = {className: name};
	};
}

// Decorator
interface DistributedConfig{
	/**
	 * 実行の順序付けを行うかどうか。trueを指定すると、同じルームに参加しているアプリケーション間でメソッドが同時に実行されても、
	 * 常に同じ順序で実行される。順序づけは、通常、実行要求を一旦サーバに送信してサーバに届いた順に実行要求を各アプリケーションに一斉送信し、
	 * 受信するとメソッドを実行する、という仕組みで実現される。
	 */
	serialized: boolean;
}
const distributedConfigDefault: DistributedConfig = {
	serialized: true
};
export function Distributed(config: DistributedConfig = distributedConfigDefault) {
	return addMethodConfig({distributed: config});
}

// Decorator
export function ChangeState() {
	return addMethodConfig({changeState: {}});
}

// Decorator
export interface GetStateConfig{
	/**
	 * 最初の変更から最大何ミリ秒経過すると変更の取得と送信を行うか。default: 5000。
	 */
	maxInterval?: number;
	/**
	 * 最後の変更から何ミリ秒経過すると変更の取得と送信を行うか。default: 3000。
	 */
	minInterval?: number;
}
const getStateConfigDefault: GetStateConfig = {
	maxInterval: 5000,
	minInterval: 3000
}
export function GetState(config: GetStateConfig = getStateConfigDefault){
	return addMethodConfig({getState: config});
}

// Decorator
export interface SetStateConfig{
}
export function SetState(){
	return addMethodConfig({setState: {}});
}

// Decorator
export function HostOnly(){
	return addMethodConfig({hostOnly: {}});
}

// Decorator
export function BeforeEnterRoom(){
	return addMethodConfig({beforeEnterRoom: {}});
}

// Decorator
export function EnterRoomAllowed(){
	return addMethodConfig({enterRoomAllowed: {}});
}

// Decorator
export function EnterRoomDenied(){
	return addMethodConfig({enterRoomDenied: {}});
}

// Decorator
export function LeaveRoomDone(){
	return addMethodConfig({leaveRoomDone: {}});
}

// Decorator
export function RoomProfileUpdated(){
	return addMethodConfig({roomProfileUpdated: {}});
}

// Decorator
export function PeerEntered(){
	return addMethodConfig({peerEntered: {}});
}
// Decorator
export function PeerLeaved(){
	return addMethodConfig({peerLeaved: {}});
}
// Decorator
export function PeerProfileUpdated(){
	return addMethodConfig({peerProfileUpdated: {}});
}
// Decorator
export interface UserMessageArrivedConfig{
	type: string;
}
export function UserMessageArrived(type: string){
	return addMethodConfig({userMessageArrived: {type}});
}

// ---- madoi ----
export type MethodAndConfigParam = {method: Function} & MethodConfig;

interface FunctionEntry {
	promise?: Promise<any>;
	resolve?: Function;
	reject?: Function;
	original: Function;
	config: {distributed?: {serialized: boolean}, changeState?: {}};
}
type MadoiObject = {[key: string]: any, madoiClassConfig_: {className?: string}, madoiObjectId_: number};
interface ObjectEntry {
	instance: MadoiObject;
	revision: number;  // セッション開始時からの変更回数
	update: number;  // 前回状態送信以降の変更回数。送信毎に0にリセット
}
interface MethodEntry {
	promise?: Promise<any>;
	resolve?: Function;
	reject?: Function;
	original: Function;
	config: {distributed?: {serialized: boolean}, changeState?: {}};
}

//---- events ----
export interface EnterRoomAllowedDetail{
	room: RoomInfo;
	selfPeer: PeerInfo;
	otherPeers: PeerInfo[];
}
export type EnterRoomAllowedListenerOrObject = TypedCustomEventListenerOrObject<Madoi, EnterRoomAllowedDetail>;
export interface EnterRoomDeniedDetail{
	message: string;
}
export type EnterRoomDeniedListenerOrObject = TypedCustomEventListenerOrObject<Madoi, EnterRoomDeniedDetail>;
export interface LeaveRoomDoneDetail{
}
export type LeaveRoomDoneListenerOrObject = TypedCustomEventListenerOrObject<Madoi, LeaveRoomDoneDetail>;
export interface RoomProfileUpdatedDetail{
	updates?: {[key: string]: any};
	deletes?: string[];
}
export type RoomProfileUpdatedListenerOrObject = TypedCustomEventListenerOrObject<Madoi, RoomProfileUpdatedDetail>;
export interface PeerEnteredDetail{
	peer: PeerInfo;
}
export type PeerEnteredListenerOrObject = TypedCustomEventListenerOrObject<Madoi, PeerEnteredDetail>;
export interface PeerLeavedDetail{
	peerId: string;
}
export type PeerLeavedListenerOrObject = TypedCustomEventListenerOrObject<Madoi, PeerLeavedDetail>;
export interface PeerProfileUpdatedDetail{
	peerId: string;
	updates?: {[key: string]: any};
	deletes?: string[];
}
export type PeerProfileUpdatedListenerOrObject = TypedCustomEventListenerOrObject<Madoi, PeerProfileUpdatedDetail>;
export interface UserMessageDetail<T>{
	type: string;
	sender?: string;
	castType?: CastType;
	recipients?: string[];
	content: T;
}
interface ErrorDetail{
	error: any;
}
export type ErrorListenerOrObject = TypedCustomEventListenerOrObject<Madoi, ErrorDetail>;

export type UserMessageListenerOrObject<D> =
	TypedCustomEventListenerOrObject<Madoi, UserMessageDetail<D>> | null;

export class Madoi extends TypedCustomEventTarget<Madoi, {
	enterRoomAllowed: EnterRoomAllowedDetail,
	enterRoomDenied: EnterRoomDeniedDetail,
	leaveRoomDone: LeaveRoomDoneDetail,
	roomProfileUpdated: RoomProfileUpdatedDetail,
	peerEntered: PeerEnteredDetail,
	peerProfileUpdated: PeerProfileUpdatedDetail,
	peerLeaved: PeerLeavedDetail,
	error: ErrorDetail
}>{
	private connecting: boolean = false;

	private interimQueue: Array<object>;

	private distributedFuncs = new Map<string, FunctionEntry>();
	private shareObjects = new Map<number, ObjectEntry>();
	private shareOrNotifyMethods = new Map<string, MethodEntry>();

	// annotated methods
	private getStateMethods = new Map<number, {
		method: (madoi: Madoi)=>any, config: GetStateConfig,
		firstObjModified: number, lastObjModified: number}>();
	private setStateMethods = new Map<number, (state: any, madoi: Madoi)=>void>(); // objectId -> @SetState method
	private beforeEnterRoomMethods = new Map<number, (selfProfile: {[key: string]: string}, madoi: Madoi)=>void>();
	private enterRoomAllowedMethods = new Map<number, (detail: EnterRoomAllowedDetail, madoi: Madoi)=>void>();
	private enterRoomDeniedMethods = new Map<number, (detail: EnterRoomDeniedDetail, madoi: Madoi)=>void>();
	private leaveRoomDoneMethods = new Map<number, (madoi: Madoi)=>void>();
	private roomProfileUpdatedMethods = new Map<number, (detail: RoomProfileUpdatedDetail, madoi: Madoi)=>void>();
	private peerEnteredMethods = new Map<number, (detail: PeerEnteredDetail, madoi: Madoi)=>void>();
	private peerLeavedMethods = new Map<number, (detail: PeerLeavedDetail, madoi: Madoi)=>void>();
	private peerProfileUpdatedMethods = new Map<number, (detail: PeerProfileUpdatedDetail, madoi: Madoi)=>void>();
	private userMessageArrivedMethods: {
		method: (detail: UserMessageDetail<any>, madoi: Madoi)=>void,
		config: UserMessageArrivedConfig}[] = [];

	private url: string;
	private ws: WebSocket | null = null;
	private room: RoomInfo = {id: "", spec: {maxLog: 1000}, profile: {}};
	private selfPeer: PeerInfo = {id: "", order: -1, profile: {}};
	private otherPeers = new Map<string, PeerInfo>();
	private currentSenderId: string | null = null;

	constructor(roomIdOrUrl: string, authToken: string,
			selfPeer?: {id: string, profile: {[key: string]: any}},
			room?: {spec: RoomSpec, profile: {[key: string]: any}}){
		super();
		if(room) this.room = {...this.room, ...room};
		if(selfPeer) this.selfPeer = {...this.selfPeer, ...selfPeer, order: -1};
		this.interimQueue = new Array();
		const sep = roomIdOrUrl.indexOf("?") != -1 ? "&" : "?";
		if(roomIdOrUrl.match(/^wss?:\/\//)){
			this.url = `${roomIdOrUrl}${sep}authToken=${authToken}`;
			this.room.id = roomIdOrUrl.split("rooms/")[1].split("?")[0];
		} else{
			const p = (document.querySelector("script[src$='madoi.js']") as HTMLScriptElement).src.split("\/", 5);
			const contextUrl = (p[0] == "http:" ? "ws:" : "wss:") + "//" + p[2] + "/" + p[3];
			this.url = `${contextUrl}/rooms/${roomIdOrUrl}${sep}authToken=${authToken}`;
			this.room.id = roomIdOrUrl;
		}

		this.ws = new WebSocket(this.url);
		this.ws.onopen = e => this.handleOnOpen(e);
		this.ws.onclose = e => this.handleOnClose(e);
		this.ws.onerror = e => this.handleOnError(e);
		this.ws.onmessage = e => this.handleOnMessage(e);

		setInterval(()=>{this.saveStates();}, 1000);
		setInterval(()=>{this.sendPing();}, 30000);
	}

	getRoom(){
		return this.room;
	}

	updateRoomProfile(name: string, value: any){
		const m: {[key: string]: any} = {};
		m[name] = value;
		this.sendMessage(newUpdateRoomProfile(
			{updates: m}
		));
	}

	removeRoomProfile(name: string){
		this.sendMessage(newUpdateRoomProfile(
			{deletes: [name]}
		));
	}

	getSelfPeer(){
		return this.selfPeer;
	}

	updateSelfPeerProfile(name: string, value: any){
		this.selfPeer.profile[name] = value;
		const m: {[key: string]: any} = {};
		m[name] = value;
		this.sendMessage(newUpdatePeerProfile(
			{updates: m}
		));
		const v: PeerProfileUpdatedDetail = {updates: m, peerId: this.selfPeer.id};
		for(const [_, f] of this.peerProfileUpdatedMethods){
			f(v, this);
		}
		this.dispatchCustomEvent("peerProfileUpdated", v);
	}

	removeSelfPeerProfile(name: string){
		delete this.selfPeer.profile[name];
		this.sendMessage(newUpdatePeerProfile(
			{deletes: [name]}
		));
		const v: PeerProfileUpdatedDetail = {deletes: [name], peerId: this.selfPeer.id};
		for(const [_, f] of this.peerProfileUpdatedMethods){
			f(v, this);
		}
		this.dispatchCustomEvent("peerProfileUpdated", v);
	}

	getOtherPeers(){
		return Array.from(this.otherPeers.values());
	}

	isMessageProcessing(){
		return this.currentSenderId !== null;
	}

	getCurrentSender(){
		if(this.currentSenderId === null) return null;
		if(this.isCurrentSenderSelf()) return this.selfPeer;
		return this.otherPeers.get(this.currentSenderId);
	}

	isCurrentSenderSelf(){
		return this.currentSenderId === this.selfPeer.id;
	}

	close(){
		this.ws?.close();
		this.ws = null;
	}

	private sendPing(){
		this.ws?.send(JSON.stringify(newPing()));
	}

	private handleOnOpen(_e: Event){
		this.connecting = true;

		for(const [_, f] of this.beforeEnterRoomMethods){
			f(this.selfPeer.profile, this);
		}
		this.doSendMessage(newEnterRoom({ room: this.room, selfPeer: this.selfPeer }));
		for(let m of this.interimQueue){
			this.ws?.send(JSON.stringify(m));
		}
		this.interimQueue = [];
	}

	private handleOnClose(e: CloseEvent){
		console.debug(`websocket closed because: ${e.reason}.`);
		this.connecting = false;
		this.ws = null;
	}

	private handleOnError(_e: Event){
	}

	private handleOnMessage(e: MessageEvent){
		const msg = JSON.parse(e.data);
		this.currentSenderId = msg.sender;
		try{
			this.data(msg);
		} finally{
			this.currentSenderId = null;
		}
	}

	private data(msg: DownStreamMessageType){
		if(msg.type == "Pong"){
		} else if(msg.type === "EnterRoomAllowed"){
			const m: EnterRoomAllowedDetail = msg as EnterRoomAllowed;
			for(const [_, f] of this.enterRoomAllowedMethods){
				f(m, this);
			}
			this.room = msg.room;
			this.selfPeer.order = msg.selfPeer.order;
			for(const p of m.otherPeers){
				this.otherPeers.set(p.id, p);
			}
			this.dispatchCustomEvent("enterRoomAllowed", m);
			if(msg.histories) for(const h of msg.histories){
				this.data(h);
			}
		} else if(msg.type === "EnterRoomDenied"){
			const m = msg as EnterRoomDenied;
			const d: EnterRoomDeniedDetail = m;
			for(const [_, f] of this.enterRoomDeniedMethods){
				f(d, this);
			}
			this.dispatchCustomEvent("enterRoomDenied", d);
		} else if(msg.type == "LeaveRoomDone"){
			for(const [_, f] of this.leaveRoomDoneMethods){
				f(this);
			}
			this.dispatchCustomEvent("leaveRoomDone");
		} else if(msg.type === "UpdateRoomProfile"){
			const m = msg as UpdateRoomProfile;
			if(m.updates) for(const [key, value] of Object.entries(m.updates)) {
				this.room.profile[key] = value;
			}
			if(m.deletes) for(const key of m.deletes){
				delete this.room.profile[key];
			}
			const v: RoomProfileUpdatedDetail = {updates: m.updates, deletes: m.deletes};
			for(const [_, f] of this.roomProfileUpdatedMethods){
				f(v, this);
			}
			this.dispatchCustomEvent("roomProfileUpdated", v);
		} else if(msg.type === "PeerEntered"){
			const m: PeerEnteredDetail = msg as PeerEntered;
			this.otherPeers.set(m.peer.id, m.peer);
			for(const [_, f] of this.peerEnteredMethods){
				f(m, this);
			}
			this.dispatchCustomEvent("peerEntered", m);
		} else if(msg.type === "PeerLeaved"){
			const m: PeerLeavedDetail = msg as PeerLeaved;
			this.otherPeers.delete(msg.peerId);
			for(const [_, f] of this.peerLeavedMethods){
				f(m, this);
			}
			this.dispatchCustomEvent("peerLeaved", m);
		} else if(msg.type === "UpdatePeerProfile"){
			const p = this.otherPeers.get(msg.sender!);
			if(msg.sender && p){
				if(msg.updates) for(const [key, value] of Object.entries(msg.updates)) {
					p.profile[key] = value;
				}
				if(msg.deletes) for(const key of msg.deletes){
					delete p.profile[key];
				}
				const v: PeerProfileUpdatedDetail = {...msg, peerId: msg.sender};
				for(const [_, f] of this.peerProfileUpdatedMethods){
					f(v, this);
				}
				this.dispatchCustomEvent("peerProfileUpdated", v);
			}
		} else if(msg.type === "InvokeFunction"){
			const id = `${msg.funcId}`;
			const f = this.distributedFuncs.get(id);
			if(f === undefined){
				console.warn("no suitable function for ", msg);
				return;
			}
			const ret = this.applyInvocation(f.original, msg.args);
			if(ret instanceof Promise){
				ret.then(()=>{
					f.resolve?.apply(null, arguments);
				}).catch(()=>{
					f.reject?.apply(null, arguments);
				});
			}
		} else if(msg.type === "UpdateObjectState"){
			const f = this.setStateMethods.get(msg.objId);
			if(f) f(msg.state, msg.objRevision);
			const o = this.shareObjects.get(msg.objId);
			if(o) {
				o.revision = msg.objRevision;
				o.update = 0;
			}
		} else if(msg.type === "InvokeMethod"){
			const o = this.shareObjects.get(msg.objId);
			if(o === undefined){
				console.error(`Object not found for id: ${msg.objId}.`, msg);
				return;
			}
			const id = `${msg.objId}:${msg.methodId}`;
			const m = this.shareOrNotifyMethods.get(id);
			if(m === undefined){
				console.error(`Method not found for id: ${id}.`, msg);
				return;
			}
			if(m.config.distributed){
				if(m.config.distributed.serialized && o.revision + 1 !== msg.serverObjRevision){
					console.error(`Found inconsistency. serverObjRevision must be ${o.revision + 1}` +
						` but ${msg.serverObjRevision}.`, msg);
				}
				o.revision++;
				o.update++;
			}
			const ret = this.applyInvocation(m.original, msg.args);
			if(ret instanceof Promise){
				ret.then(function(){
					m.resolve?.apply(null, arguments);
				}).catch(function(){
					m.reject?.apply(null, arguments);
				});
			}
		} else if(msg.type){
			const m = msg as UserMessageDetail<any>;
			for(const mc of this.userMessageArrivedMethods){
				if(mc.config.type === msg.type){
					mc.method(m, this);
				}
			}
			this.dispatchEvent(new CustomEvent(msg.type, {detail: msg}));
		} else{
			console.warn("Unknown message type.", msg);
		}
	}

	private systemMessageTypes = [
		"Ping", "Pong",
		"EnterRoom", "EnterRoomAllowed", "EnterRoomDenied",
		"LeaveRoom", "LeaveRoomDone", "UpdateRoomProfile",
		"PeerArrived", "PeerLeaved", "UpdatePeerProfile",
		"DefineFunction", "DefineObject", 
		"InvokeFunction", "UpdateObjectState", "InvokeMethod"
	];
	private isSystemMessageType(type: string){
		return type in this.systemMessageTypes;
	}

	send(type: string, content: any,
		castType: "BROADCAST" | "SELFCAST" | "OTHERCAST" | "PEERTOSERVER" = "BROADCAST"
	){
		if(!this.ws) return;
		this.sendMessage({
			type: type,
			sender: this.selfPeer.id,
			castType: castType,
			recipients: undefined,
			content: content,
		});
	}

	unicast(type: string, content: any, recipient: string){
		this.sendMessage({
			type: type,
			sender: this.selfPeer.id,
			castType: "UNICAST",
			recipients: [recipient],
			content: content
		});
	}

	multicast(type: string, content: any, recipients: string[]){
		this.sendMessage({
			type: type,
			sender: this.selfPeer.id,
			castType: "MULTICAST",
			recipients: recipients,
			content: content
		});
	}

	broadcast(type: string, content: any){
		this.sendMessage({
			type: type,
			sender: this.selfPeer.id,
			castType: "BROADCAST",
			recipients: undefined,
			content: content
		});
	}

	othercast(type: string, content: any){
		this.sendMessage({
			type: type,
			sender: this.selfPeer.id,
			castType: "OTHERCAST",
			recipients: undefined,
			content: content
		});
	}

	sendMessage(msg: Message){
		if(this.isSystemMessageType(msg.type))
			throw new Error("システムメッセージは送信できません。");
		this.doSendMessage(msg);
	}
	addReceiver<D>(type: string, listener: UserMessageListenerOrObject<D>){
		if(this.isSystemMessageType(type))
			throw new Error("システムメッセージのレシーバは登録できません。");
		this.addEventListener(type as any, listener as EventListener);
	}

	removeReceiver<D>(type: string, listener: UserMessageListenerOrObject<D>){
		this.removeEventListener(type as any, listener as EventListener);
	}

	private replacer(_: any, value: any) {
		if (value instanceof Map) {
			return Object.fromEntries(value);
		} else {
			return value;
		}
	}

	private doSendMessage(msg: Message){
		if(this.connecting){
			this.ws?.send(JSON.stringify(msg, this.replacer));
		} else{
			this.interimQueue.push(msg);
		}
	}

	registerFunction<T extends Function>(func: T, config: MethodConfig = {distributed: distributedConfigDefault}): T{
		if(config.hostOnly){
			return this.addHostOnlyFunction(func, config);
		} else if(config.distributed || config.changeState){
			const funcName = func.name;
			const funcId = this.distributedFuncs.size;
			const f = this.createFunctionProxy(func, config, funcId);
			const ret = function(){
				return f.apply(null, arguments);
			} as any;
			this.doSendMessage(newDefineFunction({
				definition: { funcId, name: funcName, config}
			}));
			return ret;
		}
		return func;
	}

	register<T>(object: T, methodAndConfigs: MethodAndConfigParam[] = []): T{
		if(!this.ws) return object;
		const obj = object as MadoiObject;
		if(obj.madoiObjectId_){
			console.warn("Ignore object registration because it's already registered.");
			return object;
		}
		let className = obj.constructor.name;
		if(obj.__proto__.constructor.madoiClassConfig_){
			className = obj.__proto__.constructor.madoiClassConfig_.className;
		}
		// 共有オブジェクトのidを確定
		const objId = this.shareObjects.size;
		const objEntry = {instance: obj, revision: 0, update: 0};
		this.shareObjects.set(objId, objEntry);
		obj.madoiObjectId_ = objId;

		// コンフィグを集める
		const methods = new Array<Function>();
		const methodDefinitions = new Array<MethodDefinition>();
		const methodToIndex = new Map<string, number>();
			// デコレータから
		Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(methodName => {
			const f = obj[methodName];
			if(typeof(f) != "function") return;
			if(!f.madoiMethodConfig_) return;
			const cfg: MethodConfig = (f as DecoratedMethod).madoiMethodConfig_;
			const mi = methods.length;
			methodToIndex.set(methodName, mi);
			methods.push(f);
			methodDefinitions.push({methodId: mi, name: methodName, config: cfg});
			console.debug(`add config ${className}.${methodName}=${JSON.stringify(cfg)} from decorator`);
		});
			// 引数から
		for(const mc of methodAndConfigs){
			const f = mc.method;
			const c: MethodConfig = mc;
			const methodName = f.name;
			const mi = methodToIndex.get(methodName);
			if(typeof mi === "undefined"){
				// 追加
				if(c.distributed) c.distributed = {...distributedConfigDefault, ...c.distributed};
				if(c.getState) c.getState = {...getStateConfigDefault, ...c.getState};
				const mi = methods.length;
				methodToIndex.set(methodName, mi);
				methods.push(f);
				methodDefinitions.push({methodId: mi, name: mc.method.name, config: c});
				console.debug(`add config ${className}.${methodName}=${JSON.stringify(mc)} from argument`);
			} else{
				// 既にあれば設定をマージ
				methodDefinitions[mi].config = {
					...methodDefinitions[mi].config,
					...mc
				};
				console.debug(`merge config ${className}.${methodName}=${JSON.stringify(mc)} from argument`);
			}
		}

		// 集めたコンフィグ内のメソッドに応じて登録や置き換え処理を行う。
		for(let i = 0; i < methods.length; i++){
			const f = methods[i];
			const mc = methodDefinitions[i];
			const c = mc.config;
			if(c.distributed || c.changeState){
				// @Distributed, @ChangeStateの場合はメソッドを置き換え
				obj[mc.name] = this.createMethodProxy(
					f.bind(obj), c, objId, mc.methodId);
			} else if(c.hostOnly){
				// @HostOnlyの場合はメソッドを置き換え
				obj[mc.name] = this.addHostOnlyFunction(
					f.bind(obj), mc.config, objId);
			} else if(c.getState){
				this.getStateMethods.set(objId, {
					method: f.bind(obj), config: c.getState,
					firstObjModified: -1, lastObjModified: -1});
			} else if(c.setState){
				this.setStateMethods.set(objId, f.bind(obj));
			} else if(c.beforeEnterRoom){
				this.beforeEnterRoomMethods.set(objId, f.bind(obj));
			} else if(c.enterRoomAllowed){
				this.enterRoomAllowedMethods.set(objId, f.bind(obj));
			} else if(c.enterRoomDenied){
				this.enterRoomDeniedMethods.set(objId, f.bind(obj));
			} else if(c.leaveRoomDone){
				this.leaveRoomDoneMethods.set(objId, f.bind(obj));
			} else if(c.peerEntered){
				this.peerEnteredMethods.set(objId, f.bind(obj));
			} else if(c.peerProfileUpdated){
				this.peerProfileUpdatedMethods.set(objId, f.bind(obj));
			} else if(c.peerLeaved){
				this.peerLeavedMethods.set(objId, f.bind(obj));
			} else if(c.userMessageArrived){
				this.userMessageArrivedMethods.push({
					method: f.bind(obj), config: c.userMessageArrived});
			}
		}
		this.doSendMessage(newDefineObject({
			definition: { objId, className, methods: methodDefinitions}
		}));
		return object;
	}

	private createFunctionProxy(f: Function, config: MethodConfig, funcId: number): Function{
		const id = `${funcId}`;
		const fe: FunctionEntry = {original: f, config};
		this.distributedFuncs.set(id, fe);
		fe.promise = new Promise((resolve, reject)=>{
			fe.resolve = resolve;
			fe.reject = reject;
		});
		const self = this;
		return function(){
			if(self.ws === null){
				if(f) return f.apply(null, arguments);
			} else{
				let ret = null;
				let castType: CastType = "BROADCAST";
				if(config.distributed && !config.distributed.serialized){
					ret = f.apply(null, arguments);
					castType = "OTHERCAST";
				}
				self.sendMessage(newInvokeFunction(
					castType, { funcId, args: Array.from(arguments)}
				));
				return (ret != null) ? ret : fe.promise;
			}
		};
	}

	private createMethodProxy(f: Function, config: MethodConfig, objId: number, methodId: number): Function{
		const id = `${objId}:${methodId}`;
		const me: MethodEntry = {original: f, config}
		this.shareOrNotifyMethods.set(id, me);
		me.promise = new Promise((resolve, reject)=>{
			me.resolve = resolve;
			me.reject = reject;
		});
		const self = this;
		return function(){
			if(self.ws === null){
				if(f) return f.apply(null, [...arguments, self]);
			} else{
				let ret = null;
				let castType: CastType = "BROADCAST";
				const objEntry = self.shareObjects.get(objId)!;
				const objRevision = objEntry.revision;
				if(config.distributed && !config.distributed.serialized){
					ret = f.apply(null, [...arguments, self]);
					castType = "OTHERCAST";
				}
				if(config.changeState){
					objEntry.revision++;
					objEntry.update++;
				}
				self.sendMessage(newInvokeMethod(
					castType, {
						objId, objRevision, methodId,
						args: Array.from(arguments),
					}
				));
				return (ret != null) ? ret : me.promise;
			}
		};
	}

	private addHostOnlyFunction<T extends Function>(f: T, config: MethodConfig, objId?: number): T{
		const self = this;
		return (function(){
			// 自身がhost(最も小さいorderを持つ場合は実行。そうでなければ無視
			if(!self.isSelfPeerHost()) return;
			if(config.changeState && objId !== undefined){
				self.objectChanged(objId);
			}
			f.apply(null, [...arguments, self]);
		}) as any;
	}

	private objectChanged(objId: number){
		const objEntry = this.shareObjects.get(objId)!;
		objEntry.revision++;
		objEntry.update++;
		const gs = this.getStateMethods.get(objId);
		if(!gs) return;
		const now = performance.now();
		if(gs.firstObjModified == -1){
			gs.firstObjModified = now;
		}
		gs.lastObjModified = now;
	}

	public saveStates(){
		if(!this.ws || !this.connecting) return;
		// ホストでなければ送らない
		if(!this.isSelfPeerHost()) return;
		for(let [objId, oe] of this.shareObjects){
			if(oe.update == 0) continue;
			const info = this.getStateMethods.get(objId);
			if(!info) continue;
			const cfg = info.config;
			const curTick = performance.now();
			const firstModTick = info.firstObjModified;
			const lastModTick = info.lastObjModified;
			if((curTick - lastModTick) >= (cfg.minInterval || 0) ||
				(curTick - firstModTick) >= (cfg.maxInterval || 0)){
				this.doSendMessage(newUpdateObjectState({
					objId, objRevision: oe.revision,
					state: info.method(this)}));
				info.firstObjModified = -1;
				info.lastObjModified = -1;
				oe.update = 0;
				console.debug(`state saved: ${objId}`)
			}
		}
	}

	private applyInvocation(method: Function, args: any[]){
		return method.apply(null, args);
	}

	private isSelfPeerHost(){
		for(const p of this.otherPeers.values()){
			if(p.order < this.selfPeer.order) return false;
		}
		return true;
	}
}
