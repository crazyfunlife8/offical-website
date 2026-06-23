/* ============================================================
   pages/index-glass-stack.js — 軟體開發三服務堆疊玻璃（WebGL r0.160 module）
   來源 index-rain-preview.html module（commit 442b261 引擎），整併時移除預覽拉軸面板。
   保留 window.__fx（效能/視覺降階鉤子）、QA_MODE（URL gated、production 永為 false）。
   r0.160 走 importmap module、與全站 r128 global 並存、不碰 window.THREE。
   ============================================================ */
    import * as THREE from 'three';
    import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
    import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
    import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
    import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

    const urlParams=new URLSearchParams(window.location.search);
    const QA_MODE=urlParams.get('qa')==='1';
    /* 2026-06-23 創辦人決定拿掉玻璃面板：隱藏玻璃/邊光/Fresnel/背板/陰影/高光，
       只留程式碼雨在深色空間流動、服務文字浮在前。引擎其餘結構保留、可一鍵還原（false）。 */
    const REMOVE_GLASS=true;
    const LIGHTS=[
      {id:'key', name:'key', color:0xf6fbff, size:2.4, defaults:{azimuth:13,elevation:80,distance:6.05,intensity:32}},
      {id:'top', name:'top', color:0xdfeaff, size:1.45, defaults:{azimuth:65,elevation:8,distance:8,intensity:134}},
      {id:'rim', name:'rim', color:0x9edcff, size:1.75, defaults:{azimuth:70,elevation:34,distance:6,intensity:157}},
      {id:'back', name:'back', color:0xb8ccff, size:2.1, defaults:{azimuth:270,elevation:35,distance:4.7,intensity:39}}
    ];
    const state={ thickness:1.55, ior:1.05, roughness:0.06, dispersion:0.26, tiltX:9, tiltY:-12, transmission:1, envMapIntensity:1.2, bloomStrength:0, fresnelPower:2.25, bevelPx:16 };
    for(const spec of LIGHTS){
      for(const prop in spec.defaults) state[spec.id+'_'+prop]=spec.defaults[prop];
    }
    const cssRoot=document.getElementById('devGlassStack');
    const htmlCard=document.getElementById('devStackSlot');
    const devStage=document.getElementById('devCardStage');
    const prevBtn=document.getElementById('devCardPrev');
    const nextBtn=document.getElementById('devCardNext');
    const dotsWrap=document.getElementById('devCardDots');
    const GRAIN=['const nest = createStudio()','export default function App(){','return <Section/>','await build(idea)','if(ready) ship()','render(art, code)','while(true){ create() }'].join('\n').repeat(8);

    /* 三服務內容（取自服務知識庫定稿；客製系統避用「流程自動化」措辭，免與 G 類採集混淆） */
    const CARDS=[
      { i:'01', cpath:'WEB ARCHITECTURE', klab:'// WEB DEVELOPMENT', title:'網站架設', en:'Your digital front door.',
        sub:'從一頁式門面到企業電商，依需求量身打造，不套公版。', ghost:'網',
        svc:[['形象 / 一頁式官網','乾淨俐落的數位門面'],['電商 / 會員整合','線上販售與會員經營'],['客製整合站','特殊流程、活動、訂閱']] },
      { i:'02', cpath:'CUSTOM SYSTEM', klab:'// SYSTEM DEVELOPMENT', title:'客製化系統開發', en:'Built around how you work.',
        sub:'現成軟體框不住的需求，從零打造只屬於你的系統。', ghost:'系',
        svc:[['內部管理後台','訂單、客戶、庫存一站管理'],['系統串接整合','打通既有工具與金流物流'],['資料庫 / 報表系統','數據集中、決策看得見']] },
      { i:'03', cpath:'DIGITAL STRATEGY', klab:'// TRANSFORMATION', title:'數位轉型顧問', en:'Strategy before tooling.',
        sub:'不急著買工具，先把數位這條路怎麼走想清楚。', ghost:'轉',
        svc:[['數位策略診斷','盤點現況、找出卡點'],['工具導入規劃','選對工具、不花冤枉錢'],['團隊數位賦能','讓人跟得上系統']] }
    ];
    const deck=document.getElementById('devStackDeck');
    const cardEls=CARDS.map((c,idx)=>{
      const el=document.createElement('article');
      el.className='html-card';
      el.dataset.i=idx;
      el.innerHTML=
        '<div class="ghost">'+c.ghost+'</div>'+
        '<div class="grain"></div>'+
        '<div class="codebar"><span class="cpath">'+c.cpath+'</span></div>'+
        '<div class="content">'+
          '<span class="knum">'+c.i+'</span>'+
          '<div class="lead">'+
            '<p class="klab">'+c.klab+'</p>'+
            '<h3 class="ztitle">'+c.title+'</h3>'+
            '<p class="zen">'+c.en+'</p>'+
            '<p class="zsub">'+c.sub+'</p>'+
          '</div>'+
          '<div class="svccol">'+
            '<p class="svc-head">服務範疇</p>'+
            '<ul class="svc">'+c.svc.map(s=>'<li><span class="sn">'+s[0]+'</span><span class="sd">'+s[1]+'</span></li>').join('')+'</ul>'+
          '</div>'+
        '</div>';
      el.querySelector('.grain').textContent=GRAIN;
      deck.appendChild(el);
      return el;
    });
    let activeCardIndex=0;
    const dotEls=CARDS.map((card,idx)=>{
      const btn=document.createElement('button');
      btn.className='dev-card-dot';
      btn.type='button';
      btn.setAttribute('aria-label','切換到'+card.title);
      btn.setAttribute('aria-controls','devStackDeck');
      btn.addEventListener('click',()=>goToCard(idx));
      dotsWrap.appendChild(btn);
      return btn;
    });

    function getLightPosition(spec){
      const az=THREE.MathUtils.degToRad(((state[spec.id+'_azimuth']%360)+360)%360);
      const el=THREE.MathUtils.degToRad(state[spec.id+'_elevation']);
      const distance=state[spec.id+'_distance'];
      const horizontal=Math.cos(el)*distance;
      return {
        x:Math.sin(az)*horizontal,
        y:Math.sin(el)*distance,
        z:Math.cos(az)*horizontal
      };
    }


    const canvas=document.getElementById('devStackWebgl');
    const renderer=new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=0.62;
    renderer.useLegacyLights=false;
    renderer.setClearColor(0x000000,0);
    renderer.setClearAlpha(0);
    RectAreaLightUniformsLib.init();
    const STAR_CANVAS_MAX_WIDTH=1280;
    const STAR_CANVAS_MAX_HEIGHT=900;
    const BLOOM_RESOLUTION_SCALE=0.5;
    const TARGET_FRAME_MS=1000/30;
    const IS_MOBILE=window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    const PREFERS_REDUCED_MOTION=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FX={
      bloom:!IS_MOBILE && !PREFERS_REDUCED_MOTION,
      codeScale:IS_MOBILE ? 0.58 : 1,
      codeFrameMs:IS_MOBILE ? 1000/14 : TARGET_FRAME_MS,
      pixelRatioMax:IS_MOBILE ? 1.5 : 2
    };
    const BLOOM_SCENE=1;
    const fxTuning={ heroEdgeGlow:1.45, bloomStrength:0.26, bloomThreshold:0.985, bloomRadius:0.035, rearFrost:1, codeGlow:0.05 };
    const CRYSTAL_BLOOM={ strength:fxTuning.bloomStrength, radius:fxTuning.bloomRadius, threshold:fxTuning.bloomThreshold };
    const CRYSTAL_FRONT={ edgeEnv:2.85, edgeOpacity:0.105, fresnelStrength:fxTuning.heroEdgeGlow, clearcoat:1, clearcoatRoughness:0.012 };
    const FRONT_FACE_COLOR=new THREE.Color(0xeaf3ff);
    const FRONT_FACE={ clearcoat:0.72, clearcoatRoughness:0.08, attenuationDistance:6.5 };

    const scene=new THREE.Scene();
    scene.background=null;
    const camera=new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0,0,8.1);

    const pmremGenerator=new THREE.PMREMGenerator(renderer);
    let studioEnvRT=null;
    let edgeStudioEnvRT=null;
    function buildStudioEnvMap(includeEdgeStrips){
      const envCanvas=document.createElement('canvas');
      envCanvas.width=1024;
      envCanvas.height=512;
      const ctx=envCanvas.getContext('2d');
      const base=ctx.createLinearGradient(0,0,0,512);
      base.addColorStop(0,'#071331');
      base.addColorStop(0.45,'#050d2e');
      base.addColorStop(1,'#01030b');
      ctx.fillStyle=base;
      ctx.fillRect(0,0,1024,512);

      ctx.globalCompositeOperation='screen';
      for(const spec of LIGHTS){
        const pos=getLightPosition(spec);
        const size=THREE.MathUtils.clamp(spec.size,0.55,4.2);
        const strength=THREE.MathUtils.clamp(state[spec.id+'_intensity']/180,0,1);
        const x=512+pos.x*82;
        const y=260-pos.y*86+pos.z*-14;
        const w=120+size*92;
        const h=70+size*48;
        const radius=Math.max(w,h)*0.95;
        const cg=ctx.createRadialGradient(x,y,0,x,y,radius);
        cg.addColorStop(0,'rgba(255,255,255,'+(0.018+strength*0.055)+')');
        cg.addColorStop(0.34,'rgba(232,244,255,'+(0.012+strength*0.038)+')');
        cg.addColorStop(0.72,'rgba(120,190,255,'+(strength*0.018)+')');
        cg.addColorStop(1,'rgba(0,200,255,0)');
        ctx.fillStyle=cg;
        ctx.fillRect(x-radius,y-radius,radius*2,radius*2);

        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(spec.id==='rim' ? -0.1 : spec.id==='back' ? 0.16 : 0);
        ctx.scale(1, h/w);
        const soft=ctx.createRadialGradient(0,0,0,0,0,w*0.54);
        soft.addColorStop(0,'rgba(255,255,255,'+(0.016+strength*0.050)+')');
        soft.addColorStop(0.30,'rgba(232,244,255,'+(0.011+strength*0.034)+')');
        soft.addColorStop(0.68,'rgba(120,190,255,'+(strength*0.014)+')');
        soft.addColorStop(1,'rgba(0,200,255,0)');
        ctx.fillStyle=soft;
        ctx.beginPath();
        ctx.arc(0,0,w*0.54,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      if(includeEdgeStrips){
        const strips=[
          {x:180,y:112,w:300,h:6,r:-0.10,a:0.030,c:'230,248,255'},
          {x:620,y:86,w:220,h:5,r:0.08,a:0.024,c:'150,220,255'},
          {x:710,y:334,w:260,h:5,r:-0.16,a:0.022,c:'0,200,255'},
          {x:108,y:404,w:190,h:4,r:0.14,a:0.016,c:'120,205,255'}
        ];
        for(const strip of strips){
          ctx.save();
          ctx.translate(strip.x,strip.y);
          ctx.rotate(strip.r);
          const lg=ctx.createLinearGradient(-strip.w*0.5,0,strip.w*0.5,0);
          lg.addColorStop(0,'rgba('+strip.c+',0)');
          lg.addColorStop(0.18,'rgba('+strip.c+','+(strip.a*0.46)+')');
          lg.addColorStop(0.48,'rgba(255,255,255,'+strip.a+')');
          lg.addColorStop(0.72,'rgba('+strip.c+','+(strip.a*0.58)+')');
          lg.addColorStop(1,'rgba('+strip.c+',0)');
          ctx.fillStyle=lg;
          ctx.shadowColor='rgba(0,200,255,'+(strip.a*0.45)+')';
          ctx.shadowBlur=8;
          ctx.fillRect(-strip.w*0.5,-strip.h*0.5,strip.w,strip.h);
          ctx.restore();
        }
      }
      ctx.globalCompositeOperation='source-over';

      const envTex=new THREE.CanvasTexture(envCanvas);
      envTex.mapping=THREE.EquirectangularReflectionMapping;
      envTex.colorSpace=THREE.SRGBColorSpace;
      const rt=pmremGenerator.fromEquirectangular(envTex);
      envTex.dispose();
      return rt;
    }
    function rebuildStudioEnvMaps(){
      if(studioEnvRT) studioEnvRT.dispose();
      if(edgeStudioEnvRT) edgeStudioEnvRT.dispose();
      studioEnvRT=buildStudioEnvMap(false);
      edgeStudioEnvRT=buildStudioEnvMap(true);
      scene.environment=studioEnvRT.texture;
    }
    function edgeEnvironmentMap(){
      return edgeStudioEnvRT ? edgeStudioEnvRT.texture : null;
    }
    rebuildStudioEnvMaps();
    function refreshStudioEnvMap(){
      rebuildStudioEnvMaps();
      if(typeof glassMat!=='undefined') glassMat.needsUpdate=true;
      if(typeof edgeMat!=='undefined'){
        edgeMat.envMap=edgeEnvironmentMap();
        edgeMat.needsUpdate=true;
      }
      if(typeof glassCards!=='undefined'){
        for(const card of glassCards){
          card.body.material.envMap=null;
          card.edgeGlow.material.envMap=edgeEnvironmentMap();
          card.body.material.needsUpdate=true;
          card.edgeGlow.material.needsUpdate=true;
        }
      }
      requestSceneRender();
    }

    const bloomComposer=new EffectComposer(renderer);
    bloomComposer.renderToScreen=false;
    bloomComposer.addPass(new RenderPass(scene,camera));
    const bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth*BLOOM_RESOLUTION_SCALE, window.innerHeight*BLOOM_RESOLUTION_SCALE), 0, CRYSTAL_BLOOM.radius, CRYSTAL_BLOOM.threshold);
    bloomComposer.addPass(bloomPass);

    const composer=new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    const finalPass=new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms:{
          baseTexture:{ value:null },
          bloomTexture:{ value:bloomComposer.renderTarget2.texture }
        },
        vertexShader:`
          varying vec2 vUv;
          void main(){
            vUv=uv;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }
        `,
        fragmentShader:`
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main(){
            vec4 base=texture2D(baseTexture,vUv);
            vec4 bloom=texture2D(bloomTexture,vUv);
            float bloomAlpha=clamp(max(max(bloom.r,bloom.g),bloom.b)*1.8,0.0,1.0);
            gl_FragColor=vec4(base.rgb+bloom.rgb,max(base.a,bloomAlpha));
          }
        `
      }),
      'baseTexture'
    );
    composer.addPass(finalPass);
    const smaaPass=new SMAAPass(window.innerWidth*renderer.getPixelRatio(), window.innerHeight*renderer.getPixelRatio());
    composer.addPass(smaaPass);

    const codeCanvas=document.createElement('canvas');
    const codeCtx=codeCanvas.getContext('2d');
    const codeTexture=new THREE.CanvasTexture(codeCanvas);
    codeTexture.colorSpace=THREE.SRGBColorSpace;
    codeTexture.wrapS=THREE.ClampToEdgeWrapping;
    codeTexture.wrapT=THREE.ClampToEdgeWrapping;
    codeTexture.minFilter=THREE.LinearFilter;
    codeTexture.magFilter=THREE.LinearFilter;

    const studioGroup=new THREE.Group();
    scene.add(studioGroup);

    const glassDeckGroup=new THREE.Group();
    scene.add(glassDeckGroup);
    const glassGroup=new THREE.Group();
    glassDeckGroup.add(glassGroup);
    const cardBackPoolMat=new THREE.ShaderMaterial({
      uniforms:{
        uOpacity:{ value:1.0 },
        uCenter:{ value:new THREE.Color(0x010613) },
        uMid:{ value:new THREE.Color(0x061235) },
        uRim:{ value:new THREE.Color(0x0b2b60) }
      },
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`
        uniform float uOpacity;
        uniform vec3 uCenter;
        uniform vec3 uMid;
        uniform vec3 uRim;
        varying vec2 vUv;
        void main(){
          vec2 p=vUv-0.5;
          vec2 box=abs(p)*2.0;
          float rectFalloff=1.0-smoothstep(0.92,1.0,max(box.x,box.y));
          float cornerSoft=1.0-smoothstep(0.94,1.28,length(box*vec2(0.86,1.04)));
          float core=1.0-smoothstep(0.16,0.92,length(p*vec2(1.00,1.18)));
          float alpha=rectFalloff*cornerSoft*uOpacity;
          vec3 color=mix(uMid,uCenter,core);
          color=mix(color,uRim,(1.0-core)*0.18);
          gl_FragColor=vec4(color,alpha);
        }
      `,
      transparent:true,
      depthWrite:false,
      depthTest:false,
      toneMapped:false
    });
    const cardBackPool=new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,1),cardBackPoolMat);
    cardBackPool.renderOrder=-4;
    cardBackPool.visible=!REMOVE_GLASS;
    glassGroup.add(cardBackPool);
    const cardGroundShadowMat=new THREE.ShaderMaterial({
      uniforms:{
        uOpacity:{ value:0.16 },
        uColor:{ value:new THREE.Color(0x00040f) },
        uCyan:{ value:new THREE.Color(0x00c8ff) }
      },
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`
        uniform float uOpacity;
        uniform vec3 uColor;
        uniform vec3 uCyan;
        varying vec2 vUv;
        void main(){
          vec2 p=(vUv-0.5)*vec2(1.0,3.4);
          float core=1.0-smoothstep(0.02,0.50,dot(p,p));
          float halo=1.0-smoothstep(0.20,1.10,dot(p,p));
          vec3 color=mix(uColor,uCyan,halo*0.10);
          gl_FragColor=vec4(color,(core*0.62+halo*0.38)*uOpacity);
        }
      `,
      transparent:true,
      depthWrite:false,
      depthTest:false,
      toneMapped:false
    });
    const cardGroundShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,1),cardGroundShadowMat);
    cardGroundShadow.renderOrder=-5;
    cardGroundShadow.visible=!REMOVE_GLASS;
    glassGroup.add(cardGroundShadow);
    const studioLights={};
    function createStudioLight(spec){
      const softboxSize=Math.max(0.55,spec.size);
      const light=new THREE.RectAreaLight(spec.color, spec.defaults.intensity, softboxSize, softboxSize);
      studioGroup.add(light);
      studioLights[spec.id]={light,spec};
    }
    function aimAtCard(obj){
      obj.lookAt(0,0,0);
    }
    for(const spec of LIGHTS) createStudioLight(spec);

    const GLASS_BEVEL_SEGMENTS=64;
    let GLASS_BEVEL_PX=16;

    function smoothRoundedBoxGeometry(width,height,depth,segments,radius){
      const geo=new RoundedBoxGeometry(width,height,depth,segments,radius);
      geo.computeVertexNormals();
      return geo;
    }

    let glassGeo=smoothRoundedBoxGeometry(1, 1, 0.1, GLASS_BEVEL_SEGMENTS, 0.05);
    const glassMat=new THREE.MeshPhysicalMaterial({
      color:0xeaf3ff,
      metalness:0,
      roughness:state.roughness,
      transmission:state.transmission,
      thickness:state.thickness,
      ior:state.ior,
      dispersion:state.dispersion,
      clearcoat:FRONT_FACE.clearcoat,
      clearcoatRoughness:FRONT_FACE.clearcoatRoughness,
      envMapIntensity:state.envMapIntensity,
      envMap:null,
      attenuationColor:new THREE.Color(0xacc6ff),
      attenuationDistance:6.5,
      transparent:true,
      depthWrite:false,
      opacity:1
    });
    const glass=new THREE.Mesh(glassGeo, glassMat);
    glass.visible=!REMOVE_GLASS;
    glassGroup.add(glass);

    let edgeGeo=smoothRoundedBoxGeometry(1, 1, 0.1, GLASS_BEVEL_SEGMENTS, 0.05);
    const edgeMat=new THREE.MeshPhysicalMaterial({
      color:0xf8fbff,
      roughness:0.006,
      transmission:0.66,
      thickness:1.25,
      ior:1.62,
      dispersion:0.62,
      clearcoat:1,
      clearcoatRoughness:CRYSTAL_FRONT.clearcoatRoughness,
      envMap:edgeEnvironmentMap(),
      envMapIntensity:CRYSTAL_FRONT.edgeEnv,
      transparent:true,
      depthWrite:false,
      opacity:CRYSTAL_FRONT.edgeOpacity,
      side:THREE.FrontSide
    });
    const edgeGlow=new THREE.Mesh(edgeGeo, edgeMat);
    edgeGlow.layers.enable(BLOOM_SCENE);
    edgeGlow.scale.set(1.004,1.004,1.004);
    edgeGlow.visible=!REMOVE_GLASS;
    glassGroup.add(edgeGlow);

    let fresnelGeo=smoothRoundedBoxGeometry(1, 1, 0.1, GLASS_BEVEL_SEGMENTS, 0.05);
    const fresnelMat=new THREE.ShaderMaterial({
      uniforms:{
        uPower:{ value:state.fresnelPower },
        uStrength:{ value:CRYSTAL_FRONT.fresnelStrength },
        uCornerBoost:{ value:2.4 },
        uHalfSize:{ value:new THREE.Vector2(0.5,0.5) },
        uColorA:{ value:new THREE.Color(0xe8f0ff) },
        uColorB:{ value:new THREE.Color(0x00c8ff) }
      },
      vertexShader:`
        varying vec3 vLocalPosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main(){
          vLocalPosition=position;
          vec4 worldPosition=modelMatrix*vec4(position,1.0);
          vWorldPosition=worldPosition.xyz;
          vWorldNormal=normalize(mat3(modelMatrix)*normal);
          gl_Position=projectionMatrix*viewMatrix*worldPosition;
        }
      `,
      fragmentShader:`
        uniform float uPower;
        uniform float uStrength;
        uniform float uCornerBoost;
        uniform vec2 uHalfSize;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vLocalPosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main(){
          vec3 viewDir=normalize(cameraPosition-vWorldPosition);
          float fresnel=pow(1.0-max(dot(normalize(vWorldNormal),viewDir),0.0),uPower);
          vec2 edge=abs(vLocalPosition.xy)/max(uHalfSize,vec2(0.001));
          float corner=smoothstep(0.82,1.0,edge.x)*smoothstep(0.82,1.0,edge.y);
          vec3 color=mix(uColorA,uColorB,0.22+corner*0.10);
          gl_FragColor=vec4(color,fresnel*uStrength*(1.0+corner*(uCornerBoost-1.0)*0.7));
        }
      `,
      transparent:true,
      blending:THREE.AdditiveBlending,
      depthWrite:false,
      toneMapped:false
    });
    const fresnelShell=new THREE.Mesh(fresnelGeo,fresnelMat);
    fresnelShell.layers.enable(BLOOM_SCENE);
    fresnelShell.scale.set(1.004,1.004,1.004);
    fresnelShell.visible=!REMOVE_GLASS;
    glassGroup.add(fresnelShell);

    const highlightGroup=new THREE.Group();
    highlightGroup.visible=!REMOVE_GLASS;
    glassGroup.add(highlightGroup);
    const nearSideMat=new THREE.ShaderMaterial({
      uniforms:{ uColor:{ value:new THREE.Color(0xe8f0ff) }, uAccent:{ value:new THREE.Color(0x00c8ff) }, uOpacity:{ value:0.26 } },
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uOpacity;
        varying vec2 vUv;
        void main(){
          float edgeFade=smoothstep(0.0,0.35,vUv.x)*(1.0-smoothstep(0.72,1.0,vUv.x));
          float endFade=smoothstep(0.0,0.08,vUv.y)*(1.0-smoothstep(0.92,1.0,vUv.y));
          float core=smoothstep(0.22,0.58,vUv.x);
          vec3 color=mix(uColor,uAccent,core*0.18);
          gl_FragColor=vec4(color,edgeFade*endFade*uOpacity);
        }
      `,
      transparent:true,
      blending:THREE.AdditiveBlending,
      depthWrite:false,
      toneMapped:false
    });
    const farSideMat=nearSideMat.clone();
    farSideMat.uniforms.uOpacity={ value:0.06 };
    const depthPoolMat=new THREE.ShaderMaterial({
      uniforms:{
        uColor:{ value:new THREE.Color(0x020816) },
        uCool:{ value:new THREE.Color(0x07183e) },
        uOpacity:{ value:0.055 }
      },
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`
        uniform vec3 uColor;
        uniform vec3 uCool;
        uniform float uOpacity;
        varying vec2 vUv;
        void main(){
          vec2 p=vUv-0.5;
          float oval=1.0-smoothstep(0.20,0.86,length(p*vec2(0.92,1.18)));
          float edgeDist=min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y));
          float edgeRelease=smoothstep(0.03,0.24,edgeDist);
          float nearSideRelease=smoothstep(0.38,0.98,vUv.x)*smoothstep(0.38,0.98,1.0-vUv.y);
          float absorption=oval*edgeRelease*(1.0-nearSideRelease*0.18);
          vec3 color=mix(uColor,uCool,smoothstep(0.25,0.72,vUv.y)*0.22);
          gl_FragColor=vec4(color,absorption*uOpacity);
        }
      `,
      transparent:true,
      depthWrite:false,
      toneMapped:false
    });

    function rebuildHighlightLayer(w,h,r,d,unit){
      while(highlightGroup.children.length){
        const child=highlightGroup.children.pop();
        child.geometry.dispose();
      }
      const z=d/2+unit*2;
      const nearStrip=Math.max(unit*18, d*0.36);
      const farStrip=Math.max(unit*9, d*0.16);

      const pool=new THREE.Mesh(new THREE.PlaneGeometry(w*0.94,h*0.90,1,1),depthPoolMat);
      pool.position.set(0,0,z+unit*0.8);
      highlightGroup.add(pool);
    }

    const glassCards=[
      { group:glassGroup, body:glass, edgeGlow, fresnelShell, depthPool:null, highlightGroup }
    ];

    const CODE=[
      'const nest = createStudio()','export default function App() {','<section class="services">',
      'router.get("/api/orders", fn)','await db.clients.findMany()','npm run build && deploy',
      'return <Card {...props} />','useEffect(() => render(), [])','if (user.ready) launch()',
      'SELECT * FROM orders;','transform: translateY(-4px)','git commit -m "ship it"'
    ];
    const hash=(a,b)=>{ const x=Math.sin(a*127.1+b*311.7)*43758.5453; return x-Math.floor(x); };
    const smoothstep=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
    const drops=Array.from({length:34},(_,i)=>({
      spd:0.085+hash(i,1)*0.11,
      ph:hash(i,2)*1.8,
      sz:18+(hash(i,4)*7|0),
      ye:hash(i,5)<0.12,
      cy:hash(i,6)<0.32
    }));
    /* ===== 卡內程式碼落雨：雨在玻璃裡（不透明深底+落雨碼 plane 置於玻璃 slab 內、被前玻璃折射；只在聚光主卡顯示）
       參數沿用既有程式碼落雨：spd 0.085–0.195（慢）、字級 18–26px、cyc/1.8、白頭+藍/青/金尾漸層（#dev-rain / n4rain 血統）。 */
    const RAIN={ glow:0.84, density:40, speed:0.62, depth:0.78, spread:0.92, lead:0.04, pocket:0.52, pocketR:0.19, bleedX:1.4 };
    const rainCanvas=document.createElement('canvas');
    rainCanvas.width=1792; rainCanvas.height=600;
    const rainCtx=rainCanvas.getContext('2d');
    const rainTexture=new THREE.CanvasTexture(rainCanvas);
    rainTexture.colorSpace=THREE.SRGBColorSpace;
    rainTexture.minFilter=THREE.LinearFilter; rainTexture.magFilter=THREE.LinearFilter;
    const rainCols=Array.from({length:96},(_,i)=>({
      spd:0.085+hash(i,21)*0.11, ph:hash(i,22)*1.8, fs:18+(hash(i,23)*8|0), cyan:hash(i,24)<0.30, ye:hash(i,25)<0.12
    }));
    function drawInnerRain(time){
      const W=rainCanvas.width, H=rainCanvas.height, ctx=rainCtx;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,W,H);
      const bg=ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#040a1e'); bg.addColorStop(0.52,'#050d2a'); bg.addColorStop(1,'#02060f');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      const glow=THREE.MathUtils.clamp(RAIN.glow,0,1.6);
      const cols=Math.max(6, Math.round(RAIN.density * (W/1024)));
      ctx.textBaseline='middle';
      for(let c=0;c<cols;c++){
        const col=rainCols[c % rainCols.length];
        const codeInset=REMOVE_GLASS ? 0 : W*0.08;
        const codeW=REMOVE_GLASS ? W : W*0.84;
        const x=codeInset + codeW*(RAIN.lead + ((c+0.5)/cols)*RAIN.spread);
        const raw=time*col.spd*RAIN.speed + col.ph;
        const cyc=Math.floor(raw/1.8);
        const prog=raw%1.8-0.25;
        if(prog<0) continue;
        const code=CODE[(c*5+cyc)%CODE.length];
        ctx.font=col.fs+'px "JetBrains Mono",monospace';
        const w=ctx.measureText(code).width;
        const tipY=prog*H;
        ctx.save();
        ctx.translate(x,tipY);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign='left';
        const base=col.ye?'255,199,9':col.cyan?'0,200,255':'150,180,235';
        const g=ctx.createLinearGradient(0,0,w,0);
        g.addColorStop(0,'rgba(232,244,255,'+(0.92*glow*0.62)+')');
        g.addColorStop(0.12,'rgba('+base+','+(0.78*glow*0.58)+')');
        g.addColorStop(1,'rgba('+base+',0)');
        ctx.fillStyle=g;
        ctx.fillText(code,0,0);
        ctx.restore();
      }
      if(REMOVE_GLASS){
        /* 玻璃拿掉後：文字後方壓一塊暗 pocket，讓雨退到深處、前景文字坐在安靜深底上 */
        ctx.save();
        ctx.globalCompositeOperation='source-over';
        const pk=RAIN.pocket, pkR=RAIN.pocketR;
        const pocket=ctx.createRadialGradient(W*0.50,H*0.50,0,W*0.50,H*0.50,W*pkR);
        pocket.addColorStop(0,'rgba(0,3,12,'+pk+')');
        pocket.addColorStop(0.46,'rgba(1,7,22,'+(pk*0.66)+')');
        pocket.addColorStop(0.78,'rgba(2,10,30,'+(pk*0.21)+')');
        pocket.addColorStop(1,'rgba(2,10,30,0)');
        ctx.fillStyle=pocket;
        ctx.fillRect(0,0,W,H);
        ctx.restore();
      }
      ctx.save();
      ctx.globalCompositeOperation='destination-in';
      const featherX=W*0.045;
      const featherY=H*0.052;
      /* 拿掉玻璃＋左右出血時：不做水平羽化，讓程式碼流出畫面左右緣（仍保留上下羽化） */
      if(!REMOVE_GLASS){
        const edgeMask=ctx.createLinearGradient(0,0,W,0);
        edgeMask.addColorStop(0,'rgba(0,0,0,0)');
        edgeMask.addColorStop(featherX/W,'rgba(0,0,0,1)');
        edgeMask.addColorStop(1-featherX/W,'rgba(0,0,0,1)');
        edgeMask.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=edgeMask;
        ctx.fillRect(0,0,W,H);
      }
      const verticalMask=ctx.createLinearGradient(0,0,0,H);
      verticalMask.addColorStop(0,'rgba(0,0,0,0)');
      verticalMask.addColorStop(featherY/H,'rgba(0,0,0,1)');
      verticalMask.addColorStop(1-featherY/H,'rgba(0,0,0,1)');
      verticalMask.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=verticalMask;
      ctx.fillRect(0,0,W,H);
      ctx.restore();
      rainTexture.needsUpdate=true;
    }
    function sizeInnerRain(card,w,h,depth){
      if(!card.innerRain) return;
      card.innerRain.geometry.dispose();
      const rainDepth=THREE.MathUtils.clamp(RAIN.depth,0,0.98);
      const z=REMOVE_GLASS ? -rainDepth*depth*0.86 : rainDepth*depth*0.5;
      let planeW=w*1.08, planeH=h*1.08;
      if(REMOVE_GLASS){
        /* 左右延伸超過畫面邊界：依平面實際 z 算可視寬度再乘 bleedX；高度維持卡片高（只往左右延） */
        const camDist=Math.abs(camera.position.z - z);
        const fovRad=THREE.MathUtils.degToRad(camera.fov);
        const visW=2*Math.tan(fovRad/2)*camDist*camera.aspect;
        planeW=visW*(RAIN.bleedX||1.4);
      }
      card.innerRain.geometry=new THREE.PlaneGeometry(planeW,planeH,1,1);
      card.innerRain.position.set(0,0,z);
    }
    for(const card of glassCards){
      const mat=new THREE.MeshBasicMaterial({ map:rainTexture, toneMapped:false, transparent:true, depthWrite:true });
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,1), mat);
      mesh.renderOrder=-1; mesh.visible=false;
      card.group.add(mesh);
      card.innerRain=mesh;
    }
    let starW=1, starH=1, viewW=1, viewH=1, cardRect={left:0,right:0,top:0,bottom:0};
    let rafId=0;
    let lastFrameTime=0;
    let lastCodeFrameTime=0;
    let needsRender=true;
    let qaFramesRemaining=QA_MODE ? 8 : 0;
    let sectionInView=true;

    function renderActive(){ return QA_MODE || (!document.hidden && sectionInView); }
    function requestSceneRender(){
      needsRender=true;
      if(renderActive() && !rafId){
        rafId=requestAnimationFrame(loop);
      }
    }

    function activeCardRect(){
      const card=cardEls[activeCardIndex];
      const rect=card ? card.getBoundingClientRect() : htmlCard.getBoundingClientRect();
      if(rect.width && rect.height) return rect;
      return htmlCard.getBoundingClientRect();
    }

    function rebuildGlassGeometry(){
      const rect=activeCardRect();
      if(!rect.width || !rect.height || !viewH) return;
      const cameraDist=Math.abs(camera.position.z-glassGroup.position.z);
      const fovRad=THREE.MathUtils.degToRad(camera.fov);
      const unitsPerPx=(2*cameraDist*Math.tan(fovRad/2))/viewH;
      const w=rect.width*unitsPerPx;
      const h=rect.height*unitsPerPx;
      const r=GLASS_BEVEL_PX*unitsPerPx;
      const d=112*unitsPerPx;
      const edgePad=2.4*unitsPerPx;
      const nextGlassGeo=smoothRoundedBoxGeometry(w, h, d, GLASS_BEVEL_SEGMENTS, r);
      const nextEdgeGeo=smoothRoundedBoxGeometry(w+edgePad, h+edgePad, d+(1.8*unitsPerPx), GLASS_BEVEL_SEGMENTS, r+unitsPerPx*0.85);
      const nextFresnelGeo=smoothRoundedBoxGeometry(w+edgePad*0.45, h+edgePad*0.45, d+(unitsPerPx*1.15), GLASS_BEVEL_SEGMENTS, r+unitsPerPx*0.65);
      fresnelMat.uniforms.uHalfSize.value.set((w+edgePad*0.45)*0.5,(h+edgePad*0.45)*0.5);
      rebuildHighlightLayer(w,h,r,d,unitsPerPx);

      glass.geometry.dispose();
      edgeGlow.geometry.dispose();
      fresnelShell.geometry.dispose();
      glass.geometry=nextGlassGeo;
      edgeGlow.geometry=nextEdgeGeo;
      fresnelShell.geometry=nextFresnelGeo;
      glassGeo=nextGlassGeo;
      edgeGeo=nextEdgeGeo;
      fresnelGeo=nextFresnelGeo;
      cardBackPool.geometry.dispose();
      cardBackPool.geometry=new THREE.PlaneGeometry(w,h,1,1);
      cardBackPool.position.set(0,0,THREE.MathUtils.clamp(RAIN.depth,0,0.98)*d*0.5 - unitsPerPx*1.5);
      cardBackPool.scale.set(1.012,1.012,1);
      cardGroundShadow.geometry.dispose();
      cardGroundShadow.geometry=new THREE.PlaneGeometry(w*0.86,h*0.18,1,1);
      cardGroundShadow.position.set(w*0.04,-h*0.54,-d*0.66);
      sizeInnerRain(glassCards[0], w, h, d);
    }

    function resize(){
      const dpr=Math.min(window.devicePixelRatio || 1, FX.pixelRatioMax);
      viewW=window.innerWidth;
      viewH=window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(viewW, viewH, false);
      composer.setPixelRatio(dpr);
      composer.setSize(viewW, viewH);
      bloomComposer.setPixelRatio(dpr);
      bloomComposer.setSize(viewW, viewH);
      bloomPass.setSize(Math.max(1,Math.floor(viewW*BLOOM_RESOLUTION_SCALE)), Math.max(1,Math.floor(viewH*BLOOM_RESOLUTION_SCALE)));
      finalPass.material.uniforms.bloomTexture.value=bloomComposer.renderTarget2.texture;
      smaaPass.setSize(viewW*dpr, viewH*dpr);
      camera.aspect=viewW/viewH;
      camera.updateProjectionMatrix();
      cardRect=activeCardRect();
      rebuildGlassGeometry();
      requestSceneRender();
    }
    window.addEventListener('resize', resize);

    function drawCodeTexture(time){
      const sx=starW/viewW, sy=starH/viewH;
      const ctx=codeCtx;
      const codeGlow=THREE.MathUtils.clamp(fxTuning.codeGlow, 0, 1.2);
      ctx.setTransform(1,0,0,1,0,0);
      const bg=ctx.createLinearGradient(0,0,starW,starH);
      bg.addColorStop(0,'#050d24');
      bg.addColorStop(0.46,'#050d2e');
      bg.addColorStop(1,'#020613');
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,starW,starH);

      let rg=ctx.createRadialGradient(starW*.78, -starH*.08, 0, starW*.78, -starH*.08, starW*.64);
      rg.addColorStop(0,'rgba(44,72,170,'+(0.10+0.12*codeGlow)+')');
      rg.addColorStop(.52,'rgba(24,48,130,'+(0.055+0.065*codeGlow)+')');
      rg.addColorStop(1,'rgba(40,70,160,0)');
      ctx.fillStyle=rg;
      ctx.fillRect(0,0,starW,starH);
      rg=ctx.createRadialGradient(starW*.12, starH*1.08, 0, starW*.12, starH*1.08, starW*.56);
      rg.addColorStop(0,'rgba(24,52,135,'+(0.07+0.09*codeGlow)+')');
      rg.addColorStop(1,'rgba(35,60,150,0)');
      ctx.fillStyle=rg;
      ctx.fillRect(0,0,starW,starH);

      const rcPx=cardRect;
      if(rcPx.width && rcPx.height){
        const shadowCx=(rcPx.left+rcPx.width*.56)*sx;
        const shadowCy=(rcPx.bottom+16)*sy;
        const shadowW=rcPx.width*sx*.42;
        const shadowH=Math.max(18*sy,rcPx.height*sy*.075);
        const shadow=ctx.createRadialGradient(shadowCx,shadowCy,0,shadowCx,shadowCy,shadowW);
        shadow.addColorStop(0,'rgba(0,0,0,0.30)');
        shadow.addColorStop(0.42,'rgba(1,6,20,0.22)');
        shadow.addColorStop(1,'rgba(1,6,20,0)');
        ctx.save();
        ctx.fillStyle=shadow;
        ctx.beginPath();
        ctx.ellipse(shadowCx,shadowCy,shadowW,shadowH,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();

        const reflect=ctx.createRadialGradient(shadowCx,shadowCy-8*sy,0,shadowCx,shadowCy-8*sy,shadowW*.74);
        reflect.addColorStop(0,'rgba(0,200,255,'+(0.006+0.020*codeGlow)+')');
        reflect.addColorStop(0.48,'rgba(170,220,255,'+(0.004+0.014*codeGlow)+')');
        reflect.addColorStop(1,'rgba(0,200,255,0)');
        ctx.save();
        ctx.fillStyle=reflect;
        ctx.beginPath();
        ctx.ellipse(shadowCx,shadowCy-8*sy,shadowW*.74,shadowH*.72,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if(rcPx.width && rcPx.height && codeGlow>0){
        const cx=(rcPx.left+rcPx.width*.55)*sx;
        const cy=(rcPx.top+rcPx.height*.46)*sy;
        const pocket=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rcPx.width*sx*.38, rcPx.height*sy*.56));
        pocket.addColorStop(0,'rgba(100,185,245,'+(0.020*codeGlow)+')');
        pocket.addColorStop(0.30,'rgba(45,145,220,'+(0.012*codeGlow)+')');
        pocket.addColorStop(0.62,'rgba(0,190,245,'+(0.006*codeGlow)+')');
        pocket.addColorStop(1,'rgba(0,200,255,0)');
        ctx.fillStyle=pocket;
        ctx.fillRect((rcPx.left-40)*sx,(rcPx.top-45)*sy,(rcPx.width+80)*sx,(rcPx.height+80)*sy);
      }

      if(rcPx.width && rcPx.height){
        ctx.save();
        const rawLeft=rcPx.left*sx, rawTop=rcPx.top*sy, rawRight=rcPx.right*sx, rawBottom=rcPx.bottom*sy;
        const safeInsetX=Math.max(34*sx,rcPx.width*sx*.075);
        const safeInsetTop=Math.max(34*sy,rcPx.height*sy*.085);
        const safeInsetBottom=Math.max(28*sy,rcPx.height*sy*.065);
        const safeLeft=rawLeft+safeInsetX;
        const safeTop=rawTop+safeInsetTop;
        const safeRight=rawRight-safeInsetX*1.18;
        const safeBottom=rawBottom-safeInsetBottom;
        const safeW=safeRight-safeLeft;
        const safeH=safeBottom-safeTop;
        if(safeW>0 && safeH>0){
          ctx.beginPath();
          if(ctx.roundRect){
            ctx.roundRect(safeLeft,safeTop,safeW,safeH,Math.max(18*sx,22));
          }else{
            ctx.rect(safeLeft,safeTop,safeW,safeH);
          }
          ctx.clip();

          const left=safeLeft, top=safeTop, right=safeRight, bottom=safeBottom;
          const organicCode=[
            'const view = render(glass)',
            'shader.uniforms.ior',
            'await deploy(site)',
            'return <ServiceCard />',
            'route.post("/lead")',
            'cms.render(page)',
            'build: production',
            'db.sync(client)'
          ];
          ctx.font=Math.max(9,10.5*sx)+'px "JetBrains Mono",monospace';
          ctx.textAlign='left';
          ctx.textBaseline='middle';
          for(let i=0;i<(IS_MOBILE ? 12 : 22);i++){
            const px=left+safeW*(0.08+hash(i,31)*0.84);
            const py=top+safeH*(0.08+hash(i,47)*0.84);
            const len=0.45+hash(i,59)*0.55;
            const alpha=(0.018+hash(i,71)*0.036)*codeGlow;
            const cyan=hash(i,83)>0.58;
            ctx.save();
            ctx.translate(px,py);
            ctx.rotate((-0.14+hash(i,97)*0.28));
            ctx.fillStyle=cyan?'rgba(0,200,255,'+alpha+')':'rgba(232,240,255,'+alpha+')';
            ctx.fillText(organicCode[(i*3)%organicCode.length].slice(0,Math.floor(10+len*16)),0,0);
            ctx.restore();
          }
        }
        ctx.restore();
      }

      ctx.save();
      ctx.scale(sx, sy);
      ctx.textBaseline='middle';
      const rc=cardRect;
      const streamCount=IS_MOBILE ? 10 : 18;
      for(let i=0;i<streamCount;i++){
        const d=drops[i];
        const raw=time*d.spd+d.ph;
        const cyc=Math.floor(raw/1.8);
        const prog=raw%1.8-0.25;
        if(prog<0) continue;
        const code=CODE[(i*5+cyc)%CODE.length];
        ctx.font=d.sz+'px "JetBrains Mono",monospace';
        const w=ctx.measureText(code).width;
        const streamLeft=rc.width ? Math.max(12, rc.left-rc.width*0.34) : 16;
        const streamRight=rc.width ? Math.min(viewW-12, rc.right+rc.width*0.28) : viewW-16;
        const x=streamLeft+Math.floor(hash(i,cyc*9+5)*(streamRight-streamLeft));
        const tipY=prog*viewH;
        const inside=x>=rc.left && x<=rc.right && tipY>=rc.top && tipY<=rc.bottom;
        const base=d.ye?'232,240,255':(d.cy || inside?'0,200,255':'150,170,220');
        const topEdgeFade=inside ? smoothstep(0, 54, tipY-rc.top) : 1;
        ctx.save();
        ctx.translate(x,tipY);
        ctx.rotate(-Math.PI/2 + (-0.09+hash(i,cyc+17)*0.18));
        ctx.textAlign='left';
        const g=ctx.createLinearGradient(0,0,w,0);
        const hotAlpha=(inside?0.15:0.020)*codeGlow*topEdgeFade;
        const trailAlpha=(inside?0.10:0.014)*codeGlow*topEdgeFade;
        g.addColorStop(0,'rgba(232,240,255,'+hotAlpha+')');
        g.addColorStop(0.1,'rgba('+base+','+trailAlpha+')');
        g.addColorStop(1,'rgba('+base+',0)');
        ctx.fillStyle=g;
        ctx.fillText(code,0,0);
        ctx.restore();
      }
      ctx.restore();
      codeTexture.needsUpdate=true;
    }

    function applyGlassCardMaterial(card){
      card.body.material.color.copy(FRONT_FACE_COLOR);
      card.body.material.transmission=state.transmission;
      card.body.material.thickness=state.thickness;
      card.body.material.ior=state.ior;
      card.body.material.roughness=state.roughness;
      card.body.material.clearcoat=FRONT_FACE.clearcoat;
      card.body.material.clearcoatRoughness=FRONT_FACE.clearcoatRoughness;
      card.body.material.envMapIntensity=state.envMapIntensity;
      card.body.material.opacity=1;
      card.body.material.emissive.set(0x000000);
      card.body.material.emissiveIntensity=0;
      card.body.material.attenuationDistance=FRONT_FACE.attenuationDistance;
      card.body.material.needsUpdate=true;

      card.edgeGlow.material.transmission=0.66;
      card.edgeGlow.material.thickness=1.25;
      card.edgeGlow.material.ior=1.62;
      card.edgeGlow.material.roughness=0.006;
      card.edgeGlow.material.clearcoat=CRYSTAL_FRONT.clearcoat;
      card.edgeGlow.material.clearcoatRoughness=CRYSTAL_FRONT.clearcoatRoughness;
      card.edgeGlow.material.envMapIntensity=CRYSTAL_FRONT.edgeEnv;
      card.edgeGlow.material.opacity=CRYSTAL_FRONT.edgeOpacity;
      card.edgeGlow.material.needsUpdate=true;

      card.fresnelShell.material.uniforms.uPower.value=state.fresnelPower;
      card.fresnelShell.material.uniforms.uStrength.value=CRYSTAL_FRONT.fresnelStrength;
      card.fresnelShell.material.uniforms.uCornerBoost.value=2.0;
      depthPoolMat.uniforms.uOpacity.value=0.055;
    }

    function applyState(){
      cssRoot.style.setProperty('--tiltX', state.tiltX);
      cssRoot.style.setProperty('--tiltY', state.tiltY);
      glassMat.thickness=state.thickness;
      glassMat.ior=state.ior;
      glassMat.roughness=state.roughness;
      glassMat.dispersion=state.dispersion;
      glassMat.transmission=state.transmission;
      glassMat.color.copy(FRONT_FACE_COLOR);
      glassMat.envMap=null;
      glassMat.envMapIntensity=state.envMapIntensity;
      glassMat.clearcoat=FRONT_FACE.clearcoat;
      glassMat.clearcoatRoughness=FRONT_FACE.clearcoatRoughness;
      glassMat.attenuationDistance=FRONT_FACE.attenuationDistance;
      edgeMat.envMap=edgeEnvironmentMap();
      edgeMat.envMapIntensity=CRYSTAL_FRONT.edgeEnv;
      edgeMat.opacity=CRYSTAL_FRONT.edgeOpacity;
      edgeMat.roughness=0.006;
      edgeMat.clearcoat=CRYSTAL_FRONT.clearcoat;
      edgeMat.clearcoatRoughness=CRYSTAL_FRONT.clearcoatRoughness;
      edgeMat.dispersion=0.62;
      for(const spec of LIGHTS){
        const kit=studioLights[spec.id];
        const pos=getLightPosition(spec);
        const size=Math.max(0.55,spec.size);
        const intensity=state[spec.id+'_intensity'];
        kit.light.position.set(pos.x,pos.y,pos.z);
        kit.light.width=size;
        kit.light.height=size;
        kit.light.intensity=intensity;
        aimAtCard(kit.light);
      }
      bloomPass.strength=FX.bloom ? CRYSTAL_BLOOM.strength : Math.min(state.bloomStrength, 0.08);
      bloomPass.radius=FX.bloom ? CRYSTAL_BLOOM.radius : 0.08;
      bloomPass.threshold=FX.bloom ? CRYSTAL_BLOOM.threshold : 0.96;
      fresnelMat.uniforms.uPower.value=state.fresnelPower;
      fresnelMat.uniforms.uStrength.value=CRYSTAL_FRONT.fresnelStrength;
      fresnelMat.uniforms.uCornerBoost.value=2.4;
      glassMat.needsUpdate=true;
      edgeMat.needsUpdate=true;
      glassGroup.rotation.x=THREE.MathUtils.degToRad(-state.tiltX);
      glassGroup.rotation.y=THREE.MathUtils.degToRad(state.tiltY);
      if(GLASS_BEVEL_PX!==state.bevelPx){ GLASS_BEVEL_PX=state.bevelPx; rebuildGlassGeometry(); }
      applyGlassCardMaterial(glassCards[0]);
      requestSceneRender();
    }

    const FX_CTRL=[
      {k:'heroEdgeGlow', name:'hero edge glow', min:0, max:1.8, step:0.01},
      {k:'bloomStrength', name:'bloom strength', min:0, max:0.8, step:0.005},
      {k:'bloomThreshold', name:'bloom threshold', min:0.82, max:1.2, step:0.001},
      {k:'bloomRadius', name:'bloom radius', min:0, max:0.18, step:0.001},
      {k:'rearFrost', name:'rear frost', min:0.5, max:1.8, step:0.01},
      {k:'codeGlow', name:'code glow', min:0, max:1.2, step:0.01}
    ];
    function clampFxValue(ctrl,value){
      return THREE.MathUtils.clamp(Number(value), ctrl.min, ctrl.max);
    }
    /* 預覽拉軸面板已移除；保留空函式維持 applyFxTuning 的呼叫點不變（window.__fx 仍可即時調值） */
    function syncFxControls(){}
    function applyFxTuning(){
      CRYSTAL_BLOOM.strength=fxTuning.bloomStrength;
      CRYSTAL_BLOOM.threshold=fxTuning.bloomThreshold;
      CRYSTAL_BLOOM.radius=fxTuning.bloomRadius;
      CRYSTAL_FRONT.fresnelStrength=fxTuning.heroEdgeGlow;
      CRYSTAL_FRONT.edgeOpacity=0.052 + fxTuning.heroEdgeGlow*0.072;
      CRYSTAL_FRONT.edgeEnv=1.45 + fxTuning.heroEdgeGlow*1.90;
      bloomPass.strength=FX.bloom ? CRYSTAL_BLOOM.strength : Math.min(CRYSTAL_BLOOM.strength, 0.05);
      bloomPass.threshold=FX.bloom ? CRYSTAL_BLOOM.threshold : Math.max(0.98, CRYSTAL_BLOOM.threshold);
      bloomPass.radius=FX.bloom ? CRYSTAL_BLOOM.radius : Math.min(CRYSTAL_BLOOM.radius, 0.04);
      lastCodeFrameTime=0;
      syncFxControls();
      applyState();
      updateDevCardState();
    }
    const fxApi={};
    for(const ctrl of FX_CTRL){
      Object.defineProperty(fxApi, ctrl.k, {
        enumerable:true,
        get(){ return fxTuning[ctrl.k]; },
        set(value){
          fxTuning[ctrl.k]=clampFxValue(ctrl,value);
          applyFxTuning();
        }
      });
    }
    fxApi.set=(key,value)=>{
      const ctrl=FX_CTRL.find(item=>item.k===key);
      if(!ctrl) return false;
      fxTuning[key]=clampFxValue(ctrl,value);
      applyFxTuning();
      return true;
    };
    fxApi.values=()=>Object.assign({},fxTuning);
    window.__fx=fxApi;

    syncFxControls();


    /* ===== 單卡左右滑：HTML 內容層 slide/fade，WebGL 玻璃與雨維持穩定 ===== */
    let transitionSerial=0;
    const CARD_TRANSITION_MS=360;
    function cardTransform(x){
      return 'perspective(1700px) translateX('+x+'px) scale(1) rotateX(calc(var(--tiltX)*1deg)) rotateY(calc(var(--tiltY)*1deg))';
    }
    function syncCardControls(){
      for(let idx=0; idx<dotEls.length; idx++){
        const isActive=idx===activeCardIndex;
        dotEls[idx].classList.toggle('is-active', isActive);
        dotEls[idx].setAttribute('aria-current', isActive ? 'true' : 'false');
        dotEls[idx].setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
      prevBtn.disabled=activeCardIndex===0;
      nextBtn.disabled=activeCardIndex===CARDS.length-1;
    }
    function updateDevCardState(){
      for(let idx=0; idx<cardEls.length; idx++){
        const isActive=idx===activeCardIndex;
        cardEls[idx].classList.toggle('is-active', isActive);
        cardEls[idx].classList.toggle('is-front', isActive);
        cardEls[idx].style.zIndex=String(isActive ? 230 : 210);
        cardEls[idx].setAttribute('aria-hidden', isActive ? 'false' : 'true');
      }
      syncCardControls();
      const card=glassCards[0];
      card.group.position.set(0,0,0);
      card.group.scale.setScalar(1);
      card.group.rotation.x=THREE.MathUtils.degToRad(-state.tiltX);
      card.group.rotation.y=THREE.MathUtils.degToRad(state.tiltY);
      card.group.visible=true;
      if(card.innerRain) card.innerRain.visible=true;
      card.edgeGlow.layers.enable(BLOOM_SCENE);
      card.fresnelShell.layers.enable(BLOOM_SCENE);
      applyGlassCardMaterial(card);
      requestSceneRender();
    }
    function goToCard(target, direction){
      const nextIndex=Math.max(0, Math.min(CARDS.length-1, Number(target)));
      if(!Number.isFinite(nextIndex) || nextIndex===activeCardIndex) return activeCardIndex;
      const fromIndex=activeCardIndex;
      const dir=direction || (nextIndex>fromIndex ? 1 : -1);
      const serial=++transitionSerial;
      const outgoing=cardEls[fromIndex];
      const incoming=cardEls[nextIndex];
      activeCardIndex=nextIndex;
      incoming.classList.add('is-active');
      incoming.setAttribute('aria-hidden','false');
      incoming.style.zIndex='230';
      outgoing.style.zIndex='220';
      incoming.style.transition='none';
      incoming.style.opacity='0';
      incoming.style.visibility='visible';
      incoming.style.transform=cardTransform(dir*74);
      outgoing.style.transition='transform '+CARD_TRANSITION_MS+'ms ease-out, opacity '+CARD_TRANSITION_MS+'ms ease-out';
      syncCardControls();
      requestAnimationFrame(()=>{
        incoming.style.transition='transform '+CARD_TRANSITION_MS+'ms ease-out, opacity '+CARD_TRANSITION_MS+'ms ease-out';
        outgoing.style.transform=cardTransform(-dir*74);
        outgoing.style.opacity='0';
        incoming.style.transform=cardTransform(0);
        incoming.style.opacity='1';
      });
      window.setTimeout(()=>{
        if(serial!==transitionSerial) return;
        outgoing.classList.remove('is-active','is-front');
        outgoing.setAttribute('aria-hidden','true');
        outgoing.style.transition='';
        outgoing.style.opacity='0';
        outgoing.style.transform=cardTransform(0);
        incoming.style.transition='';
        updateDevCardState();
      }, CARD_TRANSITION_MS+30);
      applyGlassCardMaterial(glassCards[0]);
      requestSceneRender();
      applyState();
      return activeCardIndex;
    }
    function goPrev(){ return goToCard(activeCardIndex-1, -1); }
    function goNext(){ return goToCard(activeCardIndex+1, 1); }
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    let dragState=null;
    devStage.addEventListener('pointerdown', e=>{
      if(e.button!==undefined && e.button!==0) return;
      if(e.target.closest('button')) return;
      dragState={ id:e.pointerId, x:e.clientX, y:e.clientY, locked:false };
      devStage.setPointerCapture(e.pointerId);
    });
    devStage.addEventListener('pointermove', e=>{
      if(!dragState || dragState.id!==e.pointerId) return;
      const dx=e.clientX-dragState.x;
      const dy=e.clientY-dragState.y;
      if(!dragState.locked && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.2) dragState.locked=true;
      if(dragState.locked) e.preventDefault();
    });
    function finishDrag(e){
      if(!dragState || dragState.id!==e.pointerId) return;
      const dx=e.clientX-dragState.x;
      const dy=e.clientY-dragState.y;
      const horizontal=Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.25;
      if(horizontal){
        if(dx<0) goNext();
        else goPrev();
      }
      dragState=null;
    }
    devStage.addEventListener('pointerup', finishDrag);
    devStage.addEventListener('pointercancel', ()=>{ dragState=null; });
    window.addEventListener('keydown', e=>{
      if(!sectionInView || e.altKey || e.ctrlKey || e.metaKey) return;
      if(e.key==='ArrowLeft'){ e.preventDefault(); goPrev(); }
      if(e.key==='ArrowRight'){ e.preventDefault(); goNext(); }
    });
    window.addEventListener('resize', updateDevCardState);

    resize();
    applyState();
    updateDevCardState();
    cardEls.forEach((el,idx)=>{
      el.style.transform=cardTransform(0);
      el.style.opacity=idx===activeCardIndex ? '1' : '0';
      el.setAttribute('aria-hidden', idx===activeCardIndex ? 'false' : 'true');
    });


    /* #dev 進出視窗才 render（IntersectionObserver 效能閘） */
    new IntersectionObserver(es=>{
      sectionInView=es[0].isIntersecting;
      if(sectionInView){ lastFrameTime=0; requestSceneRender(); }
    }, {threshold:0, rootMargin:'120px 0px'}).observe(document.getElementById('dev'));

    const t0=performance.now();
    function loop(now){
      rafId=requestAnimationFrame(loop);
      if(!QA_MODE && !renderActive()){
        cancelAnimationFrame(rafId);
        rafId=0;
        return;
      }
      const elapsed=now-lastFrameTime;
      const forceQaFrame=QA_MODE && qaFramesRemaining>0;
      if(elapsed<TARGET_FRAME_MS && !needsRender && !forceQaFrame) return;
      lastFrameTime=now-(elapsed%TARGET_FRAME_MS);
      cardRect=activeCardRect();
      const t=QA_MODE ? 0.75 : (performance.now()-t0)/1000;
      if(forceQaFrame || now-lastCodeFrameTime>=FX.codeFrameMs){
        drawInnerRain(t);
        lastCodeFrameTime=now;
      }
      const previousBackground=scene.background;
      scene.background=new THREE.Color(0x000000);
      camera.layers.set(BLOOM_SCENE);
      bloomComposer.render();
      camera.layers.set(0);
      scene.background=previousBackground;
      composer.render();
      needsRender=false;
      if(forceQaFrame){
        qaFramesRemaining--;
        needsRender=qaFramesRemaining>0;
      }
    }
    document.addEventListener('visibilitychange',()=>{
      if(!QA_MODE && document.hidden){
        if(rafId){
          cancelAnimationFrame(rafId);
          rafId=0;
        }
      }else{
        lastFrameTime=0;
        requestSceneRender();
      }
    });
    requestSceneRender();
