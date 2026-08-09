export type Tool020RenderableImage = { img: CanvasImageSource; width: number; height: number };
export type Tool020DesignState = {
  bgX:number; bgY:number; bgZoom:number; bgDark:number; bgColor:string;
  title:string; font:string; fontSize:number; color:string; align:CanvasTextAlign;
  titleX:number; titleY:number; outline:boolean; outlineWidth:number; outlineColor:string;
  shadow:boolean; shadowBlur:number; shadowX:number; shadowY:number; shadowColor:string;
  logoX:number; logoY:number; logoScale:number; logoOpacity:number; guide:boolean;
};
export type Tool020Rect = { x:number; y:number; width:number; height:number };

export function wrapTool020Text(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  const out:string[]=[];
  for(const paragraph of text.split("\n")){
    if(!paragraph){out.push("");continue;}
    const hasSpaces=/\s/.test(paragraph);
    const words=hasSpaces?paragraph.split(/\s+/):Array.from(paragraph);
    let line="";
    for(const word of words){
      const sep=hasSpaces?" ":"";
      const next=line?line+sep+word:word;
      if(ctx.measureText(next).width<=maxWidth||!line) line=next;
      else { out.push(line); line=word; }
    }
    out.push(line);
  }
  return out;
}

export function calculateTool020CoverPlacement(imageWidth:number,imageHeight:number,canvasWidth:number,canvasHeight:number,bgX:number,bgY:number,bgZoom:number){
  const base=Math.max(canvasWidth/imageWidth,canvasHeight/imageHeight);
  const scale=base*Math.max(1,bgZoom);
  const width=imageWidth*scale,height=imageHeight*scale;
  const overflowX=Math.max(0,width-canvasWidth),overflowY=Math.max(0,height-canvasHeight);
  return {x:-overflowX*Math.max(0,Math.min(1,bgX)),y:-overflowY*Math.max(0,Math.min(1,bgY)),width,height,scale};
}

export function measureTool020TitleBounds(ctx:CanvasRenderingContext2D,design:Tool020DesignState,safeWidth:number,canvasWidth:number,canvasHeight:number):Tool020Rect|null{
  if(!design.title) return null;
  ctx.save();
  ctx.font=`700 ${design.fontSize}px ${design.font}`;
  const lines=wrapTool020Text(ctx,design.title,safeWidth*.92);
  const lineHeight=design.fontSize*1.18;
  const widths=lines.map(line=>ctx.measureText(line).width);
  const width=Math.max(0,...widths);
  const height=Math.max(lineHeight,lines.length*lineHeight);
  let x=design.titleX*canvasWidth;
  if(design.align==="center") x-=width/2;
  else if(design.align==="right"||design.align==="end") x-=width;
  let y=design.titleY*canvasHeight-height/2;
  const outline=design.outline?design.outlineWidth:0;
  const shadowX=design.shadow?Math.abs(design.shadowX)+design.shadowBlur:0;
  const shadowY=design.shadow?Math.abs(design.shadowY)+design.shadowBlur:0;
  const padX=Math.max(outline,shadowX),padY=Math.max(outline,shadowY);
  ctx.restore();
  return {x:x-padX,y:y-padY,width:width+padX*2,height:height+padY*2};
}

export function calculateTool020LogoBounds(logo:Tool020RenderableImage|null,design:Tool020DesignState,canvasWidth:number,canvasHeight:number):Tool020Rect|null{
  if(!logo) return null;
  const width=canvasWidth*design.logoScale;
  const height=width*(logo.height/logo.width);
  return {x:design.logoX*canvasWidth-width/2,y:design.logoY*canvasHeight-height/2,width,height};
}

export function isTool020RectInside(rect:Tool020Rect|null,safe:Tool020Rect){
  if(!rect) return true;
  return rect.x>=safe.x && rect.y>=safe.y && rect.x+rect.width<=safe.x+safe.width && rect.y+rect.height<=safe.y+safe.height;
}

export function clampTool020CenterToSafe(rect:Tool020Rect|null,currentX:number,currentY:number,safe:Tool020Rect,canvasWidth:number,canvasHeight:number){
  if(!rect) return {x:currentX,y:currentY};
  const inset=1;
  const inner={x:safe.x+inset,y:safe.y+inset,width:Math.max(0,safe.width-inset*2),height:Math.max(0,safe.height-inset*2)};
  let dx=0,dy=0;
  if(rect.width>=inner.width) dx=(inner.x+inner.width/2)-(rect.x+rect.width/2);
  else if(rect.x<inner.x) dx=inner.x-rect.x;
  else if(rect.x+rect.width>inner.x+inner.width) dx=(inner.x+inner.width)-(rect.x+rect.width);
  if(rect.height>=inner.height) dy=(inner.y+inner.height/2)-(rect.y+rect.height/2);
  else if(rect.y<inner.y) dy=inner.y-rect.y;
  else if(rect.y+rect.height>inner.y+inner.height) dy=(inner.y+inner.height)-(rect.y+rect.height);
  return {x:Math.max(0,Math.min(1,currentX+dx/canvasWidth)),y:Math.max(0,Math.min(1,currentY+dy/canvasHeight))};
}

export function drawTool020Banner(ctx:CanvasRenderingContext2D,width:number,height:number,design:Tool020DesignState,bg:Tool020RenderableImage|null,logo:Tool020RenderableImage|null,safeWidth:number){
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle=design.bgColor;
  ctx.fillRect(0,0,width,height);
  if(bg){
    const p=calculateTool020CoverPlacement(bg.width,bg.height,width,height,design.bgX,design.bgY,design.bgZoom);
    ctx.drawImage(bg.img,p.x,p.y,p.width,p.height);
  }
  if(design.bgDark>0){ctx.fillStyle=`rgba(0,0,0,${design.bgDark})`;ctx.fillRect(0,0,width,height);}
  if(logo){
    const bounds=calculateTool020LogoBounds(logo,design,width,height)!;
    ctx.save();ctx.globalAlpha=design.logoOpacity;ctx.drawImage(logo.img,bounds.x,bounds.y,bounds.width,bounds.height);ctx.restore();
  }
  if(design.title){
    ctx.save();ctx.font=`700 ${design.fontSize}px ${design.font}`;ctx.textAlign=design.align;ctx.textBaseline="middle";ctx.fillStyle=design.color;ctx.lineJoin="round";
    const lines=wrapTool020Text(ctx,design.title,safeWidth*.92),lineH=design.fontSize*1.18,startY=design.titleY*height-(lines.length-1)*lineH/2;
    for(let i=0;i<lines.length;i++){
      const y=startY+i*lineH,x=design.titleX*width;
      if(design.shadow){ctx.shadowColor=design.shadowColor;ctx.shadowBlur=design.shadowBlur;ctx.shadowOffsetX=design.shadowX;ctx.shadowOffsetY=design.shadowY;}
      if(design.outline){ctx.strokeStyle=design.outlineColor;ctx.lineWidth=design.outlineWidth*2;ctx.strokeText(lines[i],x,y);}
      ctx.fillText(lines[i],x,y);
    }
    ctx.restore();
  }
}
