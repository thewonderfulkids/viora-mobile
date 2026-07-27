import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Platform } from "react-native";

import { storage } from "../../firebase/firebaseConfig";
import { AdminContentCategory, AdminContentKind, AdminMediaType } from "../../types";

export type PickedMediaFile = { name: string; mimeType: string; size: number; uri?: string; webFile?: File };
export type MediaUploadProgress = { transferred: number; total: number; percent: number };
export type MediaUploadResult = { downloadUrl: string; storagePath: string; fileName: string; contentType: string; size: number };
type PickKind = "video" | "audio" | "image";

const LIMITS: Record<PickKind, number> = { video: 500*1024*1024, audio: 100*1024*1024, image: 10*1024*1024 };
function accept(kind: PickKind) { return kind === "video" ? "video/mp4,video/webm,video/quicktime" : kind === "audio" ? "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/aac" : "image/jpeg,image/png,image/webp"; }
function safeName(value:string){ return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/-+/g,"-") || `media-${Date.now()}`; }
function mime(name:string,value?:string|null){ if(value) return value; const n=name.toLowerCase(); if(n.endsWith('.mp4'))return 'video/mp4';if(n.endsWith('.webm'))return 'video/webm';if(n.endsWith('.mp3'))return 'audio/mpeg';if(n.endsWith('.m4a'))return 'audio/mp4';if(n.endsWith('.wav'))return 'audio/wav';if(n.endsWith('.png'))return 'image/png';if(n.endsWith('.webp'))return 'image/webp';return 'image/jpeg'; }

async function pickWeb(kind:PickKind):Promise<PickedMediaFile|null>{
 return new Promise(resolve=>{ const input=document.createElement('input');input.type='file';input.accept=accept(kind);input.style.display='none';input.onchange=()=>{const file=input.files?.[0];input.remove();resolve(file?{name:file.name,mimeType:mime(file.name,file.type),size:file.size,webFile:file}:null)};document.body.appendChild(input);input.click(); });
}
async function pickNative(kind:PickKind):Promise<PickedMediaFile|null>{
 if(kind==='audio') throw new Error('Audio upload is available from the Viora web admin panel.');
 const permission=await ImagePicker.requestMediaLibraryPermissionsAsync(); if(!permission.granted) throw new Error('Media library permission is required.');
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:kind==='video'?ImagePicker.MediaTypeOptions.Videos:ImagePicker.MediaTypeOptions.Images,quality:kind==='image'?0.9:undefined,allowsEditing:false});
 if(result.canceled||!result.assets[0])return null; const a=result.assets[0];const name=a.fileName||`${kind}-${Date.now()}${kind==='video'?'.mp4':'.jpg'}`;return{name,mimeType:mime(name,a.mimeType),size:a.fileSize||0,uri:a.uri};
}
export async function pickMediaFile(kind:PickKind){ const f=Platform.OS==='web'?await pickWeb(kind):await pickNative(kind);if(!f)return null;if(f.size>LIMITS[kind])throw new Error(`${kind} file is larger than the allowed limit.`);return f; }
async function body(file:PickedMediaFile):Promise<Blob|File>{if(file.webFile)return file.webFile;if(!file.uri)throw new Error('Selected file cannot be read.');const response=await fetch(file.uri);if(!response.ok)throw new Error('Selected file could not be loaded.');return response.blob();}
export function mediaKindFromDraft(kind:AdminContentKind,mediaType?:AdminMediaType):'video'|'audio'{return kind==='music'||mediaType==='audio'?'audio':'video';}
export async function uploadAdminMedia(input:{file:PickedMediaFile;category:AdminContentCategory;contentKind:AdminContentKind;mediaKind:PickKind;onProgress?:(p:MediaUploadProgress)=>void}):Promise<MediaUploadResult>{
 const blob=await body(input.file);const folder=input.mediaKind==='image'?'thumbnails':input.mediaKind==='audio'?'audio':'videos';const storagePath=`viora-media/${input.category}/${folder}/${Date.now()}-${safeName(input.file.name)}`;const task=uploadBytesResumable(ref(storage,storagePath),blob,{contentType:input.file.mimeType,customMetadata:{category:input.category,contentKind:input.contentKind}});
 await new Promise<void>((resolve,reject)=>task.on('state_changed',s=>input.onProgress?.({transferred:s.bytesTransferred,total:s.totalBytes,percent:s.totalBytes?Math.round(s.bytesTransferred/s.totalBytes*100):0}),reject,resolve));
 return{downloadUrl:await getDownloadURL(task.snapshot.ref),storagePath,fileName:input.file.name,contentType:input.file.mimeType,size:input.file.size};
}
