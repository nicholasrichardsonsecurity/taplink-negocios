import {randomBytes,scrypt as nodeScrypt,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";

const scrypt=promisify(nodeScrypt);
const KEY_LENGTH=64;

export async function hashPassword(password:string){
 const salt=randomBytes(16);
 const derived=await scrypt(password,salt,KEY_LENGTH) as Buffer;
 return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password:string,stored:string){
 const [algorithm,saltValue,hashValue]=stored.split("$");
 if(algorithm!=="scrypt"||!saltValue||!hashValue)return false;
 const expected=Buffer.from(hashValue,"base64url");
 const actual=await scrypt(password,Buffer.from(saltValue,"base64url"),expected.length) as Buffer;
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
