type ItemValue = number | string | object;
type ItemMap = Record<string, ItemValue>;

export class TypedStorage<Items extends ItemMap>{
    private storage: Storage;
    private keyPrefix?: string;

    constructor(storage: Storage, keyPrefix?: string){
        this.storage = storage;
        this.keyPrefix = keyPrefix;
    }

    getItem<K extends keyof Items>(
        key: K, defaultValue: Items[K] | (()=>Items[K])): Items[K];
    getItem<K extends keyof Items>(
        key: K): Items[K] | null;
    getItem(
        key: string, defaultValue?: ItemValue | (()=>ItemValue)): ItemValue | null
    {
        let ret = this.storage.getItem(this.getKey(key));
        if(ret) ret = JSON.parse(ret);
        if(ret !== null) return ret;
        if(!defaultValue) return null;
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }

    getOrCreateItem<K extends keyof Items & string>(
        key: K,
        defaultValue: Items[K] | (()=>Items[K])): Items[K]
    getOrCreateItem(
        key: string,
        defaultValue: ItemValue | (()=>ItemValue)): any
    {
        let ret = this.getItem(key);
        if(ret) return ret;
        ret = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        this.storage.setItem(this.getKey(key), JSON.stringify(ret));
        return ret;
    }

    setItem<K extends keyof Items & string>(
        key: K, value: Items[K]): void;
    setItem(key: string, value: ItemValue){
        this.storage.setItem(this.getKey(key), JSON.stringify(value));
    }

    removeItem<K extends keyof Items & string>(key: K){
        this.storage.removeItem(this.getKey(key));
    }

    clear(){
        if(!this.keyPrefix || this.keyPrefix.length == 0){
            this.storage.clear();
            return;
        }
        let n = this.storage.length;
        for(let i = 0; i < n; i++){
            const k = this.storage.key(i);
            if(k === null) continue;
            if(k.startsWith(this.keyPrefix)){
                this.storage.removeItem(k);
                n--;
            }
        }
    }

    private getKey(key: string){
        const p = this.keyPrefix;
        if(p && p.length > 0){
            return `${p}.${key}`;
        }
        return key;
    }
}

export class TypedLocalStorage<Items extends Record<string, any>> extends TypedStorage<Items>{
    constructor(prefix?: string){
        super(localStorage, prefix);
    }
}

export class TypedSessionStorage<Items extends Record<string, any>> extends TypedStorage<Items>{
    constructor(prefix?: string){
        super(sessionStorage, prefix);
    }
}
