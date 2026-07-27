import { useVideoPlayer, VideoView } from "expo-video";
import { X } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
export function WorkoutVideoPlayer({title,url,onClose}:{title:string;url:string;onClose:()=>void}){const player=useVideoPlayer(url,p=>{p.loop=false;p.muted=false;p.volume=1;p.play()});useEffect(()=>()=>{try{player.pause()}catch{}},[player]);return <View style={s.card}><View style={s.header}><View style={{flex:1}}><Text style={s.eyebrow}>NOW PLAYING</Text><Text style={s.title}>{title}</Text></View><Pressable onPress={onClose} style={s.close}><X size={19} color={colors.text}/></Pressable></View><VideoView player={player} nativeControls contentFit="contain" style={s.video}/></View>}
const s=StyleSheet.create({card:{overflow:'hidden',borderRadius:radius.xxl,backgroundColor:'#061D17',borderWidth:1,borderColor:colors.primary},header:{padding:spacing.md,flexDirection:'row',alignItems:'center',gap:spacing.md},eyebrow:{color:'#9DE8C4',fontSize:9,fontWeight:'900',letterSpacing:1},title:{marginTop:3,color:colors.white,fontSize:16,fontWeight:'900'},close:{width:38,height:38,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.white},video:{width:'100%',aspectRatio:16/9,backgroundColor:'#000'}});
