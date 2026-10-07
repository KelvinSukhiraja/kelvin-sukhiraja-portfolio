// One textured mesh draw per frame; no per-glyph CPU drawing or allocations.
export function createOuroborosRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const vertex = `
  precision mediump float;
  attribute vec2 aUv;
  uniform vec2 uSize;
  uniform vec3 uPointer;
  uniform float uTime;
  varying vec2 vUv;
  void main(){
    vUv=aUv;
    vec2 p=(aUv-.5)*vec2(720.,760.);
    float angle=atan(p.y,p.x);
    float b=smoothstep(0.,1.2,uTime);
    float wave=(sin(angle*3.-uTime*1.1)*5.+sin(angle*5.+uTime*.65)*2.)*b;
    p=p*(1.+sin(uTime*.8)*.012*b)+vec2(cos(angle),sin(angle))*wave;
    vec2 delta=p-uPointer.xy;
    float d=length(delta);
    float pressure=exp(-d*d/9025.)*uPointer.z;
    p+=delta/max(d,12.)*pressure*27.;
    p.x+=sin(uTime*.35)*(aUv.y-.5)*760.*.025*b;
    p.y+=cos(uTime*.29)*(aUv.x-.5)*720.*.015*b;
    float scale=min(uSize.x/720.,uSize.y/760.);
    gl_Position=vec4(p*scale/uSize*vec2(2.,-2.),0.,1.);
  }`;
  const fragment = `precision mediump float;
  uniform sampler2D uMap;
  uniform float uTime;
  varying vec2 vUv;
  void main(){
    vec4 ink=texture2D(uMap,vUv);
    float angle=atan(vUv.y-.5,vUv.x-.5);
    float light=1.+(-.1+.1*sin(angle*2.-uTime*1.4))*smoothstep(0.,1.2,uTime);
    gl_FragColor=vec4(ink.rgb,ink.a*light);
  }`;
  const compile=(type:number, source:string)=>{
    const shader=gl.createShader(type)!; gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;} return shader;
  };
  const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
  if(!vs || !fs){if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);return null;}
  const program=gl.createProgram()!; gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
  const vertices:number[]=[], indices:number[]=[];
  const columns=72, rows=76;
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)vertices.push(x/columns,y/rows);
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const a=y*(columns+1)+x,b=a+columns+1;indices.push(a,b,a+1,a+1,b,b+1);
  }
  const buffer=gl.createBuffer()!, elements=gl.createBuffer()!, texture=gl.createTexture()!;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const location=gl.getAttribLocation(program,'aUv');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elements);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.bindTexture(gl.TEXTURE_2D,texture);
  // Keep the stippled glyph texture crisp on high-density mobile screens.
  // Linear filtering blends the transparent gaps into the white ink and can
  // make the settled ouroboros look like a solid white ring on iOS Safari.
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const size=gl.getUniformLocation(program,'uSize'), time=gl.getUniformLocation(program,'uTime'), pointer=gl.getUniformLocation(program,'uPointer');
  return {
    upload(image:HTMLImageElement){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);},
    draw(width:number,height:number,seconds:number,p:{x:number;y:number;strength:number}){
      gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);gl.uniform2f(size,width,height);gl.uniform1f(time,seconds);gl.uniform3f(pointer,p.x,p.y,p.strength);
      gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    },
    dispose(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteBuffer(elements);gl.deleteProgram(program);},
  };
}
