import { TypedCustomEventTarget } from "tcet";

export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
export interface NameChangedDetail{
    name: string;
}
export interface PositionChangedDetail{
    position: vec3;
}
export interface OrientationChangedDetail{
    orientation: vec4;
}
export class Peer extends TypedCustomEventTarget<Peer, {
    nameChanged: NameChangedDetail,
    positionChanged: PositionChangedDetail,
    orientationChanged: OrientationChangedDetail,
}>{
    private _id: string;
    private _name: string;
    private _position: vec3;
    private _orientation: vec4;
    constructor(_id: string, _name: string,
        _position: vec3, _orientation: vec4){
        super();
        this._id = _id;
        this._name = _name;
        this._position = _position;
        this._orientation = _orientation;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name: string){
        this._name = name;
        this.dispatchCustomEvent("nameChanged", {name});
    }

    get position(){
        return this._position;
    }

    set position(position: [number, number, number]){
        this._position = position;
        this.dispatchCustomEvent("positionChanged", {position: this._position});
    }

    get orientation(){
        return this._orientation;
    }

    set orientation(orientation: vec4){
        this._orientation = orientation;
        this.dispatchCustomEvent("orientationChanged", {orientation: this._orientation});
    }
}
