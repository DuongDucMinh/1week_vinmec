export interface MapLabel { id:string;text:string;x:number;pointY:number;fontSize:number;color:string;bold:boolean;priority:number }
export function arrangeMapLabels(labels:MapLabel[]){
 const rows:{left:number;right:number}[][]=[];
 return [...labels].sort((a,b)=>b.priority-a.priority||a.x-b.x).map(label=>{
  const width=label.text.length*label.fontSize*.68+10;
  const x=Math.max(width/2+6,Math.min(354-width/2,label.x));
  const interval={left:x-width/2,right:x+width/2};
  let row=rows.findIndex(items=>items.every(item=>interval.right+8<=item.left||interval.left>=item.right+8));
  if(row<0){row=rows.length;rows.push([]);}
  rows[row].push(interval);
  return {...label,x,width,y:208+row*24};
 });
}
